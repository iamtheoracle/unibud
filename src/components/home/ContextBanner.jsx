import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

/**
 * ContextBanner — Bud's proactive narration of why the dashboard was rearranged,
 * plus a quick mood check-in that feeds back into the layout.
 */
export default function ContextBanner({ message, mood, setMood, MOODS = ["great", "good", "ok", "stressed", "tired", "anxious"] }) {
  const { setOpen } = useBudLauncher();

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="glass-card p-4"
    >
      <button onClick={() => setOpen(true)} className="w-full text-left spring-tap">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-6 h-6 rounded-full bg-primary/12 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[11px] font-semibold text-primary tracking-wide">BUD · DASHBOARD TUNED</span>
        </div>
        <p className="text-[13px] text-foreground/90 leading-relaxed">{message}</p>
      </button>

      <div className="mt-3 pt-3 border-t border-border/40">
        <p className="text-[10px] text-muted-foreground mb-2">How are you feeling? This reshapes your layout.</p>
        <div className="flex flex-wrap gap-1.5">
          {MOODS.map((m) => (
            <button
              key={m}
              onClick={() => setMood(m === mood ? "" : m)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium capitalize spring-tap transition-colors ${
                mood === m
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}