import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWebSocket } from "@/hooks/use-websocket";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { addMinutes, format, isSameDay, setHours, setMinutes } from "date-fns";

interface CalendarViewProps {
  tutorId?: number;
  isTutor?: boolean;
  focusedDate?: Date | null;
}

export function CalendarView({ tutorId, isTutor = false, focusedDate = null }: CalendarViewProps) {
  const { user } = useAuth();
  const { sendMessage } = useWebSocket();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const [sessionTime, setSessionTime] = useState("09:00");
  const [sessionDuration, setSessionDuration] = useState("1");
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDescription, setSessionDescription] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");
  
  // Fetch sessions
  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ["/api/users?role=student"],
    enabled: isTutor,
  });
  
  // Create session mutation
  const createSession = useMutation({
    mutationFn: async (sessionData: any) => {
      const res = await apiRequest("POST", "/api/sessions", sessionData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      
      // Notify via WebSocket
      sendMessage({
        type: "session_update",
        payload: { session: data }
      });
      
      // Close dialog and reset form
      setShowSessionDialog(false);
      resetForm();
    },
  });
  
  // Update session mutation
  const updateSession = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, data);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      
      // Notify via WebSocket
      sendMessage({
        type: "session_update",
        payload: { session: data }
      });
      
      // Close dialog and reset
      setShowSessionDialog(false);
      setSelectedSession(null);
    },
  });
  
  // Delete session mutation
  const deleteSession = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      
      // Close dialog and reset
      setShowSessionDialog(false);
      setSelectedSession(null);
    },
  });
  
  // Listen for session updates via WebSocket
  useEffect(() => {
    // WebSocket logic for real-time updates is handled in useWebSocket hook
    // This is where we'd handle any specific UI updates based on received data
  }, []);

  useEffect(() => {
    if (focusedDate) {
      setSelectedDate(focusedDate);
    }
  }, [focusedDate]);
  
  // Filter sessions for the selected date
  const sessionsForSelectedDate = selectedDate
    ? sessions.filter((session) => isSameDay(new Date(session.startTime), selectedDate))
    : [];

  const formatSessionDuration = (session: Session) => {
    const durationMinutes = Math.round(
      (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60)
    );

    if (durationMinutes === 30) return "30 minutes";
    if (durationMinutes % 60 === 0) {
      const hours = durationMinutes / 60;
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }

    return `${(durationMinutes / 60).toFixed(1)} hours`;
  };
  
  // Open the dialog to create a new session
  const handleAddSession = () => {
    setSelectedSession(null);
    setSessionTime("09:00");
    setSessionDuration("1");
    setSessionTitle("");
    setSessionDescription("");
    setSelectedStudentId(students[0]?.id?.toString() || "");
    setShowSessionDialog(true);
  };
  
  // Open the dialog to view/edit an existing session
  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    
    // Format the time from the session
    const sessionDateTime = new Date(session.startTime);
    setSessionTime(format(sessionDateTime, "HH:mm"));
    
    // Calculate duration in hours
    const startTime = new Date(session.startTime).getTime();
    const endTime = new Date(session.endTime).getTime();
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    setSessionDuration(durationHours.toString());
    
    setSessionTitle(session.title);
    setSessionDescription(session.description || "");
    setSelectedStudentId(session.studentId.toString());
    
    setShowSessionDialog(true);
  };
  
  // Handle dialog submission
  const handleSubmit = () => {
    if (!selectedDate || !sessionTime || !sessionTitle) return;
    if (isTutor && !selectedStudentId) return;
    
    // Parse the selected time
    const [hours, minutes] = sessionTime.split(":").map(Number);
    
    // Create start and end times
    const startTime = setMinutes(setHours(new Date(selectedDate), hours), minutes);
    const endTime = addMinutes(startTime, parseFloat(sessionDuration) * 60);
    
    const sessionData = {
      title: sessionTitle,
      description: sessionDescription,
      tutorId: isTutor ? user!.id : (tutorId || 1), // Default to first tutor if not specified
      studentId: isTutor ? Number(selectedStudentId) : user!.id,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: "scheduled"
    };
    
    if (selectedSession) {
      updateSession.mutate({ id: selectedSession.id, data: sessionData });
    } else {
      createSession.mutate(sessionData);
    }
  };
  
  // Handle session deletion
  const handleDeleteSession = () => {
    if (selectedSession) {
      deleteSession.mutate(selectedSession.id);
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setSessionTime("09:00");
    setSessionDuration("1");
    setSessionTitle("");
    setSessionDescription("");
    setSelectedStudentId("");
  };
  
  if (isLoading) {
    return <div>Loading calendar...</div>;
  }
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>
              {isTutor 
                ? "View and manage your tutoring schedule" 
                : "Book sessions with your tutor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="border rounded-md"
            />
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>
                Sessions for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Selected Date"}
              </CardTitle>
              <CardDescription>
                {sessionsForSelectedDate.length
                  ? `${sessionsForSelectedDate.length} session(s) scheduled`
                  : "No sessions scheduled"}
              </CardDescription>
            </div>
            <Button 
              onClick={handleAddSession} 
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
              disabled={isTutor && !studentsLoading && students.length === 0}
            >
              Add Session
            </Button>
          </CardHeader>
          <CardContent>
            {sessionsForSelectedDate.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No sessions scheduled for this day. Click "Add Session" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {sessionsForSelectedDate.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{session.title}</h4>
                        {session.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {session.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          {format(new Date(session.startTime), "h:mm a")} - {format(new Date(session.endTime), "h:mm a")}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatSessionDuration(session)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Session Dialog */}
      <Dialog open={showSessionDialog} onOpenChange={setShowSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSession ? "Edit Session" : "Add New Session"}</DialogTitle>
            <DialogDescription>
              {selectedSession 
                ? "Update the details of your session" 
                : "Schedule a new tutoring session"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="e.g., Research Methodology Tutorial"
              />
            </div>

            {isTutor && (
              <div>
                <Label htmlFor="student">Student</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder={studentsLoading ? "Loading students..." : "Select a student"} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="time">Start Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Select
                  value={sessionDuration}
                  onValueChange={setSessionDuration}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">30 minutes</SelectItem>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="1.5">1.5 hours</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="3">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                placeholder="Add details about the session..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            {selectedSession && (
              <Button
                variant="destructive"
                onClick={handleDeleteSession}
                className="mr-auto"
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowSessionDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
              disabled={isTutor && !selectedStudentId}
            >
              {selectedSession ? "Update" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
