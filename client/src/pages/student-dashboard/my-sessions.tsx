import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Video, CheckCircle, XCircle, StickyNote } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Session } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Link } from "wouter";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export default function MySessions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [notesSession, setNotesSession] = useState<Session | null>(null);
  const [notesText, setNotesText] = useState("");

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Cancel session
  const cancelSession = useMutation({
    mutationFn: async (sessionId: number) => {
      const res = await apiRequest("PUT", `/api/sessions/${sessionId}`, { status: "cancelled" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setShowCancelDialog(false);
      toast({ title: "Session cancelled", description: "Your session has been cancelled." });
    },
  });

  // Save notes
  const saveNotes = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setShowNotesDialog(false);
      toast({ title: "Notes saved", description: "Your session notes have been updated." });
    },
    onError: () => {
      toast({ title: "Failed to save notes", variant: "destructive" });
    },
  });

  const studentSessions = sessions.filter(s => s.studentId === user?.id);

  const upcomingSessions = studentSessions
    .filter(s => new Date(s.startTime) > new Date() && s.status !== "cancelled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const pastSessions = studentSessions
    .filter(s => s.status !== "cancelled" &&
      (new Date(s.startTime) < new Date() || s.status === "completed"))
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const cancelledSessions = studentSessions
    .filter(s => s.status === "cancelled")
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const openCancelDialog = (session: Session) => {
    setSelectedSession(session);
    setShowCancelDialog(true);
  };

  const openNotesDialog = (session: Session) => {
    setNotesSession(session);
    setNotesText(session.notes ?? "");
    setShowNotesDialog(true);
  };

  const renderSessionCard = (session: Session) => {
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    const isPast = startTime < new Date();
    const isCancelled = session.status === "cancelled";

    return (
      <Card key={session.id} className={`mb-4 ${isCancelled ? "opacity-75" : ""}`}>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start flex-1">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${
                isCancelled ? "bg-destructive/10" : isPast ? "bg-muted" : "bg-primary/10"
              }`}>
                {isCancelled ? (
                  <XCircle className="h-6 w-6 text-destructive" />
                ) : isPast ? (
                  <CheckCircle className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Calendar className="h-6 w-6 text-primary" />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-lg">{session.title}</h3>
                <div className="flex items-center mt-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {format(startTime, "MMMM d, yyyy • h:mm a")} –{" "}
                    {format(endTime, "h:mm a")}
                  </span>
                </div>

                {session.description && (
                  <p className="text-sm text-muted-foreground mt-2">{session.description}</p>
                )}

                {/* Session notes preview */}
                {session.notes && (
                  <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
                    <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                      <StickyNote className="h-3 w-3" /> My Notes
                    </p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{session.notes}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  {!isPast && !isCancelled && (
                    <>
                      <Link href="/student/chat">
                        <Button variant="outline" size="sm">Message Tutor</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openCancelDialog(session)}
                      >
                        Cancel Session
                      </Button>
                    </>
                  )}

                  {/* Notes button — available on all non-cancelled sessions */}
                  {!isCancelled && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5"
                      onClick={() => openNotesDialog(session)}
                    >
                      <StickyNote className="h-3.5 w-3.5" />
                      {session.notes ? "Edit Notes" : "Add Notes"}
                    </Button>
                  )}

                  {isPast && !isCancelled && (
                    <span className="bg-muted px-3 py-1 rounded-full text-xs">Completed</span>
                  )}
                  {isCancelled && (
                    <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-xs">
                      Cancelled
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Video call button for upcoming sessions */}
            {!isPast && !isCancelled && (
              <Link href="/student/chat">
                <Button variant="outline" size="icon" className="ml-2 text-primary flex-shrink-0">
                  <Video className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ label, showBook }: { label: string; showBook?: boolean }) => (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">{label}</p>
      {showBook && (
        <Link href="/student/book-session">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
            Book a Session
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
          <p className="text-muted-foreground mt-2">View and manage your tutoring sessions</p>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Total sessions: {studentSessions.length}
          </span>
          <Link href="/student/book-session">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
              Book New Session
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming ({upcomingSessions.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastSessions.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelledSessions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading sessions...</div>
            ) : upcomingSessions.length > 0 ? (
              upcomingSessions.map(renderSessionCard)
            ) : (
              <EmptyState label="You don't have any upcoming sessions" showBook />
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading sessions...</div>
            ) : pastSessions.length > 0 ? (
              pastSessions.map(renderSessionCard)
            ) : (
              <EmptyState label="You don't have any past sessions" />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">Loading sessions...</div>
            ) : cancelledSessions.length > 0 ? (
              cancelledSessions.map(renderSessionCard)
            ) : (
              <EmptyState label="You don't have any cancelled sessions" />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Session Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="py-4">
              <p className="font-medium">{selectedSession.title}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedSession.startTime), "MMMM d, yyyy • h:mm a")} –{" "}
                {format(new Date(selectedSession.endTime), "h:mm a")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Session
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSession && cancelSession.mutate(selectedSession.id)}
              disabled={cancelSession.isPending}
            >
              {cancelSession.isPending ? "Cancelling..." : "Yes, Cancel Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Session Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              Session Notes
            </DialogTitle>
            <DialogDescription>
              {notesSession?.title} —{" "}
              {notesSession && format(new Date(notesSession.startTime), "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              rows={7}
              placeholder="Write your personal notes, key takeaways, follow-up actions, questions to research..."
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Notes are private and only visible to you.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => notesSession && saveNotes.mutate({ id: notesSession.id, notes: notesText })}
              disabled={saveNotes.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
            >
              {saveNotes.isPending ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
