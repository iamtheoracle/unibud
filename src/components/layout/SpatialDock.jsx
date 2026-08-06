import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Home, Radio, GraduationCap, MessagesSquare, Store,
  CalendarDays, Users, Sparkles, Bookmark,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOCK_ITEMS = [
  { icon: Home, path: "/home", label: "Home" },
  { icon: Radio, path: "/social", label: "Orbit" },
  { icon: GraduationCap, path: "/academics", label: "Academic" },
  { icon: MessagesSquare, path: "/messages", label: "Messages" },
  { icon: CalendarDays, path: "/events", label: "Events" },
  { icon: Users, path: "/communities", label: "Communities" },
  { icon: Store, path: "/marketplace", label: "Marketplace" },
  { icon: Bookmark, path: "/highlights", label: "Highlights" },
];

/**
 * SpatialDock — floating workspace switcher dock.
 * Breathing animation when idle, magnifies on hover (macOS dock style).
 *
 * Props:
 *  - onOpenBud: () => void
 */
export default function SpatialDock({ onOpenBud }) {
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[5000]">
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="flex items-end gap-1 px-2.5 py-2 rounded-[20px] crystal-dock"
      >
        {DOCK_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;
          const isHovered = hovered === i;
          const scale = isHovered ? 1.35 : active ? 1.12 : 1;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative w-9 h-9 rounded-[12px] flex items-center justify-center spring-tap"
              >
                <Icon
                  className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")}
                  strokeWidth={2.2}
                />
                {active && (
                  <motion.div
                    layoutId="dock-active-dot"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                  />
                )}

                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md glass text-[9px] font-bold text-foreground whitespace-nowrap pointer-events-none"
                  >
                    {item.label}
                  </motion.div>
                )}
              </motion.div>
            </Link>
          );
        })}

        {/* Divider */}
        <div className="w-px h-6 bg-border/30 mx-0.5 self-center" />

        {/* Bud */}
        <motion.button
          onMouseEnter={() => setHovered("bud")}
          onMouseLeave={() => setHovered(null)}
          whileHover={{ scale: 1.35 }}
          whileTap={{ scale: 0.9 }}
          onClick={onOpenBud}
          className="relative w-9 h-9 rounded-[12px] flex items-center justify-center spring-tap"
        >
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 hsl(var(--primary) / 0)", "0 0 12px 2px hsl(var(--primary) / 0.15)", "0 0 0 0 hsl(var(--primary) / 0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.2} />
          </motion.div>
          {hovered === "bud" && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md glass text-[9px] font-bold text-foreground whitespace-nowrap pointer-events-none"
            >
              Bud
            </motion.div>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}