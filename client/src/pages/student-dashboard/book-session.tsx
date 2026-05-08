import { useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CalendarView } from "@/components/scheduler/calendar-view";
import { TutorProfile } from "@/components/tutor-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export default function BookSession() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("calendar");
  
  // Get the tutor
  const { data: tutors = [], isLoading: tutorsLoading } = useQuery<User[]>({
    queryKey: ["/api/users?role=tutor"],
  });

  // For simplicity, we're assuming there's only one tutor in the system
  const tutor = tutors.length > 0 ? tutors[0] : undefined;

  const handleBookSession = () => {
    setActiveTab("calendar");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Book a Session</h1>
          <p className="text-muted-foreground mt-2">
            Schedule a tutoring session with our expert research methodology tutor.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="tutor">Select Tutor</TabsTrigger>
            <TabsTrigger value="calendar">Schedule Session</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tutor">
            <Card>
              <CardHeader>
                <CardTitle>Available Tutor</CardTitle>
                <CardDescription>
                  Meet our expert research methodology tutor
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tutorsLoading ? (
                  <div className="text-center py-8">Loading tutor information...</div>
                ) : tutor ? (
                  <div className="space-y-6">
                    <TutorProfile onBookSession={handleBookSession} />
                    
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Tutoring Areas</h3>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>Research Methodology (Quantitative, Qualitative, Mixed Methods)</li>
                        <li>Academic Writing and Thesis Development</li>
                        <li>Statistical Analysis (SPSS, R)</li>
                        <li>Literature Review and Referencing</li>
                        <li>Research Design and Data Collection</li>
                      </ul>
                    </div>
                    
                    <div className="text-center pt-4">
                      <Button 
                        onClick={handleBookSession}
                        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
                      >
                        Schedule with this Tutor
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No tutors are currently available.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Your Session</CardTitle>
                <CardDescription>
                  Select a date and time for your tutoring session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tutor ? (
                  <CalendarView tutorId={tutor.id} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Please select a tutor first.
                    <div className="mt-4">
                      <Button onClick={() => setActiveTab("tutor")}>
                        Select Tutor
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Booking Information */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Information</CardTitle>
            <CardDescription>
              Important details about scheduling a session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Session Duration</h3>
                <p className="text-muted-foreground">
                  You can book sessions in increments of 30 minutes, with a minimum duration of 1 hour.
                  For comprehensive research methodology assistance, we recommend 1.5-2 hour sessions.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Cancellation Policy</h3>
                <p className="text-muted-foreground">
                  Sessions can be cancelled or rescheduled up to 24 hours before the scheduled time without penalty.
                  Late cancellations may be subject to our cancellation policy.
                </p>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Preparation</h3>
                <p className="text-muted-foreground">
                  For the most productive session, please share any relevant documents ahead of time through the
                  Documents section. Consider preparing specific questions or topics you'd like to cover.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
