import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import BudCharacter from "@/components/brand/BudCharacter";

const EASE = [0.16, 1, 0.3, 1];

function computeStreak(sessions) {
  const dates = [...new Set(sessions.filter((s) => s.session_date).map((s) => s.session_date))].sort().reverse();
  let streak = 0;
  let check = new Date().toISOString().split("T")[0];
  for (const d of dates) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().split("T")[0];
    } else if (d < check) break;
  }
  return streak;
}

/**
 * BudCard — Bud appears naturally with a calm, encouraging message
 * based on the student's recent activity.
 */
export default function BudCard({ sessions }) {
  const streak = computeStreak(sessions || []);
  const message =
    streak >= 3
      ? `You're making steady progress — ${streak}-day streak. Keep it alive today.`
      : (sessions || []).length === 0
      ? "Welcome! Ready to begin? A short study session is a perfect first step."
      : "You haven't studied this week. A quick 25-minute session will rebuild your momentum.";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.25 }} className="glass-card p-5 flex gap-3.5 items-start">
      <div className="relative flex-shrink-0">
        <div
          className="absolute inset-0 rounded-full bud-breathe pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(127,216,255,0.35), transparent 65%)", filter: "blur(12px)" }}
        />
        <div className="relative w-14 h-14 rounded-full glass-strong overflow-hidden ring-1 ring-primary/25">
          <BudCharacter animate={false} glow={false} className="w-full h-full" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-[12px] font-semibold text-foreground">Bud</span>
        </div>
        <p className="text-[14px] text-foreground/90 leading-relaxed">{message}</p>
      </div>
    </motion.div>
  );
}