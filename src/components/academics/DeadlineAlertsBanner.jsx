import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, Bell, X, CheckCircle, Clock, BookOpen,
  ChevronRight, BellOff, Calendar,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

function hoursUntil(dateStr) {
  if (!dateStr) return null;
  return (new Date(dateStr) - new Date()) / (1000 * 60 * 60);
}

export default function DeadlineAlertsBanner() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(new Set());
  const [snoozed, setSnoozed] = useState({});

  const { data: assignments } = useQuery({
    queryKey: ["deadline-alerts", "assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 30),
    enabled: isOnline,
    staleTime: 60000,
  });

  const { data: exams } = useQuery({
    queryKey: ["deadline-alerts", "exams"],
    queryFn: () => base44.entities.Exam.list("date", 10),
    enabled: isOnline,
    staleTime: 60000,
  });

  const { data: projects } = useQuery({
    queryKey: ["deadline-alerts", "projects"],
    queryFn: () => base44.entities.Project.list("-due_date", 10),
    enabled: isOnline,
    staleTime: 60000,
  });

  const alerts = useMemo(() => {
    const list = [];

    (assignments || []).forEach((a) => {
      const hrs = hoursUntil(a.due_date);
      if (hrs === null || hrs < 0) return;
      if (a.status === "submitted" || a.status === "completed" || a.submitted) return;

      let priority = "high";
      let label = "";
      if (hrs <= 24) {
        label = hrs <= 2 ? "Due soon" : "Due today";
        priority = "high";
      } else if (hrs <= 72) {
        label = "Due in " + Math.round(hrs / 24) + " day" + (Math.round(hrs / 24) === 1 ? "" : "s");
        priority = "high";
      } else if (hrs <= 168) {
        label = "Due in " + Math.round(hrs / 24) + " days";
        priority = "medium";
      } else {
        return;
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
        entityId: a.id,
        entity: "Assignment",
      });
    });

    (exams || []).forEach((e) => {
      const days = hoursUntil(e.date) / 24;
      if (days < 0 || days > 14) return;

      let priority = "high";
      let label = "";
      if (days <= 1) {
        label = "Tomorrow";
        priority = "high";
      } else if (days <= 3) {
        label = "In " + Math.round(days) + " days";
        priority = "high";
      } else if (days <= 7) {
        label = "In " + Math.round(days) + " days";
        priority = "medium";
      } else {
        label = "In " + Math.round(days) + " days";
        priority = "low";
      }

      list.push({
        id: `exam-${e.id}`,
        type: "exam",
        priority,
        icon: AlertCircle,
        title: e.title || e.course_code || "Exam",
        subtitle: e.course_code || "Exam",
        label,
        dueDate: e.date,
        path: "/exams",
        entityId: e.id,
        entity: "Exam",
      });
    });

    (projects || []).forEach((p) => {
      const days = hoursUntil(p.due_date || p.deadline) / 24;
      if (days < 0 || days > 14) return;

      let priority = days <= 3 ? "high" : "medium";
      list.push({
        id: `project-${p.id}`,
        type: "project",
        priority,
        icon: BookOpen,
        title: p.title || p.name || "Project",
        subtitle: p.course_code || "Project",
        label: days < 1 ? "Today" : "In " + Math.round(days) + " day" + (Math.round(days) === 1 ? "" : "s"),
        dueDate: p.due_date || p.deadline,
        path: "/projects",
        entityId: p.id,
        entity: "Project",
      });
    });

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    list.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate) - new Date(b.dueDate);
    });

    return list;
  }, [assignments, exams, projects]);

  // Filter out dismissed and snoozed
  const visibleAlerts = alerts.filter((a) => {
    if (dismissed.has(a.id)) return false;
    const snooze = snoozed[a.id];
    if (snooze && snooze > Date.now()) return false;
    return true;
  });

  const handleDismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  const handleSnooze = (id) => {
    setSnoozed((prev) => ({ ...prev, [id]: Date.now() + 2 * 60 * 60 * 1000 }));
  };

  const handleMarkComplete = async (alert) => {
    try {
      if (alert.entity === "Assignment") {
        await base44.entities.Assignment.update(alert.entityId, { status: "completed" });
      }
      setDismissed((prev) => new Set([...prev, alert.id]));
      qc.invalidateQueries({ queryKey: ["deadline-alerts"] });
    } catch (err) {
      // Silent — alert stays
    }
  };

  if (visibleAlerts.length === 0) {
    return null;
  }

  const highCount = visibleAlerts.filter((a) => a.priority === "high").length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <Bell className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            {highCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
            )}
          </div>
          <h3 className="text-[14px] font-bold text-foreground tracking-tight">Deadline Alerts</h3>
          {highCount > 0 && (
            <span className="text-[9px] font-bold text-destructive px-1.5 py-0.5 rounded-full bg-destructive/10">
              {highCount} urgent
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground">{visibleAlerts.length} active</span>
      </div>

      <AnimatePresence mode="popLayout">
        {visibleAlerts.slice(0, 5).map((alert) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={alert.id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="rounded-[16px] bg-card overflow-hidden"
              style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}
            >
              <div className="p-3">
                <div className="flex items-start gap-2.5">
                  <div className={`w-8 h-8 rounded-[12px] flex items-center justify-center flex-shrink-0 ${
                    alert.priority === "high" ? "bg-destructive/10" : "bg-warning/10"
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      alert.priority === "high" ? "text-destructive" : "text-warning"
                    }`} strokeWidth={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-foreground truncate">{alert.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{alert.subtitle}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" strokeWidth={2.2} />
                      <span className={`text-[9px] font-bold ${
                        alert.priority === "high" ? "text-destructive" : "text-warning"
                      }`}>{alert.label}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                  >
                    <X className="w-3 h-3 text-muted-foreground" strokeWidth={2.2} />
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-1.5 mt-2.5">
                  <button
                    onClick={() => handleMarkComplete(alert)}
                    className="flex-1 flex items-center justify-center gap-1 h-7 rounded-[10px] bg-success/10 text-success text-[10px] font-bold active:scale-95 transition-transform"
                  >
                    <CheckCircle className="w-3 h-3" strokeWidth={2.2} />
                    Complete
                  </button>
                  <button
                    onClick={() => handleSnooze(alert.id)}
                    className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-[10px] bg-muted text-muted-foreground text-[10px] font-bold active:scale-95 transition-transform"
                  >
                    <Clock className="w-3 h-3" strokeWidth={2.2} />
                    Snooze
                  </button>
                  <button
                    onClick={() => navigate(alert.path)}
                    className="flex items-center justify-center gap-1 h-7 px-2.5 rounded-[10px] bg-primary text-primary-foreground text-[10px] font-bold active:scale-95 transition-transform"
                  >
                    Open
                    <ChevronRight className="w-3 h-3" strokeWidth={2.2} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {visibleAlerts.length > 5 && (
        <button
          onClick={() => navigate("/smart-notifications")}
          className="w-full text-center text-[11px] font-bold text-primary py-2"
        >
          View all {visibleAlerts.length} alerts
        </button>
      )}
    </div>
  );
}