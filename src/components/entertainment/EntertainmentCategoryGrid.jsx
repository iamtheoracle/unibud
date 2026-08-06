import React from "react";
import { motion } from "framer-motion";
import {
  Film, Tv, Clapperboard, Headphones, Music, Radio,
  Video, GraduationCap, Users, Trophy, Gamepad2, BookOpen,
  Sparkles, Calendar, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

export const ENTERTAINMENT_CATEGORIES = [
  { id: "movies", label: "Movies", icon: Film, accent: "hsl(0 84% 60%)" },
  { id: "series", label: "Series", icon: Tv, accent: "hsl(280 65% 60%)" },
  { id: "documentaries", label: "Documentaries", icon: Clapperboard, accent: "hsl(200 80% 55%)" },
  { id: "anime", label: "Anime", icon: Sparkles, accent: "hsl(330 75% 55%)" },
  { id: "podcasts", label: "Podcasts", icon: Headphones, accent: "hsl(160 70% 45%)" },
  { id: "music", label: "Music", icon: Music, accent: "hsl(142 71% 45%)" },
  { id: "campus_radio", label: "Campus Radio", icon: Radio, accent: "hsl(24 90% 55%)" },
  { id: "campus_tv", label: "Campus TV", icon: Video, accent: "hsl(190 70% 45%)" },
  { id: "live_streams", label: "Live Streams", icon: Radio, accent: "hsl(0 84% 60%)" },
  { id: "educational", label: "Educational", icon: GraduationCap, accent: "hsl(217 91% 60%)" },
  { id: "creator_channels", label: "Creator Channels", icon: Users, accent: "hsl(48 85% 55%)" },
  { id: "university_events", label: "University Events", icon: Calendar, accent: "hsl(270 70% 60%)" },
  { id: "sports_streams", label: "Sports Streams", icon: Trophy, accent: "hsl(15 75% 50%)" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, accent: "hsl(270 70% 60%)" },
  { id: "study_with_me", label: "Study With Me", icon: BookOpen, accent: "hsl(142 71% 45%)" },
  { id: "campus_originals", label: "Campus Originals", icon: Sparkles, accent: "hsl(46 74% 55%)" },
  { id: "watch_parties", label: "Watch Parties", icon: Users, accent: "hsl(280 65% 60%)" },
  { id: "trending", label: "Trending", icon: TrendingUp, accent: "hsl(0 84% 60%)" },
];

/**
 * EntertainmentCategoryGrid — grid of entertainment categories.
 *
 * Props:
 *  - active: string — currently selected category id
 *  - onSelect: (category) => void
 *  - variant: "grid" | "rail" — grid layout or horizontal scroll rail
 *  - showLabels: boolean
 */
export default function EntertainmentCategoryGrid({
  active,
  onSelect,
  variant = "grid",
  showLabels = true,
}) {
  if (variant === "rail") {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2">
        {ENTERTAINMENT_CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          const isActive = active === cat.id;
          return (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onSelect?.(cat)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold spring-tap whitespace-nowrap flex-shrink-0",
                isActive ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
              {showLabels && cat.label}
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {ENTERTAINMENT_CATEGORIES.map((cat, i) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.35, ease: EASE }}
            whileTap={{ scale: 0.93 }}
            onClick={() => onSelect?.(cat)}
            className={cn(
              "relative crystal-card rounded-[14px] flex flex-col items-center justify-center gap-1 p-2.5 spring-tap overflow-hidden",
              isActive && "ring-2 ring-primary/40"
            )}
          >
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{ background: `radial-gradient(50% 50% at 50% 50%, ${cat.accent}, transparent 70%)` }}
            />
            <Icon
              className="relative w-4 h-4"
              strokeWidth={2.2}
              style={{ color: isActive ? "hsl(var(--primary))" : cat.accent }}
            />
            {showLabels && (
              <span className="relative text-[8px] font-bold text-foreground text-center leading-tight">
                {cat.label}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}