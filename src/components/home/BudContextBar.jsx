import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * BudContextBar — shows the active adaptive mode and Bud's proactive
 * message explaining why the dashboard was rearranged.
 */
export default function BudContextBar({ label, message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="glass-card p-4 border border-primary/15"
    >
      <div className="flex items-center gap-2.5 mb-2">
        <span className="w-7 h-7 rounded-full bg-primary/12 flex items-center justify-center bud-breathe flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-primary leading-none">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-1">Bud rearranged your dashboard</p>
        </div>
      </div>
      <p className="text-[13px] text-foreground/90 leading-relaxed">{message}</p>
    </motion.div>
  );
}