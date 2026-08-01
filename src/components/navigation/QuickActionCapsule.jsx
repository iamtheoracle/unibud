import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/ExperienceContext";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { hapticSelect } from "@/lib/haptics";
import { QUICK_ACTIONS } from "@/lib/navigation/adaptiveNavConfig";

/**
 * QuickActionCapsule — the ONE floating top contextual action strip.
 *
 * Fixed at the top of the viewport. Adapts to the current operating mode
 * (Social or Academic). Thin, glass, elegant, almost full width.
 * This replaces the old FloatingNav (top stories bar) and AICommandBar
 * (floating AI pill) — one unified contextual surface, no duplicates.
 */
const SPRING = { type: "spring", stiffness: 420, damping: 32 };

export default function QuickActionCapsule() {
  const { mode } = useExperience();
  const navigate = useNavigate();
  const { setOpen } = useBudLauncher();
  const actions = QUICK_ACTIONS[mode] || [];

  const handle = (a) => {
    hapticSelect();
    if (a.action === "bud") { setOpen(true); return; }
    if (a.to) navigate(a.to);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="fixed top-0 left-0 right-0 z-[9997] safe-area-pt pointer-events-none app-content">
        <motion.div
          className="max-w-[520px] mx-auto px-4 pt-2 pb-1 pointer-events-auto"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            layout
            transition={SPRING}
            className="glass rounded-full h-10 px-1.5 flex items-center gap-1 edge-light soft-shadow"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                layout
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-1 w-full"
              >
                {actions.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.key}
                      onClick={() => handle(a)}
                      aria-label={a.label}
                      className={`relative flex items-center gap-1.5 h-8 px-2.5 rounded-full spring-tap flex-1 min-w-0 justify-center ${
                        a.accent ? "bg-primary/10" : ""
                      }`}
                    >
                      <Icon className="w-[15px] h-[15px] text-primary shrink-0" strokeWidth={2.1} />
                      <span className="text-[11px] font-semibold text-foreground truncate">{a.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </MotionConfig>
  );
}