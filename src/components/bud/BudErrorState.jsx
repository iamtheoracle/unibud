import React from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * BudErrorState — replaces stack traces and technical errors with
 * Bud's natural, reassuring explanations.
 *
 * Usage:
 *   <BudErrorState message="I couldn't reach the university server." onRetry={refetch} />
 *   <BudErrorState context="network" onRetry={refetch} />
 */
const DEFAULT_MESSAGES = {
  network: "I couldn't reach the server right now. Let's try again.",
  permission: "You don't have access to this yet. I'll help you get set up.",
  not_found: "I couldn't find what you're looking for. It may have moved.",
  generic: "Something went wrong on my end. Let's try that again.",
};

export default function BudErrorState({ context = "generic", message, onRetry, compact = false }) {
  const displayMessage = message || DEFAULT_MESSAGES[context] || DEFAULT_MESSAGES.generic;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 p-3 rounded-xl glass-card">
        <div className="w-8 h-8 rounded-lg bg-destructive/10 grid place-items-center shrink-0">
          <span className="text-[11px]">⚠</span>
        </div>
        <p className="text-[12px] text-muted-foreground flex-1">{displayMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="w-7 h-7 rounded-full glass flex items-center justify-center spring-tap shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center text-center py-8 px-4"
    >
      {/* Bud orb — calm, not alarming */}
      <div className="relative w-14 h-14 grid place-items-center mb-4">
        <div
          className="absolute inset-0 rounded-full bud-breathe"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(var(--primary) / 0.10), transparent 70%)" }}
        />
        <div
          className="w-10 h-10 rounded-full grid place-items-center"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.6))" }}
        >
          <div className="w-4 h-1.5 rounded-full bg-primary-foreground/80" />
        </div>
      </div>

      <p className="text-[14px] font-semibold text-foreground mb-1">Hmm, that didn't work</p>
      <p className="text-[13px] text-muted-foreground max-w-[280px] leading-relaxed">{displayMessage}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-[13px] font-semibold spring-tap"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </motion.div>
  );
}