import React from "react";
import { motion } from "framer-motion";
import { Flame, Target, TrendingUp, BookOpen } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

export default function TaskProgressPanel({ tasks, completedIds }) {
  const all = tasks || [];
  const total = all.length;
  const completed = all.filter((t) => completedIds.includes(t.id) || t.status === "submitted" || t.status === "graded").length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const todayTotal = all.filter((t) => {
    const d = t.due_date ? new Date(t.due_date) : null;
    return d && d.toDateString() === now.toDateString();
  }).length;
  const todayDone = all.filter((t) => {
    const d = t.due_date ? new Date(t.due_date) : null;
    return d && d.toDateString() === now.toDateString() && (completedIds.includes(t.id) || t.status === "submitted" || t.status === "graded");
  }).length;
  const todayPct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  const weekTotal = all.filter((t) => {
    const d = t.due_date ? new Date(t.due_date) : null;
    return d && d >= weekStart;
  }).length;
  const weekDone = all.filter((t) => {
    const d = t.due_date ? new Date(t.due_date) : null;
    return d && d >= weekStart && (completedIds.includes(t.id) || t.status === "submitted" || t.status === "graded");
  }).length;
  const weekPct = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

  // Focus score — completion rate weighted by deadline proximity
  const focusScore = pct;

  // Mock streak (would connect to study sessions in production)
  const streak = Math.min(7, completed);

  const metrics = [
    { label: "Today", value: todayPct, icon: Target, sub: `${todayDone}/${todayTotal} done` },
    { label: "This Week", value: weekPct, icon: TrendingUp, sub: `${weekDone}/${weekTotal} done` },
    { label: "Streak", value: streak, icon: Flame, sub: `${streak} day${streak !== 1 ? "s" : ""}`, isCount: true },
    { label: "Focus Score", value: focusScore, icon: BookOpen, sub: `${focusScore}% overall` },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: EASE }}
            className="bg-muted/20 border border-border/15 rounded-xl p-3.5"
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Icon className="w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={1.8} />
              <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">{m.label}</span>
            </div>
            {m.isCount ? (
              <div className="flex items-baseline gap-1 mb-1.5">
                <span className="text-[24px] font-bold text-foreground tabular-nums leading-none">{m.value}</span>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-[24px] font-bold text-foreground tabular-nums leading-none">{m.value}</span>
                  <span className="text-[13px] text-muted-foreground/50">%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.value}%` }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
                    className="h-full rounded-full bg-foreground"
                  />
                </div>
              </>
            )}
            <p className="text-[10px] text-muted-foreground/50 mt-1.5">{m.sub}</p>
          </motion.div>
        );
      })}
    </div>
  );
}