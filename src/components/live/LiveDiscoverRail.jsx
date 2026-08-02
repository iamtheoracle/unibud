import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Building2, GraduationCap, CalendarDays, Bookmark, UserCheck, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "@/lib/motion/motionPresets";

const DISCOVER_TABS = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "friends", label: "Friends Live", icon: UserCheck },
  { id: "department", label: "Department", icon: Building2 },
  { id: "faculty", label: "Faculty", icon: GraduationCap },
  { id: "following", label: "Following", icon: Users },
  { id: "upcoming", label: "Upcoming", icon: CalendarDays },
  { id: "saved", label: "Saved", icon: Bookmark },
];

/**
 * LiveDiscoverRail — horizontal scrollable filter rail for the Live homepage.
 *
 * Props:
 *  - active: string — currently selected tab id
 *  - onChange: (tabId) => void
 *  - liveCounts: object — { trending: 3, friends: 1, ... } live count per tab
 */
export default function LiveDiscoverRail({ active = "trending", onChange, liveCounts = {} }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-4 py-2">
      {DISCOVER_TABS.map((tab, i) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        const count = liveCounts[tab.id] || 0;

        return (
          <motion.button
            key={tab.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange?.(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-full text-[12px] font-bold spring-tap whitespace-nowrap flex-shrink-0 relative",
              isActive ? "bg-primary text-primary-foreground" : "glass text-muted-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
            {tab.label}
            {count > 0 && (
              <span className={cn(
                "flex items-center gap-0.5 px-1 py-0.5 rounded-full text-[8px] font-bold",
                isActive ? "bg-white/20" : "bg-destructive/20"
              )}>
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className={cn("w-1 h-1 rounded-full", isActive ? "bg-white" : "bg-destructive")}
                />
                {count}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export { DISCOVER_TABS };