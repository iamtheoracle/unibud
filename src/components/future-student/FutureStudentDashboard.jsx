import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell, Sparkles, GraduationCap, Video, PlayCircle, FileQuestion,
  ClipboardCheck, Users, MessageCircle, HeartHandshake, Compass,
  Award, BookMarked, MapPin, Columns3, Building2, Star, Clock,
  Brain, Lightbulb, ArrowRight, Rocket,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { getNextSteps, getEducationLevel, getExamStatus } from "@/lib/futureStudentConfig";
import EmptyState from "@/components/ui/EmptyState";

const ICONS = {
  GraduationCap, Video, PlayCircle, FileQuestion, ClipboardCheck, Users,
  MessageCircle, HeartHandshake, Compass, Award, BookMarked, MapPin,
  Columns3, Building2, Star, Clock, Brain, Lightbulb,
};

const CATEGORY_PATHS = {
  prep_courses: "/library",
  live_classes: "/live",
  recorded_lessons: "/library",
  practice_questions: "/library",
  mock_exams: "/assignments",
  study_groups: "/study-groups",
  communities: "/communities",
  mentorship: "/mentorship",
  career_exploration: "/career",
  scholarships: "/scholarships",
  admission_guides: "/library",
  campus_tours: "/campus-traditions",
  university_comparison: "/discover",
  faculty_info: "/communities",
  student_stories: "/quad",
  campus_traditions: "/campus-traditions",
  study_habits: "/study-session",
  time_management: "/calendar",
  survival_tips: "/bud",
};

const CATEGORIES = [
  { id: "prep_courses", label: "Prep Courses", icon: "GraduationCap", color: "text-primary", bg: "bg-primary/10" },
  { id: "live_classes", label: "Live Classes", icon: "Video", color: "text-purple", bg: "bg-purple/10" },
  { id: "recorded_lessons", label: "Recorded Lessons", icon: "PlayCircle", color: "text-info", bg: "bg-info/10" },
  { id: "practice_questions", label: "Practice Questions", icon: "FileQuestion", color: "text-success", bg: "bg-success/10" },
  { id: "mock_exams", label: "Mock Exams", icon: "ClipboardCheck", color: "text-warning", bg: "bg-warning/10" },
  { id: "study_groups", label: "Study Groups", icon: "Users", color: "text-info", bg: "bg-info/10" },
  { id: "communities", label: "Communities", icon: "MessageCircle", color: "text-primary", bg: "bg-primary/10" },
  { id: "mentorship", label: "Mentorship", icon: "HeartHandshake", color: "text-error", bg: "bg-error/10" },
  { id: "career_exploration", label: "Careers", icon: "Compass", color: "text-success", bg: "bg-success/10" },
  { id: "scholarships", label: "Scholarships", icon: "Award", color: "text-warning", bg: "bg-warning/10" },
  { id: "admission_guides", label: "Admission Guides", icon: "BookMarked", color: "text-info", bg: "bg-info/10" },
  { id: "campus_tours", label: "Campus Tours", icon: "MapPin", color: "text-purple", bg: "bg-purple/10" },
  { id: "university_comparison", label: "Compare Unis", icon: "Columns3", color: "text-primary", bg: "bg-primary/10" },
  { id: "faculty_info", label: "Faculty Info", icon: "Building2", color: "text-info", bg: "bg-info/10" },
  { id: "student_stories", label: "Student Stories", icon: "Star", color: "text-warning", bg: "bg-warning/10" },
  { id: "campus_traditions", label: "Traditions", icon: "Sparkles", color: "text-purple", bg: "bg-purple/10" },
  { id: "study_habits", label: "Study Habits", icon: "Brain", color: "text-success", bg: "bg-success/10" },
  { id: "time_management", label: "Time Mgmt", icon: "Clock", color: "text-info", bg: "bg-info/10" },
  { id: "survival_tips", label: "Survival Tips", icon: "Lightbulb", color: "text-warning", bg: "bg-warning/10" },
];

