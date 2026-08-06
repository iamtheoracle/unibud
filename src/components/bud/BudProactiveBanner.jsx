import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, AlertTriangle, Users, Library, Award, MapPin, X, Sparkles,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

const PROACTIVE_TYPES = {
  reminder: { icon: Clock, color: "hsl(217 91% 60%)", bg: "hsl(217 91% 60% / 0.10)" },
  deadline: { icon: AlertTriangle, color: "hsl(0 84% 60%)", bg: "hsl(0 84% 60% / 0.10)" },
  social: { icon: Users, color: "hsl(251 90% 67%)", bg: "hsl(251 90% 67% / 0.10)" },
  campus: { icon: Library, color: "hsl(142 71% 45%)", bg: "hsl(142 71% 45% / 0.10)" },
  opportunity: { icon: Award, color: "hsl(46 74% 55%)", bg: "hsl(46 74% 55% / 0.10)" },
  location: { icon: MapPin, color: "hsl(280 65% 60%)", bg: "hsl(280 65% 60% / 0.10)" },
};

/**
 * BudProactiveBanner — Bud's proactive intelligence banner.
 * Displays contextual messages like:
 *  "You have class in 15 minutes."
 *  "Your assignment deadline is tomorrow."
 *  "Three classmates are studying this topic."
 *  "The library is quieter than usual."
 *  "A scholarship matching your course is available."
 *  "Your friend just arrived on campus."
 *
 * Props:
 *  - message: { type, title, subtitle, action_label }
 *  - onAction: () => void
 *  - onDismiss: () => void
 *  - autoDismissMs: number — auto dismiss after N ms (0 = never)
 */
export default function BudProactiveBanner({ message, onAction, onDismiss, autoDismissMs = 8000 }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      if (autoDismissMs > 0) {
        const timer = setTimeout(() => handleDismiss(), autoDismissMs);
        return () => clearTimeout(timer);
      }
    }
  }, [message, autoDismissMs]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss?.(), 300);
  };

  const handleAction = () => {
    onAction?.();
    handleDismiss();
  };

  const config = PROACTIVE_TYPES[message?.type] || PROACTIVE_TYPES.reminder;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[6000] w-[calc(100%-2rem)] max-w-[440px]"
        >
          <div className="crystal-card rounded-[16px] p-2.5 flex items-center gap-2.5 shadow-2xl">
            {/* Bud orb indicator */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: config.bg }}
            >
              <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: config.color }} />
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-primary flex-shrink-0" strokeWidth={2.5} />
                <span className="text-[8px] font-bold uppercase tracking-wider text-primary">Bud</span>
              </div>
              <p className="text-[12px] font-bold text-foreground truncate mt-0.5">{message.title}</p>
              {message.subtitle && (
                <p className="text-[10px] text-muted-foreground truncate">{message.subtitle}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {message.action_label && (
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleAction}
                  className="px-2.5 h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap"
                >
                  {message.action_label}
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleDismiss}
                className="w-6 h-6 rounded-full glass flex items-center justify-center spring-tap"
              >
                <X className="w-3 h-3 text-muted-foreground" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { PROACTIVE_TYPES };