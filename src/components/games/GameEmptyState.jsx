import React from "react";
import { motion } from "framer-motion";

/**
 * GameEmptyState — premium empty state for games sections.
 * Encourages students to create the first room, tournament, or challenge.
 */
export default function GameEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center py-10 px-6"
    >
      <div className="w-14 h-14 rounded-full grid place-items-center mb-3 crystal-card edge-light">
        <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="text-[14px] font-bold text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground mt-1 max-w-[260px] leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}