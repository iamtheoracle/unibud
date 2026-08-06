import React from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

/**
 * BudMemoryStrip — a calm horizontal strip of things Bud remembers, so the
 * space feels continuous and personal.
 */
export default function BudMemoryStrip({ memories }) {
  if (!memories || !memories.length) {
    return (
      <div className="p-4 rounded-[22px] glass">
        <div className="flex items-center gap-2 mb-1.5">
          <Brain className="w-4 h-4 text-primary" strokeWidth={2} />
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">What Bud remembers</p>
        </div>
        <p className="text-[12px] text-muted-foreground leading-snug">Nothing yet — as you go about your day, I'll quietly remember what works for you.</p>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <Brain className="w-4 h-4 text-primary" strokeWidth={2} />
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">What Bud remembers</p>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1">
        {memories.slice(0, 8).map((m, i) => (
          <motion.div key={m.id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex-shrink-0 max-w-[220px] p-3 rounded-[18px] glass">
            <span className="text-[9px] font-semibold text-primary uppercase tracking-wide">{m.memory_type || "note"}</span>
            <p className="text-[12px] text-foreground leading-snug mt-1">{m.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}