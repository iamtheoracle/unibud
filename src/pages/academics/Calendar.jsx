import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMockFallback } from "@/lib/mock/useMockFallback";
import { EXAM_MOCK_ENTRIES, ASSIGNMENT_MOCK_ENTRIES, TIMETABLE_MOCK_ENTRIES } from "@/lib/academic/mockShapes";
import { PROJECT_MOCK_ENTRIES, CALENDAR_EVENT_MOCK_ENTRIES, CAMPUS_EVENT_MOCK_ENTRIES } from "@/lib/academic/mockShapes2";
import ScreenShell from "@/components/layout/ScreenShell";
import EmptyState from "@/components/academics/EmptyState";
import WeatherStrip from "@/components/weather/WeatherStrip";

const WD = ["S", "M", "T", "W", "T", "F", "S"];

export default function Calendar() {
  const { data: cal } = useMockFallback(useQuery({ queryKey: ["calEvents"], queryFn: () => base44.entities.CalendarEvent.list() }), CALENDAR_EVENT_MOCK_ENTRIES);
  const { data: exams } = useMockFallback(useQuery({ queryKey: ["calExams"], queryFn: () => base44.entities.Exam.list("date", 50) }), EXAM_MOCK_ENTRIES);
  const { data: assignments } = useMockFallback(useQuery({ queryKey: ["calAssign"], queryFn: () => base44.entities.Assignment.list("-due_date", 50) }), ASSIGNMENT_MOCK_ENTRIES);
  const { data: projects } = useMockFallback(useQuery({ queryKey: ["calProjects"], queryFn: () => base44.entities.Project.list() }), PROJECT_MOCK_ENTRIES);
  const { data: timetable } = useMockFallback(useQuery({ queryKey: ["calTimetable"], queryFn: () => base44.entities.TimetableEntry.list() }), TIMETABLE_MOCK_ENTRIES);
  const { data: campus } = useMockFallback(useQuery({ queryKey: ["calCampus"], queryFn: () => base44.entities.CampusEvent.list() }), CAMPUS_EVENT_MOCK_ENTRIES);

  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState(new Date().toISOString().split("T")[0]);

  const eventsFor = (dateStr) => {
    const out = [];
    const wd = new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long" });
    (timetable || []).filter((e) => e.day === wd).forEach((e) => out.push({ type: "Class", title: e.course_code, detail: `${e.start_time}–${e.end_time}` }));
    (exams || []).filter((e) => e.date === dateStr).forEach((e) => out.push({ type: "Exam", title: e.title, detail: e.course_code }));
    (assignments || []).filter((a) => (a.due_date || "").split("T")[0] === dateStr).forEach((a) => out.push({ type: "Assignment", title: a.title, detail: a.course_code }));
    (projects || []).filter((p) => p.deadline === dateStr).forEach((p) => out.push({ type: "Project", title: p.title, detail: "Deadline" }));
    (cal || []).filter((c) => c.date === dateStr).forEach((c) => out.push({ type: c.type || "Reminder", title: c.title, detail: c.start_time }));
    (campus || []).filter((c) => c.date === dateStr).forEach((c) => out.push({ type: "Campus", title: c.title, detail: "" }));
    return out;
  };

  const monthDays = useMemo(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= days; d++) {
      const ds = new Date(y, m, d).toISOString().split("T")[0];
      cells.push({ day: d, date: ds });
    }
    return cells;
  }, [cursor]);

  const agenda = useMemo(() => {
    const all = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const ds = d.toISOString().split("T")[0];
      eventsFor(ds).forEach((e) => all.push({ ...e, date: ds }));
    }
    return all;
  }, [cal, exams, assignments, projects, timetable, campus]);

  const selEvents = eventsFor(selected);

  return (
    <ScreenShell title="Calendar" back>
      <WeatherStrip className="mb-4" />
      <div className="flex bg-muted/40 rounded-xl p-1 mb-4">
        {[["month", "Month"], ["agenda", "Agenda"]].map(([k, l]) => (
          <button key={k} onClick={() => setView(k)} className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium spring-tap transition-all ${view === k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {view === "month" && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="text-muted-foreground spring-tap text-[16px] font-semibold px-2">‹</button>
            <span className="font-heading font-bold text-[15px] text-foreground">{cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="text-muted-foreground spring-tap text-[16px] font-semibold px-2">›</button>
          </div>
          <div className="grid grid-cols-7 mb-2">{WD.map((d, i) => <span key={i} className="text-[10px] text-center text-muted-foreground font-semibold">{d}</span>)}</div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((c, i) => {
              if (!c) return <span key={i} />;
              const ev = eventsFor(c.date);
              const isSel = c.date === selected;
              return (
                <button key={i} onClick={() => setSelected(c.date)} className={`aspect-square rounded-xl flex flex-col items-center justify-center spring-tap ${isSel ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}>
                  <span className="text-[12px] font-semibold">{c.day}</span>
                  {ev.length > 0 && <span className={`w-1 h-1 rounded-full mt-0.5 ${isSel ? "bg-primary-foreground" : "bg-primary"}`} />}
                </button>
              );
            })}
          </div>
          <div className="mt-4 border-t border-border/30 pt-4">
            <p className="text-[12px] font-bold text-foreground mb-2">{new Date(selected + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
            {selEvents.length === 0 ? <p className="text-[12px] text-muted-foreground">Nothing scheduled.</p> : (
              <div className="space-y-2">
                {selEvents.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                     <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                     <div className="flex-1 min-w-0">
                       <p className="text-[13px] font-medium text-foreground truncate">{e.title}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{e.type}{e.detail ? ` · ${e.detail}` : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <div className="space-y-3">
          {!agenda.length ? <EmptyState message="No upcoming events in the next 30 days." /> : agenda.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.2), duration: 0.3 }} className="bg-card border border-border rounded-2xl p-4">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{e.type} · {e.date}</p>
              <p className="text-[14px] font-medium text-foreground">{e.title}</p>
              {e.detail && <p className="text-[11px] text-muted-foreground">{e.detail}</p>}
            </motion.div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground/60 mt-4 text-center">Device calendar sync arrives in a future milestone.</p>
    </ScreenShell>
  );
}