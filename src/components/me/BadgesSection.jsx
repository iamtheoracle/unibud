import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Shield, Eye, EyeOff, Lock, ChevronRight, Award,
  Users, BookOpen, Rocket, Trophy, Heart, GraduationCap,
  PartyPopper, Briefcase, Lightbulb, Dumbbell, Star, BadgeCheck,
  Sparkles, Globe,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const badgeIcons = {
  orientation: Users, matriculation: GraduationCap, department_week: BookOpen,
  faculty_week: Users, sports_festival: Dumbbell, career_fair: Briefcase,
  innovation_week: Lightbulb, hackathon: Lightbulb, volunteer_service: Heart,
  student_leadership: Shield, club_membership: Users, research: Lightbulb,
  competition: Trophy, community_service: Heart, final_year_project: Rocket,
  graduation: GraduationCap, deans_list: Award, outstanding_student: Star,
  scholarship_recipient: Award, internship_completion: BadgeCheck,
};

const badgeColors = {
  orientation: "hsl(var(--unibud-blue))", matriculation: "hsl(var(--unibud-purple))",
  department_week: "hsl(var(--unibud-green))", faculty_week: "hsl(var(--unibud-blue))",
  sports_festival: "hsl(var(--unibud-red))", career_fair: "hsl(var(--unibud-gold))",
  innovation_week: "hsl(var(--unibud-purple))", hackathon: "hsl(var(--unibud-purple))",
  volunteer_service: "hsl(var(--unibud-red))", student_leadership: "hsl(var(--unibud-gold))",
  club_membership: "hsl(var(--unibud-blue))", research: "hsl(var(--unibud-green))",
  competition: "hsl(var(--unibud-gold))", community_service: "hsl(var(--unibud-green))",
  final_year_project: "hsl(var(--unibud-gold))", graduation: "hsl(var(--unibud-gold))",
  deans_list: "hsl(var(--unibud-blue))", outstanding_student: "hsl(var(--unibud-gold))",
  scholarship_recipient: "hsl(var(--unibud-gold))", internship_completion: "hsl(var(--unibud-purple))",
};

const withAlpha = (hsl, a = 0.12) => hsl.replace("))", ") / " + a + ")");

export default function BadgesSection() {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const { data: badges, isLoading } = useQuery({
    queryKey: ["digitalBadges"],
    queryFn: () => base44.entities.DigitalBadge.list("-date_awarded", 50),
  });

  const togglePublic = async (badge) => {
    await base44.entities.DigitalBadge.update(badge.id, { is_public: !badge.is_public });
    qc.invalidateQueries({ queryKey: ["digitalBadges"] });
  };

  const display = expanded ? badges : badges?.slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[15px] text-foreground">Digital Badges</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">{badges?.length || 0} earned</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="aspect-square rounded-[16px] shimmer" />
          ))}
        </div>
      ) : !badges || badges.length === 0 ? (
        <GlassCard variant="solid" className="p-6 text-center">
          <div className="w-12 h-12 rounded-[18px] bg-muted flex items-center justify-center mx-auto mb-2">
            <Shield className="w-6 h-6 text-muted-foreground" strokeWidth={1.8} />
          </div>
          <p className="text-[12px] font-semibold text-foreground">No badges yet</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Participate in campus events to earn badges</p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2">
            {display.map((badge, i) => {
              const Icon = badgeIcons[badge.category] || Award;
              const color = badgeColors[badge.category] || "hsl(var(--unibud-gold))";
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04, type: "spring", stiffness: 300, damping: 22 }}
                  className="relative group"
                >
                  <button
                    onClick={() => togglePublic(badge)}
                    className="w-full aspect-square rounded-[16px] flex flex-col items-center justify-center card-hover spring-tap relative"
                    style={{ backgroundColor: withAlpha(color, 0.1) }}
                    aria-label={`${badge.title} — ${badge.is_public ? "Public" : "Private"}`}
                  >
                    <div className="w-8 h-8 rounded-[12px] flex items-center justify-center mb-1" style={{ backgroundColor: withAlpha(color, 0.2) }}>
                      <Icon className="w-4 h-4" style={{ color }} strokeWidth={2} />
                    </div>
                    <p className="text-[7px] font-semibold text-foreground text-center px-1 leading-tight line-clamp-2">{badge.title}</p>
                    <div className="absolute top-1 right-1">
                      {badge.is_public ? (
                        <Eye className="w-2.5 h-2.5 text-success" />
                      ) : (
                        <EyeOff className="w-2.5 h-2.5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {badges.length > 8 && !expanded && (
            <button onClick={() => setExpanded(true)} className="w-full py-2.5 rounded-[14px] bg-card border border-border/40 text-[11px] font-semibold text-primary spring-tap flex items-center justify-center gap-1">
              Show all {badges.length} badges <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
          {expanded && (
            <button onClick={() => setExpanded(false)} className="w-full py-2.5 rounded-[14px] bg-card border border-border/40 text-[11px] font-semibold text-muted-foreground spring-tap">
              Show less
            </button>
          )}

          <div className="flex items-center gap-2 px-1">
            <Globe className="w-3 h-3 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Tap a badge to toggle public visibility on your profile</p>
          </div>
        </>
      )}
    </div>
  );
}