import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, MapPin, AlertCircle, GraduationCap, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EASE = [0.16, 1, 0.3, 1];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const todayName = () => DAYS[new Date().getDay()];
const todayStr = new Date().toISOString().split("T")[0];

function parseHM(s) { if (!s) return null; const part = s.includes("T") ? s.split("T")[1] : s; const [h, m] = part.split(":").map(Number); if (isNaN(h) || isNaN(m)) return null; return { h, m }; }
function fmt(s) { const hm = parseHM(s); if (!hm) return s || "—"; return `${String(hm.h).padStart(2, "0")}:${String(hm.m).padStart(2, "0")}`; }
function daysUntil(d) { return Math.ceil((new Date(d) - new Date(todayStr)) / 86400000); }

export default function StudyTodayLearning() {
  const navigate = useNavigate();
  const timetable = useQuery({ queryKey: ["studyTodayTimetable"], queryFn: () => base44.entities.TimetableEntry.list() });
  const assignments = useQuery({ queryKey: ["studyDueAssignments"], queryFn: () => base44.entities.Assignment.list("due_date", 20) });
  const exams = useQuery({ queryKey: ["studyUpcomingExams"], queryFn: () => base44.entities.Exam.list("date", 10) });

  const today = todayName();
  const classes = (timetable.data || []).filter((e) => e.day === today).sort((a, b) => (a.start_time || "").localeCompare(b.start_time || "")).slice(0, 3);
  const due = (assignments.data || []).filter((a) => a.status === "pending" && a.due_date && a.due_date >= todayStr).slice(0, 2);
  const upcomingExams = (exams.data || []).filter((e) => e.date && e.date >= todayStr).slice(0, 2);

  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="glass-card p-5">
      <h2 className="font-heading font-bold text-[15px] text-foreground mb-3">Today's Learning</h2>

      <div className="space-y-3">
        {classes.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" />Classes today</p>
            <div className="space-y-1.5">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted/30">
                  <div className="w-10 text-center shrink-0"><p className="text-[11px] font-bold text-foreground">{fmt(c.start_time)}</p></div>
                  <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{c.course_title || c.course_code}</p><p className="text-[10px] text-muted-foreground truncate flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{c.location || "—"}</p></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {due.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1"><Clock className="w-3 h-3" />Assignments due</p>
            <div className="space-y-1.5">
              {due.map((a) => {
                const d = daysUntil(a.due_date); const soon = d <= 2;
                return (
                  <button key={a.id} onClick={() => navigate("/assignments")} className="w-full flex items-center gap-3 p-2 rounded-xl bg-muted/30 spring-tap text-left">
                    <AlertCircle className={`w-4 h-4 shrink-0 ${soon ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{a.title}</p><p className="text-[10px] text-muted-foreground">{a.course_code || "—"}</p></div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${soon ? "bg-primary/15 text-primary" : "bg-muted/60 text-muted-foreground"}`}>{d <= 0 ? "Today" : d === 1 ? "1d" : `${d}d`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {upcomingExams.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5 flex items-center gap-1"><GraduationCap className="w-3 h-3" />Exams upcoming</p>
            <div className="space-y-1.5">
              {upcomingExams.map((e) => {
                const d = daysUntil(e.date);
                return (
                  <button key={e.id} onClick={() => navigate("/exams")} className="w-full flex items-center gap-3 p-2 rounded-xl bg-muted/30 spring-tap text-left">
                    <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                    <div className="min-w-0 flex-1"><p className="text-[12px] font-semibold text-foreground truncate">{e.title}</p><p className="text-[10px] text-muted-foreground">{e.course_code || "—"}</p></div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 bg-primary/15 text-primary">{d <= 0 ? "Today" : `${d}d`}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {classes.length === 0 && due.length === 0 && upcomingExams.length === 0 && (
          <p className="text-[13px] text-muted-foreground text-center py-4">Nothing scheduled today. Perfect time to study ahead.</p>
        )}
      </div>

      <button onClick={() => navigate("/agenda")} className="w-full mt-3 text-[11px] font-semibold text-primary flex items-center justify-center gap-1 spring-tap">Unified agenda <ChevronRight className="w-3 h-3" /></button>
    </motion.section>
  );
}