import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronDown, Sparkles } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

/**
 * AIRecommendationCard — Bud's proactive suggestion surfaced as a card.
 * Has a title, a one-line rationale, a "Why now" disclosure, and
 * accept/dismiss. Accepted cards fade into the action; dismissed shrink out.
 */
export default function AIRecommendationCard({ title, rationale, whyNow, onAccept, onDismiss, actionLabel = "Accept" }) {
  const [expanded, setExpanded] = useState(false);
  const [resolved, setResolved] = useState(null); // "accepted" | "dismissed"

  const handleAccept = () => {
    setResolved("accepted");
    setTimeout(() => onAccept?.(), 280);
  };
  const handleDismiss = () => {
    setResolved("dismissed");
    setTimeout(() => onDismiss?.(), 280);
  };

  return (
    <AnimatePresence mode="wait">
      {!resolved && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, height: 0, marginTop: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="glass-card rounded-[24px] p-4 w-full relative overflow-hidden"
        >
          {/* AI shimmer accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] ai-glow" style={{ opacity: 0.6 }} />

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[12px] bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-primary" strokeWidth={2.3} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-foreground leading-snug">{title}</p>
              <p className="text-[12px] text-muted-foreground leading-relaxed mt-1">{rationale}</p>

              {whyNow && (
                <button
                  onClick={() => setExpanded((e) => !e)}
                  className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-primary spring-tap"
                >
                  Why now
                  <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} strokeWidth={2.4} />
                </button>
              )}

              <AnimatePresence>
                {expanded && whyNow && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="text-[12px] text-muted-foreground leading-relaxed mt-2 overflow-hidden"
                  >
                    {whyNow}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleAccept}
                  className="h-9 px-4 rounded-xl bg-primary text-primary-foreground premium-shadow liquid-press flex items-center gap-1.5 text-[12px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2.6} />
                  {actionLabel}
                </button>
                <button
                  onClick={handleDismiss}
                  className="h-9 w-9 rounded-xl glass text-muted-foreground liquid-press flex items-center justify-center spring-tap hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={2.4} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}