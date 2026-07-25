import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, FlaskConical, FileQuestion, FileText } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];
const todayStr = new Date().toISOString().split("T")[0];

const TYPE_META = {
  assignment: { icon: ClipboardList, label: "Assignment" },
  quiz: { icon: FileQuestion, label: "Quiz" },
  project: { icon: FlaskConical, label: "Project" },
  lab: { icon: FlaskConical, label: "Lab" },
  exam: { icon: FileText, label: "Examination" },
};

/**
 * UpcomingDeadlines — timeline of assignments, projects, quizzes, and
 * examinations with subtle color coding.
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
        <div>
          {upcoming.map((it, i) => (
            <DeadlineRow key={it.kind + it.id} item={it} last={i === upcoming.length - 1} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function DeadlineRow({ item, last }) {
  const meta = TYPE_META[item.type] || TYPE_META.assignment;
  const days = Math.ceil((new Date(item.date) - new Date(todayStr)) / 86400000);
  const Icon = meta.icon;
  const soon = days <= 2;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center flex-shrink-0">
          <Icon className="w-[18px] h-[18px]" />
        </div>
        {!last && <div className="w-px flex-1 bg-border my-1" />}
      </div>
      <div className={`flex-1 min-w-0 ${last ? "" : "pb-3.5"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-foreground truncate">{item.title}</p>
            <p className="text-[11px] text-muted-foreground">{meta.label}{item.course ? ` · ${item.course}` : ""}</p>
          </div>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${soon ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>
            {days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `${days}d`}
          </span>
        </div>
      </div>
    </div>
  );
}