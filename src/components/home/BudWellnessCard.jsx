import React from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles } from "lucide-react";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

const LINES = {
  stressed: "Let's slow down together. One small step at a time — I'm here.",
  tired: "Rest is productive too. Want a gentle plan for today?",
  anxious: "Take a breath with me. We'll keep things light on your dashboard.",
  sad: "I've kept your day calm. I'm here whenever you're ready to talk.",
};

/**
 * BudWellnessCard — a softer Bud presence Bud surfaces above everything else
 * when the student's mood is low, reducing academic pressure prominence.
 */
export default function BudWellnessCard({ mood = "" }) {
  const { setOpen } = useBudLauncher();
  const line = LINES[mood] || "I've tuned things down. Tap to talk whenever.";

  return (
    <motion.button
      onClick={() => setOpen(true)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="glass-card p-5 w-full text-left spring-tap border border-primary/25"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-primary/12 flex items-center justify-center bud-breathe">
          <Heart className="w-4 h-4 text-primary" />
        </div>
        <span className="text-[11px] font-semibold text-primary tracking-wide">BUD · HERE FOR YOU</span>
      </div>
      <p className="text-[14px] text-foreground/90 leading-relaxed">{line}</p>
      <div className="mt-3 flex items-center gap-1.5 text-primary">
        <Sparkles className="w-3.5 h-3.5" />
        <span className="text-[12px] font-semibold">Talk to Bud</span>
      </div>
    </motion.button>
  );
}