import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatInterface } from "@/components/chat/chat-interface";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Search, MessageSquare } from "lucide-react";

export default function AdminChat() {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const { data: students = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=student"] });
  const { data: tutors = [] } = useQuery<User[]>({ queryKey: ["/api/users?role=tutor"] });

  const allUsers = [...tutors, ...students].filter(u => u.id !== user?.id);

  const filtered = allUsers.filter(u =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const roleColor = (role: string) =>
    role === "tutor" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600";

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Message Center</h1>
          <p className="text-muted-foreground mt-1">Send messages to tutors and students</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]">
          {/* User list */}
          <Card className="md:col-span-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-2 flex-shrink-0">
              <CardTitle className="text-base">Conversations</CardTitle>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search}
                  onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-sm" />
              </div>
            </CardHeader>
            <ScrollArea className="flex-1">
              <CardContent className="p-2 space-y-1">
                {filtered.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No users found</p>
                ) : (
                  filtered.map(u => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                        selectedUser?.id === u.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      }`}
                    >
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className={`text-xs font-semibold ${roleColor(u.role)}`}>
                          {getInitials(u.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${roleColor(u.role)} border-0`}>
                        {u.role}
                      </Badge>
                    </button>
                  ))
                )}
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Chat area */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedUser ? (
              <ChatInterface recipientId={selectedUser.id} />
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">Select a user to start messaging</p>
                  <p className="text-sm text-muted-foreground mt-1">Choose a tutor or student from the left panel</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
