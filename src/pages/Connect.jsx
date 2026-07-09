import React from "react";
import { Search, Plus, UserPlus, Users, Calendar, Briefcase, Circle, Trophy, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";
import StudyMatching from "@/components/connect/StudyMatching";
import EventsSection from "@/components/connect/EventsSection";
import MentorshipSection from "@/components/connect/MentorshipSection";
import CareerNetwork from "@/components/connect/CareerNetwork";
import MessagesPreview from "@/components/connect/MessagesPreview";
import SafetyBanner from "@/components/connect/SafetyBanner";
import { Link } from "react-router-dom";

const quickActions = [
  { icon: UserPlus, label: "Find Friends", desc: "Connect with classmates", color: "bg-primary/10", iconColor: "text-primary", path: "/connect" },
  { icon: Users, label: "Groups", desc: "Join communities", color: "bg-info/10", iconColor: "text-info", path: "/connect" },
  { icon: Trophy, label: "Challenges", desc: "Compete & win", color: "bg-purple/10", iconColor: "text-purple", path: "/challenges" },
  { icon: Shield, label: "Government", desc: "Student leaders", color: "bg-success/10", iconColor: "text-success", path: "/student-government" },
  { icon: Calendar, label: "Events", desc: "What's happening", color: "bg-warning/10", iconColor: "text-warning", path: "/connect" },
  { icon: Heart, label: "Support", desc: "We're here for you", color: "bg-error/10", iconColor: "text-error", path: "/student-support" },
];

const students = [
  { name: "Chioma Eze", major: "Computer Science · 300L", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { name: "Femi Adeyinka", major: "Mathematics · 200L", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80" },
  { name: "Aisha Bello", major: "Physics · 300L", avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80" },
  { name: "David Okonkwo", major: "Engineering · 400L", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
];

const groups = [
  { name: "Computer Science Hub", members: "1,234 members", icon: "💻", active: true },
  { name: "UNIBUD Developers", members: "234 members", icon: "🚀", active: true },
  { name: "Chess Club", members: "89 members", icon: "♟️", active: false },
  { name: "Entrepreneurship Hub", members: "312 members", icon: "💼", active: true },
];

export default function Connect() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="pt-12 pb-3 px-5 flex items-center justify-between"
      >
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Connect</h1>
          <p className="text-[12px] text-muted-foreground font-medium">People. Groups. Opportunities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
            <Search className="w-[18px] h-[18px] text-foreground" strokeWidth={1.8} />
          </button>
          <button className="w-10 h-10 rounded-full bg-primary soft-shadow flex items-center justify-center spring-tap">
            <Plus className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2} />
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
            >
              <Link to={action.path} className="block bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 text-left card-hover spring-tap">
                <div className={`w-10 h-10 rounded-[14px] ${action.color} flex items-center justify-center mb-2.5`}>
                  <action.icon className={`w-[18px] h-[18px] ${action.iconColor}`} strokeWidth={2.2} />
                </div>
                <p className="font-heading font-semibold text-[13px] text-foreground">{action.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{action.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Messages Preview */}
      <MessagesPreview />

      {/* Students You May Know */}
      <div className="mb-5">
        <h3 className="font-heading font-bold text-[16px] text-foreground px-5 mb-3">Students You May Know</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {students.map((student, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3 flex-shrink-0 w-[145px] card-hover"
            >
              <img src={student.avatar} alt={student.name} className="w-full h-20 rounded-[14px] object-cover mb-2.5" />
              <p className="font-heading font-semibold text-[12px] text-foreground truncate">{student.name}</p>
              <p className="text-[10px] text-muted-foreground mb-2.5 truncate">{student.major}</p>
              <button className="w-full py-2 rounded-[12px] bg-primary text-primary-foreground text-[11px] font-semibold spring-tap">Connect</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Study Matching */}
      <StudyMatching />

      {/* Active Groups */}
      <div className="px-4 pb-8">
        <h3 className="font-heading font-bold text-[16px] text-foreground mb-3 px-1">Active Groups</h3>
        <div className="space-y-2.5">
          {groups.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card rounded-[20px] soft-shadow border border-border/40 p-3.5 flex items-center gap-3.5 card-hover"
            >
              <div className="w-12 h-12 rounded-[16px] bg-muted flex items-center justify-center text-xl flex-shrink-0">{group.icon}</div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-[13px] text-foreground">{group.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{group.members}</span>
                  {group.active && (
                    <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                      <Circle className="w-2 h-2 fill-success text-success" />
                      Active
                    </span>
                  )}
                </div>
              </div>
              <button className="px-3.5 py-2 rounded-full bg-primary/10 text-primary text-[11px] font-semibold spring-tap">Join</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mentorship */}
      <MentorshipSection />

      {/* Events */}
      <EventsSection />

      {/* Career Network */}
      <CareerNetwork />

      {/* Safety */}
      <SafetyBanner />
    </div>
  );
}