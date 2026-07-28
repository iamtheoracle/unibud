import React from "react";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";
import { useExperience } from "@/lib/ExperienceContext";

/**
 * ModeSwitcher — the single Academic | Social category selector for UNIBUD.
 * Rendered at the top of the authenticated shell, inside every workspace.
 * One product: the choice filters/prioritizes content only — never navigation.
 */
const OPTIONS = [
  { key: "academic", label: "Academic", icon: GraduationCap },
  { key: "social", label: "Social", icon: Sparkles },
];

export default function ModeSwitcher() {
  const { mode, setMode } = useExperience();

  return (
    <div className="max-w-[520px] mx-auto px-5 pt-3 safe-area-pt app-content">
      <div className="founder-dock rounded-full h-9 p-1 flex items-center gap-1 w-fit mx-auto edge-light">
        {OPTIONS.map((o) => {
          const active = mode === o.key;
          return (
            <button
              key={o.key}
              onClick={() => setMode(o.key)}
              aria-pressed={active}
              className="relative flex items-center gap-1.5 px-3 h-7 rounded-full spring-tap"
            >
              {active && (
                <motion.span
                  layoutId="mode-switch-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: o.key === "social" ? "hsl(var(--accent))" : "hsl(var(--primary))" }}
                  transition={{ type: "spring", stiffness: 320, damping: 26 }}
                />
              )}
              <o.icon className={`relative w-3.5 h-3.5 ${active ? "text-primary-foreground" : "dock-label"}`} />
              <span className={`relative text-[12px] font-semibold ${active ? "text-primary-foreground" : "dock-label"}`}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}