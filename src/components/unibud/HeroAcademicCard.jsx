import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Calendar, Trophy } from "lucide-react";
import LearningProgressRing from "@/components/unibud/LearningProgressRing";
import { useBudLauncher } from "@/lib/BudLauncherContext";
import { useNavigate } from "react-router-dom";

const EASE = [0.16, 1, 0.3, 1];

/**
 * HeroAcademicCard — the dashboard's opening statement.
 * Surfaces the single most important academic thing right now:
 * an exam countdown, an assignment due today, or study progress.
 * Crystal bloom, depth-float, edge-lit. One primary action.
 */
export default function HeroAcademicCard({ courses, assignments, exams, sessions }) {
  const navigate = useNavigate();
  const { setOpen } = useBudLauncher();
  const todayStr = new Date().toISOString().split("T")[0];

  const dueToday = (assignments || []).filter(
    (a) => a.due_date && a.due_date.split("T")[0] === todayStr && a.status !== "completed" && a.status !== "done"
  );
  const upcomingExam = (exams || []).find((e) => e.date && e.date >= todayStr && e.status === "upcoming");
  const examDays = upcomingExam
    ? Math.max(0, Math.ceil((new Date(upcomingExam.date) - new Date(todayStr)) / 86400000))
    : null;
  const examSoon = examDays !== null && examDays <= 2;

  const streakDates = [...new Set((sessions || []).filter((s) => s.session_date).map((s) => s.session_date))].sort().reverse();
  let streak = 0;
  let check = todayStr;
  for (const d of streakDates) {
    if (d === check) {
      streak++;
      const dt = new Date(check); dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().split("T")[0];
    } else if (d < check) break;
  }
  const weekMinutes = (sessions || [])
    .filter((s) => {
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      return s.session_date && new Date(s.session_date) >= cutoff;
    })
    .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const weekGoal = 600; // 10h target
  const weekProgress = Math.min(1, weekMinutes / weekGoal);

  let mode, metric, metricLabel, title, subtitle, actionLabel, onAction, budInsight;
  let Icon = Trophy;

  if (examSoon && upcomingExam) {
    mode = "exam";
    metric = String(examDays);
    metricLabel = examDays === 0 ? "today" : examDays === 1 ? "day" : "days";
    title = upcomingExam.title || "Upcoming Exam";
    subtitle = examDays === 0 ? "Your exam is today. You've got this." : `${examDays} day${examDays > 1 ? "s" : ""} until your exam. Focus mode recommended.`;
    Icon = Calendar;
    actionLabel = "Start Focus";
    onAction = () => navigate("/study/exams");
    budInsight = examDays === 0
      ? "Take a breath. You've prepared for this. I'll be right here if you need a quick review."
      : "A short focused review tonight will make a real difference. Want me to build a plan?";
  } else if (dueToday.length > 0) {
    mode = "assignment";
    metric = String(dueToday.length);
    metricLabel = dueToday.length === 1 ? "due" : "due";
    title = dueToday[0].title || "Assignment Due";
    subtitle = dueToday.length === 1
      ? "Due today. Bud can help you get started."
      : `${dueToday.length} assignments due today. Let's tackle them one at a time.`;
    Icon = BookOpen;
    actionLabel = "Open Assignment";
    onAction = () => navigate("/assignments");
    budInsight = dueToday.length === 1
      ? `Start with "${dueToday[0].title}". Breaking it into small steps makes it manageable.`
      : "I've ordered these by deadline. The first one is your best use of focus right now.";
  } else {
    mode = "progress";
    metric = `${streak}`;
    metricLabel = streak === 1 ? "day streak" : "day streak";
    title = streak > 0 ? "You're on a roll" : "Ready when you are";
    subtitle = streak > 0
      ? `${streak}-day study streak. ${Math.round(weekMinutes / 60 * 10) / 10}h this week. Keep the momentum.`
      : "No deadlines today. A short session keeps you sharp.";
    Icon = Trophy;
    actionLabel = "Start Studying";
    onAction = () => navigate("/study");
    budInsight = streak > 0
      ? "Consistency compounds. Even twenty minutes today extends your streak and your understanding."
      : "A quiet day is a gift. Want to review something light, or get ahead on next week?";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, ease: EASE }}
      className="crystal-card crystal-bloom edge-light rounded-[32px] p-6 w-full depth-float"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-[14px] bg-primary/10 flex items-center justify-center">
              <Icon className="w-[18px] h-[18px] text-primary" strokeWidth={2.2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary">
              {mode === "exam" ? "Exam Countdown" : mode === "assignment" ? "Due Today" : "Study Streak"}
            </span>
          </div>
          <h2 className="font-heading font-bold text-[20px] text-foreground leading-tight mb-1.5 truncate">{title}</h2>
          <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">{subtitle}</p>

          <button
            onClick={() => setOpen(true)}
            className="w-full text-left p-3.5 rounded-2xl glass spring-tap flex items-start gap-2.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary bud-breathe mt-1.5 flex-shrink-0" />
            <p className="text-[13px] text-foreground/85 leading-relaxed italic">{budInsight}</p>
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 flex-shrink-0">
          <LearningProgressRing
            progress={mode === "progress" ? weekProgress : mode === "exam" ? Math.max(0.08, 1 - examDays / 7) : Math.min(1, dueToday.length / 3)}
            size={104}
            label={metricLabel}
            sublabel={mode === "progress" ? "this week" : mode === "exam" ? "remaining" : "priority"}
          />
        </div>
      </div>

      <button
        onClick={onAction}
        className="w-full mt-5 h-12 rounded-2xl bg-primary text-primary-foreground premium-shadow liquid-press flex items-center justify-center gap-2 font-heading font-semibold text-[14px] hover:bg-primary/90 hover:-translate-y-px transition-all"
      >
        {actionLabel}
        <ArrowRight className="w-4 h-4" strokeWidth={2.3} />
      </button>
    </motion.div>
  );
}