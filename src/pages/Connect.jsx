import React from "react";
import { Search, Plus, UserPlus, Users, Calendar, Briefcase, Circle } from "lucide-react";
import { motion } from "framer-motion";
import StudyMatching from "@/components/connect/StudyMatching";
import EventsSection from "@/components/connect/EventsSection";
import MentorshipSection from "@/components/connect/MentorshipSection";
import CareerNetwork from "@/components/connect/CareerNetwork";
import MessagesPreview from "@/components/connect/MessagesPreview";
import SafetyBanner from "@/components/connect/SafetyBanner";

const quickActions = [
  { icon: UserPlus, label: "Find Friends", desc: "Connect with classmates", color: "bg-[#28A745]/10", iconColor: "text-[#28A745]" },
  { icon: Users, label: "Groups", desc: "Join communities", color: "bg-blue-500/10", iconColor: "text-blue-500" },
  { icon: Calendar, label: "Events", desc: "What's happening", color: "bg-purple-500/10", iconColor: "text-purple-500" },
  { icon: Briefcase, label: "Opportunities", desc: "Internships & jobs", color: "bg-amber-500/10", iconColor: "text-amber-500" },
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
      <div className="pt-12 pb-3 px-5 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-[#1A1A1A]">Connect</h1>
          <p className="text-[12px] text-[#86868B] font-medium">People. Groups. Opportunities.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
            <Search className="w-[18px] h-[18px] text-[#1A1A1A]" strokeWidth={1.8} />
          </button>
          <button className="w-10 h-10 rounded-full bg-[#28A745] shadow-sm flex items-center justify-center">
            <Plus className="w-[18px] h-[18px] text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2.5">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3.5 text-left"
            >
              <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center mb-2`}>
                <action.icon className={`w-[18px] h-[18px] ${action.iconColor}`} strokeWidth={2} />
              </div>
              <p className="font-heading font-semibold text-[13px] text-[#1A1A1A]">{action.label}</p>
              <p className="text-[10px] text-[#86868B] mt-0.5">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Messages Preview */}
      <MessagesPreview />

      {/* Students You May Know */}
      <div className="mb-5">
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A] px-5 mb-3">Students You May Know</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {students.map((student, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3 flex-shrink-0 w-[140px]"
            >
              <img src={student.avatar} alt={student.name} className="w-full h-20 rounded-xl object-cover mb-2" />
              <p className="font-heading font-semibold text-[12px] text-[#1A1A1A] truncate">{student.name}</p>
              <p className="text-[10px] text-[#86868B] mb-2.5 truncate">{student.major}</p>
              <button className="w-full py-1.5 rounded-lg bg-[#28A745] text-white text-[11px] font-semibold">Connect</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Study Matching */}
      <StudyMatching />

      {/* Active Groups */}
      <div className="px-4 pb-8">
        <h3 className="font-heading font-bold text-[16px] text-[#1A1A1A] mb-3 px-1">Active Groups</h3>
        <div className="space-y-2.5">
          {groups.map((group, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-black/[0.04] p-3.5 flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-xl flex-shrink-0">{group.icon}</div>
              <div className="flex-1">
                <p className="font-heading font-semibold text-[13px] text-[#1A1A1A]">{group.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-[#86868B]">{group.members}</span>
                  {group.active && (
                    <span className="flex items-center gap-1 text-[10px] text-[#28A745] font-medium">
                      <Circle className="w-2 h-2 fill-[#28A745] text-[#28A745]" />
                      Active
                    </span>
                  )}
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-full bg-[#28A745]/10 text-[#28A745] text-[11px] font-semibold">Join</button>
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