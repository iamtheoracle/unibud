import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarClock, Wallet, Bus, Users, Store, BookOpen, Award, Home,
  ChevronRight, Sparkles,
} from "lucide-react";
import { EASE } from "@/lib/motion/motionPresets";

const QUICK_ACTIONS = [
  { id: "schedule", label: "Schedule", icon: CalendarClock, color: "hsl(217 91% 60%)", path: "/timetable" },
  { id: "wallet", label: "Wallet", icon: Wallet, color: "hsl(142 71% 45%)", path: "/wallet" },
  { id: "transport", label: "Transport", icon: Bus, color: "hsl(200 80% 55%)", path: "/campus" },
  { id: "friends", label: "Friends", icon: Users, color: "hsl(251 90% 67%)", path: "/friends" },
  { id: "marketplace", label: "Market", icon: Store, color: "hsl(24 90% 55%)", path: "/marketplace" },
  { id: "study", label: "Study", icon: BookOpen, color: "hsl(280 65% 60%)", path: "/study" },
  { id: "scholarships", label: "Awards", icon: Award, color: "hsl(46 74% 55%)", path: "/scholarships" },
  { id: "housing", label: "Housing", icon: Home, color: "hsl(200 80% 55%)", path: "/campus" },
];

/**
 * SmartQuickActions — quick actions grid for the home screen.
 * 8 context-aware shortcuts with adaptive colors.
 *
 * Props:
 *  - onAction: (action) => void
 *  - variant: "grid" | "rail"
 */
export default function SmartQuickActions({ onAction, variant = "grid" }) {
  if (variant === "rail") {
    return (
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1">
        {QUICK_ACTIONS.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25, ease: EASE }}
              whileTap={{ scale: 0.92 }}
              onClick={() => onAction?.(action)}
              className="flex flex-col items-center gap-1 flex-shrink-0 spring-tap"
            >
              <div
                className="w-11 h-11 rounded-[14px] glass flex items-center justify-center"
                style={{ boxShadow: `inset 0 0 12px ${action.color}15` }}
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={2.2} style={{ color: action.color }} />
              </div>
              <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">{action.label}</span>
            </motion.button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {QUICK_ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
            whileTap={{ scale: 0.92 }}
            onClick={() => onAction?.(action)}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-[16px] glass spring-tap group"
          >
            <div
              className="w-10 h-10 rounded-[12px] flex items-center justify-center relative overflow-hidden"
              style={{ background: `${action.color}15` }}
            >
              <Icon className="w-4.5 h-4.5 relative z-10" strokeWidth={2.2} style={{ color: action.color }} />
              {/* Hover glow */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${action.color}20, transparent 70%)` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-[9px] font-bold text-foreground">{action.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * BudSuggestionCard — a single Bud suggestion card with action.
 */
export function BudSuggestionCard({ suggestion, onAction, onDismiss }) {
  const [dismissed, setDismissed] = useState(false);
  const config = QUICK_ACTIONS.find((a) => a.id === suggestion?.action_id) || QUICK_ACTIONS[0];
  const Icon = config.icon;

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => onDismiss?.(), 200);
  };

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="crystal-card rounded-[16px] p-3 flex items-center gap-2.5"
    >
      <div
        className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
        style={{ background: `${config.color}15` }}
      >
        <Icon className="w-4 h-4" strokeWidth={2.2} style={{ color: config.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-primary flex-shrink-0" strokeWidth={2.5} />
          <span className="text-[8px] font-bold uppercase tracking-wider text-primary">Bud</span>
        </div>
        <p className="text-[11px] text-foreground font-medium mt-0.5 line-clamp-2">{suggestion?.message || "Bud has a suggestion for you."}</p>
      </div>

      {suggestion?.action_label && (
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => onAction?.(suggestion)}
          className="flex items-center gap-0.5 px-2.5 h-7 rounded-full bg-primary text-[10px] font-bold text-primary-foreground spring-tap flex-shrink-0"
        >
          {suggestion.action_label}
          <ChevronRight className="w-3 h-3" strokeWidth={2.2} />
        </motion.button>
      )}
    </motion.div>
  );
}

export { QUICK_ACTIONS };