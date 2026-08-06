import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { hapticTap } from "@/lib/haptics";

const EASE = [0.16, 1, 0.3, 1];

/**
 * BudQuickActions — radial fan quick-action menu that expands from the floating Bud button.
 * Shows context-aware actions based on the current screen.
 */
export default function BudQuickActions({ visible, actions, screenName, onSelect, onClose }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => { hapticTap(); onClose(); }}
          />

          {/* Action fan — positioned above the Bud button, fanning up-left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.05, duration: 0.25, ease: EASE }}
            className="relative pointer-events-none"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 130px)", paddingRight: "max(1rem, env(safe-area-inset-right))" }}
          >
            <div className="flex flex-col-reverse items-end gap-2.5 pointer-events-auto">
              {/* Screen label */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: 0.1, duration: 0.3, ease: EASE }}
                className="glass-strong rounded-full px-3.5 h-9 flex items-center mb-1"
              >
                <span className="text-[11px] font-semibold text-muted-foreground">{screenName}</span>
              </motion.div>

              {/* Action buttons — fan upward */}
              {(actions || []).slice(0, 5).map((action, i) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label + i}
                    initial={{ opacity: 0, x: 30, y: 10 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: 30, y: 10 }}
                    transition={{ delay: 0.06 + i * 0.04, duration: 0.3, ease: EASE }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => onSelect(action)}
                    className="flex items-center gap-2.5 glass-strong rounded-full pl-2.5 pr-4 h-12 spring-tap group"
                    style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.10)" }}
                  >
                    <span className="w-8 h-8 rounded-full glass flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-[16px] h-[16px] text-primary" strokeWidth={2} />}
                    </span>
                    <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">{action.label}</span>
                  </motion.button>
                );
              })}

              {/* Close button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ delay: 0.15, duration: 0.25, ease: EASE }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { hapticTap(); onClose(); }}
                className="w-10 h-10 rounded-full glass flex items-center justify-center spring-tap mt-1"
                aria-label="Close quick actions"
              >
                <X className="w-[18px] h-[18px] text-muted-foreground" strokeWidth={2} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}