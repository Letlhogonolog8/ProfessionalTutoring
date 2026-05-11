import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { KindleahLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Home,
  UserCircle
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    refetchInterval: 30000,
  });
  const unreadCount = unreadData?.count ?? 0;

  if (!user) return null;

  const isStudent = user.role === "student";
  const isAdmin = user.role === "admin";

  const adminLinks = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />
    },
    {
      name: "Schedule",
      href: "/admin/schedule",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    {
      name: "Students",
      href: "/admin/students",
      icon: <Users className="h-5 w-5 mr-3" />
    },
    {
      name: "Documents",
      href: "/admin/documents",
      icon: <FileText className="h-5 w-5 mr-3" />
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase();
  };

  const studentLinks = [
    {
      name: "Dashboard",
      href: "/student",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />
    },
    {
      name: "Book Session",
      href: "/student/book-session",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    {
      name: "My Sessions",
      href: "/student/my-sessions",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    {
      name: "Chat",
      href: "/student/chat",
      icon: <MessageSquare className="h-5 w-5 mr-3" />
    },
    {
      name: "Documents",
      href: "/student/documents",
      icon: <FileText className="h-5 w-5 mr-3" />
    },
    {
      name: "Profile",
      href: "/student/profile",
      icon: <UserCircle className="h-5 w-5 mr-3" />
    }
  ];

  const tutorLinks = [
    {
      name: "Dashboard",
      href: "/tutor",
      icon: <LayoutDashboard className="h-5 w-5 mr-3" />
    },
    {
      name: "Schedule",
      href: "/tutor/schedule",
      icon: <Calendar className="h-5 w-5 mr-3" />
    },
    {
      name: "Students",
      href: "/tutor/students",
      icon: <Users className="h-5 w-5 mr-3" />
    },
    {
      name: "Chat",
      href: "/tutor/chat",
      icon: <MessageSquare className="h-5 w-5 mr-3" />
    },
    {
      name: "Documents",
      href: "/tutor/documents",
      icon: <FileText className="h-5 w-5 mr-3" />
    }
  ];

  

  const links = isAdmin ? adminLinks : (isStudent ? studentLinks : tutorLinks);
  const dashboardRoot = isAdmin ? "/admin" : (isStudent ? "/student" : "/tutor");

  const isActive = (href: string) => location === href;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center p-4 border-b">
        <Link href={dashboardRoot} className="flex items-center">
          <KindleahLogo size="small" />
        </Link>
      </div>

      <div className="flex flex-col h-full justify-between">
        <ScrollArea className="flex-1">
          <div className="p-4 pt-6 space-y-2">
            {links.map((link) => {
              const isChatLink = link.name === "Chat";
              return (
                <Button
                  key={link.href}
                  variant="ghost"
                  className={`w-full justify-start ${
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    navigate(link.href);
                  }}
                >
                  {link.icon}
                  <span className="flex-1 text-left">{link.name}</span>
                  {isChatLink && unreadCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-4 border-t space-y-4">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
              <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <ThemeToggle />

            <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 flex-col border-r bg-background">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          isMobileSidebarOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={toggleMobileSidebar}
        ></div>
        <aside className="absolute left-0 top-0 h-full w-64 bg-background flex flex-col">
          <SidebarContent />
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b h-16 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="mr-2"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <KindleahLogo size="small" />
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl || ""} alt={user.fullName} />
            <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
          </Avatar>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
