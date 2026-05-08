import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CalendarView } from "@/components/scheduler/calendar-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Session, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar as CalendarIcon, CheckCircle, User as UserIcon, XCircle, Edit2 } from "lucide-react";
import { format, isToday, isFuture, isPast } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-200",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

export default function TutorSchedule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [editSession, setEditSession] = useState<Session | null>(null);

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  const { data: students = [] } = useQuery<User[]>({
    queryKey: ["/api/users?role=student"],
  });

  const tutorSessions = sessions.filter(s => s.tutorId === user?.id);

  const filteredSessions = tutorSessions.filter(s => {
    if (statusFilter === "upcoming") return isFuture(new Date(s.startTime)) && s.status !== "cancelled";
    if (statusFilter === "completed") return isPast(new Date(s.startTime)) && s.status !== "cancelled";
    if (statusFilter === "cancelled") return s.status === "cancelled";
    return true;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const getStudentName = (studentId: number) =>
    students.find(s => s.id === studentId)?.fullName ?? "Unknown Student";

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Session updated" });
      setEditSession(null);
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const getStatusBadge = (session: Session) => {
    if (session.status === "cancelled")
      return (
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS.cancelled}`}>
          <XCircle className="h-3 w-3 inline mr-1" />Cancelled
        </span>
      );
    if (isPast(new Date(session.startTime)))
      return (
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS.completed}`}>
          <CheckCircle className="h-3 w-3 inline mr-1" />Completed
        </span>
      );
    if (isToday(new Date(session.startTime)))
      return (
        <span className="text-xs px-2 py-1 rounded-full border font-medium bg-orange-500/10 text-orange-600 border-orange-200">
          <Clock className="h-3 w-3 inline mr-1" />Today
        </span>
      );
    return (
      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS.scheduled}`}>
        <CalendarIcon className="h-3 w-3 inline mr-1" />Upcoming
      </span>
    );
  };

  const upcoming = tutorSessions.filter(s => isFuture(new Date(s.startTime)) && s.status !== "cancelled");
  const completed = tutorSessions.filter(s => isPast(new Date(s.startTime)) && s.status !== "cancelled");
  const cancelled = tutorSessions.filter(s => s.status === "cancelled");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground mt-2">Manage your tutoring sessions and availability</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming", count: upcoming.length, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "Completed", count: completed.length, color: "text-green-600", bg: "bg-green-500/10" },
            { label: "Cancelled", count: cancelled.length, color: "text-red-600", bg: "bg-red-500/10" },
          ].map(c => (
            <Card key={c.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full ${c.bg} ${c.color} flex items-center justify-center text-lg font-bold`}>
                  {c.count}
                </div>
                <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "calendar" | "list")}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Tutoring Calendar</CardTitle>
                <CardDescription>Click a date to book or review sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarView isTutor={true} focusedDate={focusedDate} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Session List</CardTitle>
                    <CardDescription>{filteredSessions.length} session{filteredSessions.length !== 1 ? "s" : ""}</CardDescription>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-center text-muted-foreground py-8">Loading sessions...</p>
                ) : filteredSessions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No sessions match the filter</p>
                ) : (
                  <div className="space-y-3">
                    {filteredSessions.map(session => (
                      <div key={session.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{session.title}</p>
                            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                              <UserIcon className="h-3 w-3" />
                              {getStudentName(session.studentId)}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.startTime), "MMM d, yyyy · h:mm a")} –{" "}
                              {format(new Date(session.endTime), "h:mm a")}
                            </div>
                            {session.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{session.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          {getStatusBadge(session)}
                          {isFuture(new Date(session.startTime)) && session.status !== "cancelled" && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
                              onClick={() => setEditSession(session)}>
                              <Edit2 className="h-3 w-3" /> Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Tutoring Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Tutoring Guidelines</CardTitle>
            <CardDescription>Best practices for effective tutoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  title: "Preparation",
                  items: [
                    "Review the student's background and previous session notes",
                    "Prepare relevant resources and materials in advance",
                    "Check that your audio and video equipment is working properly",
                  ],
                },
                {
                  title: "During Session",
                  items: [
                    "Begin by setting clear objectives for the session",
                    "Focus on guiding students rather than providing direct answers",
                    "Regularly check for understanding and adjust your pace",
                  ],
                },
                {
                  title: "Follow-up",
                  items: [
                    "Provide a summary of what was covered and next steps",
                    "Share relevant resources or reference materials",
                    "Schedule the next session if appropriate",
                  ],
                },
              ].map(section => (
                <div key={section.title} className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2 text-sm">{section.title}</h3>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-muted-foreground">
                    {section.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={!!editSession} onOpenChange={() => setEditSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Session Status</DialogTitle>
            <DialogDescription>{editSession?.title}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select
              value={editSession?.status ?? "scheduled"}
              onValueChange={v => setEditSession(editSession ? { ...editSession, status: v } : null)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSession(null)}>Cancel</Button>
            <Button
              disabled={updateStatusMutation.isPending}
              onClick={() => editSession && updateStatusMutation.mutate({ id: editSession.id, status: editSession.status })}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
            >
              {updateStatusMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
