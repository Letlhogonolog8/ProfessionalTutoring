import { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TutorProfile } from "@/components/tutor-profile";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@shared/schema";
import { Link } from "wouter";
import { Calendar, Clock, FileText, MessageSquare, Bell, CheckCircle, TrendingUp, BookOpen } from "lucide-react";
import { format, formatDistanceToNow, differenceInHours, differenceInMinutes } from "date-fns";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: tutors = [] } = useQuery<User[]>({
    queryKey: ["/api/users?role=tutor"],
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count ?? 0;

  const studentSessions = sessions.filter(s => s.studentId === user?.id);

  const upcomingSessions = studentSessions
    .filter(s => new Date(s.startTime) > new Date() && s.status !== "cancelled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const completedSessions = studentSessions.filter(
    s => s.status === "completed" || new Date(s.startTime) < new Date()
  );

  // Total hours studied (sum of durations of non-cancelled sessions that are past)
  const totalMinutes = completedSessions.reduce((acc, s) => {
    const diff = differenceInMinutes(new Date(s.endTime), new Date(s.startTime));
    return acc + Math.max(0, diff);
  }, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Nearest upcoming session (within 24 hours)
  const nextSession = upcomingSessions[0];
  const hoursToNext = nextSession
    ? differenceInHours(new Date(nextSession.startTime), new Date())
    : null;
  const showReminder = hoursToNext !== null && hoursToNext <= 24;

  // Toast reminder on mount for very soon sessions (≤1 hour away)
  useEffect(() => {
    if (nextSession) {
      const mins = differenceInMinutes(new Date(nextSession.startTime), new Date());
      if (mins > 0 && mins <= 60) {
        toast({
          title: "Session starting soon!",
          description: `"${nextSession.title}" starts in ${mins} minute${mins === 1 ? "" : "s"}.`,
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-500/10 p-6 rounded-xl">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName}!</h1>
          <p className="text-muted-foreground mt-2">
            Track your progress and manage your academic journey
          </p>
          <div className="mt-4 flex gap-4">
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
              <Link href="/student/book-session">Book New Session</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/student/documents">View Resources</Link>
            </Button>
          </div>
        </div>

        {/* Session reminder alert */}
        {showReminder && nextSession && (
          <Alert className="border-primary/50 bg-primary/5">
            <Bell className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-semibold">Upcoming Session Reminder</AlertTitle>
            <AlertDescription>
              <span className="font-medium">"{nextSession.title}"</span> starts{" "}
              <span className="font-medium">
                {formatDistanceToNow(new Date(nextSession.startTime), { addSuffix: true })}
              </span>{" "}
              — {format(new Date(nextSession.startTime), "EEEE, MMMM d • h:mm a")}
            </AlertDescription>
          </Alert>
        )}

        {/* Unread message alert */}
        {unreadCount > 0 && (
          <Alert className="border-blue-500/40 bg-blue-500/5">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-600 dark:text-blue-400 font-semibold">
              {unreadCount} unread message{unreadCount > 1 ? "s" : ""}
            </AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>You have new messages from your tutor.</span>
              <Button asChild size="sm" variant="outline" className="ml-4">
                <Link href="/student/chat">Open Chat</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <div className="h-11 w-11 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold">{studentSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <div className="h-11 w-11 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold">{completedSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <div className="h-11 w-11 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold">{totalHours}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hours Studied</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex flex-col items-center text-center">
                <div className="h-11 w-11 bg-purple-500/10 rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold">{upcomingSessions.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Upcoming</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Book a Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Schedule a one-on-one tutoring session with our expert.
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                <Link href="/student/book-session">Book Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Chat with Tutor
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1">
                    {unreadCount}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Send messages or start a video call with your tutor.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/student/chat">Start Chat</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upload Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Share research papers or assignments for review.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/student/documents">Manage Files</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
            ) : upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {upcomingSessions.slice(0, 3).map((session) => {
                  const hoursAway = differenceInHours(new Date(session.startTime), new Date());
                  const isSoon = hoursAway <= 24;
                  return (
                    <div
                      key={session.id}
                      className={`flex items-start p-4 border rounded-lg ${isSoon ? "border-primary/40 bg-primary/5" : ""}`}
                    >
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-4 flex-shrink-0 ${isSoon ? "bg-primary/20" : "bg-primary/10"}`}>
                        <Calendar className={`h-5 w-5 ${isSoon ? "text-primary" : "text-primary"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{session.title}</h4>
                          {isSoon && (
                            <span className="text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              SOON
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>
                            {format(new Date(session.startTime), "MMMM d, yyyy • h:mm a")} –{" "}
                            {format(new Date(session.endTime), "h:mm a")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}
                        </p>
                        {session.description && (
                          <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="mt-4 text-center">
                  <Button asChild variant="link">
                    <Link href="/student/my-sessions">View All Sessions</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No upcoming sessions scheduled.</p>
                <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                  <Link href="/student/book-session">Book a Session</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tutor Profile */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Tutor</h2>
          <TutorProfile />
        </div>
      </div>
    </DashboardLayout>
  );
}
