import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

const TONE = {
  primary: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
  information: "text-information",
};

/**
 * BudContextCards — "Before you ask" mini cards. Bud surfaces what it noticed
 * and offers one calm next step. Tap sends a prompt to the chat or navigates.
 */
export default function BudContextCards({ cards, onPrompt, onNavigate }) {
  if (!cards || !cards.length) return null;
  return (
    <div className="px-4 pt-3 pb-1">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Before you ask</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {cards.map((c, i) => {
          const Icon = c.icon;
          const act = () => (c.prompt ? onPrompt?.(c.prompt) : onNavigate?.(c.to));
          return (
            <motion.button
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={act}
              className="flex-shrink-0 w-[210px] text-left p-3 rounded-[18px] glass spring-tap"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`w-7 h-7 rounded-full bg-card flex items-center justify-center ${TONE[c.tone] || "text-primary"}`}>
                  <Icon className="w-3.5 h-3.5" strokeWidth={2.2} />
                </span>
                <p className="text-[12px] font-semibold text-foreground leading-tight flex-1">{c.title}</p>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">{c.message}</p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}