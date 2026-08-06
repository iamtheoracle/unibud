import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ThumbsUp, GraduationCap, Star, Award, Trophy } from "lucide-react";
import BudHead from "@/components/bud/BudHead";

const EASE = [0.16, 1, 0.3, 1];

const CELEBRATION_ICONS = {
  thumbs_up: { Icon: ThumbsUp, color: "hsl(var(--primary))" },
  graduation: { Icon: GraduationCap, color: "hsl(var(--gold))" },
  gold_star: { Icon: Star, color: "hsl(var(--gold))" },
  certificate: { Icon: Award, color: "hsl(var(--primary))" },
  trophy: { Icon: Trophy, color: "hsl(var(--gold))" },
};

/**
 * BudCelebration — an understated celebration overlay.
 *
 * Bud celebrates quietly (thumbs-up, graduation cap, gold star, certificate,
 * or trophy) then returns to idle. Never flashy — always calm and rewarding.
 *
 * @param {string} type — celebration type
 * @param {boolean} visible — show/hide
 * @param {function} onComplete — called when the celebration finishes
 * @param {string} message — optional text below Bud
 */
export default function BudCelebration({ type = "thumbs_up", visible, onComplete, message }) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [visible, onComplete]);

  const celeb = CELEBRATION_ICONS[type] || CELEBRATION_ICONS.thumbs_up;
  const { Icon } = celeb;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="relative flex flex-col items-center"
          >
            {/* Bud celebrating */}
            <BudHead size={72} mood="celebrating" glow active />

            {/* Celebration icon floating above */}
            <motion.div
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: 1, y: -8, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 340, damping: 18 }}
              className="absolute -top-6"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: `${celeb.color} / 0.14` }}
              >
                <Icon className="w-5 h-5" style={{ color: celeb.color }} strokeWidth={2} />
              </div>
            </motion.div>

            {/* Sparkle particles */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: celeb.color,
                  top: "50%",
                  left: "50%",
                }}
                initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * 72 * Math.PI) / 180) * 50,
                  y: Math.sin((i * 72 * Math.PI) / 180) * 50,
                  opacity: [0, 1, 0],
                }}
                transition={{ delay: 0.3 + i * 0.05, duration: 1, ease: "easeOut" }}
              />
            ))}
          </motion.div>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4, ease: EASE }}
              className="text-[14px] font-semibold text-foreground mt-6 text-center"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}