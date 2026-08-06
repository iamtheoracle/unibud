import React from "react";
import { motion } from "framer-motion";

/**
 * RouteLoading — premium fallback for lazy-loaded routes: centered mark,
 * breathing glow, and a soft fade so suspended route chunks never flash blank.
 */
export default function RouteLoading() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-xl bud-breathe" />
          <div className="relative w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
          </div>
        </div>
        <span className="font-heading font-bold text-[12px] tracking-[0.22em] text-muted-foreground">UNIBUD</span>
      </motion.div>
    </div>
  );
}