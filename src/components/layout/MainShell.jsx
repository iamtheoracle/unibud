import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];

/**
 * MainShell — layout for the four primary tab routes (Bud · Social · Academics · Me).
 * Wraps the Outlet in a subtle fade + slide transition so tab switches
 * feel continuous like iOS, never abrupt.
 */
export default function MainShell() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}