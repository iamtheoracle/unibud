import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ClipboardList, FileText, FolderKanban, CalendarRange, AlertTriangle,
  ChevronRight, CalendarClock,
} from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];

const SOURCE_META = {
  assignment: { label: "Assignment", icon: ClipboardList, color: "262 83% 58%", route: "/assignments" },
  exam: { label: "Exam", icon: FileText, color: "0 72% 51%", route: "/exams" },
  project: { label: "Project", icon: FolderKanban, color: "142 71% 45%", route: "/projects" },
  calendar: { label: "Event", icon: CalendarRange, color: "217 91% 60%", route: "/calendar" },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "assignment", label: "Assignments" },
  { key: "exam", label: "Exams" },
  { key: "project", label: "Projects" },
  { key: "calendar", label: "Events" },
];

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

function combineDate(date, time) {
  if (!date) return null;
  const d = new Date(date);
  if (time) {
    const [h, m] = time.split(":").map(Number);
    if (!isNaN(h)) { d.setHours(h, m || 0, 0, 0); }
  }
  return d;
}

function dueLabel(d) {
  const now = new Date();
  const today = startOfDay(now);
  const itemDay = startOfDay(d);
  const dayDiff = Math.round((itemDay - today) / 86400000);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (dayDiff < 0) return { overdue: true, text: `${Math.abs(dayDiff)}d overdue` };
  if (dayDiff === 0) return { overdue: false, text: `Today · ${time}` };
  if (dayDiff === 1) return { overdue: false, text: `Tomorrow · ${time}` };
  if (dayDiff < 7) return { overdue: false, text: d.toLocaleDateString([], { weekday: "short" }) + ` · ${time}` };
  return { overdue: false, text: d.toLocaleDateString([], { month: "short", day: "numeric" }) };
}

/**
 * UnifiedAgenda — one prioritized timeline of every time-bound academic item
 * (assignments, exams, projects, calendar events) so nothing slips through.
 */
export default function UnifiedAgenda() {
  const [filter, setFilter] = useState("all");

  const { data: assignments } = useQuery({
    queryKey: ["agendaAssignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 100),
  });
  const { data: exams } = useQuery({
    queryKey: ["agendaExams"],
    queryFn: () => base44.entities.Exam.list("date", 100),
  });
  const { data: projects } = useQuery({
    queryKey: ["agendaProjects"],
    queryFn: () => base44.entities.Project.list("deadline", 100),
  });
  const { data: events } = useQuery({
    queryKey: ["agendaEvents"],
    queryFn: () => base44.entities.CalendarEvent.list("date", 100),
  });

  const items = useMemo(() => {
    const out = [];
    (assignments || []).forEach((a) => {
      if (a.status === "submitted" || a.status === "graded") return;
      const due = a.due_date ? new Date(a.due_date) : null;
      if (!due) return;
      out.push({ id: a.id, source: "assignment", title: a.title, subtitle: a.course_code || a.course_title || "Assignment", due, route: "/assignments" });
    });
    (exams || []).forEach((e) => {
      if (e.status !== "upcoming") return;
      const due = combineDate(e.date, e.start_time);
      if (!due) return;
      out.push({ id: e.id, source: "exam", title: e.title, subtitle: [e.course_code, e.type].filter(Boolean).join(" · "), due, route: "/exams" });
    });
    (projects || []).forEach((p) => {
      if (p.status === "completed" || !p.deadline) return;
      const due = new Date(p.deadline);
      out.push({ id: p.id, source: "project", title: p.title, subtitle: p.supervisor || `${(p.team_members || []).length} members`, due, route: "/projects" });
    });
    (events || []).forEach((ev) => {
      if (ev.is_completed) return;
      const due = combineDate(ev.date, ev.start_time);
      if (!due) return;
      out.push({ id: ev.id, source: "calendar", title: ev.title, subtitle: ev.type || "Event", due, route: "/calendar" });
    });
    return out;
  }, [assignments, exams, projects, events]);

  const filtered = filter === "all" ? items : items.filter((i) => i.source === filter);

  const groups = useMemo(() => {
    const now = new Date();
    const today = startOfDay(now);
    const weekEnd = new Date(today); weekEnd.setDate(today.getDate() + 7);
    const overdue = [], todayList = [], week = [], later = [];
    for (const it of filtered) {
      if (it.due < today) overdue.push(it);
      else if (startOfDay(it.due).getTime() === today.getTime()) todayList.push(it);
      else if (it.due < weekEnd) week.push(it);
      else later.push(it);
    }
    const sortFn = (a, b) => a.due - b.due;
    overdue.sort(sortFn); todayList.sort(sortFn); week.sort(sortFn); later.sort(sortFn);
    return [
      { key: "overdue", label: "Overdue", items: overdue },
      { key: "today", label: "Today", items: todayList },
      { key: "week", label: "This Week", items: week },
      { key: "later", label: "Later", items: later },
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  const totalCount = filtered.length;

  return (
    <div className="w-full max-w-[600px] mx-auto px-5 pt-8 pb-32 safe-area-pt">
      <header className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <CalendarClock className="w-5 h-5 text-primary" />
          <h1 className="font-heading font-extrabold text-[28px] text-foreground tracking-tight">Unified Agenda</h1>
        </div>
        <p className="text-[13px] text-muted-foreground">Every deadline — assignments, exams, projects and events — in one timeline.</p>
      </header>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap spring-tap ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-card border border-border/40 text-foreground/70"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {totalCount === 0 ? (
        <div className="glass-card p-8 text-center">
          <div className="w-14 h-14 rounded-[18px] bg-success/10 flex items-center justify-center mx-auto mb-3">
            <CalendarClock className="w-7 h-7 text-success" />
          </div>
          <p className="text-[14px] font-semibold text-foreground">Nothing on the horizon</p>
          <p className="text-[12px] text-muted-foreground mt-1">You're all caught up. New deadlines will appear here the moment they're added.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <section key={g.key}>
              <div className="flex items-center gap-2 mb-2.5">
                {g.key === "overdue" && <AlertTriangle className="w-3.5 h-3.5 text-destructive" />}
                <h2 className={`text-[13px] font-semibold ${g.key === "overdue" ? "text-destructive" : "text-foreground"}`}>{g.label}</h2>
                <span className="text-[11px] text-muted-foreground">{g.items.length}</span>
              </div>
              <div className="space-y-2.5">
                {g.items.map((it, i) => {
                  const meta = SOURCE_META[it.source];
                  const Icon = meta.icon;
                  const lbl = dueLabel(it.due);
                  return (
                    <Link key={it.source + it.id} to={it.route} className="block">
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                        className={`glass-card p-3.5 flex items-center gap-3 spring-tap ${g.key === "overdue" ? "ring-1 ring-destructive/25" : ""}`}
                      >
                        <div className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: `hsl(${meta.color} / 0.14)` }}>
                          <Icon className="w-4 h-4" style={{ color: `hsl(${meta.color})` }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold text-foreground truncate">{it.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{it.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[11px] font-semibold ${lbl.overdue ? "text-destructive" : "text-muted-foreground"}`}>{lbl.text}</p>
                          <p className="text-[9px] text-muted-foreground uppercase tracking-wide">{meta.label}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}