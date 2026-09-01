import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { REACTIONS } from "./quadConstants";

/**
 * Floating reaction picker that appears above the Like button.
 * Shows 6 animated reaction options.
 */
export default function ReactionPicker({ onSelect, onClose, position = "up" }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: position === "up" ? 10 : -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.6, y: position === "up" ? 10 : -10 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-card border border-border/40 elevated-shadow"
        onMouseLeave={onClose}
      >
        {REACTIONS.map((r, i) => (
          <motion.button
            key={r.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.03, type: "spring", stiffness: 500, damping: 20 }}
            whileHover={{ scale: 1.3, y: position === "up" ? -4 : 4 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(r.id)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-muted/50 spring-tap"
            title={r.label}
          >
            <span className="text-xl">{r.emoji}</span>
          </motion.button>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}