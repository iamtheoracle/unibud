import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

export const SPORT_CATEGORIES = [
  { id: "football", label: "Football", emoji: "⚽", accent: "hsl(142 71% 45%)" },
  { id: "basketball", label: "Basketball", emoji: "🏀", accent: "hsl(24 90% 55%)" },
  { id: "volleyball", label: "Volleyball", emoji: "🏐", accent: "hsl(280 65% 60%)" },
  { id: "athletics", label: "Athletics", emoji: "🏃", accent: "hsl(200 80% 55%)" },
  { id: "badminton", label: "Badminton", emoji: "🏸", accent: "hsl(160 70% 45%)" },
  { id: "table_tennis", label: "Table Tennis", emoji: "🏓", accent: "hsl(340 75% 55%)" },
  { id: "tennis", label: "Tennis", emoji: "🎾", accent: "hsl(135 60% 50%)" },
  { id: "swimming", label: "Swimming", emoji: "🏊", accent: "hsl(210 85% 55%)" },
  { id: "chess", label: "Chess", emoji: "♟", accent: "hsl(0 0% 60%)" },
  { id: "esports", label: "Esports", emoji: "🎮", accent: "hsl(270 70% 60%)" },
  { id: "cricket", label: "Cricket", emoji: "🏏", accent: "hsl(48 85% 55%)" },
  { id: "rugby", label: "Rugby", emoji: "🏉", accent: "hsl(15 75% 50%)" },
  { id: "boxing", label: "Boxing", emoji: "🥊", accent: "hsl(0 0% 45%)" },
  { id: "martial_arts", label: "Martial Arts", emoji: "🥋", accent: "hsl(190 70% 45%)" },
];

/**
 * SportsCategoryGrid — grid of sport categories with favourite support.
 *
 * Props:
 *  - favorites: string[] (sport IDs)
 *  - onToggleFavorite: (sportId) => void
 *  - onSelect: (sport) => void
 *  - compact: boolean — smaller tiles
 */
export default function SportsCategoryGrid({ favorites = [], onToggleFavorite, onSelect, compact = false }) {
  return (
    <div className={cn("grid gap-2.5", compact ? "grid-cols-4" : "grid-cols-3")}>
      {SPORT_CATEGORIES.map((sport, i) => {
        const isFav = favorites.includes(sport.id);
        return (
          <motion.button
            key={sport.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.35, ease: EASE }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect?.(sport)}
            className={cn(
              "relative crystal-card rounded-[16px] flex flex-col items-center justify-center gap-1 spring-tap overflow-hidden",
              compact ? "p-2.5" : "p-3.5"
            )}
          >
            {/* Accent glow */}
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{ background: `radial-gradient(50% 50% at 50% 50%, ${sport.accent}, transparent 70%)` }}
            />

            <span className={compact ? "text-2xl" : "text-3xl"}>{sport.emoji}</span>
            <span className={cn("font-bold text-foreground text-center leading-tight", compact ? "text-[9px]" : "text-[10px]")}>
              {sport.label}
            </span>

            {/* Favorite star */}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(sport.id);
                }}
                className="absolute top-1.5 right-1.5 w-5 h-5 flex items-center justify-center spring-tap"
              >
                <Star
                  className={cn("w-3 h-3 transition-all", isFav ? "text-gold fill-gold" : "text-muted-foreground/40")}
                  strokeWidth={2.2}
                />
              </button>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}