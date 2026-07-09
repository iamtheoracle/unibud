import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Settings, ChevronRight, Award, BookOpen, Flame, Target,
  Bell, Shield, Palette, HelpCircle, LogOut, Download,
  BarChart3, Trophy, Star, FileText, Globe, Bookmark, Brain, Link2, Heart, Compass,
  PartyPopper, Rocket, Calendar, Users,
} from "lucide-react";
// BookOpen already imported above
import GlassCard from "@/components/ui/GlassCard";
import { Link, useNavigate } from "react-router-dom";
import AcademicProgressSection from "@/components/me/AcademicProgressSection";
import CampusLifeSection from "@/components/me/CampusLifeSection";
import BadgesSection from "@/components/me/BadgesSection";

const quickStats = [
  { label: "GPA", value: "4.20", icon: Award, color: "text-primary" },
  { label: "Streak", value: "12d", icon: Flame, color: "text-warning" },
  { label: "Courses", value: "6", icon: BookOpen, color: "text-success" },
  { label: "Rank", value: "Top 15%", icon: Trophy, color: "text-primary" },
];

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
      { icon: Star, label: "Portfolio & Projects", path: "/me" },
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
      { icon: Bell, label: "Notifications", path: "/notifications" },
      { icon: Palette, label: "Appearance", path: "/me" },
      { icon: Shield, label: "Privacy & Security", path: "/me" },
      { icon: Download, label: "Downloads", path: "/me" },
      { icon: HelpCircle, label: "Help & Support", path: "/me" },
    ],
  },
];

export default function Me() {
  const navigate = useNavigate();
  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
  });

  const handleLogout = () => {
    base44.auth.logout("/login");
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="pt-12 pb-5 px-5 text-center"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-3 gold-glow"
        >
          <span className="text-primary-foreground font-heading font-bold text-2xl">
            {user?.full_name?.charAt(0) || "U"}
          </span>
        </motion.div>
        <h1 className="font-heading font-bold text-[20px] text-foreground">{user?.full_name || "Student"}</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">{user?.email}</p>
        <span className="inline-block mt-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
          Computer Science · 300 Level
        </span>
      </motion.div>

      {/* Quick Stats */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {quickStats.map((stat, i) => (
            <GlassCard key={i} variant="solid" className="p-2.5 text-center" delay={i * 0.04}>
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} strokeWidth={2.2} />
              <p className="font-heading font-bold text-[13px] text-foreground">{stat.value}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Academic Progress Dashboard */}
      <div className="px-4 mb-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h2 className="font-heading font-bold text-[15px] text-foreground">Academic Progress</h2>
        </div>
        <AcademicProgressSection />
      </div>

      {/* Campus Journey */}
      <div className="px-4 mb-5">
        <CampusLifeSection />
      </div>

      {/* Digital Badges */}
      <div className="px-4 mb-5">
        <BadgesSection />
      </div>

      {/* Menu Sections */}
      <div className="px-4 space-y-5">
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
                  className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors ${
                    ii < section.items.length - 1 ? "border-b border-border/30" : ""
                  }`}
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
      </div>
    </div>
  );
}