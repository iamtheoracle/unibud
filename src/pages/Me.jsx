import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ChevronRight, Award, BookOpen, Flame, Target,
  Bell, Shield, Palette, HelpCircle, LogOut, Download,
  BarChart3, Trophy, Star, FileText, Globe, Bookmark, Brain, Link2, Heart, Compass,
  PartyPopper, Rocket, Calendar, Users, GraduationCap,
  Trash2,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Link } from "react-router-dom";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import AcademicProgressSection from "@/components/me/AcademicProgressSection";
import CampusLifeSection from "@/components/me/CampusLifeSection";
import BadgesSection from "@/components/me/BadgesSection";
import StudyStatsSection from "@/components/me/StudyStatsSection";
import MilestonesSection from "@/components/milestones/MilestonesSection";
import HighlightShelf from "@/components/stories/HighlightShelf";
import MatriculationCard from "@/components/me/MatriculationCard";
import TransitionToStudent from "@/components/future-student/TransitionToStudent";
import GraduationTransition from "@/components/journey/GraduationTransition";
import { useDemoMode } from "@/lib/DemoModeContext";
import { getEducationLevel, getExamStatus } from "@/lib/futureStudentConfig";
import { getJourneyStageForUser } from "@/lib/universityJourney";

const menuSections = [
  {
    title: "Academic",
    items: [
      { icon: BarChart3, label: "Learning Analytics", path: "/academics" },
      { icon: FileText, label: "Transcript & Results", path: "/academics" },
      { icon: Bookmark, label: "Saved Resources", path: "/library" },
      { icon: Target, label: "Academic Goals", path: "/academics" },
    ],
  },
  {
    title: "Achievements",
    items: [
      { icon: Award, label: "Achievement Timeline", path: "/achievements" },
      { icon: Trophy, label: "Challenges", path: "/challenges" },
      { icon: PartyPopper, label: "Celebrations", path: "/celebrations" },
      { icon: Rocket, label: "FYP Hub", path: "/fyp-hub" },
      { icon: Calendar, label: "Traditions Calendar", path: "/traditions-calendar" },
      { icon: Star, label: "Portfolio & Projects", path: "/portfolio" },
      { icon: Globe, label: "Career Readiness", path: "/opportunities" },
    ],
  },
  {
    title: "Settings",
    items: [
      { icon: Brain, label: "Bud Memory", path: "/bud-memory" },
      { icon: Link2, label: "Connected Accounts", path: "/connected-accounts" },
      { icon: Compass, label: "Discover", path: "/discover" },
      { icon: PartyPopper, label: "Campus Life", path: "/campus-traditions" },
      { icon: Users, label: "Mentorship", path: "/mentorship" },
      { icon: Heart, label: "Student Support", path: "/student-support" },
      { icon: Shield, label: "Student Government", path: "/student-government" },
      { icon: Calendar, label: "Calendar", path: "/calendar" },
      { icon: Heart, label: "Wellbeing", path: "/wellbeing" },
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Palette, label: "Appearance", path: "/me" },
      { icon: Shield, label: "Privacy & Security", path: "/connected-accounts" },
      { icon: Download, label: "Downloads", path: "/library" },
      { icon: HelpCircle, label: "Help & Support", path: "/student-support" },
    ],
  },
];

