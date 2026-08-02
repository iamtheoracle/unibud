import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bell, Clock, BookOpen, GraduationCap, FileText, Calendar,
  Plus, X, Sparkles, ChevronRight,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * AcademicNotificationPreferences — quiet settings for customizing
 * Bud's academic reminder timing per category. Multi-stage lead times
 * for assignments, exams, quizzes, and projects; single lead time
 * for classes, study sessions, and attendance.
 *
 * All preferences persist to the ReminderPreference entity (per-student via RLS).
 */

const LEAD_DAY_OPTIONS = [
  { value: 14, label: "14 days" },
  { value: 7, label: "7 days" },
  { value: 3, label: "3 days" },
  { value: 1, label: "1 day" },
  { value: 0, label: "Due today" },
];

const CATEGORIES = [
  { id: "assignments", label: "Assignments", icon: FileText, field: "assignment_lead_days", defaults: [7, 3, 1, 0] },
  { id: "exams", label: "Exams", icon: GraduationCap, field: "exam_lead_days", defaults: [14, 7, 3, 1, 0] },
  { id: "quizzes", label: "Quizzes", icon: BookOpen, field: "quiz_lead_days", defaults: [3, 1, 0] },
  { id: "projects", label: "Project Milestones", icon: FileText, field: "project_lead_days", defaults: [7, 3, 1, 0] },
];

export default function AcademicNotificationPreferences() {
  const [prefs, setPrefs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedCat, setExpandedCat] = useState(null);
  const { toast } = useToast();

  const loadPrefs = useCallback(async () => {
    try {
      const res = await base44.entities.ReminderPreference.list();
      if (res && res.length > 0) {
        setPrefs(res[0]);
      } else {
        const created = await base44.entities.ReminderPreference.create({
          assignment_lead_days: [7, 3, 1, 0],
          exam_lead_days: [14, 7, 3, 1, 0],
          quiz_lead_days: [3, 1, 0],
          project_lead_days: [7, 3, 1, 0],
          class_lead_minutes: 15,
          class_travel_reminder: true,
          study_session_lead_minutes: 10,
          attendance_lead_minutes: 30,
          smart_prioritization: true,
          reminders_actionable_until_deadline: true,
        });
        setPrefs(created);
      }
    } catch {
      // Fallback to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("unibud_reminder_prefs") || "{}");
        setPrefs(stored);
      } catch {
        setPrefs({});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadPrefs(); }, [loadPrefs]);

  const save = async (updates) => {
    const next = { ...prefs, ...updates };
    setPrefs(next);
    try {
      if (prefs?.id) {
        await base44.entities.ReminderPreference.update(prefs.id, updates);
      }
    } catch {
      try { localStorage.setItem("unibud_reminder_prefs", JSON.stringify(next)); } catch {}
    }
  };

  const toggleLeadDay = (field, value) => {
    const current = prefs[field] || [];
    const has = current.includes(value);
    const next = has ? current.filter((v) => v !== value) : [...current, value].sort((a, b) => b - a);
    save({ [field]: next });
  };

  const toggleCategory = (catId, field) => {
    const enabled = !prefs[field];
    save({ [field]: enabled });
  };

  if (loading || !prefs) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-[14px] bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-1">
        <Bell className="w-4 h-4 text-primary" strokeWidth={1.8} />
        <div>
          <p className="text-[14px] font-bold text-foreground">Academic Reminders</p>
          <p className="text-[11px] text-muted-foreground">Customize when Bud reminds you about deadlines and classes.</p>
        </div>
      </div>

      {/* Smart prioritization toggle */}
      <div className="flex items-center justify-between p-3.5 rounded-[16px] bg-muted/30">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary" strokeWidth={1.8} />
          <div>
            <p className="text-[12px] font-semibold text-foreground">Smart Prioritization</p>
            <p className="text-[10px] text-muted-foreground">Bud prioritizes urgent reminders automatically</p>
          </div>
        </div>
        <button
          onClick={() => save({ smart_prioritization: !prefs.smart_prioritization })}
          className={`w-10 h-5.5 rounded-full flex items-center px-0.5 transition-colors ${prefs.smart_prioritization ? "bg-primary justify-end" : "bg-muted justify-start"}`}
          style={{ height: 22 }}
        >
          <motion.div layout className="w-4 h-4 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
        </button>
      </div>

      {/* Category-specific lead times */}
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const enabledField = `${cat.id === "assignments" ? "assignment" : cat.id === "exams" ? "exam" : cat.id === "quizzes" ? "quiz" : cat.id === "projects" ? "project" : "deadline"}_reminders`;
        const isEnabled = prefs[enabledField] !== false;
        const leadDays = prefs[cat.field] || cat.defaults;
        const isExpanded = expandedCat === cat.id;

        return (
          <div key={cat.id} className="rounded-[16px] bg-card overflow-hidden" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
            <button
              onClick={() => setExpandedCat(isExpanded ? null : cat.id)}
              className="w-full flex items-center gap-3 px-3.5 py-3 text-left active:bg-muted/30 transition-colors"
            >
              <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${isEnabled ? "bg-primary/10" : "bg-muted/50"}`}>
                <Icon className="w-3.5 h-3.5 text-foreground" strokeWidth={1.6} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-semibold ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>{cat.label}</p>
                <p className="text-[10px] text-muted-foreground">
                  {isEnabled ? leadDays.map((d) => d === 0 ? "Today" : `${d}d`).join(" · ") : "Disabled"}
                </p>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} strokeWidth={1.8} />
            </button>

            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
              >
                <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 bg-muted/20">
                  {/* Enable toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Enable</span>
                    <button
                      onClick={() => save({ [enabledField]: !isEnabled })}
                      className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${isEnabled ? "bg-primary justify-end" : "bg-muted justify-start"}`}
                    >
                      <motion.div layout className="w-4 h-4 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                    </button>
                  </div>

                  {/* Lead time chips */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground block mb-2">Reminder Schedule</span>
                    <div className="flex flex-wrap gap-1.5">
                      {LEAD_DAY_OPTIONS.map((opt) => {
                        const active = leadDays.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            onClick={() => toggleLeadDay(cat.field, opt.value)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap ${active ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground"}`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );
      })}

      {/* Class reminders */}
      <div className="rounded-[16px] bg-card p-3.5" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03), 0 4px 12px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
            <Calendar className="w-3.5 h-3.5 text-foreground" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-foreground">Class Reminders</p>
            <p className="text-[10px] text-muted-foreground">{prefs.class_lead_minutes || 15} min before class</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {[5, 10, 15, 20, 30].map((min) => (
            <button
              key={min}
              onClick={() => save({ class_lead_minutes: min })}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium spring-tap ${(prefs.class_lead_minutes || 15) === min ? "bg-foreground text-background" : "bg-muted/40 text-muted-foreground"}`}
            >
              {min} min
            </button>
          ))}
        </div>
        <button
          onClick={() => save({ class_travel_reminder: !prefs.class_travel_reminder })}
          className="flex items-center justify-between w-full pt-2 border-t border-border/30"
        >
          <span className="text-[11px] font-medium text-muted-foreground">Travel reminder (when location available)</span>
          <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${prefs.class_travel_reminder ? "bg-primary justify-end" : "bg-muted justify-start"}`}>
            <motion.div layout className="w-4 h-4 rounded-full bg-white" transition={{ type: "spring", stiffness: 500, damping: 30 }} />
          </div>
        </button>
      </div>
    </div>
  );
}