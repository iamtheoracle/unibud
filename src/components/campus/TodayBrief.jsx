import React from "react";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

function dueLabel(days) {
  if (days == null) return "";
  if (days < 0) return "overdue";
  if (days === 0) return "due today";
  if (days === 1) return "due tomorrow";
  return `due in ${days} days`;
}

/**
 * composeBrief — the "invisible AI" rule-based daily focus.
 * Derives a calm, intelligent summary from the user's live academic state
 * (next class, next deadline, GPA) without any chatbot UI.
 */
export function composeBrief(nextClass, nextDeadline, gpa, todaySchedule) {
  let focus = null;
  let urgency = "calm"; // calm | attention | urgent

  if (nextDeadline) {
    const d = nextDeadline.dueInDays;
    if (d <= 1) {
      urgency = d < 0 ? "urgent" : "attention";
      focus = `Prioritise "${nextDeadline.title}" — ${dueLabel(d)}.`;
    }
  }
  if (nextClass && !focus) {
    focus = `Get ready for ${nextClass.code} at ${nextClass.start}.`;
  }

  const parts = [];
  if (nextDeadline) parts.push(`${nextDeadline.title} ${dueLabel(nextDeadline.dueInDays)}`);
  if (nextClass) parts.push(`${nextClass.code} at ${nextClass.start}`);
  if (gpa) parts.push(`GPA ${gpa.current.toFixed(2)}`);

  let headline;
  if (!nextClass && !nextDeadline) {
    headline = "You're all caught up";
    focus = "A great day to get ahead — review notes or start the next assignment.";
    urgency = "calm";
  } else {
    headline = parts.join(" · ");
    if (!focus) focus = "Stay on track with today's plan.";
  }

  return { headline, focus, urgency };
}

/**
 * TodayBrief — the daily focus card. The single most important surface on
 * Campus: answers "what needs my attention right now?" before anything else.
 */
export default function TodayBrief({ brief, loading }) {
  if (loading || !brief) {
    return (
      <div className="crystal-card p-4">
        <div className="h-4 w-32 rounded shimmer mb-3" />
        <div className="h-3.5 w-full rounded shimmer mb-2" />
        <div className="h-3 w-2/3 rounded shimmer" />
      </div>
    );
  }

  const { headline, focus, urgency } = brief;
  const Icon = urgency === "urgent" ? AlertCircle : urgency === "attention" ? Clock : CheckCircle2;
  const accent = urgency === "urgent" ? "0 70% 55%" : urgency === "attention" ? "38 92% 50%" : "142 71% 45%";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="crystal-card glass-shine p-4 edge-light"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `hsl(${accent} / 0.16)` }}>
          <Icon className="w-3.5 h-3.5" style={{ color: `hsl(${accent})` }} strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Today's focus</span>
      </div>
      <p className="text-[15px] font-semibold text-foreground leading-snug">{headline}</p>
      <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">{focus}</p>
    </motion.section>
  );
}