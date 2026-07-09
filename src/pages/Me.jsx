import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Settings, ChevronRight, Award, BookOpen, Flame, Target,
  Bell, Shield, Palette, HelpCircle, LogOut, Download,
  BarChart3, Trophy, Star, FileText, Globe, Bookmark
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { Link, useNavigate } from "react-router-dom";

const stats = [
  { label: "GPA", value: "4.20", icon: Award, color: "text-primary" },
  { label: "Streak", value: "5 days", icon: Flame, color: "text-orange-500" },
  { label: "Courses", value: "6", icon: BookOpen, color: "text-emerald-500" },
  { label: "Rank", value: "Top 15%", icon: Trophy, color: "text-amber-500" },
];

const menuSections = [
  {
    title: "Academic",
    items: [
      { icon: BarChart3, label: "Learning Analytics", path: "/academics" },
      { icon: FileText, label: "Transcript & Results", path: "/academics" },
      { icon: Bookmark, label: "Saved Resources", path: "/academics" },
      { icon: Target, label: "Academic Goals", path: "/academics" },
    ],
  },
  {
    title: "Achievements",
    items: [
      { icon: Trophy, label: "Badges & Certificates", path: "/me" },
      { icon: Star, label: "Portfolio & Projects", path: "/me" },
      { icon: Globe, label: "Career Readiness", path: "/opportunities" },
    ],
  },
  {
    title: "Settings",
    items: [
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
      <div className="pt-12 pb-6 px-5 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#28A745] to-[#1a7a35] flex items-center justify-center mx-auto mb-3 shadow-lg"
        >
          <span className="text-white font-heading font-bold text-2xl">
            {user?.full_name?.charAt(0) || "U"}
          </span>
        </motion.div>
        <h1 className="font-heading font-bold text-xl">{user?.full_name || "Student"}</h1>
        <p className="text-[12px] text-muted-foreground mt-0.5">{user?.email}</p>
        <p className="text-[11px] text-primary font-medium mt-1">Computer Science · 300 Level</p>
      </div>

      {/* Stats */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, i) => (
            <GlassCard key={i} variant="solid" className="p-2.5 text-center" delay={i * 0.04}>
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="font-heading font-bold text-[13px]">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="px-4 space-y-4">
        {menuSections.map((section, si) => (
          <div key={si}>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {section.title}
            </p>
            <GlassCard variant="solid" className="overflow-hidden" delay={0.1 + si * 0.05}>
              {section.items.map((item, ii) => (
                <Link
                  key={ii}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors ${
                    ii < section.items.length - 1 ? "border-b border-border/30" : ""
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-primary/8 flex items-center justify-center">
                    <item.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium">{item.label}</span>
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
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="w-3.5 h-3.5 text-red-500" />
            </div>
            <span className="text-[13px] font-medium text-red-500">Sign Out</span>
          </button>
        </GlassCard>
      </div>
    </div>
  );
}