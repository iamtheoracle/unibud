import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarClock, ClipboardList, Zap, CheckCircle2 } from "lucide-react";

/**
 * BudToday — today's classes, assignments due, upcoming exams, attendance.
 */
export default function BudToday({ ctx }) {
  const due = (ctx.assignments || []).filter((x) => x.due_date && x.status === "pending").length;
  const upcoming = (ctx.exams || []).filter((x) => x.date && x.status === "upcoming").length;
  const att = ctx.attendanceRate !== null ? `${Math.round(ctx.attendanceRate * 100)}%` : "—";
  const attTone = ctx.attendanceRate !== null && ctx.attendanceRate < 0.7 ? "text-warning" : "text-success";

  const items = [
    { icon: CalendarClock, label: "Classes today", value: ctx.nextLecture ? ctx.nextLecture.course_title || "Soon" : "Free day", to: "/timetable", tone: "text-primary" },
    { icon: ClipboardList, label: "Assignments due", value: String(due), to: "/assignments", tone: "text-warning" },
    { icon: Zap, label: "Exams upcoming", value: String(upcoming), to: "/exams", tone: "text-primary" },
    { icon: CheckCircle2, label: "Attendance", value: att, to: "/attendance", tone: attTone },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <motion.div key={it.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={it.to} className="block p-4 rounded-[22px] glass card-hover h-full">
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-8 h-8 rounded-full bg-card flex items-center justify-center ${it.tone}`}>
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mb-0.5">{it.label}</p>
              <p className="font-heading font-semibold text-[15px] text-foreground truncate">{it.value}</p>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}