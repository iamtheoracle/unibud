import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE } from "@/lib/motion/motionPresets";

/**
 * Contextual loading messages Bud uses while working.
 * Each key maps to an array of progressive messages that cycle
 * while the operation is in flight, so the student always knows
 * what Bud is doing.
 */
export const BUD_LOADING_MESSAGES = {
  notes: ["Bud is reading your lecture notes...", "Summarizing key concepts...", "Almost there..."],
  scholarships: ["Finding scholarship opportunities...", "Matching your profile...", "Filtering deadlines..."],
  study_summary: ["Bud is reviewing your progress...", "Generating your study summary...", "Polishing it up..."],
  campus: ["Preparing your campus...", "Loading your communities...", "Almost ready..."],
  assignments: ["Reviewing your assignments...", "Checking deadlines...", "Sorting by priority..."],
  exams: ["Checking your exam schedule...", "Finding upcoming exams...", "Counting down..."],
  search: ["Bud is searching...", "Finding the best matches...", "Ranking results..."],
  upload: ["Bud is processing your file...", "Understanding the content...", "Almost done..."],
  grades: ["Loading your grades...", "Calculating your GPA...", "Preparing trends..."],
  events: ["Finding campus events...", "Checking your calendar...", "Sorting by date..."],
  default: ["Bud is thinking...", "Working on it...", "Almost there..."],
};

/**
 * BudIntelligentLoader — replaces generic loading spinners with
 * Bud's living presence and contextual messages.
 *
 * Usage:
 *   <BudIntelligentLoader context="assignments" />
 *   <BudIntelligentLoader message="Bud is reading your lecture notes..." />
 */
export default function BudIntelligentLoader({ context = "default", message, size = "md" }) {
  const messages = BUD_LOADING_MESSAGES[context] || BUD_LOADING_MESSAGES.default;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (message) return; // Static message — don't cycle
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [message, messages.length]);

  const currentMessage = message || messages[index];

  const sizes = {
    sm: { orb: 32, dot: 3, text: "text-[12px]" },
    md: { orb: 48, dot: 4, text: "text-[13px]" },
    lg: { orb: 72, dot: 5, text: "text-[14px]" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Bud orb — living presence */}
      <div className="relative grid place-items-center mb-4" style={{ width: s.orb, height: s.orb }}>
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-full bud-breathe"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, hsl(var(--primary) / 0.12), transparent 70%)" }}
        />
        {/* Core orb */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="rounded-full grid place-items-center"
          style={{
            width: s.orb * 0.7,
            height: s.orb * 0.7,
            background: "linear-gradient(135deg, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.6))",
          }}
        >
          <div
            className="rounded-full bg-primary-foreground/80"
            style={{ width: s.orb * 0.22, height: s.orb * 0.08 }}
          />
        </motion.div>
      </div>

      {/* Contextual message — progressive reveal */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.3, ease: EASE }}
          className={s.text + " text-muted-foreground text-center max-w-[240px]"}
        >
          {currentMessage}
        </motion.p>
      </AnimatePresence>

      {/* Streaming dots */}
      <div className="flex gap-1.5 mt-3">
        <span className="stream-dot" style={{ width: s.dot, height: s.dot }} />
        <span className="stream-dot" style={{ width: s.dot, height: s.dot }} />
        <span className="stream-dot" style={{ width: s.dot, height: s.dot }} />
      </div>
    </div>
  );
}