import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt,
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaInstagram 
} from "react-icons/fa";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600/90 to-blue-500/90 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            Have questions about our tutoring services? Reach out to us and we'll be happy to help.
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-card rounded-xl shadow-md p-8 gradient-border relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Subject
                </label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message here..."
                  rows={5}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-card rounded-xl shadow-md p-8 gradient-border relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-white text-lg" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Phone</h3>
                    <p className="text-muted-foreground mt-1">Call or WhatsApp: 0734801665 / 0652 519 6587</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaEnvelope className="text-white text-lg" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Email</h3>
                    <p className="text-muted-foreground mt-1">info@kindleahinvestment.com</p>
                    <p className="text-muted-foreground">support@kindleahinvestment.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-white text-lg" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-base font-medium">Office Location</h3>
                    <p className="text-muted-foreground mt-1">
                      KindLeah Investment and Projects Pty Ltd<br />
                      Johannesburg, South Africa
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl shadow-md p-8 gradient-border relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
              <h2 className="text-xl font-bold mb-4">Business Hours</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Monday - Friday</h3>
                  <p className="text-muted-foreground">9:00 AM - 6:00 PM</p>
                </div>
                <div>
                  <h3 className="font-medium">Saturday</h3>
                  <p className="text-muted-foreground">10:00 AM - 4:00 PM</p>
                </div>
                <div>
                  <h3 className="font-medium">Sunday</h3>
                  <p className="text-muted-foreground">Closed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-xl shadow-md p-8 gradient-border relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none border border-primary/10 rounded-xl"></div>
              <h2 className="text-xl font-bold mb-4">Connect With Us</h2>
              
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebookF />
                </a>
                <a 
                  href="#" 
                  className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter />
                </a>
                <a 
                  href="#" 
                  className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn />
                </a>
                <a 
                  href="#" 
                  className="h-10 w-10 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">
              Find quick answers to common questions
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">What are your response times?</h3>
              <p className="text-muted-foreground">
                We aim to respond to all inquiries within 24 hours during business days. For urgent matters, please contact us directly via phone.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">Do you offer international tutoring services?</h3>
              <p className="text-muted-foreground">
                Yes, our online platform allows us to provide tutoring services to students worldwide. We work with students across different time zones and can accommodate various scheduling needs.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">How can I book a consultation with a tutor?</h3>
              <p className="text-muted-foreground">
                You can book a consultation by creating an account on our platform, then scheduling a session through our booking system. If you need assistance, feel free to contact us directly.
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept various payment methods including credit/debit cards, bank transfers, and mobile payment solutions. All payments are processed securely through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
