import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Session } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Users, BookOpen, CalendarCheck, TrendingUp,
  Plus, Trash2, Phone, Mail, ChevronRight, UserCog,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showAddTutor, setShowAddTutor] = useState(false);
  const [deleteTutor, setDeleteTutor] = useState<User | null>(null);
  const [newTutor, setNewTutor] = useState({
    username: "", email: "", fullName: "", password: "", phoneNumber: "", bio: "",
  });

  const { data: tutors = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=tutor"] });
  const { data: sessions = [] } = useQuery<Session[]>({ queryKey: ["/api/sessions"] });
  const { data: students = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=student"] });

  const upcomingSessions = sessions.filter(
    s => new Date(s.startTime) > new Date() && s.status !== "cancelled"
  );
  const completedSessions = sessions.filter(s => s.status === "completed");

  const addTutorMutation = useMutation({
    mutationFn: async (data: typeof newTutor & { role: string }) => {
      const res = await apiRequest("POST", "/api/admin/tutors", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=tutor"] });
      toast({ title: "Tutor added", description: "New tutor account created successfully." });
      setNewTutor({ username: "", email: "", fullName: "", password: "", phoneNumber: "", bio: "" });
      setShowAddTutor(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to add tutor", description: err.message, variant: "destructive" });
    },
  });

  const deleteTutorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=tutor"] });
      toast({ title: "Tutor removed", description: "Tutor account deleted successfully." });
      setDeleteTutor(null);
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const handleAddTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTutor.username || !newTutor.email || !newTutor.fullName || !newTutor.password) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    addTutorMutation.mutate({ ...newTutor, role: "tutor" });
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const stats = [
    {
      title: "Total Tutors", value: tutors.length, icon: <UserCog className="h-5 w-5" />,
      sub: "Active teaching staff", color: "text-purple-500", bg: "bg-purple-500/10",
    },
    {
      title: "Total Students", value: students.length, icon: <Users className="h-5 w-5" />,
      sub: "Registered learners", color: "text-blue-500", bg: "bg-blue-500/10",
    },
    {
      title: "Upcoming Sessions", value: upcomingSessions.length, icon: <CalendarCheck className="h-5 w-5" />,
      sub: "Scheduled ahead", color: "text-green-500", bg: "bg-green-500/10",
    },
    {
      title: "Completed Sessions", value: completedSessions.length, icon: <TrendingUp className="h-5 w-5" />,
      sub: "All time", color: "text-orange-500", bg: "bg-orange-500/10",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage tutors, students and platform activity</p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 gap-2"
            onClick={() => setShowAddTutor(true)}
          >
            <Plus className="h-4 w-4" /> Add Tutor
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <Card key={s.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-muted-foreground">{s.title}</span>
                  <div className={`h-9 w-9 rounded-full ${s.bg} flex items-center justify-center ${s.color}`}>
                    {s.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold">{s.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "View All Students", href: "/admin/students", icon: <Users className="h-4 w-4" /> },
            { label: "Session Schedule", href: "/admin/schedule", icon: <CalendarCheck className="h-4 w-4" /> },
            { label: "Documents", href: "/admin/documents", icon: <BookOpen className="h-4 w-4" /> },
          ].map(l => (
            <Link key={l.href} href={l.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer hover:border-primary/40">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-sm font-medium">
                    {l.icon}{l.label}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent sessions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Latest tutoring activity</CardDescription>
            </div>
            <Link href="/admin/schedule">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No sessions yet</p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 5).map(session => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium text-sm">{session.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.startTime), "MMM d, yyyy · h:mm a")}
                      </p>
                    </div>
                    <Badge variant={
                      session.status === "completed" ? "default" :
                      session.status === "cancelled" ? "destructive" : "secondary"
                    }>
                      {session.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tutors list */}
        <Card>
          <CardHeader>
            <CardTitle>Tutors</CardTitle>
            <CardDescription>All registered tutors on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {tutors.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No tutors yet</p>
            ) : (
              <div className="space-y-3">
                {tutors.map(tutor => (
                  <div key={tutor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-purple-500/10 text-purple-600 text-sm font-semibold">
                          {getInitials(tutor.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{tutor.fullName}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />{tutor.email}
                          </span>
                          {tutor.phoneNumber && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />{tutor.phoneNumber}
                            </span>
                          )}
                        </div>
                        {tutor.bio && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">{tutor.bio}</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTutor(tutor)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Tutor Dialog */}
      <Dialog open={showAddTutor} onOpenChange={setShowAddTutor}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Tutor</DialogTitle>
            <DialogDescription>Create a tutor account. They can log in immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTutor}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input placeholder="Samuel Dlamini" value={newTutor.fullName}
                    onChange={e => setNewTutor({ ...newTutor, fullName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Username *</Label>
                  <Input placeholder="samuel" value={newTutor.username}
                    onChange={e => setNewTutor({ ...newTutor, username: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" placeholder="samuel@example.com" value={newTutor.email}
                  onChange={e => setNewTutor({ ...newTutor, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Password *</Label>
                  <Input type="password" placeholder="Min 6 characters" value={newTutor.password}
                    onChange={e => setNewTutor({ ...newTutor, password: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input type="tel" placeholder="+27 71 234 5678" value={newTutor.phoneNumber}
                    onChange={e => setNewTutor({ ...newTutor, phoneNumber: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Bio</Label>
                <Textarea placeholder="Brief description of expertise and background..." rows={3}
                  value={newTutor.bio}
                  onChange={e => setNewTutor({ ...newTutor, bio: e.target.value })} />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddTutor(false)}>Cancel</Button>
              <Button type="submit" disabled={addTutorMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                {addTutorMutation.isPending ? "Adding..." : "Add Tutor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTutor} onOpenChange={() => setDeleteTutor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tutor</DialogTitle>
            <DialogDescription>
              This will permanently delete <strong>{deleteTutor?.fullName}</strong>'s account and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTutor(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteTutorMutation.isPending}
              onClick={() => deleteTutor && deleteTutorMutation.mutate(deleteTutor.id)}>
              {deleteTutorMutation.isPending ? "Deleting..." : "Delete Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
