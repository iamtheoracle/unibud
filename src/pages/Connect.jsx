import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, MessageCircle, Users, GraduationCap, Briefcase, Star, ChevronRight } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import SectionHeader from "@/components/ui/SectionHeader";

const connectTabs = ["Discover", "Classmates", "Clubs", "Mentors"];

const people = [
  { name: "Chioma Eze", dept: "Computer Science", level: "300L", mutual: 5, avatar: "CE", tag: "Study Partner", color: "from-pink-400 to-rose-500" },
  { name: "Femi Adeyinka", dept: "Mathematics", level: "200L", mutual: 3, avatar: "FA", tag: "Project Team", color: "from-blue-400 to-indigo-500" },
  { name: "Aisha Bello", dept: "Physics", level: "300L", mutual: 8, avatar: "AB", tag: "Classmate", color: "from-emerald-400 to-green-500" },
  { name: "David Okonkwo", dept: "Engineering", level: "400L", mutual: 2, avatar: "DO", tag: "Mentor", color: "from-purple-400 to-violet-500" },
];

const clubs = [
  { name: "UNIBUD Developers", members: 234, category: "Tech", icon: "💻" },
  { name: "Chess Club", members: 89, category: "Sports", icon: "♟️" },
  { name: "Literary Society", members: 156, category: "Arts", icon: "📚" },
  { name: "Entrepreneurship Hub", members: 312, category: "Business", icon: "🚀" },
];

const mentors = [
  { name: "Prof. Okafor", dept: "Mathematics", expertise: "Linear Algebra, Calculus", rating: 4.9, sessions: 120 },
  { name: "Dr. Adeyemi", dept: "Computer Science", expertise: "Algorithms, AI", rating: 4.8, sessions: 95 },
];

export default function Connect() {
  const [activeTab, setActiveTab] = useState("Discover");

  return (
    <div className="min-h-screen">
      <div className="pt-12 pb-3 px-5">
        <h1 className="font-heading font-bold text-[22px] tracking-tight">Connect</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Your campus network</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Find students, clubs, mentors..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-border/50 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {connectTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-white border border-border/50 text-muted-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-4 pb-8">
        {(activeTab === "Discover" || activeTab === "Classmates") && (
          <>
            <SectionHeader title="People You May Know" icon={Users} />
            {people.map((p, i) => (
              <GlassCard key={i} variant="solid" className="p-3" delay={i * 0.05}>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${p.color} flex items-center justify-center text-white text-[12px] font-bold`}>
                    {p.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-[13px]">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground">{p.dept} · {p.level}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-semibold">{p.tag}</span>
                      <span className="text-[9px] text-muted-foreground">{p.mutual} mutual</span>
                    </div>
                  </div>
                  <button className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <UserPlus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {activeTab === "Clubs" && (
          <>
            <SectionHeader title="Campus Clubs & Societies" icon={Users} />
            {clubs.map((club, i) => (
              <GlassCard key={i} variant="solid" className="p-4" delay={i * 0.05}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted/60 flex items-center justify-center text-xl">
                    {club.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[13px]">{club.name}</p>
                    <p className="text-[10px] text-muted-foreground">{club.members} members · {club.category}</p>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-semibold">
                    Join
                  </button>
                </div>
              </GlassCard>
            ))}
          </>
        )}

        {activeTab === "Mentors" && (
          <>
            <SectionHeader title="Available Mentors" icon={GraduationCap} />
            {mentors.map((m, i) => (
              <GlassCard key={i} variant="solid" className="p-4" delay={i * 0.05}>
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-[14px] font-bold">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-[13px]">{m.name}</p>
                    <p className="text-[10px] text-muted-foreground">{m.dept}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{m.expertise}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-semibold">{m.rating}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{m.sessions} sessions</span>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-full bg-primary text-white text-[11px] font-semibold">
                    Book
                  </button>
                </div>
              </GlassCard>
            ))}
          </>
        )}
      </div>
    </div>
  );
}