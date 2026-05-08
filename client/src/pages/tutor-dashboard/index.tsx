import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User, Session } from "@shared/schema";
import { Link } from "wouter";
import {
  Calendar, Clock, Users, BookOpen, TrendingUp,
  ChevronRight, MessageSquare, FileText, CalendarCheck,
} from "lucide-react";
import { format, isToday, isFuture } from "date-fns";

export default function TutorDashboard() {
  const { user } = useAuth();

  const { data: sessions = [] } = useQuery<Session[]>({ queryKey: ["/api/sessions"] });
  const { data: students = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=student"] });

  const tutorSessions = sessions.filter(s => s.tutorId === user?.id);
  const upcomingSessions = tutorSessions
    .filter(s => isFuture(new Date(s.startTime)) && s.status !== "cancelled")
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const todaySessions = tutorSessions.filter(s => isToday(new Date(s.startTime)) && s.status !== "cancelled");
  const completedSessions = tutorSessions.filter(s => s.status === "completed");

  // Show all registered students (not only those with existing sessions)
  const activeStudents = students;

  const getStudentName = (studentId: number) =>
    students.find(s => s.id === studentId)?.fullName ?? "Unknown Student";

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const stats = [
    {
      title: "Total Sessions", value: tutorSessions.length,
      icon: <BookOpen className="h-5 w-5" />, sub: "All time",
      color: "text-purple-500", bg: "bg-purple-500/10",
    },
    {
      title: "Active Students", value: activeStudents.length,
      icon: <Users className="h-5 w-5" />, sub: "Currently enrolled",
      color: "text-blue-500", bg: "bg-blue-500/10",
    },
    {
      title: "Today's Sessions", value: todaySessions.length,
      icon: <Clock className="h-5 w-5" />, sub: "Scheduled today",
      color: "text-orange-500", bg: "bg-orange-500/10",
    },
    {
      title: "Completed", value: completedSessions.length,
      icon: <TrendingUp className="h-5 w-5" />, sub: "Sessions finished",
      color: "text-green-500", bg: "bg-green-500/10",
    },
  ];

  const quickLinks = [
    { href: "/tutor/schedule", label: "Schedule", icon: <CalendarCheck className="h-4 w-4" /> },
    { href: "/tutor/students", label: "Students", icon: <Users className="h-4 w-4" /> },
    { href: "/tutor/chat", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
    { href: "/tutor/documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-purple-600/10 to-blue-500/10 p-6 rounded-xl border border-purple-500/10">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.fullName}</h1>
          <p className="text-muted-foreground mt-1">
            You have <strong className="text-foreground">{upcomingSessions.length}</strong> upcoming session{upcomingSessions.length !== 1 ? "s" : ""} and{" "}
            <strong className="text-foreground">{activeStudents.length}</strong> active student{activeStudents.length !== 1 ? "s" : ""}.
          </p>
          <div className="mt-4 flex gap-3 flex-wrap">
            <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
              <Link href="/tutor/schedule">View Schedule</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tutor/students">My Students</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => (
            <Card key={stat.title}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                </div>
                <p className="text-sm font-medium mt-2">{stat.title}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Upcoming Sessions</CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                  <Link href="/tutor/schedule">
                    View all <ChevronRight className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming sessions</p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link href="/tutor/schedule">Open Calendar</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingSessions.slice(0, 5).map(session => (
                    <div key={session.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getStudentName(session.studentId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isToday(new Date(session.startTime)) ? (
                            <span className="text-orange-600 font-medium">Today · </span>
                          ) : null}
                          {format(new Date(session.startTime), "MMM d · h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Students + Quick Links */}
          <div className="space-y-4">
            {/* Quick Links */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                {quickLinks.map(link => (
                  <Button key={link.href} asChild variant="outline" className="justify-start gap-2 h-10">
                    <Link href={link.href}>
                      {link.icon}
                      <span>{link.label}</span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Active Students */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Active Students</CardTitle>
                  <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                    <Link href="/tutor/students">
                      View all <ChevronRight className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No students assigned yet</p>
                ) : (
                  <div className="space-y-2">
                    {activeStudents.slice(0, 4).map(student => (
                      <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs font-semibold bg-blue-500/10 text-blue-600">
                            {getInitials(student.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{student.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {tutorSessions.filter(s => s.studentId === student.id).length} sessions
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
