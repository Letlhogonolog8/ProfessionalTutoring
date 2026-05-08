import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Session, User } from "@shared/schema";
import { Link } from "wouter";
import { Search, MessageSquare, Calendar, FileText, Mail, Phone } from "lucide-react";
import { format, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function TutorStudents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [notesText, setNotesText] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  const { data: students = [], isLoading: studentsLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=student"],
  });

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Show all registered students so tutors can schedule with any student
  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedStudent = selectedStudentId
    ? students.find(s => s.id === selectedStudentId)
    : null;

  const studentSessions = selectedStudentId
    ? sessions
        .filter(s => s.studentId === selectedStudentId && s.tutorId === user?.id)
        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    : [];

  const saveNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setNotesDirty(false);
      toast({ title: "Notes saved" });
    },
    onError: () => toast({ title: "Failed to save notes", variant: "destructive" }),
  });

  const handleSelectStudent = (id: number) => {
    setSelectedStudentId(id);
    const lastSession = sessions
      .filter(s => s.studentId === id && s.tutorId === user?.id && s.notes)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
    setNotesText(lastSession?.notes ?? "");
    setNotesDirty(false);
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const statusBadge = (session: Session) => {
    if (session.status === "cancelled")
      return <span className="text-xs text-red-600 bg-red-500/10 px-2 py-0.5 rounded-full">Cancelled</span>;
    if (isPast(new Date(session.startTime)))
      return <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Completed</span>;
    return <span className="text-xs text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">Upcoming</span>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-2">Manage and view information about your students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student List */}
          <Card className="md:col-span-1 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>{filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} registered</CardDescription>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 max-h-[600px] overflow-y-auto">
              {studentsLoading ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Loading students...</p>
              ) : filteredStudents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  {searchQuery ? "No students match your search" : "No students assigned yet"}
                </p>
              ) : (
                filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={`w-full flex items-center gap-3 p-4 border-b text-left hover:bg-muted/50 transition-colors ${
                      selectedStudentId === student.id ? "bg-muted" : ""
                    }`}
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage src={student.avatarUrl ?? ""} />
                      <AvatarFallback className="text-sm font-semibold bg-blue-500/10 text-blue-600">
                        {getInitials(student.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Student Detail */}
          <Card className="md:col-span-2">
            {selectedStudent ? (
              <>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 flex-shrink-0">
                      <AvatarImage src={selectedStudent.avatarUrl ?? ""} />
                      <AvatarFallback className="text-lg font-bold bg-blue-500/10 text-blue-600">
                        {getInitials(selectedStudent.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xl">{selectedStudent.fullName}</CardTitle>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{selectedStudent.email}</span>
                        {selectedStudent.phoneNumber && (
                          <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{selectedStudent.phoneNumber}</span>
                        )}
                      </div>
                      {selectedStudent.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{selectedStudent.bio}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button asChild variant="outline" size="sm">
                      <Link href="/tutor/chat">
                        <MessageSquare className="h-4 w-4 mr-1.5" />
                        Message
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                      <Link href="/tutor/schedule">
                        <Calendar className="h-4 w-4 mr-1.5" />
                        Schedule Session
                      </Link>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="sessions">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="sessions">Session History ({studentSessions.length})</TabsTrigger>
                      <TabsTrigger value="notes">Progress Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sessions" className="mt-4">
                      {studentSessions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">No sessions with this student yet</p>
                      ) : (
                        <div className="space-y-3">
                          {studentSessions.map(session => (
                            <div key={session.id} className="p-4 border rounded-lg">
                              <div className="flex justify-between items-start gap-2">
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{session.title}</p>
                                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(session.startTime), "MMM d, yyyy · h:mm a")} –{" "}
                                    {format(new Date(session.endTime), "h:mm a")}
                                  </div>
                                  {session.description && (
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{session.description}</p>
                                  )}
                                  {session.notes && (
                                    <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">
                                      Notes: {session.notes}
                                    </p>
                                  )}
                                </div>
                                {statusBadge(session)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="notes" className="mt-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Record private notes about {selectedStudent.fullName}'s progress, learning style, and areas to focus on.
                        Notes are saved against the most recent session.
                      </p>
                      <Textarea
                        placeholder="Enter your notes about this student here..."
                        rows={8}
                        value={notesText}
                        onChange={e => { setNotesText(e.target.value); setNotesDirty(true); }}
                        className="resize-none"
                      />
                      <Button
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
                        disabled={!notesDirty || saveNotesMutation.isPending || studentSessions.length === 0}
                        onClick={() => {
                          const latestSession = studentSessions[0];
                          if (latestSession) saveNotesMutation.mutate({ id: latestSession.id, notes: notesText });
                        }}
                      >
                        {saveNotesMutation.isPending ? "Saving..." : "Save Notes"}
                      </Button>
                      {studentSessions.length === 0 && (
                        <p className="text-xs text-muted-foreground">Notes can be saved once a session exists with this student.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center p-8">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium">No Student Selected</h3>
                  <p className="text-sm text-muted-foreground mt-2">Select a student from the list to view their details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
