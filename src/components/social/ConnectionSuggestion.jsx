import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * ConnectionSuggestion — quiet, dismissible prompt suggesting a student
 * connect an optional account. Never blocks onboarding; always skippable.
 *
 * Props:
 *  - platform: string (display label)
 *  - benefit: string (what the student gains)
 *  - dismissKey: string (localStorage key to remember dismissal)
 */
export default function ConnectionSuggestion({ platform, benefit, dismissKey }) {
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (dismissKey && localStorage.getItem(dismissKey)) setDismissed(true);
  }, [dismissKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (dismissKey) localStorage.setItem(dismissKey, "1");
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex items-center gap-3 p-3 rounded-[16px] bg-muted/30 border border-border/30"
      >
        <div className="w-9 h-9 rounded-[12px] bg-primary/8 flex items-center justify-center flex-shrink-0">
          <Link2 className="w-4 h-4 text-primary" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold text-foreground leading-snug">
            Connect {platform}
          </p>
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5">
            {benefit}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => navigate("/settings/connected-accounts")}
            className="px-3 h-8 rounded-full bg-foreground text-background text-[11px] font-bold active:scale-95 transition-transform"
          >
            Connect
          </button>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}