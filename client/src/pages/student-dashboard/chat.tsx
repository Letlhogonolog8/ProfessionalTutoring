import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from "@/components/chat/chat-interface";
import { VideoCall } from "@/components/video-call/video-call";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function StudentChat() {
  const { user } = useAuth();
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);
  const [selectedTutorId, setSelectedTutorId] = useState<number | null>(null);

  // Fetch tutors
  const { data: tutors = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=tutor"],
  });

  // For this example, we'll select the first tutor by default
  const selectedTutor = selectedTutorId ? 
    tutors.find(tutor => tutor.id === selectedTutorId) : 
    tutors.length > 0 ? tutors[0] : null;

  // Start video call
  const handleStartVideoCall = () => {
    if (selectedTutor) {
      setIsVideoCallOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground mt-2">
            Communicate with your tutor in real-time
          </p>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-muted-foreground">Loading chat...</p>
            </div>
          </div>
        ) : tutors.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>No Tutors Available</CardTitle>
                <CardDescription>
                  There are currently no tutors available to chat with.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        ) : (
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {selectedTutor && (
                <ChatInterface 
                  recipientId={selectedTutor.id} 
                  onStartVideoCall={handleStartVideoCall}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Video Call Dialog */}
      {selectedTutor && (
        <VideoCall
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          recipient={selectedTutor}
        />
      )}
    </DashboardLayout>
  );
}
