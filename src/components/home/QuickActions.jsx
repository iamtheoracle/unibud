import React from "react";
import { motion } from "framer-motion";
import { Sparkles, ScanLine, BookOpen, CalendarDays, ClipboardList, CalendarClock } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { toast } from "@/components/ui/use-toast";

const EASE = [0.16, 1, 0.3, 1];

const ACTIONS = [
  { icon: Sparkles, label: "Ask Bud", action: "bud" },
  { icon: ScanLine, label: "Scan Notes", action: "scan" },
  { icon: BookOpen, label: "My Courses", action: "courses" },
  { icon: CalendarDays, label: "Timetable", action: "timetable" },
  { icon: ClipboardList, label: "Assignments", action: "assignments" },
  { icon: CalendarClock, label: "Study Planner", action: "planner" },
];

/**
 * QuickActions — six premium Liquid Glass shortcuts.
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
            className="flex flex-col items-center gap-2 p-3 rounded-2xl glass spring-tap card-hover"
          >
            <div className="w-11 h-11 rounded-2xl bg-primary/12 text-primary flex items-center justify-center">
              <a.icon className="w-[20px] h-[20px]" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold text-foreground text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}