export default function FutureStudentDashboard({ user }) {
  const educationLevel = getEducationLevel(user?.education_level);
  const examStatus = getExamStatus(user?.exam_status);
  const nextSteps = getNextSteps(user?.education_level, user?.exam_status);
  const firstName = user?.preferred_name || user?.full_name?.split(" ")[0] || "Future Student";

  const { data: mentors } = useQuery({
    queryKey: ["futureStudentMentors"],
    queryFn: () => base44.entities.Mentor.filter({ is_available: true }, "-rating", 5),
  });

  const { data: scholarships } = useQuery({
    queryKey: ["futureStudentScholarships"],
    queryFn: () => base44.entities.Scholarship.filter({ status: "open" }, "-created_date", 5),
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between pt-12 pb-2 px-5"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">UNIBUD</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <Link to="/notifications" className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </Link>
          <Link to="/me" className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 soft-shadow flex items-center justify-center text-primary-foreground font-bold text-sm spring-tap">
            {firstName.charAt(0)}
          </Link>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-4"
      >
        <h2 className="font-heading font-bold text-[20px] tracking-tight text-foreground">{greeting}, {firstName}</h2>
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[12px] text-primary font-medium">
            <Rocket className="w-3.5 h-3.5" /> Future Student
          </span>
          {educationLevel && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground font-medium">{educationLevel.short}</span>
            </>
          )}
          {examStatus && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-[12px] text-muted-foreground font-medium">{examStatus.label}</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Bud Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <Link to="/bud" className="block">
          <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary to-primary/80 p-5 shadow-[0_8px_30px_rgba(124,58,237,0.25)] spring-tap">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-9 h-9 rounded-[12px] bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-heading font-bold text-[15px] text-white">Ask Bud Anything</p>
                  <p className="text-[11px] text-white/80">Your companion before, during & after university</p>
                </div>
              </div>
              <p className="text-[13px] text-white/90 leading-relaxed mb-3">
                Curious about university life? Need study tips? Want to explore faculties? Bud is here to guide you every step of the way.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/20 text-white text-[12px] font-semibold">
                Start chatting <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Preparation Pathway — Next Steps */}
      {nextSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pb-6"
        >
          <div className="surface-grouped rounded-[24px] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
                <Compass className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-[16px] text-foreground">Your Preparation Pathway</h3>
            </div>
            <p className="text-[12px] text-muted-foreground mb-3">Recommended next steps based on your profile</p>
            <div className="space-y-2">
              {nextSteps.slice(0, 4).map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <p className="text-[13px] text-foreground leading-relaxed">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Pre-University Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Explore University Life</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {CATEGORIES.map((cat, i) => {
            const Icon = ICONS[cat.icon] || GraduationCap;
            const path = CATEGORY_PATHS[cat.id] || "/";
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 + i * 0.03, type: "spring", stiffness: 300, damping: 24 }}
              >
                <Link to={path} className="block">
                  <div className="bg-card rounded-[18px] soft-shadow border border-border/20 p-3 text-center card-hover spring-tap h-full">
                    <div className={`w-9 h-9 rounded-[12px] ${cat.bg} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className={`w-[17px] h-[17px] ${cat.color}`} strokeWidth={2} />
                    </div>
                    <p className="font-heading font-semibold text-[10px] text-foreground leading-tight">{cat.label}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Target Universities */}
      {user?.target_universities && user.target_universities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="px-5 pb-6"
        >
          <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Your Target Universities</h3>
          <div className="space-y-2.5">
            {user.target_universities.map((uni, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3 card-hover"
              >
                <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-heading font-semibold text-[13px] text-foreground">{uni}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {user.target_faculty ? `${user.target_faculty}` : "Faculty not set yet"}
                    {user.target_department ? ` · ${user.target_department}` : ""}
                  </p>
                </div>
                <Link to="/discover" className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold spring-tap">
                  Explore
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Scholarships Preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-6"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Scholarship Opportunities</h3>
          <Link to="/scholarships" className="text-[12px] text-primary font-semibold spring-tap">View all</Link>
        </div>
        {!scholarships || scholarships.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState icon={Award} title="No scholarships yet" description="New scholarship opportunities will appear here as they become available." />
          </div>
        ) : (
          <div className="space-y-2.5">
            {scholarships.slice(0, 3).map((sch, i) => (
              <Link key={sch.id || i} to="/scholarships" className="block">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 flex items-center gap-3 card-hover">
                  <div className="w-10 h-10 rounded-[14px] bg-warning/10 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[13px] text-foreground">{sch.title}</p>
                    <p className="text-[11px] text-muted-foreground">{sch.provider} · {sch.amount || "See details"}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mentorship Preview */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="px-5 pb-10"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-heading font-bold text-[16px] text-foreground">Connect with Mentors</h3>
          <Link to="/mentorship" className="text-[12px] text-primary font-semibold spring-tap">View all</Link>
        </div>
        {!mentors || mentors.length === 0 ? (
          <div className="bg-card rounded-[20px] soft-shadow border border-border/20">
            <EmptyState icon={HeartHandshake} title="No mentors available yet" description="Verified university student mentors will appear here to guide your journey." />
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {mentors.slice(0, 5).map((mentor, i) => (
              <Link key={mentor.id || i} to={`/mentor/${mentor.id || ""}`} className="flex-shrink-0 w-[160px]">
                <div className="bg-card rounded-[20px] soft-shadow border border-border/20 p-4 card-hover">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mb-2 overflow-hidden">
                    {mentor.image_url || mentor.avatar_url ? (
                      <img src={mentor.image_url || mentor.avatar_url} alt={mentor.name} className="w-full h-full object-cover" />
                    ) : (
                      <HeartHandshake className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <p className="font-heading font-semibold text-[12px] text-foreground truncate">{mentor.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{mentor.role || mentor.department || "University Student"}</p>
                  {mentor.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span className="text-[10px] text-muted-foreground font-medium">{mentor.rating}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}