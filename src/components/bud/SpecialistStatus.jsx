import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Rocket } from "lucide-react";

const ICONS = { Sparkles, Brain, Rocket };

/**
 * SpecialistStatus — Lightweight status indicator shown while Bud processes.
 *
 * Shows "✨ Spark is creating ideas..." style messages.
 * This is a status indicator only — it never replaces Bud's response.
 */
export default function SpecialistStatus({ specialists, statusMessage }) {
  if (!specialists || specialists.length === 0) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border/40 rounded-[20px] rounded-bl-md w-fit soft-shadow"
    >
      {/* Specialist icons */}
      <div className="flex items-center gap-1">
        {specialists.slice(0, 3).map((id) => {
          const Icon = ICONS[id === "spark" ? "Sparkles" : id === "oracle" ? "Brain" : "Rocket"];
          return (
            <motion.div
              key={id}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className={`w-5 h-5 rounded-md flex items-center justify-center ${
                id === "spark" ? "bg-primary/10" : id === "oracle" ? "bg-blue-500/10" : "bg-green-500/10"
              }`}
            >
              <Icon
                className={`w-3 h-3 ${
                  id === "spark" ? "text-primary" : id === "oracle" ? "text-blue-500" : "text-green-500"
                }`}
                strokeWidth={2}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Animated dots */}
      <div className="flex gap-1">
        {[0, 150, 300].map((delay) => (
          <motion.div
            key={delay}
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: delay / 1000 }}
            className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full"
          />
        ))}
      </div>

      {/* Status text */}
      <span className="text-[10px] text-muted-foreground font-medium">{statusMessage}</span>
    </motion.div>
  );
}