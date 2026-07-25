import React from "react";
import { motion } from "framer-motion";
import { useBudLauncher } from "@/lib/BudLauncherContext";

const EASE = [0.16, 1, 0.3, 1];

/**
 * BudCard — a calm Bud presence card. Tapping opens Bud.
 * The official Bud visual will be added here once provided.
 */
export default function BudCard() {
  const { setOpen } = useBudLauncher();
  return (
    <motion.button
      onClick={() => setOpen(true)}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay: 0.25 }}
      className="glass-card p-5 w-full text-left spring-tap"
    >
      <p className="text-[12px] font-semibold text-primary mb-1">Bud</p>
      <p className="text-[14px] text-foreground/90 leading-relaxed">
        I'm here whenever you're ready. Tap to start a conversation.
      </p>
    </motion.button>
  );
}