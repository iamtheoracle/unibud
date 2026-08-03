import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/lib/motion/useMotion";

/**
 * MainShell — layout for the seven permanent experiences (Square · Campus · Quad · Connect · Lens · Services · Me).
 * Wraps the Outlet in a subtle fade + slide transition so tab switches
 * feel continuous like iOS, never abrupt.
 * Transition config resolved from the Motion Engine (not hardcoded).
 */
export default function MainShell() {
  const location = useLocation();
  const motionEngine = useMotion();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={motionEngine.timing('normal')}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}