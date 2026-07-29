import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import { useExperience } from "@/lib/ExperienceContext";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { hapticSelect } from "@/lib/haptics";
import { QUICK_ACTIONS } from "@/lib/navigation/adaptiveNavConfig";

/**
 * QuickActionCapsule — slim, floating top contextual action strip.
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
      <div className="max-w-[520px] mx-auto px-4 pt-3 safe-area-pt app-content">
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
      </div>
    </MotionConfig>
  );
}