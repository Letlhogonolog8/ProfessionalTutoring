import { PageLayout } from "@/components/layout/page-layout";
import { TutorProfile } from "@/components/tutor-profile";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle, Award, Users, BookOpen } from "lucide-react";

export default function AboutPage() {
  // Company history timeline
  const historyTimeline = [
    {
      year: "2020",
      title: "Foundation of KindLeah Investment",
      description: "The company was established with a vision to provide expert academic tutoring and research methodology services to students at all levels."
    },
    {
      year: "2021",
      title: "Expansion of Services",
      description: "Added specialized services in quantitative and qualitative research methodologies, catering to graduate and postgraduate students."
    },
    {
      year: "2022",
      title: "Introduction of Online Tutoring",
      description: "Launched our digital platform to provide remote tutoring services, expanding our reach to students worldwide."
    },
    {
      year: "2023",
      title: "Advanced Research Methodology Programs",
      description: "Developed comprehensive programs focusing on advanced statistical analysis and research design for doctoral students."
    }
  ];

  // Company values
  const companyValues = [
    {
      icon: <CheckCircle className="h-8 w-8 text-primary" />,
      title: "Academic Excellence",
      description: "We uphold the highest standards of academic integrity and excellence in all our tutoring services."
    },
    {
      icon: <Award className="h-8 w-8 text-primary" />,
      title: "Personalized Approach",
      description: "We recognize that each student has unique needs and learning styles, and we tailor our tutoring accordingly."
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Collaborative Learning",
      description: "We believe in fostering a collaborative environment where knowledge is shared freely between tutors and students."
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Continuous Development",
      description: "We are committed to staying current with the latest research methodologies and academic standards."
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600/90 to-blue-500/90 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">About KindLeah Investment</h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            We are dedicated to empowering students with expert tutoring and research methodology services to achieve academic excellence.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-card rounded-xl p-8 shadow-md gradient-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 h-8 w-2 rounded mr-4"></span>
              Our Mission
            </h2>
            <p className="text-muted-foreground mb-6">
              To provide exceptional academic tutoring services that empower students to excel in their research endeavors. We aim to bridge the gap between theoretical knowledge and practical application, guiding students through every stage of their academic journey.
            </p>
            <p className="text-muted-foreground">
              By offering personalized support and expertise in research methodology, we strive to help students develop the skills and confidence they need to succeed in their academic careers and beyond.
            </p>
          </div>

          <div className="bg-card rounded-xl p-8 shadow-md gradient-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 h-8 w-2 rounded mr-4"></span>
              Our Vision
            </h2>
            <p className="text-muted-foreground mb-6">
              To be recognized as the leading provider of academic research methodology tutoring, known for our commitment to excellence, innovation, and student success. We envision a future where all students have access to high-quality academic support.
            </p>
            <p className="text-muted-foreground">
              We aim to create a global community of scholars who are equipped with the knowledge and skills to conduct meaningful research and make significant contributions to their fields of study.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our approach to academic tutoring and student support
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="bg-card rounded-xl p-6 shadow-md flex items-start gradient-border relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
                <div className="mr-4 flex-shrink-0 mt-1">{value.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our History */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From our founding to the present, follow the evolution of KindLeah Investment
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-purple-600 to-blue-500 rounded hidden md:block"></div>

          <div className="space-y-12">
            {historyTimeline.map((event, index) => (
              <div key={index} className={`md:flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className="md:w-1/2 p-4">
                  <div className={`bg-card rounded-xl p-6 shadow-md gradient-border relative overflow-hidden ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
                    <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1 rounded text-sm font-semibold mb-3">
                      {event.year}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <p className="text-muted-foreground">{event.description}</p>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Tutor</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert guidance from our specialized academic tutor
            </p>
          </div>

          <TutorProfile expanded={true} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Elevate Your Academic Performance?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join KindLeah Investment today and experience personalized tutoring from our expert in research methodology.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-primary hover:bg-gray-100" asChild>
              <Link href="/auth">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
