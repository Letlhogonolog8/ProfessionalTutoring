import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FaGraduationCap, FaAward, FaBook, FaPhone } from "react-icons/fa";
import { User } from "@shared/schema";
import tutorImage from "@assets/image_1744141820357.png";
import { motion } from "framer-motion";

interface TutorProfileProps {
  expanded?: boolean;
  onBookSession?: () => void;
}

export function TutorProfile({ expanded = false, onBookSession }: TutorProfileProps) {
  // Samuel's profile is hardcoded as he's the only tutor
  const tutor = {
    id: 1,
    fullName: "Samuel Silabele",
    role: "tutor",
    bio: "Samuel is a highly respected academic with extensive experience in research methodology. His expertise spans quantitative, qualitative, and mixed methods research approaches. Students appreciate his patient teaching style and ability to explain complex concepts in accessible ways.",
    phoneNumber: "0734801665",
    qualifications: [
      "PhD in Research Methodology",
      "10+ years of tutoring experience",
      "Published researcher with multiple academic papers"
    ]
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hover-up"
    >
      <Card className={`overflow-hidden shadow-lg ${expanded ? "w-full" : "max-w-3xl mx-auto"}`}>
        <div className={expanded ? "md:flex" : ""}>
          <div className={`relative ${expanded ? "md:flex-shrink-0 md:w-1/3" : ""}`}>
            <img
              src={tutorImage}
              alt={tutor.fullName}
              className={`w-full h-full object-cover ${!expanded && "max-h-[300px]"} z-10 relative rounded-lg`}
            />
          </div>
          <CardContent className={`p-6 md:p-8 ${expanded ? "md:w-2/3" : ""}`}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex items-center"
            >
              <h3 className="text-2xl font-bold">{tutor.fullName}</h3>
              <div className="ml-4 bg-primary/10 dark:bg-primary/20 px-3 py-1 rounded-full">
                <span className="text-sm font-medium text-primary">Lead Tutor</span>
              </div>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-4 text-muted-foreground"
            >
              {tutor.bio}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-6 space-y-4"
            >
              <div className="flex items-start">
                <FaGraduationCap className="h-5 w-5 text-primary mt-0.5 mr-3" />
                <span>{tutor.qualifications[0]}</span>
              </div>
              <div className="flex items-start">
                <FaAward className="h-5 w-5 text-primary mt-0.5 mr-3" />
                <span>{tutor.qualifications[1]}</span>
              </div>
              <div className="flex items-start">
                <FaBook className="h-5 w-5 text-primary mt-0.5 mr-3" />
                <span>{tutor.qualifications[2]}</span>
              </div>
              <div className="flex items-start">
                <FaPhone className="h-5 w-5 text-primary mt-0.5 mr-3" />
                <span>Contact: {tutor.phoneNumber}</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-6"
            >
              {onBookSession ? (
                <Button 
                  onClick={onBookSession} 
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white animate-pulse-glow"
                >
                  Book a Session
                </Button>
              ) : (
                <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white animate-pulse-glow">
                  <Link href="/student/book-session">
                    Book a Session
                  </Link>
                </Button>
              )}
            </motion.div>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}