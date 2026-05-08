import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { useWebSocket } from './use-websocket';
import { useAuth } from './use-auth';

type CallStatus = 'idle' | 'calling' | 'receiving' | 'connected';

interface UseVideoCallReturn {
  callStatus: CallStatus;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  startCall: (receiverId: number) => void;
  answerCall: () => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export function useVideoCall(): UseVideoCallReturn {
  const { user } = useAuth();
  const { sendMessage, lastMessage } = useWebSocket();
  
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [incomingCallId, setIncomingCallId] = useState<string | null>(null);
  
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<MediaConnection | null>(null);
  
  // Initialize PeerJS
  useEffect(() => {
    if (!user) return;
    
    // Create a random peer ID based on user ID
    const peerId = `user-${user.id}-${Math.random().toString(36).substring(2, 7)}`;
    
    // Initialize PeerJS with host configuration based on the current URL
    const url = new URL(window.location.href);
    const isHttps = url.protocol === 'https:';
    const resolvedPort = url.port
      ? parseInt(url.port, 10)
      : (isHttps ? 443 : 5000);

    const peer = new Peer(peerId, {
      host: url.hostname,
      port: resolvedPort,
      path: '/peerjs',
      secure: isHttps,
      debug: 2,
    });
    
    peer.on('open', (id) => {
      console.log('PeerJS connected with ID:', id);
      peerRef.current = peer;
    });
    
    peer.on('call', (call) => {
      setCallStatus('receiving');
      setIncomingCallId(call.peer);
      connectionRef.current = call;
    });
    
    peer.on('error', (err) => {
      console.error('PeerJS error:', err);
    });
    
    return () => {
      peer.destroy();
      peerRef.current = null;
    };
  }, [user]);
  
  // Handle WebSocket messages for call coordination
  useEffect(() => {
    if (!lastMessage) return;
    
    switch (lastMessage.type) {
      case 'call_request':
        // This is a notification that someone wants to call
        // The actual call will come through PeerJS
        setCallStatus('receiving');
        break;
        
      case 'call_end':
        endCall();
        break;
    }
  }, [lastMessage]);
  
  // Function to start a call
  const startCall = useCallback(async (receiverId: number) => {
    if (!peerRef.current) {
      console.error('PeerJS not initialized');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      setCallStatus('calling');
      
      // Let the other user know our peer ID via WebSocket
      const myPeerId = peerRef.current.id;
      sendMessage({
        type: 'call_request',
        payload: {
          to: receiverId,
          from: user?.id,
          peerId: myPeerId
        }
      });
      
      // We'll make the call when we receive their peer ID
      // This is asynchronous as we need to wait for them to respond
      
    } catch (err) {
      console.error('Failed to start call:', err);
      setCallStatus('idle');
    }
  }, [user, sendMessage]);
  
  // When we receive a peer ID via WebSocket, initiate the call
  useEffect(() => {
    if (!lastMessage || !peerRef.current || !localStream) return;
    
    if (lastMessage.type === 'peer_id' && callStatus === 'calling') {
      const { peerId } = lastMessage.payload;
      
      // Make the actual call via PeerJS
      const call = peerRef.current.call(peerId, localStream);
      connectionRef.current = call;
      
      call.on('stream', (incomingStream) => {
        setRemoteStream(incomingStream);
        setCallStatus('connected');
      });
      
      call.on('close', () => {
        endCall();
      });
    }
  }, [lastMessage, peerRef, localStream, callStatus]);
  
  // Function to answer an incoming call
  const answerCall = useCallback(async () => {
    if (!connectionRef.current) {
      console.error('No incoming call to answer');
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      setLocalStream(stream);
      
      const call = connectionRef.current;
      call.answer(stream);
      
      call.on('stream', (remoteMediaStream) => {
        setRemoteStream(remoteMediaStream);
        setCallStatus('connected');
      });
      
    } catch (err) {
      console.error('Failed to answer call:', err);
    }
  }, []);
  
  // Function to end the call
  const endCall = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // If we're on a call with someone, notify them it's ending
    if (callStatus !== 'idle' && user) {
      // We don't know exactly who we're calling, so we broadcast
      sendMessage({
        type: 'call_end',
        payload: {
          from: user.id,
        }
      });
    }
    
    setLocalStream(null);
    setRemoteStream(null);
    setCallStatus('idle');
    setIncomingCallId(null);
  }, [localStream, callStatus, user, sendMessage]);
  
  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, [localStream]);
  
  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, [localStream]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      if (connectionRef.current) {
        connectionRef.current.close();
      }
      
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [localStream]);
  
  return {
    callStatus,
    localStream,
    remoteStream,
    startCall,
    answerCall,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled
  };
}
