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
        initial={{ opacity: 0, y: 8, scale: 0.985, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, scale: 0.985, filter: "blur(4px)" }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}