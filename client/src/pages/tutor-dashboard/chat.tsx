import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatInterface } from "@/components/chat/chat-interface";
import { VideoCall } from "@/components/video-call/video-call";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Search } from "lucide-react";

export default function TutorChat() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isVideoCallOpen, setIsVideoCallOpen] = useState(false);

  // Fetch students
  const { data: students = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=student"],
  });

  // Filter students based on search — show all registered students
  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected student
  const selectedStudent = selectedStudentId ? 
    students.find(student => student.id === selectedStudentId) : null;

  // Start video call
  const handleStartVideoCall = () => {
    if (selectedStudent) {
      setIsVideoCallOpen(true);
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Student Conversations</h1>
          <p className="text-muted-foreground mt-2">
            Chat with your students in real-time
          </p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Students List */}
          <Card className="w-80 flex-shrink-0 mr-4 flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <CardContent className="flex-1 p-0 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No students match your search" : "No students assigned to you yet"}
                </div>
              ) : (
                <div>
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedStudentId === student.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-4">
                          <AvatarImage src={student.avatarUrl || ""} alt={student.fullName} />
                          <AvatarFallback>{getInitials(student.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{student.fullName}</h4>
                          <p className="text-sm text-muted-foreground truncate">{student.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
              {selectedStudent ? (
                <ChatInterface 
                  recipientId={selectedStudent.id} 
                  onStartVideoCall={handleStartVideoCall}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="bg-muted rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium">Select a Student</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                      Choose a student from the list to start a conversation or continue a previous chat.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Video Call Dialog */}
      {selectedStudent && (
        <VideoCall
          isOpen={isVideoCallOpen}
          onClose={() => setIsVideoCallOpen(false)}
          recipient={selectedStudent}
        />
      )}
    </DashboardLayout>
  );
}