export default function Me() {
  const { isDemoMode } = useDemoMode();
  const [showTransition, setShowTransition] = useState(false);
  const [showGraduation, setShowGraduation] = useState(false);
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });

  const { data: courses } = useQuery({
    queryKey: ["meCourses"],
    queryFn: () => base44.entities.Course.list(),
    enabled: !isDemoMode,
  });
  const { data: sessions } = useQuery({
    queryKey: ["meSessions"],
    queryFn: () => base44.entities.StudySession.list("-session_date", 50),
    enabled: !isDemoMode,
  });
  const { data: badges } = useQuery({
    queryKey: ["meBadges"],
    queryFn: () => base44.entities.DigitalBadge.list(),
    enabled: !isDemoMode,
  });

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await base44.entities.SupportTicket.create({
        subject: "Account Deletion Request",
        category: "general",
        priority: "urgent",
        status: "open",
        student_name: user?.full_name || user?.email || "Unknown",
        student_id: user?.id || "",
        messages: [{
          content: "User requested permanent account deletion.",
          author: user?.email || "user",
          created_at: new Date().toISOString(),
        }],
      });
      toast({
        title: "Deletion request submitted",
        description: "Our support team will contact you within 48 hours to complete this.",
      });
      setShowDeleteDialog(false);
      setTimeout(() => base44.auth.logout("/login"), 2000);
    } catch {
      toast({
        title: "Something went wrong",
        description: "Could not submit your request. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const sessionDates = (sessions || []).filter((s) => s.session_date).map((s) => s.session_date);
  const uniqueDates = [...new Set(sessionDates)].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  let checkDate = today;
  for (let i = 0; i < uniqueDates.length; i++) {
    if (uniqueDates[i] === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    } else if (uniqueDates[i] < checkDate) {
      break;
    }
  }

  const quickStats = isDemoMode
    ? [
        { label: "GPA", value: "4.20", icon: Award, color: "text-primary" },
        { label: "Streak", value: "12d", icon: Flame, color: "text-warning" },
        { label: "Courses", value: "6", icon: BookOpen, color: "text-success" },
        { label: "Badges", value: "8", icon: Trophy, color: "text-primary" },
      ]
    : [
        { label: "Courses", value: String(courses?.length || 0), icon: BookOpen, color: "text-success" },
        { label: "Streak", value: streak + "d", icon: Flame, color: "text-warning" },
        { label: "Sessions", value: String(sessions?.length || 0), icon: BarChart3, color: "text-info" },
        { label: "Badges", value: String(badges?.length || 0), icon: Trophy, color: "text-primary" },
      ];

  const displayName = isDemoMode ? "Alex Johnson" : (user?.full_name || "Student");
  const displayEmail = isDemoMode ? "alex.demo@unibud.app" : (user?.email || "");
  const displayProgram = isDemoMode ? "Computer Science · 300 Level" : (user?.department ? user.department + " · " + (user?.level || "") : "Add your program");

  return (
    <div className="min-h-screen pb-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-12 pb-6 px-5 text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-[26px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-3.5 gold-glow"
        >
          <span className="text-primary-foreground font-heading font-bold text-2xl">
            {displayName.charAt(0)}
          </span>
        </motion.div>
        <h1 className="font-heading font-bold text-[20px] text-foreground">{displayName}</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">{displayEmail}</p>
        {!isDemoMode && (() => {
          const stage = getJourneyStageForUser(user);
          const StageIcon = stage.icon;
          return (
            <span className={`inline-flex items-center gap-1 mt-1.5 px-3 py-1 rounded-full ${stage.badge} text-[10px] font-semibold`}>
              <StageIcon className="w-3 h-3" /> {stage.label}
            </span>
          );
        })()}
        {isDemoMode && (
          <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
            {displayProgram}
          </span>
        )}
        {!isDemoMode && user?.user_type === "student" && user?.department && (
          <span className="block mt-1 text-[10px] text-muted-foreground">
            {user.department}{user.level ? ` · ${user.level} Level` : ""}{user.university ? ` · ${user.university}` : ""}
          </span>
        )}
        {!isDemoMode && user?.user_type === "alumni" && user?.graduation_year && (
          <span className="block mt-1 text-[10px] text-muted-foreground">
            {user.university ? `${user.university} · ` : ""}Class of {user.graduation_year}
            {user.current_occupation ? ` · ${user.current_occupation}` : ""}
          </span>
        )}
        {!isDemoMode && user?.user_type === "postgraduate" && (
          <span className="block mt-1 text-[10px] text-muted-foreground">
            {user.postgraduate_field || user.department || ""}{user.university ? ` · ${user.university}` : ""}
          </span>
        )}
      </motion.div>

      {/* Future Student Banner + Transition */}
      {!isDemoMode && user?.user_type === "future_student" && (
        <div className="px-5 mb-6">
          <div className="rounded-[24px] bg-gradient-to-br from-primary to-primary/80 p-5 shadow-[0_8px_30px_rgba(124,58,237,0.25)]">
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-5 h-5 text-white" />
              <p className="font-heading font-bold text-[15px] text-white">Future Student</p>
            </div>
            <div className="flex items-center gap-3 mb-3 text-white/90 text-[12px]">
              {user.education_level && (
                <span className="px-2.5 py-1 rounded-full bg-white/15 font-medium">
                  {getEducationLevel(user.education_level)?.short || user.education_level}
                </span>
              )}
              {user.exam_status && (
                <span className="px-2.5 py-1 rounded-full bg-white/15 font-medium">
                  {getExamStatus(user.exam_status)?.label || user.exam_status}
                </span>
              )}
            </div>
            <p className="text-[12px] text-white/85 leading-relaxed mb-3">
              Been admitted? Transition your account to a full student profile — all your history, conversations, and progress stay with you.
            </p>
            <button
              onClick={() => setShowTransition(true)}
              className="w-full h-[46px] rounded-2xl bg-white/20 text-white font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
            >
              <GraduationCap className="w-[18px] h-[18px]" /> Transition to Student Account
            </button>
          </div>
          <TransitionToStudent open={showTransition} onClose={() => setShowTransition(false)} user={user} />
        </div>
      )}

      {/* Graduation Transition — for undergraduate & postgraduate students */}
      {!isDemoMode && (user?.user_type === "student" || user?.user_type === "postgraduate") && (
        <div className="px-5 mb-6">
          <div className="rounded-[24px] bg-gradient-to-br from-success/10 to-success/5 border border-success/20 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-success" />
              <p className="font-heading font-bold text-[15px] text-foreground">
                {user?.user_type === "postgraduate" ? "Completed Your Programme?" : "Graduating Soon?"}
              </p>
            </div>
            <p className="text-[12px] text-muted-foreground leading-relaxed mb-3">
              {user?.user_type === "postgraduate"
                ? "Transition to an Alumni profile or continue your journey. All your research, conversations, and achievements will be preserved."
                : "Transition to an Alumni profile or continue to postgraduate studies. All your history, conversations, and achievements will be preserved."}
            </p>
            <button
              onClick={() => setShowGraduation(true)}
              className="w-full h-[46px] rounded-2xl bg-success text-white font-heading font-semibold text-[13px] flex items-center justify-center gap-2 spring-tap"
            >
              {user?.user_type === "postgraduate" ? <Award className="w-[18px] h-[18px]" /> : <GraduationCap className="w-[18px] h-[18px]" />}
              {user?.user_type === "postgraduate" ? "Complete Your Journey" : "Graduate & Transition"}
            </button>
          </div>
          <GraduationTransition open={showGraduation} onClose={() => setShowGraduation(false)} user={user} />
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-4 gap-2.5">
          {quickStats.map((stat, i) => (
            <GlassCard key={i} variant="solid" className="p-2.5 text-center" delay={i * 0.04}>
              <stat.icon className={"w-4 h-4 mx-auto mb-1 " + stat.color} strokeWidth={2.2} />
              <p className="font-heading font-bold text-[13px] text-foreground">{stat.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Matriculation Number — visible for enrolled students (undergrad + postgrad) */}
      {!isDemoMode && (user?.user_type === "student" || user?.user_type === "postgraduate") && (
        <div className="px-5 mb-6">
          <MatriculationCard user={user} />
        </div>
      )}

      {/* Academic Progress Dashboard */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Academic Progress</h2>
        </div>
        <AcademicProgressSection />
      </div>

      {/* Campus Journey */}
      <div className="px-5 mb-6">
        <CampusLifeSection />
      </div>

      {/* Story Highlights */}
      <div className="mb-6">
        <HighlightShelf />
      </div>

      {/* Study Stats */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Weekly Progress</h2>
        </div>
        <StudyStatsSection />
      </div>

      {/* Digital Badges */}
      <div className="px-5 mb-6">
        <BadgesSection />
      </div>

      {/* Recent Milestones */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3 px-1">
          <PartyPopper className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Recent Milestones</h2>
        </div>
        <MilestonesSection />
      </div>

      {/* Menu Sections */}
      <div className="px-5 space-y-6">
        {menuSections.map((section, si) => (
          <div key={si}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
              {section.title}
            </p>
            <GlassCard variant="solid" className="overflow-hidden" delay={0.1 + si * 0.05}>
              {section.items.map((item, ii) => (
                <Link
                  key={ii}
                  to={item.path}
                  className={"flex items-center gap-3 px-4 py-3.5 hover:bg-muted/40 transition-colors " + (ii < section.items.length - 1 ? "border-b border-border/20" : "")}
                >
                  <div className="w-8 h-8 rounded-[12px] bg-primary/8 flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-foreground">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              ))}
            </GlassCard>
          </div>
        ))}

        {/* Logout */}
        {!isDemoMode && (
          <GlassCard variant="solid" className="overflow-hidden" delay={0.3}>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-destructive/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-[12px] bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-4 h-4 text-destructive" />
              </div>
              <span className="text-[13px] font-medium text-destructive">Sign Out</span>
            </button>
          </GlassCard>
        )}

        {/* Delete Account */}
        {!isDemoMode && (
          <>
            <GlassCard variant="solid" className="overflow-hidden" delay={0.35}>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-3 px-4 py-3.5 w-full hover:bg-destructive/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-[12px] bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-[13px] font-medium text-destructive">Delete Account</span>
              </button>
            </GlassCard>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent className="max-w-sm rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[16px] font-heading font-bold">Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[13px] leading-relaxed">
                    This will permanently remove your profile, conversations, and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-row gap-2">
                  <AlertDialogCancel className="flex-1 h-[42px] rounded-2xl text-[13px] mt-0">
                    Cancel
                  </AlertDialogCancel>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 h-[42px] rounded-2xl bg-destructive text-destructive-foreground text-[13px] font-semibold hover:bg-destructive/90 disabled:opacity-50 transition-colors"
                  >
                    {isDeleting ? "Processing..." : "Delete Account"}
                  </button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        {/* Branding */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[9px] text-muted-foreground/60">A My Realm Product</p>
          <p className="text-[8px] text-muted-foreground/40 mt-0.5">My Realm Network Limited · RC: 9645700</p>
          <p className="text-[8px] text-muted-foreground/40">© 2026 My Realm Network Limited. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  );
}