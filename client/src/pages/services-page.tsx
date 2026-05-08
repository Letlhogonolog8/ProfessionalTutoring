import { PageLayout } from "@/components/layout/page-layout";
import { ServiceCard, type ServiceItem } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  FileText,
  BarChart2,
  Edit,
  Video,
  Code,
  Users,
  CheckCircle
} from "lucide-react";

export default function ServicesPage() {
  // Services data
  const services: ServiceItem[] = [
    {
      icon: <FileText className="h-6 w-6 text-white" />,
      title: "Thesis Development",
      features: [
        "Proposal writing assistance",
        "Literature review guidance",
        "Methodology development",
        "Data collection planning",
        "Analysis and interpretation"
      ]
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-white" />,
      title: "Research Methods",
      features: [
        "Quantitative research techniques",
        "Qualitative analysis methods",
        "Mixed methods approach",
        "Statistical software training",
        "Research design consultation"
      ]
    },
    {
      icon: <Edit className="h-6 w-6 text-white" />,
      title: "Technical Writing",
      features: [
        "Language editing services",
        "Proofreading and revision",
        "Citation and referencing",
        "APA, MLA, Harvard formatting",
        "Document structuring guidance"
      ]
    },
    {
      icon: <Video className="h-6 w-6 text-white" />,
      title: "Live Tutoring",
      features: [
        "One-on-one video sessions",
        "Real-time document collaboration",
        "Interactive learning materials",
        "Flexible scheduling options",
        "Session recording for review"
      ]
    },
    {
      icon: <Code className="h-6 w-6 text-white" />,
      title: "Data Analysis",
      features: [
        "Statistical analysis (SPSS, R)",
        "Qualitative coding (NVivo)",
        "Data visualization techniques",
        "Results interpretation",
        "Findings presentation"
      ]
    },
    {
      icon: <Users className="h-6 w-6 text-white" />,
      title: "Group Workshops",
      features: [
        "Research methodology classes",
        "Academic writing workshops",
        "Software training sessions",
        "Collaborative learning activities",
        "Peer review opportunities"
      ]
    }
  ];

  // Service packages
  const packages = [
    {
      name: "Basic",
      price: "R800",
      description: "Perfect for undergraduate students needing occasional help",
      features: [
        "2 hours of one-on-one tutoring",
        "Document review (up to 10 pages)",
        "Email support",
        "Access to learning resources"
      ],
      recommended: false
    },
    {
      name: "Standard",
      price: "R1 700",
      description: "Ideal for graduate students working on research projects",
      features: [
        "5 hours of one-on-one tutoring",
        "Document review (up to 25 pages)",
        "Priority email support",
        "Access to learning resources",
        "Statistical analysis assistance"
      ],
      recommended: true
    },
    {
      name: "Premium",
      price: "R3 300",
      description: "Comprehensive support for thesis and dissertation students",
      features: [
        "10 hours of one-on-one tutoring",
        "Unlimited document review",
        "Priority email and chat support",
        "Access to all learning resources",
        "Advanced statistical analysis",
        "Research design consultation",
        "Presentation preparation assistance"
      ],
      recommended: false
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600/90 to-blue-500/90 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Our Services</h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Comprehensive academic support to help you excel in your research journey
          </p>
          <Link href="#service-list">
            <a>
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                Explore Services
              </Button>
            </a>
          </Link>
        </div>
      </section>

      {/* Service List */}
      <section id="service-list" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Academic Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From thesis development to data analysis, we offer comprehensive support for all stages of your academic journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Service Packages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect package to suit your academic needs and budget
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`bg-card rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg relative ${
                  pkg.recommended ? 'ring-2 ring-primary' : 'gradient-border'
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                    Recommended
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-end mb-4">
                    <span className="text-3xl font-bold">{pkg.price}</span>
                    <span className="text-muted-foreground ml-1">/ month</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{pkg.description}</p>

                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    className={`w-full ${
                      pkg.recommended
                        ? 'bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90'
                        : ''
                    }`}
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10 text-muted-foreground">
            <p>Need a custom package? <Link href="/contact"><a className="text-primary hover:underline">Contact us</a></Link> for a tailored solution.</p>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our simple process to get you started with our academic tutoring services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
            <p className="text-muted-foreground">
              Create an account to get started with our tutoring services. Simply register and select your preferred package.
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Book a Session</h3>
            <p className="text-muted-foreground">
              Schedule a tutoring session at your convenience. Choose from available time slots and specify your needs.
            </p>
          </div>

          <div className="text-center">
            <div className="h-16 w-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
            <p className="text-muted-foreground">
              Connect with your tutor via our platform for one-on-one guidance, document reviews, and personalized support.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href="/auth">
            <a>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                Get Started Now
              </Button>
            </a>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find answers to common questions about our tutoring services
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">How are tutoring sessions conducted?</h3>
              <p className="text-muted-foreground">
                Our tutoring sessions are conducted online through our platform, featuring video calls, screen sharing, and real-time document collaboration. You can interact directly with your tutor in a virtual environment designed for productive learning.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">What qualifications do your tutors have?</h3>
              <p className="text-muted-foreground">
                Our lead tutor, Samuel Silabele, holds a PhD in Research Methodology and has over 10 years of experience in academic tutoring. He specializes in quantitative, qualitative, and mixed methods research approaches.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Can I get help with statistical analysis?</h3>
              <p className="text-muted-foreground">
                Yes, we offer specialized assistance with statistical analysis using various software packages including SPSS, R, and others. Our tutors can help you with data preparation, analysis, interpretation, and visualization.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">How do I schedule a tutoring session?</h3>
              <p className="text-muted-foreground">
                After creating an account, you can access our scheduling system to book sessions at your convenience. Simply select an available time slot, specify your requirements, and confirm your booking. You'll receive a confirmation and reminder before your session.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Can I share documents with my tutor?</h3>
              <p className="text-muted-foreground">
                Yes, our platform includes a document sharing feature that allows you to securely upload and share your research papers, data, and other materials with your tutor. This enables collaborative review and feedback during your sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Excel in Your Academic Journey?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Sign up today and experience the difference our expert tutoring can make in your research and academic performance.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth">
              <a>
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </a>
            </Link>
            <Link href="/contact">
              <a>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
