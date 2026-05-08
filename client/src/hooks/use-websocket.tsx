
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';

export type WebSocketMessage = {
  type: string;
  payload: any;
};

const BASE_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 30000;
const MAX_RETRIES = 10;

export function useWebSocket() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (!user || unmountedRef.current) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
    const wsUrl = `${protocol}//${host}:${port}/ws`;

    console.log('Connecting to WebSocket at:', wsUrl);
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      if (unmountedRef.current) { socket.close(); return; }
      console.log('WebSocket connected');
      setIsConnected(true);
      retryCountRef.current = 0;
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    socket.onclose = (ev) => {
      if (unmountedRef.current) return;
      console.log('WebSocket disconnected', ev.code, ev.reason);
      setIsConnected(false);
      socketRef.current = null;

      if (ev.code === 1008) {
        console.warn('WebSocket closed: unauthorized. Will not retry.');
        return;
      }

      if (retryCountRef.current < MAX_RETRIES) {
        const delay = Math.min(
          BASE_RETRY_DELAY_MS * 2 ** retryCountRef.current,
          MAX_RETRY_DELAY_MS
        );
        retryCountRef.current += 1;
        console.log(`Reconnecting in ${delay}ms (attempt ${retryCountRef.current})`);
        retryTimerRef.current = setTimeout(connect, delay);
      } else {
        console.error('WebSocket max retries reached.');
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [user]);

  useEffect(() => {
    unmountedRef.current = false;
    if (user) {
      retryCountRef.current = 0;
      connect();
    }
    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [user, connect]);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  return { isConnected, lastMessage, sendMessage };
}
