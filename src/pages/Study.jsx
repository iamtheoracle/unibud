import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Target, CalendarClock, Activity, ArrowRight } from "lucide-react";

const ease = [0.16, 1, 0.3, 1];

const PLACEHOLDER_CARDS = [
  { icon: Target, label: "Study Goal", hint: "Set a target" },
  { icon: CalendarClock, label: "Today's Focus", hint: "Nothing scheduled" },
  { icon: Activity, label: "Recent Activity", hint: "No sessions yet" },
];

export default function Study() {
  return (
    <div className="min-h-screen pt-14 pb-28 px-5 max-w-lg mx-auto">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        className="mb-6"
      >
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Study</h1>
        <p className="text-[13px] text-muted-foreground mt-1">Your focus space. Keep it simple, stay consistent.</p>
      </motion.header>

      {/* Empty state */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease }}
        className="rounded-[28px] glass border border-border/30 p-8 flex flex-col items-center text-center"
      >
        <div className="w-16 h-16 rounded-[20px] bg-foreground flex items-center justify-center mb-5">
          <Target className="w-8 h-8 text-background" strokeWidth={2} />
        </div>
        <h2 className="font-heading font-bold text-[18px] text-foreground">No study goal yet</h2>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-[260px] leading-relaxed">
          Set your first goal and Bud will help you build a plan around it.
        </p>
        <Link
          to="/bud"
          className="mt-5 inline-flex items-center gap-2 px-5 h-11 rounded-full bg-foreground text-background font-heading font-semibold text-[14px] spring-tap"
        >
          <Sparkles className="w-4 h-4" />
          Ask Bud to plan
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Placeholder cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {PLACEHOLDER_CARDS.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.45, ease }}
            className="rounded-[22px] glass border border-border/20 p-5"
          >
            <c.icon className="w-5 h-5 text-muted-foreground mb-3" strokeWidth={2} />
            <p className="font-heading font-semibold text-[14px] text-foreground">{c.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{c.hint}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}