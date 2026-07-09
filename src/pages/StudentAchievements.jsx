import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  ArrowLeft, Award, Trophy, Users, Heart, BookOpen, Cpu,
  Star, Rocket, BadgeCheck, Briefcase, Palette, Eye, EyeOff,
  Plus, ChevronRight, Sparkles,
} from "lucide-react";

const categoryIcons = {
  academic: BookOpen, leadership: Users, club: Users, volunteer: Heart,
  competition: Trophy, sports: Star, research: Cpu, certification: BadgeCheck,
  project: Rocket, award: Award, creative: Palette,
};

const categoryColors = {
  academic: "hsl(var(--unibud-blue))", leadership: "hsl(var(--unibud-purple))",
  club: "hsl(var(--unibud-blue))", volunteer: "hsl(var(--unibud-green))",
  competition: "hsl(var(--unibud-gold))", sports: "hsl(var(--unibud-red))",
  research: "hsl(var(--unibud-green))", certification: "hsl(var(--unibud-purple))",
  project: "hsl(var(--unibud-gold))", award: "hsl(var(--unibud-gold))",
  creative: "hsl(var(--unibud-orange))",
};

const categoryLabels = {
  academic: "Academic", leadership: "Leadership", club: "Club", volunteer: "Volunteer",
  competition: "Competition", sports: "Sports", research: "Research",
  certification: "Certification", project: "Project", award: "Award", creative: "Creative",
};

const FILTERS = ["All", "Academic", "Leadership", "Competition", "Research", "Project", "Award", "Sports", "Volunteer"];

const withAlpha = (hsl, a = 0.08) => hsl.replace("))", ") / " + a + ")");

export default function StudentAchievements() {
  const [filter, setFilter] = useState("All");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const { data: achievements } = useQuery({
    queryKey: ["studentAchievements"],
    queryFn: () => base44.entities.StudentAchievement.list("-date", 50),
  });

  const filtered = filter === "All"
    ? achievements || []
    : achievements?.filter(a => a.category === filter.toLowerCase()) || [];

  const totalBadges = achievements?.length || 0;
  const publicCount = achievements?.filter(a => a.is_public)?.length || 0;

  const toggleVisibility = async (achievement) => {
    await base44.entities.StudentAchievement.update(achievement.id, { is_public: !achievement.is_public });
    qc.invalidateQueries({ queryKey: ["studentAchievements"] });
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="pt-12 pb-4 px-5 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-card soft-shadow flex items-center justify-center spring-tap border border-border/30">
          <ArrowLeft className="w-[18px] h-[18px] text-foreground" strokeWidth={2} />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Achievements</h1>
          <p className="text-[12px] text-muted-foreground">Your journey, your milestones</p>
        </div>
        <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center spring-tap gold-glow">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-4 mb-4">
        <div className="grid grid-cols-2 gap-2.5">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-[18px] p-3.5 soft-shadow border border-border/40 text-center">
            <Trophy className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="font-heading font-bold text-[20px] text-foreground">{totalBadges}</p>
            <p className="text-[10px] text-muted-foreground">Total Badges</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card rounded-[18px] p-3.5 soft-shadow border border-border/40 text-center">
            <Eye className="w-5 h-5 text-success mx-auto mb-1.5" />
            <p className="font-heading font-bold text-[20px] text-foreground">{publicCount}</p>
            <p className="text-[10px] text-muted-foreground">Publicly Visible</p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all spring-tap ${filter === f ? "bg-foreground text-background soft-shadow" : "bg-card border border-border/40 text-muted-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="px-4">
        {filtered.length > 0 ? (
          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-border/40" />

            <div className="space-y-4">
              {filtered.map((achievement, i) => {
                const Icon = categoryIcons[achievement.category] || Award;
                const color = categoryColors[achievement.category] || "hsl(var(--unibud-gold))";
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-6 top-3 w-6 h-6 rounded-full flex items-center justify-center border-4 border-background" style={{ backgroundColor: color }}>
                      <Icon className="w-3 h-3 text-white" strokeWidth={2.5} />
                    </div>

                    <div className="bg-card rounded-[20px] p-4 soft-shadow border border-border/40 card-hover">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold" style={{ backgroundColor: withAlpha(color), color }}>
                              {categoryLabels[achievement.category] || achievement.category}
                            </span>
                            {achievement.date && (
                              <span className="text-[10px] text-muted-foreground">
                                {new Date(achievement.date).toLocaleDateString("en", { month: "short", year: "numeric" })}
                              </span>
                            )}
                          </div>
                          <p className="font-heading font-semibold text-[14px] text-foreground">{achievement.title}</p>
                          {achievement.description && <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{achievement.description}</p>}
                          {achievement.issuer && (
                            <p className="text-[10px] text-muted-foreground mt-1.5">Issued by {achievement.issuer}</p>
                          )}
                        </div>
                        <button onClick={() => toggleVisibility(achievement)}
                          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                            achievement.is_public ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                          }`}>
                          {achievement.is_public ? <><Eye className="w-3 h-3" /> Public</> : <><EyeOff className="w-3 h-3" /> Private</>}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-[20px] bg-muted flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
            </div>
            <p className="text-[13px] font-semibold text-foreground">No achievements yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Start adding your milestones to build your timeline</p>
          </div>
        )}
      </div>
    </div>
  );
}