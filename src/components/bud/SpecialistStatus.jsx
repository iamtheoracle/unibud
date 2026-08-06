import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * SpecialistStatus — Lightweight "Bud is thinking" indicator shown while processing.
 *
 * Always presents as Bud. Specialist routing is never exposed to the user.
 */
export default function SpecialistStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/40 rounded-[20px] rounded-bl-md w-fit soft-shadow"
    >
      <Sparkles className="w-3 h-3 text-primary" />
      <div className="flex gap-1.5">
        {[0, 150, 300].map((delay) => (
          <motion.div
            key={delay}
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: delay / 1000 }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">Bud is thinking...</span>
    </motion.div>
  );
}