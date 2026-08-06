import React from "react";
import { motion } from "framer-motion";
import {
  Video, GraduationCap, Users, CalendarDays, Heart, Star,
  Crown, Shield, Flame, BookOpen, Trophy, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const REPUTATION_TYPES = {
  host: { icon: Video, label: "Host", color: "hsl(217 91% 60%)", desc: "Hosted live sessions" },
  teacher: { icon: GraduationCap, label: "Teacher", color: "hsl(142 71% 45%)", desc: "Taught others" },
  helper: { icon: Heart, label: "Helper", color: "hsl(0 84% 60%)", desc: "Helped classmates" },
  participant: { icon: Users, label: "Active", color: "hsl(280 65% 60%)", desc: "Regular participant" },
  consistent: { icon: Flame, label: "Consistent", color: "hsl(24 90% 55%)", desc: "Consistent attendance" },
  attendance: { icon: CalendarDays, label: "Present", color: "hsl(200 80% 55%)", desc: "Great attendance" },
  leadership: { icon: Crown, label: "Leader", color: "hsl(46 74% 55%)", desc: "Community leader" },
  impact: { icon: Star, label: "Impact", color: "hsl(330 75% 55%)", desc: "Community impact" },
  moderator: { icon: Shield, label: "Moderator", color: "hsl(160 70% 45%)", desc: "Kept spaces safe" },
  scholar: { icon: BookOpen, label: "Scholar", color: "hsl(251 90% 67%)", desc: "Study excellence" },
  champion: { icon: Trophy, label: "Champion", color: "hsl(15 75% 50%)", desc: "Competition winner" },
  pioneer: { icon: Sparkles, label: "Pioneer", color: "hsl(0 0% 100%)", desc: "Early adopter" },
};

/**
 * LiveReputationBadge — a single reputation badge.
 *
 * Props:
 *  - type: string — reputation type key
 *  - level: number — badge level (1-3)
 *  - count: number — times earned
 *  - size: "sm" | "md" | "lg"
 *  - onClick: () => void
 */
export default function LiveReputationBadge({ type, level = 1, count, size = "md", onClick }) {
  const config = REPUTATION_TYPES[type];
  if (!config) return null;
  const Icon = config.icon;

  const sizes = {
    sm: { box: "w-7 h-7", icon: "w-3 h-3", text: "text-[8px]" },
    md: { box: "w-9 h-9", icon: "w-4 h-4", text: "text-[9px]" },
    lg: { box: "w-12 h-12", icon: "w-5 h-5", text: "text-[10px]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: EASE }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="flex flex-col items-center gap-1 cursor-pointer"
    >
      <div
        className={cn(s.box, "rounded-[10px] flex items-center justify-center relative spring-tap")}
        style={{
          background: `linear-gradient(135deg, ${config.color}20, ${config.color}08)`,
          border: `1px solid ${config.color}30`,
        }}
      >
        <Icon className={s.icon} strokeWidth={2.2} style={{ color: config.color }} />

        {/* Level stars */}
        {level > 1 && (
          <div className="absolute -bottom-0.5 -right-0.5 flex items-center gap-0.5 px-0.5 rounded-full bg-background">
            {Array.from({ length: level - 1 }).map((_, i) => (
              <Star key={i} className="w-1.5 h-1.5 fill-current" style={{ color: config.color }} strokeWidth={0} />
            ))}
          </div>
        )}

        {/* Count badge */}
        {count != null && count > 1 && (
          <div className="absolute -top-1 -right-1 px-1 py-0.5 rounded-full bg-foreground text-background text-[7px] font-bold">
            {count}
          </div>
        )}
      </div>
      <span className={cn(s.text, "font-bold text-muted-foreground uppercase tracking-wider")}>{config.label}</span>
    </motion.div>
  );
}

/**
 * LiveReputationGrid — grid of reputation badges.
 *
 * Props:
 *  - badges: [{ type, level, count }]
 *  - size: "sm" | "md" | "lg"
 */
export function LiveReputationGrid({ badges = [], size = "md" }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {badges.map((b, i) => (
        <LiveReputationBadge key={b.type || i} type={b.type} level={b.level} count={b.count} size={size} />
      ))}
    </div>
  );
}

export { REPUTATION_TYPES };