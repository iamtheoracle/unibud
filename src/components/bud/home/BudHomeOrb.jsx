import React from "react";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import { useBudLauncher } from "@/lib/BudLauncherContext";

/**
 * BudHomeOrb — Bud lives in the center. A large living orb with a calm
 * contextual line and Talk / Voice CTAs.
 */
export default function BudHomeOrb({ ctx }) {
  const { setOpen, setVoiceMode } = useBudLauncher();
  const state = ctx.nextLectureIn !== null && ctx.nextLectureIn <= 15 ? "speaking" : "idle";
  const line = ctx.examWeek
    ? "Exam week — I'm right here with you."
    : ctx.timeOfDay === "night"
    ? "Late night. Let's keep it light."
    : "I'm here whenever you need me.";
  return (
    <div className="flex flex-col items-center py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
      >
        <BudVoiceOrb size={184} state={state} />
      </motion.div>
      <p className="mt-5 text-[13px] text-muted-foreground text-center max-w-[280px]">{line}</p>
      <div className="flex gap-2.5 mt-4">
        <button onClick={() => setOpen(true)} className="px-5 h-12 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap ice-glow">
          Talk to Bud
        </button>
        <button onClick={() => { setVoiceMode(true); setOpen(true); }} className="px-5 h-12 rounded-full glass-strong text-primary text-[13px] font-semibold spring-tap flex items-center gap-1.5">
          <Mic className="w-4 h-4" strokeWidth={2.2} /> Voice
        </button>
      </div>
    </div>
  );
}