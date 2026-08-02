import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Camera, CalendarDays, Sparkles,
  Clock, ClipboardList, QrCode,
} from "lucide-react";
import { useExperience } from "@/lib/ExperienceContext";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

const SOCIAL_ACTIONS = [
  { key: "search", icon: Search, label: "Search", to: "/discover" },
  { key: "create", icon: Plus, label: "Create", to: "/square" },
  { key: "camera", icon: Camera, label: "Camera", to: "/shorts" },
  { key: "events", icon: CalendarDays, label: "Events", to: "/events" },
  { key: "bud", icon: Sparkles, label: "Bud", kind: "bud", glow: true },
];

const ACADEMIC_ACTIONS = [
  { key: "search", icon: Search, label: "Search", to: "/discover" },
  { key: "timetable", icon: Clock, label: "Timetable", to: "/timetable" },
  { key: "tasks", icon: ClipboardList, label: "Tasks", to: "/assignments" },
  { key: "bud", icon: Sparkles, label: "Bud", kind: "bud", glow: true },
  { key: "scan", icon: QrCode, label: "Scan", to: "/smart-attendance" },
];

/**
 * QuickActionBar — premium floating glass capsule fixed near the top.
 * Adapts its actions based on the active experience mode (Social/Academic).
 * This is NOT navigation — it contains context-aware quick actions only.
 */
export default function QuickActionBar() {
  const { mode } = useExperience();
  const { setOpen } = useBudLauncher();
  const navigate = useNavigate();

  const actions = mode === "social" ? SOCIAL_ACTIONS : ACADEMIC_ACTIONS;

  const handleAction = (action) => {
    hapticTap();
    if (action.kind === "bud") {
      setOpen(true);
    } else if (action.to) {
      navigate(action.to);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="fixed top-0 inset-x-0 z-30 pointer-events-none"
    >
      <div className="max-w-[520px] mx-auto px-4 pt-2 safe-area-pt pointer-events-auto">
        <div className="glass rounded-full px-1.5 py-1 flex items-center shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex items-center flex-1"
            >
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.key}
                    onClick={() => handleAction(action)}
                    className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-full spring-tap transition-colors hover:bg-muted/30 ${action.glow ? "glow-pulse" : ""}`}
                    aria-label={action.label}
                  >
                    <Icon className="w-[17px] h-[17px] text-foreground/70" strokeWidth={2} />
                    <span className="text-[9px] font-semibold text-muted-foreground">{action.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}