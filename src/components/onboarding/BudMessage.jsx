import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function BudMessage({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start gap-2.5 mb-5"
    >
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 gold-glow">
        <Sparkles className="w-[18px] h-[18px] text-primary-foreground" />
      </div>
      <div className="flex-1 bg-card rounded-2xl rounded-tl-md px-4 py-3 premium-shadow border border-border/30">
        {typeof children === "string"
          ? <p className="text-[14px] text-foreground leading-relaxed">{children}</p>
          : children}
      </div>
    </motion.div>
  );
}