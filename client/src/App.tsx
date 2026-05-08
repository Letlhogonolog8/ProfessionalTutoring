import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import { Component, ReactNode } from "react";

// Pages
import HomePage from "@/pages/home-page";
import AboutPage from "@/pages/about-page";
import ServicesPage from "@/pages/services-page";
import AdminDashboard from "@/pages/admin-dashboard/index";
import AdminSchedule from "@/pages/admin-dashboard/schedule";
import AdminStudents from "@/pages/admin-dashboard/students";
import AdminChat from "@/pages/admin-dashboard/chat";
import AdminDocuments from "@/pages/admin-dashboard/documents";
import ContactPage from "@/pages/contact-page";
import AuthPage from "@/pages/auth-page";
import TermsPage from "@/pages/terms-page";
import PrivacyPolicyPage from "@/pages/privacy-policy-page";
import ConditionsPage from "@/pages/conditions-page";

// Student Dashboard
import StudentDashboard from "@/pages/student-dashboard/index";
import StudentBookSession from "@/pages/student-dashboard/book-session";
import StudentMySessions from "@/pages/student-dashboard/my-sessions";
import StudentChat from "@/pages/student-dashboard/chat";
import StudentDocuments from "@/pages/student-dashboard/documents";
import StudentProfile from "@/pages/student-dashboard/profile";

// Tutor Dashboard
import TutorDashboard from "@/pages/tutor-dashboard/index";
import TutorSchedule from "@/pages/tutor-dashboard/schedule";
import TutorStudents from "@/pages/tutor-dashboard/students";
import TutorChat from "@/pages/tutor-dashboard/chat";
import TutorDocuments from "@/pages/tutor-dashboard/documents";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground max-w-md">{this.state.message}</p>
          <button
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90"
            onClick={() => { this.setState({ hasError: false, message: "" }); window.location.href = "/"; }}
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/conditions" component={ConditionsPage} />

      {/* Student Dashboard */}
      <Route path="/student">
        <ProtectedRoute path="/student" component={StudentDashboard} role="student" />
      </Route>
      <Route path="/student/book-session">
        <ProtectedRoute path="/student/book-session" component={StudentBookSession} role="student" />
      </Route>
      <Route path="/student/my-sessions">
        <ProtectedRoute path="/student/my-sessions" component={StudentMySessions} role="student" />
      </Route>
      <Route path="/student/chat">
        <ProtectedRoute path="/student/chat" component={StudentChat} role="student" />
      </Route>
      <Route path="/student/documents">
        <ProtectedRoute path="/student/documents" component={StudentDocuments} role="student" />
      </Route>
      <Route path="/student/profile">
        <ProtectedRoute path="/student/profile" component={StudentProfile} role="student" />
      </Route>

      {/* Tutor Dashboard */}
      <Route path="/tutor">
        <ProtectedRoute path="/tutor" component={TutorDashboard} role="tutor" />
      </Route>
      <Route path="/tutor/schedule">
        <ProtectedRoute path="/tutor/schedule" component={TutorSchedule} role="tutor" />
      </Route>
      <Route path="/tutor/students">
        <ProtectedRoute path="/tutor/students" component={TutorStudents} role="tutor" />
      </Route>
      <Route path="/tutor/chat">
        <ProtectedRoute path="/tutor/chat" component={TutorChat} role="tutor" />
      </Route>
      <Route path="/tutor/documents">
        <ProtectedRoute path="/tutor/documents" component={TutorDocuments} role="tutor" />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin">
        {() => <ProtectedRoute path="/admin" component={AdminDashboard} role="admin" />}
      </Route>
      <Route path="/admin/schedule">
        {() => <ProtectedRoute path="/admin/schedule" component={AdminSchedule} role="admin" />}
      </Route>
      <Route path="/admin/students">
        <ProtectedRoute path="/admin/students" component={AdminStudents} role="admin" />
      </Route>
      <Route path="/admin/chat">
        <ProtectedRoute path="/admin/chat" component={AdminChat} role="admin" />
      </Route>
      <Route path="/admin/documents">
        <ProtectedRoute path="/admin/documents" component={AdminDocuments} role="admin" />
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
