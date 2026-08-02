import React from "react";
import { motion } from "framer-motion";
import { Radio, Clock, UserCheck, Building2, Users, Heart, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const CATEGORIES = [
  { id: "live_now", label: "Live Now", icon: Radio, hasLiveDot: true },
  { id: "starting_soon", label: "Starting Soon", icon: Clock },
  { id: "following", label: "Following", icon: UserCheck },
  { id: "university", label: "University", icon: Building2 },
  { id: "communities", label: "Communities", icon: Users },
  { id: "friends", label: "Friends", icon: Heart },
  { id: "trending", label: "Trending", icon: TrendingUp },
];

/**
 * LiveCategoryBar — horizontal scrollable category filter for the Live Hub.
 *
 * Props:
 *  - active: currently selected category id
 *  - onChange: (categoryId) => void
 *  - liveCount: number of live sessions (for the Live Now badge)
 */
export default function LiveCategoryBar({ active = "live_now", onChange, liveCount = 0 }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-4 py-2">
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = active === cat.id;
        return (
          <motion.button
            key={cat.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange?.(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold spring-tap whitespace-nowrap flex-shrink-0",
              isActive ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2.2} style={{ width: 14, height: 14 }} />
            {cat.label}
            {cat.hasLiveDot && liveCount > 0 && (
              <span className="flex items-center gap-1 ml-0.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isActive ? "bg-primary-foreground" : "bg-destructive"
                  )}
                />
                <span className={cn("text-[10px]", isActive ? "text-primary-foreground" : "text-destructive")}>
                  {liveCount}
                </span>
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export { CATEGORIES };