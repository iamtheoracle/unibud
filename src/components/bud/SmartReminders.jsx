import React, { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, Clock, CalendarClock, Award, BookOpen,
  Megaphone, ChevronRight, Bell,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function hoursUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  return diff / (1000 * 60 * 60);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return hoursUntil(dateStr) / 24;
}

export default function SmartReminders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOnline = useOnlineStatus();

  const { data: assignments } = useQuery({
    queryKey: ["reminders", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 20),
    enabled: isOnline,
  });

  const { data: exams } = useQuery({
    queryKey: ["reminders", "exams"],
    queryFn: () => base44.entities.Exam.list("date", 10),
    enabled: isOnline,
  });

  const { data: events } = useQuery({
    queryKey: ["reminders", "events"],
    queryFn: () => base44.entities.CampusEvent.list("date", 10),
    enabled: isOnline,
  });

  const { data: scholarships } = useQuery({
    queryKey: ["reminders", "scholarships"],
    queryFn: () => base44.entities.Scholarship.list("-created_date", 5),
    enabled: isOnline,
  });

  const { data: timetable } = useQuery({
    queryKey: ["reminders", "timetable"],
    queryFn: () => base44.entities.TimetableEntry.list("start_time", 10),
    enabled: isOnline,
  });

  const reminders = useMemo(() => {
    const list = [];

    // Assignment reminders (7d, 3d, 1d, 2h)
    (assignments || []).forEach((a) => {
      const hrs = hoursUntil(a.due_date);
      if (hrs === null) return;
      if (hrs < 0 || hrs > 168) return;

      let priority = "medium";
      let label = "";
      if (hrs <= 2) {
        priority = "high";
        label = hrs > 0 ? `Due in ${Math.round(hrs * 60)} min` : "Overdue";
      } else if (hrs <= 24) {
        priority = "high";
        label = "Due today";
      } else if (hrs <= 72) {
        priority = "high";
        label = `Due in ${Math.round(hrs / 24)} day${Math.round(hrs / 24) === 1 ? "" : "s"}`;
      } else {
        priority = "medium";
        label = `Due in ${Math.round(hrs / 24)} days`;
      }

      list.push({
        id: `assignment-${a.id}`,
        type: "assignment",
        priority,
        icon: BookOpen,
        title: a.title,
        subtitle: a.course_code || a.subject || "Assignment",
        label,
        dueDate: a.due_date,
        path: "/assignments",
      });
    });

    // Exam reminders (2w, 1w, 3d, morning of)
    (exams || []).forEach((e) => {
      const days = daysUntil(e.date);
      if (days === null || days < 0 || days > 14) return;

      let priority = "high";
      let label = "";
      if (days <= 1) {
        label = days < 1 ? "Today" : "Tomorrow";
      } else if (days <= 3) {
        label = `In ${Math.round(days)} days`;
      } else if (days <= 7) {
        label = `In ${Math.round(days)} days`;
        priority = "medium";
      } else {
        label = `In ${Math.round(days)} days`;
        priority = "low";
      }

      list.push({
        id: `exam-${e.id}`,
        type: "exam",
        priority,
        icon: Award,
        title: e.title || e.course_code || "Exam",
        subtitle: e.course_code || e.subject || "Exam",
        label,
        dueDate: e.date,
        path: "/exams",
      });
    });

    // Timetable reminders (30 min before)
    (timetable || []).forEach((t) => {
      if (!t.start_time || !t.date) return;
      const classDate = new Date(`${t.date}T${t.start_time}`);
      const hrs = hoursUntil(classDate);
      if (hrs === null || hrs < 0 || hrs > 0.5) return;

      list.push({
        id: `class-${t.id}`,
        type: "class",
        priority: "high",
        icon: CalendarClock,
        title: t.course_code || t.course_name || t.title || "Class",
        subtitle: t.location || t.venue || "Campus",
        label: hrs > 0 ? `Starts in ${Math.round(hrs * 60)} min` : "Starting now",
        dueDate: classDate,
        path: "/timetable",
      });
    });

    // Event reminders
    (events || []).forEach((e) => {
      const days = daysUntil(e.date);
      if (days === null || days < 0 || days > 7) return;

      list.push({
        id: `event-${e.id}`,
        type: "event",
        priority: days <= 1 ? "medium" : "low",
        icon: CalendarClock,
        title: e.title,
        subtitle: e.location || "Campus",
        label: days < 1 ? "Today" : `In ${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`,
        dueDate: e.date,
        path: "/events",
      });
    });

    // Scholarship deadline reminders
    (scholarships || []).forEach((s) => {
      const days = daysUntil(s.deadline);
      if (days === null || days < 0 || days > 14) return;

      list.push({
        id: `scholarship-${s.id}`,
        type: "scholarship",
        priority: days <= 3 ? "medium" : "low",
        icon: Megaphone,
        title: s.title || s.name || "Scholarship",
        subtitle: "Deadline approaching",
        label: days < 1 ? "Today" : `In ${Math.round(days)} day${Math.round(days) === 1 ? "" : "s"}`,
        dueDate: s.deadline,
        path: "/scholarships",
      });
    });

    // Sort by priority then by due date
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    list.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return list.slice(0, 8);
  }, [assignments, exams, events, scholarships, timetable]);

  if (reminders.length === 0) {
    return null;
  }

  const highCount = reminders.filter(r => r.priority === "high").length;
  const mediumCount = reminders.filter(r => r.priority === "medium").length;
  const lowCount = reminders.filter(r => r.priority === "low").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
          <h3 className="text-[15px] font-bold text-foreground tracking-tight">Smart Reminders</h3>
        </div>
        {highCount > 0 && (
          <span className="text-[10px] font-bold text-destructive px-2 py-0.5 rounded-full bg-destructive/10">
            {highCount} urgent
          </span>
        )}
      </div>

      {/* Priority summary */}
      <div className="flex gap-2 mb-2.5">
        {highCount > 0 && (
          <div className="flex-1 flex items-center gap-1.5 p-2 rounded-[12px] bg-destructive/5">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive" />
            <span className="text-[10px] font-bold text-destructive">{highCount} High</span>
          </div>
        )}
        {mediumCount > 0 && (
          <div className="flex-1 flex items-center gap-1.5 p-2 rounded-[12px] bg-warning/5">
            <div className="w-1.5 h-1.5 rounded-full bg-warning" />
            <span className="text-[10px] font-bold text-warning">{mediumCount} Medium</span>
          </div>
        )}
        {lowCount > 0 && (
          <div className="flex-1 flex items-center gap-1.5 p-2 rounded-[12px] bg-primary/5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-bold text-primary">{lowCount} Low</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {reminders.map((reminder, i) => {
          const Icon = reminder.icon;
          return (
            <motion.button
              key={reminder.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(reminder.path)}
              className="w-full flex items-center gap-2.5 p-3 rounded-[16px] bg-card text-left"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <div
                className={`w-8 h-8 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                  reminder.priority === "high"
                    ? "bg-destructive/10"
                    : reminder.priority === "medium"
                    ? "bg-warning/10"
                    : "bg-primary/10"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    reminder.priority === "high"
                      ? "text-destructive"
                      : reminder.priority === "medium"
                      ? "text-warning"
                      : "text-primary"
                  }`}
                  strokeWidth={2.2}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-bold text-foreground truncate">{reminder.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{reminder.subtitle}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    reminder.priority === "high"
                      ? "bg-destructive/10 text-destructive"
                      : reminder.priority === "medium"
                      ? "bg-warning/10 text-warning"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {reminder.label}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" strokeWidth={2.2} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}