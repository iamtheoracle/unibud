import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, ArrowLeftRight } from "lucide-react";
import { useExperience } from "@/lib/ExperienceContext";

/**
 * ModeSwitcher — compact inline context pill shown at the top of the
 * authenticated shell. Taps between Academic and Social. Additive only:
 * does not alter the bottom dock, any page header, or any business logic.
 */
export default function ModeSwitcher() {
  const { mode, setMode } = useExperience();
  const isSocial = mode === "social";
  const toggle = () => setMode(isSocial ? "academic" : "social");

  return (
    <div className="max-w-[520px] mx-auto px-5 pt-3 safe-area-pt app-content">
      <button
        onClick={toggle}
        aria-label={`Switch to ${isSocial ? "Academic" : "Social"} context`}
        className="crystal-dock rounded-full h-9 px-3 flex items-center gap-2 spring-tap edge-light mx-auto"
      >
        <motion.span
          layout
          className="w-6 h-6 rounded-full grid place-items-center"
          style={{ background: isSocial ? "hsl(var(--accent))" : "hsl(var(--primary))" }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
        >
          {isSocial ? (
            <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
          ) : (
            <GraduationCap className="w-3.5 h-3.5 text-primary-foreground" />
          )}
        </motion.span>
        <span className="text-[12px] font-semibold text-foreground">
          {isSocial ? "Social" : "Academic"}
        </span>
        <ArrowLeftRight className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground hidden sm:inline">tap to switch</span>
      </button>
    </div>
  );
}