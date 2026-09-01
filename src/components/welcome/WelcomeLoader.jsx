import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import UnibudMark from "@/components/brand/UnibudMark";

const GOLD = "#C9A24B";

/**
 * Premium loading screen shown briefly on launch while the welcome
 * background preloads. Pulsing white mountain mark + thin gold progress bar.
 */
export default function WelcomeLoader() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      key="loader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col items-center justify-center relative z-10"
    >
      <motion.span
        className="inline-flex text-white"
        animate={reduceMotion ? undefined : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
        transition={{ duration: 1.4, repeat: reduceMotion ? 0 : Infinity, ease: "easeInOut" }}
      >
        <UnibudMark className="w-16 h-16" />
      </motion.span>

      {/* Thin gold progress bar */}
      <div className="w-32 h-[3px] rounded-full bg-white/15 mt-8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: GOLD, boxShadow: `0 0 12px ${GOLD}88` }}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </motion.div>
  );
}