import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { FaGraduationCap, FaAward, FaBook, FaPhone } from "react-icons/fa";
import { motion } from "framer-motion";

interface TutorProfileProps {
  expanded?: boolean;
  onBookSession?: () => void;
}

export function TutorProfile({ expanded = false, onBookSession }: TutorProfileProps) {
  const tutor = {
    fullName: "Samuel Silabele",
    initials: "SS",
    title: "Lead Tutor",
    bio: "Samuel is a highly respected academic with extensive experience in research methodology. His expertise spans quantitative, qualitative, and mixed methods research approaches. Students appreciate his patient teaching style and ability to explain complex concepts in accessible ways.",
    phoneNumber: "0734801665",
    qualifications: [
      { icon: <FaGraduationCap className="h-4 w-4" />, text: "PhD in Research Methodology" },
      { icon: <FaAward className="h-4 w-4" />, text: "10+ years of tutoring experience" },
      { icon: <FaBook className="h-4 w-4" />, text: "Published researcher with multiple academic papers" },
      { icon: <FaPhone className="h-4 w-4" />, text: "Contact: 0734801665" },
    ],
    specialisations: [
      "Quantitative Research", "Qualitative Research", "Mixed Methods",
      "Academic Writing", "Statistical Analysis", "Research Design",
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`overflow-hidden shadow-lg ${expanded ? "w-full" : "max-w-3xl mx-auto"}`}>
        {/* Header banner */}
        <div className="h-24 bg-gradient-to-r from-purple-600 to-blue-500 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="h-20 w-20 rounded-full bg-background border-4 border-background flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                {tutor.initials}
              </span>
            </div>
          </div>
        </div>

        <CardContent className="pt-14 p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {/* Name + badge */}
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-2xl font-bold">{tutor.fullName}</h3>
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-500 text-white border-0">
                {tutor.title}
              </Badge>
            </div>

            {/* Bio */}
            <p className="mt-3 text-muted-foreground leading-relaxed">
              {tutor.bio}
            </p>

            {/* Qualifications */}
            <div className="mt-6 space-y-3">
              {tutor.qualifications.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-primary flex-shrink-0">{q.icon}</span>
                  <span className="text-sm">{q.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Specialisations */}
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Areas of Expertise
              </p>
              <div className="flex flex-wrap gap-2">
                {tutor.specialisations.map(s => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8">
              {onBookSession ? (
                <Button
                  onClick={onBookSession}
                  className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white"
                >
                  Book a Session
                </Button>
              ) : (
                <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-500 hover:opacity-90 text-white">
                  <Link href="/student/book-session">Book a Session</Link>
                </Button>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
