import React from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];

/**
 * TodayCard — Liquid Glass card summarizing the student's day,
 * with a short Bud recommendation.
 */
export default function TodayCard({ courses, assignments, exams }) {
  const dueToday = (assignments || []).filter(
    (a) => a.due_date && a.due_date.split("T")[0] === todayStr && a.status === "pending"
  );
  const upcomingExam = (exams || []).find((e) => e.date && e.date >= todayStr && e.status === "upcoming");
  const classCount = courses?.length || 0;

  const rows = [
    { label: "Today's Classes", value: classCount > 0 ? `${classCount} scheduled` : "No classes today" },
    { label: "Next Lecture", value: courses?.[0]?.course_title || courses?.[0]?.course_code || "—" },
    { label: "Assignment Due Today", value: dueToday.length > 0 ? dueToday[0].title : "Nothing due today" },
    { label: "Upcoming Exam", value: upcomingExam ? upcomingExam.title : "No exams scheduled" },
  ];

  const budRec = dueToday.length > 0
    ? `You have ${dueToday.length} assignment${dueToday.length > 1 ? "s" : ""} due today. Focus on "${dueToday[0].title}" first.`
    : upcomingExam
    ? `${upcomingExam.title} is coming up. A short review today will keep you ready.`
    : "You have time free today. It's a good moment to review your notes.";

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading font-bold text-[16px] text-foreground">Today</h2>
        <span className="text-[11px] text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </span>
      </div>
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-muted-foreground">{r.label}</span>
            <span className="text-[14px] font-semibold text-foreground text-right truncate">{r.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 p-3.5 rounded-2xl bg-primary/8 border border-primary/15">
        <p className="text-[13px] text-foreground/90 leading-relaxed">{budRec}</p>
      </div>
    </motion.div>
  );
}