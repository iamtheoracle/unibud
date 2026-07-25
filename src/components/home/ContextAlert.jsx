import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

const TONES = {
  warning: { ring: "border-warning/30", chip: "bg-warning/12 text-warning", icon: "text-warning" },
  primary: { ring: "border-primary/30", chip: "bg-primary/12 text-primary", icon: "text-primary" },
  info: { ring: "border-information/30", chip: "bg-information/12 text-information", icon: "text-information" },
};

/**
 * ContextAlert — a focused, Bud-prioritised alert card surfaced when a signal
 * (attendance, fees) crosses a threshold. Tone + icon + CTA.
 */
export default function ContextAlert({ tone = "primary", icon: Icon, title, body, cta, to }) {
  const navigate = useNavigate();
  const t = TONES[tone] || TONES.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className={`glass-card p-4 border ${t.ring}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-2xl ${t.chip} flex items-center justify-center flex-shrink-0`}>
          {Icon && <Icon className="w-4.5 h-4.5" strokeWidth={1.8} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-[14px] text-foreground">{title}</p>
          <p className="text-[12px] text-muted-foreground leading-relaxed mt-0.5">{body}</p>
          {cta && to && (
            <button
              onClick={() => navigate(to)}
              className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-primary spring-tap"
            >
              {cta}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}