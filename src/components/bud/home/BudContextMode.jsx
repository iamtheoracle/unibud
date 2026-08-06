import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sunrise, Sun, Sunset, Moon, ChevronRight } from "lucide-react";

const MODES = {
  morning: {
    title: "Morning", icon: Sunrise,
    items: [
      { label: "Today's schedule", to: "/timetable" },
      { label: "First lecture", to: "/timetable" },
      { label: "Travel time", to: "/home" },
    ],
  },
  afternoon: {
    title: "Afternoon", icon: Sun,
    items: [
      { label: "Current lecture", to: "/timetable" },
      { label: "Focus timer", to: "/study-sessions" },
      { label: "Assignments", to: "/assignments" },
      { label: "Campus events", to: "/events" },
    ],
  },
  evening: {
    title: "Evening", icon: Sunset,
    items: [
      { label: "Revision", to: "/study" },
      { label: "Study streak", to: "/study-sessions" },
      { label: "Tomorrow's timetable", to: "/timetable" },
    ],
  },
  night: {
    title: "Night", icon: Moon,
    items: [
      { label: "Sleep recommendation", to: "/home" },
      { label: "Recovery", to: "/home" },
      { label: "Reflection", to: "/notes" },
      { label: "Tomorrow preview", to: "/calendar" },
    ],
  },
};

/**
 * BudContextMode — Bud adapts the home by time of day, surfacing the few
 * things that matter most right now.
 */
export default function BudContextMode({ ctx }) {
  const mode = MODES[ctx.timeOfDay] || MODES.afternoon;
  const Icon = mode.icon;
  return (
    <div className="p-4 rounded-[22px] glass">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </span>
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{mode.title} mode</p>
          <p className="font-heading font-semibold text-[14px] text-foreground">What matters now</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {mode.items.map((it, i) => (
          <motion.div key={it.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Link to={it.to} className="flex items-center justify-between p-3 rounded-[16px] bg-card border border-border/40 spring-tap">
              <span className="text-[12px] text-foreground font-medium">{it.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}