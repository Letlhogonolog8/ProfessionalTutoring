import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/page-layout";
import { TutorProfile } from "@/components/tutor-profile";
import { ServiceCard, type ServiceItem } from "@/components/service-card";
import { MobileAccess } from "@/components/mobile-access";
import { 
  FileText, 
  BarChart2, 
  Edit, 
  Video, 
  Code, 
  Users 
} from "lucide-react";
import { 
  FaGraduationCap, 
  FaLaptop, 
  FaCalendarCheck, 
  FaFileAlt, 
  FaComments, 
  FaChartLine 
} from "react-icons/fa";
import tutorImage from "@assets/image_1744141820357.png";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function HomePage() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    fullName: "", email: "", subject: "", message: "",
  });
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    try {
      await apiRequest("POST", "/api/contact", contactForm);
      toast({ title: "Message sent!", description: "We'll get back to you soon." });
      setContactForm({ fullName: "", email: "", subject: "", message: "" });
    } catch {
      toast({ title: "Failed to send", description: "Please try again.", variant: "destructive" });
    } finally {
      setContactLoading(false);
    }
  };
  // Features section data
  const features = [
    {
      icon: <FaGraduationCap className="text-white text-xl" />,
      title: "Expert Tutors",
      description: "Learn from qualified tutors with extensive experience in research methodology and academic writing."
    },
    {
      icon: <FaLaptop className="text-white text-xl" />,
      title: "Interactive Sessions",
      description: "Engage in real-time video calls, live chat, and collaborative document editing with your tutor."
    },
    {
      icon: <FaCalendarCheck className="text-white text-xl" />,
      title: "Flexible Scheduling",
      description: "Book sessions at your convenience with our user-friendly scheduling system that updates in real-time."
    },
    {
      icon: <FaFileAlt className="text-white text-xl" />,
      title: "Document Management",
      description: "Seamlessly share files, receive feedback, and collaborate on research papers and academic assignments."
    },
    {
      icon: <FaComments className="text-white text-xl" />,
      title: "Instant Communication",
      description: "Stay connected with SMS notifications and instant messaging for quick questions and updates."
    },
    {
      icon: <FaChartLine className="text-white text-xl" />,
      title: "Progress Tracking",
      description: "Monitor your academic growth with detailed progress reports and milestone achievements."
    }
  ];

  // Services section data
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

  // Testimonials data
  const testimonials = [
    {
      name: "Michael K.",
      role: "PhD Student",
      initials: "MK",
      content: "Samuel's guidance on my research methodology completely transformed my thesis. His expert knowledge and patient explanation of complex statistical concepts made all the difference."
    },
    {
      name: "Sarah J.",
      role: "Master's Student",
      initials: "SJ",
      content: "The live tutoring sessions were incredibly helpful. Being able to share my screen and get real-time feedback on my data analysis made learning so much more effective than traditional methods."
    },
    {
      name: "David R.",
      role: "Undergraduate",
      initials: "DR",
      content: "The technical writing assistance I received improved my grades dramatically. I learned so much about proper academic writing that I'll use throughout my entire academic career."
    }
  ];

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Expert Research <br />
              Methodology & <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Academic Tutoring</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-lg">
              Elevate your academic and research journey with KindLeah Investment's personalized tutoring services. Our expert methodology ensures your success in any academic endeavor.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 py-6 px-6">
                <Link href="#services">
                  Explore Our Services
                </Link>
              </Button>
              <Button asChild variant="outline" className="py-6 px-6">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
          <div className="order-1 md:order-2 flex justify-center hero-gradient-border bg-black rounded-lg p-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-500/20 rounded-lg"></div>
            <img 
              className="rounded-lg max-h-[450px] w-auto object-cover relative z-10" 
              src={tutorImage}
              alt="Samuel Silabele - Lead Tutor" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Why Choose Our Tutoring Services
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Experience the difference with our personalized approach to academic success
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg gradient-border relative overflow-hidden"
              >
                <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
                <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet The Tutor Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">
            Meet Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Expert Tutor</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Learn from the best in academic research methodology
          </p>
        </div>

        <TutorProfile expanded={true} />
      </section>

      {/* Services Section */}
      <section id="services" className="py-12 sm:py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
              Our Services
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
              Comprehensive support for all your academic and research needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold">
            What Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">Students Say</span>
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Hear from students who have transformed their academic journey with our tutoring services
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-card p-6 rounded-xl shadow-md gradient-border transition-all duration-300 hover:shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  <span className="text-xl font-medium">{testimonial.initials}</span>
                </div>
                <div className="ml-4">
                  <h4 className="font-medium">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-muted-foreground">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section id="book-session" className="py-12 sm:py-16 bg-gradient-to-br from-purple-600/90 to-blue-500/90 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Ready to Transform Your Academic Journey?</h2>
          <p className="text-white/80 mb-8 text-lg">
            Sign up now to book your first session with our expert tutor, Samuel Silabele, and take the first step toward academic excellence.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild className="bg-white text-primary hover:bg-gray-100 py-6 px-8">
              <Link href="/auth">
                Sign Up Now
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10 py-6 px-8">
              <Link href="/services">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            Get in Touch
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">
            Have questions? We're here to help you on your academic journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-card rounded-xl shadow-md p-6 gradient-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
            <h3 className="text-xl font-semibold mb-6">Send Us a Message</h3>
            
            <form onSubmit={handleContactSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                  <input required type="text" id="name" value={contactForm.fullName} onChange={e => setContactForm(f => ({ ...f, fullName: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background" />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                  <input required type="email" id="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background" />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
                  <input required type="text" id="subject" value={contactForm.subject} onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                  <textarea required id="message" rows={4} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background"></textarea>
                </div>
                
                <Button type="submit" disabled={contactLoading} className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90">
                  {contactLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </form>
          </div>
          
          <div>
            <div className="bg-card rounded-xl shadow-md p-6 mb-6 gradient-border relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Phone</h4>
                    <p>Call or WhatsApp: 0734801665 / 0652 519 6587</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                    <p>info@kindleahinvestment.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-10 w-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-muted-foreground">Website</h4>
                    <p>www.kindleahinvestment.com</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl shadow-md p-6 gradient-border relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
              <h3 className="text-xl font-semibold mb-6">Follow Us</h3>
              
              <div className="flex space-x-4">
                <a href="https://www.facebook.com/KindleahInvestment" target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </a>
                <a href="https://twitter.com/KindleahInvest" target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/kindleah-investment" target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                  </svg>
                </a>
                <a href="https://www.instagram.com/kindleahinvestment" target="_blank" rel="noopener noreferrer" className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Mobile Access Section */}
          <div className="bg-card rounded-xl shadow-md p-6 mt-8 gradient-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
            <h3 className="text-xl font-semibold mb-6">Access on Mobile</h3>
            <div className="flex justify-center">
              <MobileAccess />
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
