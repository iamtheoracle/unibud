import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

const ACTIONS = [
  { label: "Ask Bud", action: "bud" },
  { label: "Study Suite", to: "/study" },
  { label: "Institution", to: "/institution/console" },
  { label: "Lecturer", to: "/lecturer/portal" },
  { label: "Parent", to: "/parent/portal" },
  { label: "Exams", to: "/exam" },
  { label: "Courses", to: "/courses" },
  { label: "Timetable", to: "/timetable" },
  { label: "Calendar", to: "/calendar" },
  { label: "Assignments", to: "/assignments" },
  { label: "Projects", to: "/projects" },
  { label: "Exams", to: "/exams" },
  { label: "Attendance", to: "/attendance" },
  { label: "Notes", to: "/notes" },
  { label: "Study", to: "/study-sessions" },
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
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}>
      <div className="grid grid-cols-3 gap-3">
        {ACTIONS.map((a) => (
          <button
            key={a.label}
            onClick={() => handle(a)}
            className="flex items-center justify-center p-4 rounded-2xl glass spring-tap card-hover min-h-[64px]"
          >
            <span className="text-[12px] font-semibold text-foreground text-center leading-tight">{a.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}