import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Sparkles } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

const MILESTONES = [3, 7, 14, 21, 30, 50, 100];

const WEEK_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export default function StreakShowcase({ streak = 0, sessionDates = [], delay = 0.1 }) {
  const today = new Date().toISOString().split("T")[0];

  // Build last-7-days activity strip
  const last7 = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().split("T")[0];
      days.push({
        iso,
        label: WEEK_LABELS[d.getDay()],
        active: sessionDates.includes(iso),
        isToday: iso === today,
      });
    }
    return days;
  }, [sessionDates, today]);

  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => m > streak) || null;
  const prevMilestone = [...MILESTONES].reverse().find((m) => m <= streak) || 0;
  const milestoneProgress = nextMilestone
    ? Math.min(100, Math.round(((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100))
    : 100;

  const isOnFire = streak >= 3;
  const isMilestone = MILESTONES.includes(streak);

  return (
    <GlassCard variant="solid" className="p-4 overflow-hidden relative" delay={delay}>
      {/* Ambient glow for active streaks */}
      {isOnFire && (
        <motion.div
          className="absolute -top-16 -right-16 w-40 h-40 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, hsl(38 92% 50% / 0.18), transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.9, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="flex items-center gap-4 relative">
        {/* Animated flame orb */}
        <motion.div
          className="relative w-16 h-16 rounded-[20px] flex items-center justify-center flex-shrink-0"
          style={{
            background: isOnFire
              ? "linear-gradient(135deg, hsl(38 92% 50% / 0.15), hsl(0 72% 51% / 0.08))"
              : "hsl(var(--muted))",
          }}
          animate={isOnFire ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={isOnFire ? { y: [0, -3, 0], scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Flame
              className="w-8 h-8"
              strokeWidth={2}
              style={{
                color: isOnFire ? "hsl(38 92% 50%)" : "hsl(var(--muted-foreground))",
                filter: isOnFire ? "drop-shadow(0 0 8px hsl(38 92% 50% / 0.5))" : "none",
              }}
            />
          </motion.div>
          {isMilestone && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Trophy className="w-4 h-4 text-warning" fill="currentColor" />
            </motion.div>
          )}
        </motion.div>

        {/* Streak number + label */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1.5">
            <motion.p
              key={streak}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
              className="font-heading font-extrabold text-[32px] leading-none text-foreground"
            >
              {streak}
            </motion.p>
            <span className="text-[12px] font-semibold text-muted-foreground">day streak</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {streak === 0
              ? "Log a session to start your streak"
              : isMilestone
                ? "Milestone unlocked — keep going!"
                : nextMilestone
                  ? `${nextMilestone - streak} days to ${nextMilestone}-day milestone`
                  : "Legendary streak — unstoppable!"}
          </p>
        </div>
      </div>

      {/* Milestone progress bar */}
      {nextMilestone && (
        <div className="mt-3.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wide">Next goal</span>
            <span className="text-[9px] font-semibold text-warning">{nextMilestone} days</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(38 92% 50%), hsl(0 72% 51%))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay + 0.2 }}
            />
          </div>
        </div>
      )}

      {/* 7-day activity strip */}
      <div className="mt-3.5 flex items-center justify-between gap-1">
        {last7.map((day, i) => (
          <div key={day.iso} className="flex flex-col items-center gap-1 flex-1">
            <span className="text-[8px] font-medium text-muted-foreground">{day.label}</span>
            <motion.div
              className="w-7 h-7 rounded-[10px] flex items-center justify-center"
              style={{
                background: day.active
                  ? "linear-gradient(135deg, hsl(38 92% 50%), hsl(0 72% 51%))"
                  : "hsl(var(--muted))",
                boxShadow: day.active
                  ? "0 2px 8px hsl(38 92% 50% / 0.3)"
                  : "none",
              }}
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: delay + 0.3 + i * 0.04 }}
            >
              {day.active && <Flame className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
            </motion.div>
            {day.isToday && (
              <div className="w-1 h-1 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>

      {isMilestone && (
        <motion.div
          className="mt-3 flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-warning/10"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.5 }}
        >
          <Sparkles className="w-3 h-3 text-warning" />
          <span className="text-[10px] font-semibold text-warning">
            {streak}-day milestone reached!
          </span>
        </motion.div>
      )}
    </GlassCard>
  );
}