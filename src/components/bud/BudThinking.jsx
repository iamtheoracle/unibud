import React from "react";
import { motion } from "framer-motion";

/**
 * Bud's "thinking" indicator — calm, animated, never exposes internal systems.
 * Replaces the agent-activity indicator on the student-facing chat.
 */
export default function BudThinking() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2.5 w-fit px-4 py-3 bg-card border border-border/40 rounded-[20px] rounded-bl-md soft-shadow"
    >
      <div className="flex gap-1.5">
        {[0, 140, 280].map((delay) => (
          <motion.span
            key={delay}
            animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: delay / 1000, ease: "easeInOut" }}
            className="w-2 h-2 rounded-full bg-primary"
          />
        ))}
      </div>
      <span className="text-[11px] text-muted-foreground font-medium">Bud is thinking…</span>
    </motion.div>
  );
}