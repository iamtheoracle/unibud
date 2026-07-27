import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Award, Rocket, Users, Heart, Shield, GraduationCap, Flame, CheckCircle2,
  ChevronRight, Share2, Lock, Globe, Sparkles, X, Target, TrendingUp,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const TYPE_ICONS = {
  assignment_complete: CheckCircle2, study_goal: Target, gpa_improvement: TrendingUp,
  project_complete: Rocket, badge_earned: Award, leadership_role: Shield,
  event_joined: Users, mentorship_complete: Heart, fyp_milestone: Rocket,
  study_streak: Flame, exam_passed: GraduationCap,
};

const TYPE_COLORS = {
  assignment_complete: "hsl(var(--unibud-green))", study_goal: "hsl(var(--unibud-blue))",
  gpa_improvement: "hsl(var(--unibud-gold))", project_complete: "hsl(var(--unibud-purple))",
  badge_earned: "hsl(var(--unibud-gold))", leadership_role: "hsl(var(--unibud-orange))",
  event_joined: "hsl(var(--unibud-blue))", mentorship_complete: "hsl(var(--unibud-red))",
  fyp_milestone: "hsl(var(--unibud-purple))", study_streak: "hsl(var(--unibud-orange))",
  exam_passed: "hsl(var(--unibud-green))",
};

const TYPE_LABELS = {
  assignment_complete: "Assignment Done", study_goal: "Goal Achieved",
  gpa_improvement: "GPA Improved", project_complete: "Project Complete",
  badge_earned: "Badge Earned", leadership_role: "Leadership Role",
  event_joined: "Event Joined", mentorship_complete: "Mentorship Complete",
  fyp_milestone: "FYP Milestone", study_streak: "Study Streak",
  exam_passed: "Exam Passed",
};

const SHARE_OPTIONS = [
  { key: "private", label: "Private", icon: Lock, desc: "Only you can see this" },
  { key: "classmates", label: "Classmates", icon: Users, desc: "Share with your class" },
  { key: "quad", label: "Quad", icon: Globe, desc: "Share to campus feed" },
  { key: "university", label: "University", icon: GraduationCap, desc: "Share with your university" },
];

export default function MilestonesSection() {
  const qc = useQueryClient();
  const [sharing, setSharing] = useState(null);

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["milestones"],
    queryFn: () => base44.entities.Milestone.list("-created_date", 20),
  });

  const handleShare = async (milestone, scope) => {
    try {
      await base44.entities.Milestone.update(milestone.id, {
        share_scope: scope,
        is_shared: scope !== "private",
      });
      if (scope === "quad") {
        await base44.entities.QuadPost.create({
          content: `🎉 ${milestone.title} — ${milestone.description || ""}`,
          author_name: milestone.student_name || "Student",
          type: "celebration",
          is_anonymous: false,
        }).catch(() => {});
      }
      qc.invalidateQueries({ queryKey: ["milestones"] });
      setSharing(null);
    } catch (err) {}
  };

  if (isLoading) {
    return <div className="h-40 rounded-[20px] shimmer" />;
  }

  if (!milestones || milestones.length === 0) {
    return (
      <GlassCard variant="solid" className="p-6 text-center" delay={0.05}>
        <div className="w-12 h-12 rounded-[18px] bg-muted flex items-center justify-center mx-auto mb-2">
          <Sparkles className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
        </div>
        <p className="text-[12px] font-semibold text-foreground">No milestones yet</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Complete tasks and achievements to earn milestones</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-2">
      {milestones.map((m, i) => {
        const Icon = TYPE_ICONS[m.type] || Award;
        const color = m.accent_color || TYPE_COLORS[m.type] || "hsl(var(--unibud-gold))";
        return (
          <GlassCard key={m.id} variant="solid" className="p-3.5" delay={i * 0.04}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color.replace("))", ") / 0.12)") }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="font-heading font-semibold text-[12px] text-foreground truncate">{m.title}</p>
                  {m.is_shared && (
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[7px] font-bold uppercase">
                      {m.share_scope}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-2">{m.description}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[8px] font-semibold uppercase tracking-wide" style={{ color }}>
                    {TYPE_LABELS[m.type] || m.type}
                  </span>
                  <button onClick={() => setSharing(m)} className="ml-auto flex items-center gap-0.5 text-[9px] font-semibold text-primary spring-tap">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })}

      <AnimatePresence>
        {sharing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSharing(null)}>
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-[24px] w-full max-w-sm p-5 premium-shadow border border-border/40">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-bold text-[15px] text-foreground">Share Milestone</h3>
                <button onClick={() => setSharing(null)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center spring-tap">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground mb-3 text-center">"{sharing.title}"</p>
              <div className="space-y-2">
                {SHARE_OPTIONS.map((opt) => (
                  <button key={opt.key} onClick={() => handleShare(sharing, opt.key)}
                    className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-muted/40 hover:bg-muted/60 transition-colors spring-tap text-left">
                    <div className="w-9 h-9 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <opt.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}