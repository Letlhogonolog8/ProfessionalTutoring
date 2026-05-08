import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useVideoCall } from "@/hooks/use-video-call";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

interface VideoCallProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: User;
}

export function VideoCall({ isOpen, onClose, recipient }: VideoCallProps) {
  const { toast } = useToast();
  const {
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
  } = useVideoCall();
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Set up video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);
  
  // Start call when dialog opens
  useEffect(() => {
    if (isOpen && callStatus === 'idle' && recipient) {
      startCall(recipient.id);
      
      toast({
        title: "Calling...",
        description: `Connecting to ${recipient.fullName}`,
      });
    }
    
    // Clean up on dialog close
    return () => {
      if (!isOpen && callStatus !== 'idle') {
        endCall();
      }
    };
  }, [isOpen, callStatus, recipient]);
  
  // Close modal if call ends
  useEffect(() => {
    if (callStatus === 'idle' && isOpen) {
      onClose();
    }
  }, [callStatus, isOpen, onClose]);
  
  const handleEndCall = () => {
    endCall();
    onClose();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };
  
  if (!isOpen) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 bg-black">
        <div className="relative h-[600px] w-full">
          {/* Remote Video (Large) */}
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <Avatar className="h-32 w-32 mx-auto mb-4">
                  <AvatarImage src={recipient.avatarUrl || ""} />
                  <AvatarFallback className="text-4xl">{getInitials(recipient.fullName)}</AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-medium text-white">{recipient.fullName}</h3>
                <p className="text-gray-400 mt-2">
                  {callStatus === 'calling' ? 'Calling...' : 'Connecting...'}
                </p>
              </div>
            </div>
          )}
          
          {/* Local Video (Small) */}
          <div className="absolute bottom-4 right-4 w-1/4 max-w-[180px] rounded-lg overflow-hidden shadow-lg">
            {localStream && isVideoEnabled ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-[100px] bg-gray-800 flex items-center justify-center">
                <Avatar className="h-14 w-14">
                  <AvatarFallback>You</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
          
          {/* Call Controls */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-800 hover:bg-gray-700 border-gray-700 rounded-full h-12 w-12"
              onClick={toggleAudio}
            >
              {isAudioEnabled ? (
                <Mic className="h-5 w-5 text-white" />
              ) : (
                <MicOff className="h-5 w-5 text-red-500" />
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="icon"
              className="bg-red-600 hover:bg-red-700 rounded-full h-12 w-12"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-800 hover:bg-gray-700 border-gray-700 rounded-full h-12 w-12"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? (
                <Camera className="h-5 w-5 text-white" />
              ) : (
                <CameraOff className="h-5 w-5 text-red-500" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
