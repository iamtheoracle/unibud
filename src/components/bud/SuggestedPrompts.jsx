import React from "react";
import { motion } from "framer-motion";
import { SUGGESTED_PROMPTS } from "@/lib/agentRegistry";

export default function SuggestedPrompts({ onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {SUGGESTED_PROMPTS.map((prompt, i) => {
        const Icon = prompt.icon;
        return (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(prompt.label)}
            className="p-3.5 rounded-[18px] bg-card border border-border/40 text-left card-hover soft-shadow"
          >
            <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center mb-2.5">
              <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={2} />
            </div>
            <p className="text-[12px] font-medium text-foreground leading-snug">{prompt.label}</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">{prompt.category}</p>
          </motion.button>
        );
      })}
    </div>
  );
}