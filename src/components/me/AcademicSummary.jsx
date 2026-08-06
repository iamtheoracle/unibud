import React from "react";
import { motion } from "framer-motion";
import SectionHeader from "@/components/me/SectionHeader";

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

function computeCGPA(grades) {
  const valid = (grades || []).filter((g) => g.score != null && g.max_score);
  if (!valid.length) return null;
  const avgPct = valid.reduce((s, g) => s + g.score / (g.max_score || 100), 0) / valid.length * 100;
  return Math.round((avgPct / 20) * 100) / 100;
}

function hoursInRange(sessions, days) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString().split("T")[0];
  return (sessions || []).filter((s) => s.session_date && s.session_date >= sinceStr).reduce((s, x) => s + (x.duration_minutes || 0), 0) / 60;
}

/**
 * AcademicSummary — CGPA ring, weekly/monthly progress bars, and a
 * grid of academic metrics.
 */
export default function AcademicSummary({ courses, grades, assignments, sessions }) {
  const cgpa = computeCGPA(grades);
  const creditsCompleted = (courses || []).filter((c) => c.status === "completed").reduce((s, c) => s + (c.credits || 0), 0);
  const totalCredits = (courses || []).reduce((s, c) => s + (c.credits || 0), 0);
  const creditsRemaining = totalCredits ? Math.max(totalCredits - creditsCompleted, 0) : null;
  const assignmentsCompleted = (assignments || []).filter((a) => a.status === "submitted" || a.status === "graded").length;
  const projectsCompleted = (assignments || []).filter((a) => a.type === "project" && (a.status === "submitted" || a.status === "graded")).length;
  const studyHours = (sessions || []).reduce((s, x) => s + (x.duration_minutes || 0), 0) / 60;
  const streak = computeStreak(sessions || []);
  const weeklyHours = hoursInRange(sessions, 7);
  const monthlyHours = hoursInRange(sessions, 30);

  const stats = [
    { label: "Credits Completed", value: totalCredits ? creditsCompleted : "—" },
    { label: "Credits Remaining", value: creditsRemaining != null ? creditsRemaining : "—" },
    { label: "Attendance", value: "—" },
    { label: "Assignments Done", value: assignmentsCompleted },
    { label: "Projects Done", value: projectsCompleted },
    { label: "Study Hours", value: Math.round(studyHours * 10) / 10 },
    { label: "Learning Streak", value: `${streak}d` },
  ];

  return (
    <div>
      <SectionHeader title="Academic Summary" />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
        <div className="flex items-center gap-5">
          <Ring value={cgpa != null ? cgpa.toFixed(2) : "—"} pct={cgpa != null ? cgpa / 5 : 0} label="CGPA / 5.0" />
          <div className="flex-1 space-y-4 min-w-0">
            <Bar label="Weekly Progress" value={weeklyHours} target={20} unit="h" />
            <Bar label="Monthly Progress" value={monthlyHours} target={80} unit="h" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          {stats.map((s) => (
            <div key={s.label} className="p-3 rounded-2xl bg-muted/40 text-center">
              <p className="font-heading font-bold text-[16px] text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Ring({ value, pct, label }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[120px] h-[120px] flex items-center justify-center flex-shrink-0">
      <svg className="w-[120px] h-[120px] -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * Math.min(pct, 1) }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-heading font-bold text-[20px] text-foreground">{value}</p>
        <p className="text-[9px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Bar({ label, value, target, unit }) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[12px] text-muted-foreground">{label}</span>
        <span className="text-[12px] font-semibold text-foreground">{Math.round(value * 10) / 10}{unit} / {target}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.9, ease: EASE }} />
      </div>
    </div>
  );
}