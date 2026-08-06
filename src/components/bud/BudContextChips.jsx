import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, ClipboardList, GitBranch, FlaskConical, MapPin, Users,
  CalendarDays, Store, Home, Briefcase, Wallet, Dumbbell, Music,
  Bus, Heart, UtensilsCrossed, Library, Trophy, Award, GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const CONTEXT_CHIPS = [
  { id: "study", label: "Study", icon: BookOpen, color: "hsl(217 91% 60%)" },
  { id: "assignments", label: "Assignments", icon: ClipboardList, color: "hsl(142 71% 45%)" },
  { id: "projects", label: "Projects", icon: GitBranch, color: "hsl(280 65% 60%)" },
  { id: "research", label: "Research", icon: FlaskConical, color: "hsl(200 80% 55%)" },
  { id: "campus", label: "Campus", icon: MapPin, color: "hsl(251 90% 67%)" },
  { id: "friends", label: "Friends", icon: Users, color: "hsl(330 75% 55%)" },
  { id: "events", label: "Events", icon: CalendarDays, color: "hsl(24 90% 55%)" },
  { id: "marketplace", label: "Marketplace", icon: Store, color: "hsl(46 74% 55%)" },
  { id: "housing", label: "Housing", icon: Home, color: "hsl(160 70% 45%)" },
  { id: "career", label: "Career", icon: Briefcase, color: "hsl(251 90% 67%)" },
  { id: "finance", label: "Finance", icon: Wallet, color: "hsl(142 71% 45%)" },
  { id: "sports", label: "Sports", icon: Dumbbell, color: "hsl(0 84% 60%)" },
  { id: "music", label: "Music", icon: Music, color: "hsl(280 65% 60%)" },
  { id: "transport", label: "Transport", icon: Bus, color: "hsl(217 91% 60%)" },
  { id: "health", label: "Health", icon: Heart, color: "hsl(0 84% 60%)" },
  { id: "dining", label: "Dining", icon: UtensilsCrossed, color: "hsl(24 90% 55%)" },
  { id: "library", label: "Library", icon: Library, color: "hsl(46 74% 55%)" },
  { id: "clubs", label: "Clubs", icon: Trophy, color: "hsl(251 90% 67%)" },
  { id: "scholarships", label: "Scholarships", icon: Award, color: "hsl(46 74% 55%)" },
  { id: "internships", label: "Internships", icon: GraduationCap, color: "hsl(251 90% 67%)" },
];

/**
 * BudContextChips — intelligent shortcut chips that appear below Bud.
 * Each chip sets the conversation context for Bud.
 *
 * Props:
 *  - onSelect: (chipId) => void
 *  - activeChip: string
 *  - variant: "rail" | "grid"
 */
export default function BudContextChips({ onSelect, activeChip, variant = "rail" }) {
  const [active, setActive] = useState(activeChip);

  const handleSelect = (chipId) => {
    setActive(chipId);
    onSelect?.(chipId);
  };

  if (variant === "grid") {
    return (
      <div className="grid grid-cols-4 gap-1.5">
        {CONTEXT_CHIPS.map((chip, i) => {
          const Icon = chip.icon;
          const isActive = active === chip.id;
          return (
            <motion.button
              key={chip.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.25, ease: EASE }}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleSelect(chip.id)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 rounded-[10px] spring-tap",
                isActive ? "glass-strong" : "glass"
              )}
              style={isActive ? { boxShadow: `0 0 12px ${chip.color}20` } : {}}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: chip.color }} />
              <span className="text-[8px] font-bold text-foreground">{chip.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-1 py-1">
      {CONTEXT_CHIPS.map((chip, i) => {
        const Icon = chip.icon;
        const isActive = active === chip.id;
        return (
          <motion.button
            key={chip.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.025, duration: 0.25, ease: EASE }}
            whileTap={{ scale: 0.94 }}
            onClick={() => handleSelect(chip.id)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-bold spring-tap whitespace-nowrap flex-shrink-0",
              isActive ? "text-white" : "glass text-muted-foreground"
            )}
            style={isActive ? { background: chip.color } : {}}
          >
            <Icon className="w-3 h-3" strokeWidth={2.2} />
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}

export { CONTEXT_CHIPS };