import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

const ACTIONS = [
  { label: "Ask Bud", action: "bud" },
  { label: "Courses", to: "/courses" },
  { label: "Timetable", to: "/timetable" },
  { label: "Calendar", to: "/calendar" },
  { label: "Assignments", to: "/assignments" },
  { label: "Projects", to: "/projects" },
  { label: "Exams", to: "/exams" },
  { label: "Attendance", to: "/attendance" },
  { label: "Notes", to: "/notes" },
  { label: "Study", to: "/study-sessions" },
  { label: "Security", to: "/security" },
  { label: "Study Suite", to: "/study" },
];

/**
 * QuickActions — shortcuts to Bud and every academic module.
 */
export default function QuickActions() {
  const navigate = useNavigate();
  const { setOpen } = useBudLauncher();
  const handle = (a) => {
    if (a.action === "bud") setOpen(true);
    else if (a.to) navigate(a.to);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}>
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-4 gap-x-3 gap-y-1">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => handle(a)}
            className="flex flex-col items-center justify-center py-3 spring-tap min-h-[56px]"
          >
            <span className="text-[11px] font-medium text-muted-foreground text-center leading-tight hover:text-foreground transition-colors">{a.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}