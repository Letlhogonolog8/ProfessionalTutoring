import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Session, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Calendar, Clock, Plus, Trash2, Edit2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-200",
  completed: "bg-green-500/10 text-green-600 border-green-200",
  cancelled: "bg-red-500/10 text-red-600 border-red-200",
};

export default function AdminSchedule() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteSession, setDeleteSession] = useState<Session | null>(null);
  const [editSession, setEditSession] = useState<Session | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", tutorId: "", studentId: "",
    startTime: "", endTime: "", status: "scheduled",
  });

  const { data: sessions = [], isLoading } = useQuery<Session[]>({ queryKey: ["/api/sessions"] });
  const { data: tutors = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=tutor"] });
  const { data: students = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=student"] });

  const userMap = [...tutors, ...students].reduce<Record<number, User>>((acc, u) => {
    acc[u.id] = u;
    return acc;
  }, {});

  const now = new Date();
  const upcoming = sessions.filter(s => new Date(s.startTime) > now && s.status !== "cancelled");
  const past = sessions.filter(s => new Date(s.startTime) <= now && s.status !== "cancelled");
  const cancelled = sessions.filter(s => s.status === "cancelled");

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/sessions", {
        ...data,
        tutorId: Number(data.tutorId),
        studentId: Number(data.studentId),
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Session created" });
      setShowCreate(false);
      setForm({ title: "", description: "", tutorId: "", studentId: "", startTime: "", endTime: "", status: "scheduled" });
    },
    onError: (err: Error) => toast({ title: "Failed", description: err.message, variant: "destructive" }),
  });

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
    onError: (err: Error) => toast({ title: "Update failed", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      toast({ title: "Session deleted" });
      setDeleteSession(null);
    },
    onError: (err: Error) => toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
  });

  const renderCard = (session: Session) => {
    const tutor = userMap[session.tutorId];
    const student = userMap[session.studentId];
    return (
      <div key={session.id} className="p-4 border rounded-lg flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{session.title}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {format(new Date(session.startTime), "MMM d, yyyy · h:mm a")} –{" "}
              {format(new Date(session.endTime), "h:mm a")}
            </div>
            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
              {tutor && <span className="bg-purple-500/10 text-purple-600 px-2 py-0.5 rounded-full">Tutor: {tutor.fullName}</span>}
              {student && <span className="bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">Student: {student.fullName}</span>}
            </div>
            {session.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">{session.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs px-2 py-1 rounded-full border font-medium ${STATUS_COLORS[session.status] ?? "bg-muted text-muted-foreground"}`}>
            {session.status}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setEditSession(session)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteSession(session)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  };

  const EmptyState = ({ label }: { label: string }) => (
    <p className="text-center text-muted-foreground py-8">{label}</p>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Session Schedule</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all tutoring sessions</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 gap-2"
            onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Upcoming", count: upcoming.length, color: "text-blue-600", bg: "bg-blue-500/10" },
            { label: "Completed", count: past.filter(s => s.status === "completed").length, color: "text-green-600", bg: "bg-green-500/10" },
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

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                {isLoading ? <EmptyState label="Loading..." /> :
                  upcoming.length === 0 ? <EmptyState label="No upcoming sessions" /> :
                  upcoming.map(renderCard)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                {isLoading ? <EmptyState label="Loading..." /> :
                  past.length === 0 ? <EmptyState label="No past sessions" /> :
                  past.map(renderCard)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                {isLoading ? <EmptyState label="Loading..." /> :
                  cancelled.length === 0 ? <EmptyState label="No cancelled sessions" /> :
                  cancelled.map(renderCard)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Session Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Session</DialogTitle>
            <DialogDescription>Schedule a tutoring session between a tutor and student.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input placeholder="Research Methodology — Chapter 3"
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea placeholder="Session topics and objectives..." rows={2}
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tutor *</Label>
                <Select value={form.tutorId} onValueChange={v => setForm({ ...form, tutorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select tutor" /></SelectTrigger>
                  <SelectContent>
                    {tutors.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Student *</Label>
                <Select value={form.studentId} onValueChange={v => setForm({ ...form, studentId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                  <SelectContent>
                    {students.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start *</Label>
                <Input type="datetime-local" value={form.startTime}
                  onChange={e => setForm({ ...form, startTime: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>End *</Label>
                <Input type="datetime-local" value={form.endTime}
                  onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={createMutation.isPending}
              onClick={() => createMutation.mutate(form)}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
              {createMutation.isPending ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button disabled={updateStatusMutation.isPending}
              onClick={() => editSession && updateStatusMutation.mutate({ id: editSession.id, status: editSession.status })}>
              {updateStatusMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteSession} onOpenChange={() => setDeleteSession(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{deleteSession?.title}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSession(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending}
              onClick={() => deleteSession && deleteMutation.mutate(deleteSession.id)}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
