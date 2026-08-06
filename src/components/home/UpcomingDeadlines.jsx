import React from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];

const TYPE_LABEL = {
  assignment: "Assignment",
  quiz: "Quiz",
  project: "Project",
  lab: "Lab",
  exam: "Examination",
};

/**
 * UpcomingDeadlines — assignments, projects, quizzes, and examinations.
 */
export default function UpcomingDeadlines({ assignments, exams }) {
  const items = [];
  (assignments || [])
    .filter((a) => a.status === "pending" && a.due_date && a.due_date.split("T")[0] >= todayStr)
    .forEach((a) =>
      items.push({ id: a.id, title: a.title, course: a.course_code, date: a.due_date.split("T")[0], type: a.type || "assignment", kind: "a" })
    );
  (exams || [])
    .filter((e) => e.status === "upcoming" && e.date && e.date >= todayStr)
    .forEach((e) => items.push({ id: e.id, title: e.title, course: e.course_code, date: e.date, type: "exam", kind: "e" }));
  items.sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = items.slice(0, 5);

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.15 }} className="glass-card p-5">
      <h2 className="font-heading font-bold text-[16px] text-foreground mb-4">Upcoming Deadlines</h2>
      {upcoming.length === 0 ? (
        <p className="text-[13px] text-muted-foreground text-center py-6">No deadlines on the horizon. A great time to get ahead.</p>
      ) : (
        <div className="space-y-3">
          {upcoming.map((it) => {
            const days = Math.ceil((new Date(it.date) - new Date(todayStr)) / 86400000);
            const soon = days <= 2;
            return (
              <div key={it.kind + it.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-foreground truncate">{it.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {TYPE_LABEL[it.type] || "Assignment"}{it.course ? ` · ${it.course}` : ""}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${soon ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
                  {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}