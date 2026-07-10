import React from "react";
import { motion } from "framer-motion";
import { QUICK_ACTIONS } from "@/lib/agentRegistry";

export default function QuickActions({ onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar">
      {QUICK_ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelect(action.prompt)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-[16px] bg-card border border-border/40 soft-shadow flex-shrink-0 spring-tap"
          >
            <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
            <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}