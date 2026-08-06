import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, X } from "lucide-react";
import { useRecentViews } from "@/lib/resilience/useRecentViews";

/**
 * ContinueStrip — "Continue where you left off" surface.
 * Shows recently visited pages as quick-access chips so users
 * can resume their flow instantly. Covers: recently viewed,
 * recent activity, continue where you left off, quick actions.
 */
export default function ContinueStrip() {
  const { recent, clear } = useRecentViews();
  const items = recent.slice(0, 5);

  if (items.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" strokeWidth={2} />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Continue
          </span>
        </div>
        <button
          onClick={clear}
          className="text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-0.5"
        >
          Clear <X className="w-3 h-3" />
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {items.map((item, i) => (
          <Link
            key={i}
            to={item.path}
            className="shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full bg-card border border-border/40 spring-tap hover:border-primary/30 transition-colors group"
          >
            <span className="text-[13px] font-medium text-foreground truncate max-w-[120px]">
              {item.label}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" strokeWidth={1.8} />
          </Link>
        ))}
      </div>
    </motion.section>
  );
}