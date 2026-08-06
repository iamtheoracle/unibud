import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Rocket, Zap, ChevronDown } from "lucide-react";

const MODES = [
  { id: "auto", label: "Auto", icon: Zap, color: "text-primary", bg: "bg-primary/10", description: "Bud decides what to focus on" },
  { id: "spark", label: "Creative", icon: Sparkles, color: "text-primary", bg: "bg-primary/10", description: "Writing, ideas & design" },
  { id: "oracle", label: "Research", icon: Brain, color: "text-blue-500", bg: "bg-blue-500/10", description: "Analysis & explanations" },
  { id: "orbit", label: "Tasks", icon: Rocket, color: "text-green-500", bg: "bg-green-500/10", description: "Planning & automation" },
];

/**
 * SuperModeSelector — Compact focus selector for Bud.
 *
 * In AUTO mode (default), Bud decides which area to focus on.
 * Users can hint at a focus area — Bud still handles everything.
 *
 * Specialist names are never shown to the user.
 */
export default function SuperModeSelector({ mode, onModeChange, disabled }) {
  const [expanded, setExpanded] = useState(false);
  const current = MODES.find((m) => m.id === mode) || MODES[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative flex-shrink-0">
      <button
        onClick={() => !disabled && setExpanded(!expanded)}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[10px] ${current.bg} spring-tap disabled:opacity-50 transition-all`}
      >
        <CurrentIcon className={`w-3 h-3 ${current.color}`} strokeWidth={2} />
        <span className={`text-[10px] font-semibold ${current.color}`}>{current.label}</span>
        <ChevronDown className={`w-2.5 h-2.5 ${current.color} transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>

      <AnimatePresence>
        {expanded && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)} />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full left-0 mt-1.5 z-50 w-[200px] glass-strong rounded-[16px] p-1.5 soft-shadow"
            >
              {MODES.map((m) => {
                const Icon = m.icon;
                const isActive = m.id === mode;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      onModeChange(m.id);
                      setExpanded(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[12px] spring-tap transition-colors text-left ${
                      isActive ? "bg-primary/8" : "hover:bg-muted/40"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-[10px] ${m.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${m.color}`} strokeWidth={2} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-semibold ${isActive ? m.color : "text-foreground"}`}>{m.label}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{m.description}</p>
                    </div>
                    {isActive && (
                      <div className={`w-1.5 h-1.5 rounded-full ${m.color.replace("text-", "bg-")}`} />
                    )}
                  </button>
                );
              })}

              {/* Auto recommendation hint */}
              {mode !== "auto" && (
                <div className="px-2.5 py-1.5 mt-1 border-t border-border/20">
                  <p className="text-[9px] text-muted-foreground">
                    💡 Bud recommends <span className="font-semibold">Auto</span> for best results
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}