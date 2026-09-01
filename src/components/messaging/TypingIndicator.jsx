import React from "react";
import { motion } from "framer-motion";

export default function TypingIndicator({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-2 px-4 py-2"
    >
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-2xl rounded-bl-md bg-card soft-shadow border border-border/30">
        {name && <span className="text-[11px] text-muted-foreground">{name}</span>}
        <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
          />
        ))}
        </div>
      </div>
    </motion.div>
  );
}