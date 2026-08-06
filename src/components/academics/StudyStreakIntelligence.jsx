import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, Calendar, Clock, Award } from "lucide-react";

const MILESTONES = [7, 14, 30, 50, 100];

export default function StudyStreakIntelligence({ sessions = [] }) {
  const streakData = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return { current: 0, longest: 0, weeklyConsistency: 0, monthlyConsistency: 0, focusHours: 0 };
    }

    // Build a set of study dates
    const studyDates = new Set();
    sessions.forEach((s) => {
      const d = s.session_date || s.started_at || s.created_date;
      if (d) studyDates.add(new Date(d).toDateString());
    });

    // Current streak (counting back from today)
    let current = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (studyDates.has(checkDate.toDateString())) {
        current++;
      } else if (i > 0) {
        break;
      }
    }

    // Longest streak
    const sortedDates = Array.from(studyDates).map((d) => new Date(d)).sort((a, b) => a - b);
    let longest = 0;
    let tempStreak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diff = (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longest = Math.max(longest, tempStreak);
    }

    // Weekly consistency — last 7 days
    let weekDaysStudied = 0;
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (studyDates.has(checkDate.toDateString())) weekDaysStudied++;
    }
    const weeklyConsistency = Math.round((weekDaysStudied / 7) * 100);

    // Monthly consistency — last 30 days
    let monthDaysStudied = 0;
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      if (studyDates.has(checkDate.toDateString())) monthDaysStudied++;
    }
    const monthlyConsistency = Math.round((monthDaysStudied / 30) * 100);

    // Focus hours (total from all sessions)
    const focusHours = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / 60;

    return { current, longest, weeklyConsistency, monthlyConsistency, focusHours };
  }, [sessions]);

  const nextMilestone = MILESTONES.find((m) => m > streakData.current);
  const achievedMilestones = MILESTONES.filter((m) => m <= streakData.longest);

  if (streakData.current === 0 && streakData.longest === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[20px] bg-card p-4"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-[10px] bg-primary/10 flex items-center justify-center">
          <Flame className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
        </div>
        <h3 className="text-[14px] font-bold text-foreground tracking-tight">Study Streak</h3>
      </div>

      {/* Current streak hero */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-chocolate flex items-center justify-center"
            style={{ boxShadow: "0 4px 20px rgba(255,122,0,0.3)" }}
          >
            <div className="text-center">
              <motion.div
                key={streakData.current}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="text-[24px] font-bold text-white leading-none"
              >
                {streakData.current}
              </motion.div>
              <div className="text-[8px] font-bold text-white/80 uppercase tracking-wide mt-0.5">days</div>
            </div>
          </motion.div>
          {streakData.current >= 3 && (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-warning flex items-center justify-center"
            >
              <Flame className="w-3 h-3 text-warning-foreground" strokeWidth={2.5} />
            </motion.div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-bold text-foreground">
            {streakData.current === 0 ? "Start studying today!" : `${streakData.current}-day streak`}
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {nextMilestone
              ? `${nextMilestone - streakData.current} day${nextMilestone - streakData.current === 1 ? "" : "s"} to reach ${nextMilestone} days`
              : "Incredible — you've hit the 100-day milestone!"}
          </p>
          {nextMilestone && (
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (streakData.current / nextMilestone) * 100)}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-primary to-chocolate"
              />
            </div>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2.5 rounded-[14px] bg-muted/50">
          <Trophy className="w-4 h-4 text-chocolate mx-auto mb-1" strokeWidth={2.2} />
          <p className="text-[16px] font-bold text-foreground leading-none">{streakData.longest}</p>
          <p className="text-[9px] text-muted-foreground mt-1">Longest</p>
        </div>
        <div className="text-center p-2.5 rounded-[14px] bg-muted/50">
          <Calendar className="w-4 h-4 text-primary mx-auto mb-1" strokeWidth={2.2} />
          <p className="text-[16px] font-bold text-foreground leading-none">{streakData.weeklyConsistency}%</p>
          <p className="text-[9px] text-muted-foreground mt-1">Weekly</p>
        </div>
        <div className="text-center p-2.5 rounded-[14px] bg-muted/50">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" strokeWidth={2.2} />
          <p className="text-[16px] font-bold text-foreground leading-none">{streakData.focusHours.toFixed(0)}h</p>
          <p className="text-[9px] text-muted-foreground mt-1">Focus Hours</p>
        </div>
      </div>

      {/* Monthly consistency bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] font-bold text-muted-foreground">Monthly Consistency</span>
          <span className="text-[11px] font-bold text-foreground">{streakData.monthlyConsistency}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${streakData.monthlyConsistency}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-chocolate"
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Award className="w-3 h-3 text-primary" strokeWidth={2.2} />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">Milestones</span>
        </div>
        <div className="flex gap-2">
          {MILESTONES.map((m) => {
            const achieved = achievedMilestones.includes(m);
            const isNext = m === nextMilestone;
            return (
              <motion.div
                key={m}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: m * 0.02 }}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-[12px] ${
                  achieved
                    ? "bg-gradient-to-br from-primary/15 to-chocolate/10 border border-primary/20"
                    : isNext
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-muted/30"
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  achieved ? "bg-gradient-to-br from-primary to-chocolate" : "bg-muted"
                }`}>
                  {achieved ? (
                    <Flame className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  ) : (
                    <span className="text-[10px] font-bold text-muted-foreground">{m}</span>
                  )}
                </div>
                <span className={`text-[9px] font-bold ${achieved ? "text-primary" : "text-muted-foreground"}`}>{m}d</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}