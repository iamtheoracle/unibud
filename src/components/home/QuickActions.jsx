import React from "react";
import { motion } from "framer-motion";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const ACTIONS = [
  { label: "Ask Bud", action: "bud" },
  { label: "Scan Notes", action: "scan" },
  { label: "My Courses", action: "courses" },
  { label: "Timetable", action: "timetable" },
  { label: "Assignments", action: "assignments" },
  { label: "Study Planner", action: "planner" },
];

/**
 * QuickActions — six Liquid Glass shortcuts (text-only for now).
 */
export default function QuickActions() {
  const { setOpen } = useBudLauncher();
  const handle = (a) => {
    if (a === "bud") setOpen(true);
    else toast({ title: "Coming soon", description: "This module arrives in a future milestone." });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}>
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => handle(a.action)}
            className="flex items-center justify-center p-4 rounded-2xl glass spring-tap card-hover min-h-[64px]"
          >
            <span className="text-[12px] font-semibold text-foreground text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}