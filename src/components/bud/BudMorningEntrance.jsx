import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BudHead from "@/components/bud/BudHead";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * BudMorningEntrance — Bud walks onto the screen carrying today's briefing,
 * places it, looks at the student, and smiles.
 *
 * Completes within 2.5–3 seconds. Skippable via tap.
 * Shows once per day (tracked via sessionStorage).
 */
export default function BudMorningEntrance({ visible, onComplete }) {
  const [phase, setPhase] = useState(0); // 0=walking, 1=placed, 2=smiling

  useEffect(() => {
    if (!visible) return;
    setPhase(0);
    const t1 = setTimeout(() => setPhase(1), 1000);
    const t2 = setTimeout(() => setPhase(2), 1600);
    const t3 = setTimeout(() => onComplete(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [visible, onComplete]);

  const mood = phase >= 2 ? "happy" : phase >= 1 ? "idle" : "idle";
  const greeting = phase >= 2 ? "Good to see you!" : phase >= 1 ? "Here's your day." : "Bud is preparing...";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          onClick={() => { hapticTap(); onComplete(); }}
        >
          <div className="absolute inset-0 bg-background" />

          {/* Bud walking in from the left */}
          <motion.div
            initial={{ x: -160, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <div className="relative">
              <BudHead size={80} mood={mood} glow active={phase >= 2} />

              {/* Briefing paper carried by Bud */}
              <motion.div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2"
                animate={{
                  y: phase >= 1 ? 0 : 8,
                  opacity: phase >= 1 ? 1 : 0.7,
                }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <div className="w-12 h-9 rounded-[4px] glass-card flex flex-col gap-0.5 p-1.5">
                  <div className="h-0.5 w-full rounded-full bg-foreground/15" />
                  <div className="h-0.5 w-2/3 rounded-full bg-foreground/15" />
                  <div className="h-0.5 w-3/4 rounded-full bg-foreground/15" />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Greeting text */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5, ease: EASE }}
            className="text-[15px] font-semibold text-foreground mt-8 text-center"
          >
            {greeting}
          </motion.p>

          {/* Skip hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="absolute bottom-10 text-[11px] text-muted-foreground"
          >
            Tap to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}