import React from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, RotateCcw, GripHorizontal } from "lucide-react";
import { useBudPresence } from "@/lib/bud/BudPresenceContext";
import { hapticTap } from "@/lib/haptics";
import BudHead from "@/components/bud/BudHead";

const EASE = [0.16, 1, 0.3, 1];

/**
 * BudPresenceSettings — student control panel for the floating Bud.
 *
 * Lets students:
 *  • Show / hide the floating Bud head
 *  • Understand how to reposition (drag)
 *  • Reset position to default
 *
 * Preferences sync across all devices via the BudPresenceContext.
 */
export default function BudPresenceSettings() {
  const { hidden, toggleHidden, resetPosition, loaded } = useBudPresence();

  return (
    <div className="space-y-3">
      {/* Floating Bud toggle */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex items-center justify-between p-4 glass-card rounded-[18px]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-primary/8 flex items-center justify-center shrink-0">
            <BudHead size={28} mood={hidden ? "concerned" : "idle"} glow={!hidden} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-foreground">Floating Bud</p>
            <p className="text-[12px] text-muted-foreground">
              {hidden ? "Bud is hidden but always available" : "Bud quietly present on every screen"}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            hapticTap();
            toggleHidden();
          }}
          disabled={!loaded}
          className={`relative w-12 h-7 rounded-full transition-colors duration-300 spring-tap shrink-0 ${
            hidden ? "bg-muted" : "bg-primary"
          }`}
          aria-label={hidden ? "Show floating Bud" : "Hide floating Bud"}
        >
          <motion.div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
            animate={{ left: hidden ? 2 : 22 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          >
            {hidden ? (
              <EyeOff className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
            ) : (
              <Eye className="w-3 h-3 text-primary" strokeWidth={2.5} />
            )}
          </motion.div>
        </button>
      </motion.div>

      {/* Reposition info + reset */}
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
          className="flex items-center justify-between p-4 glass-card rounded-[18px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-primary/8 flex items-center justify-center shrink-0">
              <GripHorizontal className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Position</p>
              <p className="text-[12px] text-muted-foreground">Drag Bud anywhere on screen</p>
            </div>
          </div>
          <button
            onClick={() => {
              hapticTap();
              resetPosition();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] glass spring-tap text-[12px] font-semibold text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            Reset
          </button>
        </motion.div>
      )}
    </div>
  );
}