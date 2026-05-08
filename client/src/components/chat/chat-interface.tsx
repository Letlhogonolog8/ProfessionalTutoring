import { useState, useEffect, useRef } from "react";
import { Send, Paperclip, Image, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { Message } from "@/components/chat/message";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { User, Message as MessageType } from "@shared/schema";

interface ChatInterfaceProps {
  recipientId: number;
  onStartVideoCall?: () => void;
}

export function ChatInterface({ recipientId, onStartVideoCall }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { sendMessage, lastMessage, isConnected } = useWebSocket();
  const [messageText, setMessageText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch the recipient user data
  const { data: recipient } = useQuery<User>({
    queryKey: [`/api/users/${recipientId}`],
    enabled: !!recipientId,
  });
  
  // Fetch message history
  const { data: messages = [], isLoading: messagesLoading } = useQuery<MessageType[]>({
    queryKey: [`/api/messages/${recipientId}`],
    enabled: !!recipientId && !!user,
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/messages", {
        content,
        receiverId: recipientId,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${recipientId}`] });
    },
  });
  
  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const res = await apiRequest("PUT", `/api/messages/${messageId}/read`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${recipientId}`] });
    },
  });
  
  // Listen for new messages from WebSocket
  useEffect(() => {
    if (lastMessage && (lastMessage.type === "chat_message" || lastMessage.type === "message_sent")) {
      const message = lastMessage.payload;
      if (
        (message.senderId === recipientId && message.receiverId === user?.id) ||
        (message.senderId === user?.id && message.receiverId === recipientId)
      ) {
        queryClient.invalidateQueries({ queryKey: [`/api/messages/${recipientId}`] });
      }
    }
  }, [lastMessage, recipientId, user?.id]);
  
  // Mark unread messages as read
  useEffect(() => {
    if (messages.length && user) {
      const unreadMessages = messages.filter(
        msg => msg.senderId === recipientId && !msg.read
      );
      
      unreadMessages.forEach(msg => {
        markAsReadMutation.mutate(msg.id);
      });
    }
  }, [messages, recipientId, user]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim()) return;

    const sentViaWebSocket = isConnected && sendMessage({
      type: "chat_message",
      payload: {
        content: messageText,
        receiverId: recipientId,
      },
    });

    if (!sentViaWebSocket) {
      sendMessageMutation.mutate(messageText);
    }
    
    // Clear input
    setMessageText("");
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };
  
  if (!recipient) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={recipient.avatarUrl || ""} alt={recipient.fullName} />
            <AvatarFallback>{getInitials(recipient.fullName)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="font-medium">{recipient.fullName}</p>
            <p className="text-xs text-muted-foreground">
              {recipient.role === "tutor" ? "Tutor" : "Student"}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {onStartVideoCall && (
            <Button variant="outline" size="icon" onClick={onStartVideoCall}>
              <Video className="h-4 w-4" />
            </Button>
          )}
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesLoading ? (
          <div className="flex justify-center py-10">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map(message => (
            <Message
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === user?.id}
              senderName={message.senderId === user?.id ? user?.fullName : recipient.fullName}
            />
          ))
        )}
        <div ref={chatEndRef} />
      </div>
      
      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="border-t p-4">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" type="button">
            <Paperclip className="h-5 w-5" />
          </Button>
          <Textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 min-h-[60px] max-h-[180px]"
          />
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
            disabled={!messageText.trim() || sendMessageMutation.isPending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}
