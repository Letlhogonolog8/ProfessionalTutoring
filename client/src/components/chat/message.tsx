import { useState } from "react";
import { format } from "date-fns";
import { CheckIcon, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Message as MessageType } from "@shared/schema";

interface MessageProps {
  message: MessageType;
  isOwnMessage: boolean;
  senderName: string;
}

export function Message({ message, isOwnMessage, senderName }: MessageProps) {
  const messageTime = new Date(message.timestamp);
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };
  
  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className="flex max-w-[80%]">
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
            <AvatarFallback>{getInitials(senderName)}</AvatarFallback>
          </Avatar>
        )}
        
        <div className={`space-y-1 ${isOwnMessage ? "items-end" : "items-start"}`}>
          <div
            className={`
              px-4 py-2 rounded-lg
              ${isOwnMessage
                ? "bg-primary text-primary-foreground"
                : "bg-muted"}
              ${isOwnMessage ? "rounded-br-sm" : "rounded-bl-sm"}
            `}
          >
            <p className="text-sm">{message.content}</p>
          </div>
          
          <div className={`flex items-center text-xs text-muted-foreground space-x-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <span>{format(messageTime, "h:mm a")}</span>
            {isOwnMessage && (
              message.read 
                ? <CheckIcon className="h-3 w-3 text-primary" /> 
                : <Clock className="h-3 w-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
