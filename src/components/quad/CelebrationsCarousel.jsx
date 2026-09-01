import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import {
  Heart, MessageCircle, Share2, PartyPopper, ChevronRight,
  Cake, GraduationCap, Trophy, Award, Rocket, Star, Users,
  BadgeCheck, ShoppingBag, Sparkles, Lock, Globe, Sparkle, BookOpen,
} from "lucide-react";

const milestoneIcons = {
  graduation_countdown: GraduationCap, birthday: Cake, award_winner: Award,
  competition_winner: Trophy, club_launch: Users, achievement: Star,
  deans_list: BookOpen, research_publication: BookOpen, startup_launch: Rocket,
  student_business: ShoppingBag, certification: BadgeCheck, leadership_role: Users,
};

const milestoneColors = {
  graduation_countdown: "hsl(var(--unibud-gold))", birthday: "hsl(var(--unibud-gold))",
  award_winner: "hsl(var(--unibud-gold))", competition_winner: "hsl(var(--unibud-purple))",
  club_launch: "hsl(var(--unibud-blue))", achievement: "hsl(var(--unibud-green))",
  deans_list: "hsl(var(--unibud-blue))", research_publication: "hsl(var(--unibud-green))",
  startup_launch: "hsl(var(--unibud-gold))", student_business: "hsl(var(--unibud-orange))",
  certification: "hsl(var(--unibud-purple))", leadership_role: "hsl(var(--unibud-blue))",
};

const milestoneLabels = {
  graduation_countdown: "Graduation", birthday: "Birthday",
  award_winner: "Award", competition_winner: "Champion",
  club_launch: "New Club", achievement: "Achievement",
  deans_list: "Dean's List", research_publication: "Research",
  startup_launch: "Startup", student_business: "Business",
  certification: "Certified", leadership_role: "Leadership",
};

const withAlpha = (hsl, a = 0.12) => hsl.replace("))", ") / " + a + ")");

export default function CelebrationsCarousel() {
  const qc = useQueryClient();
  const [reactedIds, setReactedIds] = useState(new Set());

  const { data: celebrations, isLoading } = useQuery({
    queryKey: ["quadCelebrations"],
    queryFn: () => base44.entities.Celebration.list("-celebration_date", 10),
  });

  const toggleReact = async (celebration) => {
    const newSet = new Set(reactedIds);
    const isReacted = newSet.has(celebration.id);
    if (isReacted) newSet.delete(celebration.id);
    else newSet.add(celebration.id);

    await base44.entities.Celebration.update(celebration.id, {
      is_reacted: !isReacted,
      reactions_count: isReacted ? celebration.reactions_count - 1 : celebration.reactions_count + 1,
    });
    setReactedIds(newSet);
    qc.invalidateQueries({ queryKey: ["quadCelebrations"] });
  };

  if (isLoading) {
    return (
      <div className="mb-4">
        <h3 className="font-heading font-bold text-[16px] text-foreground px-5 mb-3">Celebrations</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[240px] h-[180px] rounded-[20px] shimmer flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (!celebrations || celebrations.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between px-5 mb-3">
        <div>
          <h3 className="font-heading font-bold text-[16px] text-foreground">Celebrations</h3>
          <p className="text-[10px] text-muted-foreground">Celebrate your classmates' wins</p>
        </div>
        <Link to="/celebrations" className="flex items-center gap-0.5 text-[11px] font-semibold text-primary spring-tap">
          See All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-1">
        {celebrations.map((celebration, i) => {
          const Icon = milestoneIcons[celebration.milestone_type] || Star;
          const color = milestoneColors[celebration.milestone_type] || "hsl(var(--unibud-gold))";
          const isReacted = reactedIds.has(celebration.id);

          return (
            <motion.div
              key={celebration.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 24 }}
              className="flex-shrink-0 w-[250px] bg-card rounded-[20px] soft-shadow border border-border/40 overflow-hidden card-hover"
            >
              {/* Top banner */}
              <div className="relative h-[60px] overflow-hidden" style={{ background: `linear-gradient(135deg, ${withAlpha(color, 0.25)}, ${withAlpha(color, 0.05)})` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon className="w-8 h-8" style={{ color }} strokeWidth={1.5} />
                </div>
                <span className="absolute top-2 left-2.5 px-2 py-0.5 rounded-full text-[8px] font-bold" style={{ backgroundColor: withAlpha(color, 0.9), color: "white" }}>
                  {milestoneLabels[celebration.milestone_type] || celebration.milestone_type}
                </span>
                <span className="absolute top-2 right-2.5 px-2 py-0.5 rounded-full bg-card/80 backdrop-blur-sm text-[8px] font-semibold text-muted-foreground flex items-center gap-0.5">
                  <Globe className="w-2 h-2" /> Public
                </span>
              </div>

              {/* Content */}
              <div className="p-3">
                <p className="font-heading font-semibold text-[12px] text-foreground leading-snug">{celebration.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">by {celebration.student_name}</p>

                <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-border/30">
                  <button onClick={() => toggleReact(celebration)} className="flex items-center gap-1 spring-tap">
                    <Heart className={`w-3.5 h-3.5 ${isReacted ? "fill-error text-error" : "text-muted-foreground"}`} />
                    <span className="text-[10px] font-semibold text-muted-foreground">{celebration.reactions_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 spring-tap">
                    <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground">{celebration.comments_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-1 spring-tap ml-auto">
                    <PartyPopper className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-semibold text-primary">Celebrate</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}