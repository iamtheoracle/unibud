import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users, Trophy, PartyPopper, Rocket, Globe, Award,
  BookOpen, Heart, Briefcase, BadgeCheck, Star, Calendar, ChevronRight,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const journeyStats = [
  { icon: Users, label: "Clubs Joined", value: 3, color: "text-info", bg: "bg-info/10", path: "/connect" },
  { icon: Globe, label: "Communities", value: 7, color: "text-purple", bg: "bg-purple/10", path: "/connect" },
  { icon: Calendar, label: "Events Attended", value: 12, color: "text-success", bg: "bg-success/10", path: "/campus-traditions" },
  { icon: PartyPopper, label: "Traditions", value: 5, color: "text-primary", bg: "bg-primary/10", path: "/campus-traditions" },
  { icon: Briefcase, label: "Scholarships", value: 2, color: "text-warning", bg: "bg-warning/10", path: "/opportunities" },
  { icon: Globe, label: "Internships", value: 1, color: "text-info", bg: "bg-info/10", path: "/opportunities" },
  { icon: BadgeCheck, label: "Certifications", value: 3, color: "text-purple", bg: "bg-purple/10", path: "/achievements" },
  { icon: Heart, label: "Volunteer Hours", value: 24, color: "text-destructive", bg: "bg-destructive/10", path: "/achievements" },
];

const leadershipRoles = [
  { role: "Class Governor", org: "CS 300 Level", period: "2025/2026" },
  { role: "Secretary", org: "NACOS UNIBEN", period: "2025/2026" },
];

export default function CampusLifeSection() {
  return (
    <div className="space-y-4">
      {/* Section title */}
      <div className="flex items-center gap-2 px-1">
        <Star className="w-4 h-4 text-primary" />
        <h3 className="font-heading font-bold text-[15px] text-foreground">Campus Journey</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {journeyStats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={stat.path}>
              <GlassCard variant="solid" className="p-3.5 flex items-center gap-3 card-hover" delay={i * 0.04}>
                <div className={`w-10 h-10 rounded-[14px] ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className={`w-[18px] h-[18px] ${stat.color}`} strokeWidth={2.2} />
                </div>
                <div>
                  <p className="font-heading font-bold text-[16px] text-foreground leading-none">{stat.value}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* FYP Progress */}
      <Link to="/fyp-hub">
        <GlassCard variant="solid" className="p-4 card-hover" delay={0.35}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center">
                <Rocket className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[12px] font-semibold text-foreground">Final Year Project</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1, delay: 0.4 }} className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70" />
            </div>
            <span className="text-[11px] font-bold text-primary">65%</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Smart Campus Navigation System</p>
        </GlassCard>
      </Link>

      {/* Leadership Roles */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
          <Trophy className="w-3 h-3" /> Leadership Roles
        </p>
        <GlassCard variant="solid" className="overflow-hidden" delay={0.4}>
          {leadershipRoles.map((role, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${i < leadershipRoles.length - 1 ? "border-b border-border/30" : ""}`}>
              <div className="w-8 h-8 rounded-[12px] bg-warning/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-semibold text-foreground">{role.role}</p>
                <p className="text-[10px] text-muted-foreground">{role.org} · {role.period}</p>
              </div>
              <Link to="/student-government"><ChevronRight className="w-4 h-4 text-muted-foreground" /></Link>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Achievements timeline link */}
      <Link to="/achievements">
        <GlassCard variant="solid" className="p-4 flex items-center gap-3 card-hover" delay={0.45}>
          <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-[12px] font-semibold text-foreground">Achievements Timeline</p>
            <p className="text-[10px] text-muted-foreground">11 milestones earned</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </GlassCard>
      </Link>
    </div>
  );
}