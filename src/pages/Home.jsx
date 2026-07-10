import React from "react";
import { Link } from "react-router-dom";
import { Bell, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import MorningBriefing from "@/components/home/MorningBriefing";
import AcademicSnapshot from "@/components/home/AcademicSnapshot";
import ExamCountdown from "@/components/home/ExamCountdown";
import SmartRecommendations from "@/components/home/SmartRecommendations";
import QuickActions from "@/components/home/QuickActions";
import CampusLife from "@/components/home/CampusLife";
import WeatherCard from "@/components/home/WeatherCard";
import CampusPulse from "@/components/home/CampusPulse";
import TodaySchedule from "@/components/home/TodaySchedule";
import FutureStudentDashboard from "@/components/future-student/FutureStudentDashboard";
import AlumniDashboard from "@/components/journey/AlumniDashboard";
import PostgraduateDashboard from "@/components/journey/PostgraduateDashboard";
import JourneyStageBanner from "@/components/journey/JourneyStageBanner";
import { useDemoMode } from "@/lib/DemoModeContext";

export default function Home() {
  const { isDemoMode } = useDemoMode();
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    enabled: !isDemoMode,
  });
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 50),
    enabled: !isDemoMode,
  });

  // Future Students get a dedicated pre-university experience
  if (!isDemoMode && user?.user_type === "future_student") {
    return <FutureStudentDashboard user={user} />;
  }

  // Postgraduate students get a research-focused experience
  if (!isDemoMode && user?.user_type === "postgraduate") {
    return <PostgraduateDashboard user={user} />;
  }

  // Alumni get a dedicated alumni experience
  if (!isDemoMode && user?.user_type === "alumni") {
    return <AlumniDashboard user={user} />;
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = isDemoMode
    ? "Alex"
    : user?.preferred_name || user?.full_name?.split(" ")[0] || "Student";
  const university = isDemoMode ? "University of Benin" : user?.university || "UNIBUD";
  const unreadCount = isDemoMode ? 3 : (notifications || []).filter((n) => !n.is_read).length;

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
          <Link to="/notifications" className="relative w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Bell className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-primary rounded-full border-2 border-card text-[9px] font-bold text-primary-foreground flex items-center justify-center">{unreadCount}</span>
            )}
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
        className="px-5 pb-6"
      >
        <h2 className="font-heading font-bold text-[20px] tracking-tight text-foreground">{greeting}, {firstName}</h2>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground font-medium">{university}</span>
        </div>
      </motion.div>

      {/* Journey Stage Banner — Bud always knows where you are */}
      {!isDemoMode && (user?.user_type === "student" || user?.user_type === "postgraduate") && (
        <JourneyStageBanner user={user} />
      )}

      <div className="px-5 sm:px-0 space-y-6 pb-10 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        <div className="lg:col-span-2">
          <MorningBriefing user={user} />
        </div>
        <WeatherCard />
        <AcademicSnapshot />
        <ExamCountdown />
        <div className="surface-grouped rounded-[24px] p-5 space-y-5 lg:col-span-2">
          <TodaySchedule />
          <SmartRecommendations />
        </div>
        <QuickActions />
        <CampusPulse />
        <div className="lg:col-span-2">
          <CampusLife />
        </div>
      </div>
    </div>
  );
}