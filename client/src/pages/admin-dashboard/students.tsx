import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Session } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, Trash2, Mail, Phone, Calendar, Users, Plus, Edit2 } from "lucide-react";

export default function AdminStudents() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteStudent, setDeleteStudent] = useState<User | null>(null);
  const [editStudent, setEditStudent] = useState<User | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);

  const [newStudent, setNewStudent] = useState({
    username: "", email: "", fullName: "", password: "", phoneNumber: "",
  });
  const [editForm, setEditForm] = useState({
    fullName: "", email: "", phoneNumber: "",
  });

  const { data: students = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=student"],
  });
  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const getSessionCount = (studentId: number) =>
    sessions.filter(s => s.studentId === studentId).length;

  const getUpcomingCount = (studentId: number) =>
    sessions.filter(s => s.studentId === studentId && new Date(s.startTime) > new Date() && s.status !== "cancelled").length;

  const filteredStudents = students.filter(s =>
    s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.phoneNumber ?? "").includes(searchQuery)
  );

  const addStudentMutation = useMutation({
    mutationFn: async (data: typeof newStudent & { role: string }) => {
      const res = await apiRequest("POST", "/api/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=student"] });
      toast({ title: "Student registered", description: "New student account created successfully." });
      setNewStudent({ username: "", email: "", fullName: "", password: "", phoneNumber: "" });
      setShowAddStudent(false);
    },
    onError: (err: Error) => {
      toast({ title: "Failed to register student", description: err.message, variant: "destructive" });
    },
  });

  const editStudentMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof editForm }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=student"] });
      toast({ title: "Student updated", description: "Student profile updated successfully." });
      setEditStudent(null);
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users?role=student"] });
      toast({ title: "Student removed", description: "Student account deleted." });
      setDeleteStudent(null);
    },
    onError: (err: Error) => {
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    },
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.username || !newStudent.email || !newStudent.fullName || !newStudent.password) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    addStudentMutation.mutate({ ...newStudent, role: "student" });
  };

  const openEditStudent = (student: User) => {
    setEditStudent(student);
    setEditForm({
      fullName: student.fullName,
      email: student.email,
      phoneNumber: student.phoneNumber ?? "",
    });
  };

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
            <p className="text-muted-foreground mt-1">View and manage all registered students</p>
          </div>
          <Button
            className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 gap-2"
            onClick={() => setShowAddStudent(true)}
          >
            <Plus className="h-4 w-4" /> Register Student
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-lg font-bold">
                {students.length}
              </div>
              <span className="text-sm font-medium text-muted-foreground">Total Students</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-lg font-bold">
                {sessions.filter(s => new Date(s.startTime) > new Date() && s.status !== "cancelled").length}
              </div>
              <span className="text-sm font-medium text-muted-foreground">Active Bookings</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center text-lg font-bold">
                {sessions.filter(s => s.status === "completed").length}
              </div>
              <span className="text-sm font-medium text-muted-foreground">Completed Sessions</span>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Students Directory</CardTitle>
            <CardDescription>{filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found</CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading students...</p>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No students match your search" : "No students registered yet"}
                </p>
                {!searchQuery && (
                  <Button className="mt-4 gap-2" onClick={() => setShowAddStudent(true)}>
                    <Plus className="h-4 w-4" /> Register First Student
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStudents.map(student => {
                  const total = getSessionCount(student.id);
                  const upcoming = getUpcomingCount(student.id);
                  return (
                    <div key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-blue-500/10 text-blue-600 text-sm font-semibold">
                            {getInitials(student.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm">{student.fullName}</p>
                          <div className="flex flex-wrap items-center gap-3 mt-0.5">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />{student.email}
                            </span>
                            {student.phoneNumber && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />{student.phoneNumber}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="flex items-center gap-1 text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">
                              <Calendar className="h-3 w-3" />{total} session{total !== 1 ? "s" : ""}
                            </span>
                            {upcoming > 0 && (
                              <span className="text-xs bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full">
                                {upcoming} upcoming
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditStudent(student)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteStudent(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Register Student Dialog */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Register New Student</DialogTitle>
            <DialogDescription>Create a student account. They can log in immediately.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStudent}>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Full Name *</Label>
                  <Input placeholder="Jane Dlamini" value={newStudent.fullName}
                    onChange={e => setNewStudent({ ...newStudent, fullName: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Username *</Label>
                  <Input placeholder="jane" value={newStudent.username}
                    onChange={e => setNewStudent({ ...newStudent, username: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input type="email" placeholder="jane@example.com" value={newStudent.email}
                  onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Password *</Label>
                  <Input type="password" placeholder="Min 6 characters" value={newStudent.password}
                    onChange={e => setNewStudent({ ...newStudent, password: e.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Phone Number</Label>
                  <Input type="tel" placeholder="+27 71 234 5678" value={newStudent.phoneNumber}
                    onChange={e => setNewStudent({ ...newStudent, phoneNumber: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddStudent(false)}>Cancel</Button>
              <Button type="submit" disabled={addStudentMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                {addStudentMutation.isPending ? "Registering..." : "Register Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update profile information for {editStudent?.fullName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Full Name</Label>
              <Input value={editForm.fullName}
                onChange={e => setEditForm({ ...editForm, fullName: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input type="tel" placeholder="+27 71 234 5678" value={editForm.phoneNumber}
                onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditStudent(null)}>Cancel</Button>
            <Button
              disabled={editStudentMutation.isPending}
              onClick={() => editStudent && editStudentMutation.mutate({ id: editStudent.id, data: editForm })}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
            >
              {editStudentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Permanently delete <strong>{deleteStudent?.fullName}</strong>'s account? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteStudent(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteMutation.isPending}
              onClick={() => deleteStudent && deleteMutation.mutate(deleteStudent.id)}>
              {deleteMutation.isPending ? "Deleting..." : "Delete Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
