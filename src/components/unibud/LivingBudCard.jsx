import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import BudVoiceOrb from "@/components/bud/BudVoiceOrb";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

/**
 * LivingBudCard — Bud as the subject, not a tool.
 * A living crystal orb with a conversational line that reacts to context.
 * Tap the orb or the message to open Bud.
 */
export default function LivingBudCard({ message, label }) {
  const { setOpen } = useBudLauncher();
  const line = message || "I'm here whenever you're ready. Tap to talk.";
  const tag = label || "Bud";

  return (
    <motion.button
      onClick={() => setOpen(true)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE, delay: 0.05 }}
      className="crystal-card rounded-[28px] p-5 w-full text-left spring-tap relative overflow-hidden"
      style={{ boxShadow: "var(--shadow-premium), inset 0 1px 0 rgba(255,255,255,0.10), inset 0 0 32px rgba(37,99,235,0.05)" }}
    >
      {/* AI shimmer top border */}
      <div className="absolute top-0 left-0 right-0 h-[2px] ai-glow" style={{ opacity: 0.5 }} />

      <div className="flex items-center gap-4">
        <div className="flex-shrink-0">
          <BudVoiceOrb size={72} state="idle" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-3 h-3 text-primary" strokeWidth={2.4} />
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary">{tag}</span>
          </div>
          <p className="text-[14px] text-foreground leading-relaxed font-medium">{line}</p>
          <span className="text-[11px] text-muted-foreground mt-1.5 block">Tap to continue the conversation</span>
        </div>
      </div>
    </motion.button>
  );
}