import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search, Sparkles, ArrowRight, ChevronRight,
  Clock, AlertCircle, TrendingUp, CalendarDays, BookOpen, ClipboardList,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAcademicData } from "@/lib/academic/useAcademicData";
import { ACADEMIC_CATEGORIES } from "@/lib/academics/registry";
import OrbitBuildingCard from "@/components/academics/OrbitBuildingCard";

const EASE = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function dueLabel(days) {
  if (days < 0) return "Overdue";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

/** AcademicHub — the premium, editorial front door to the academic OS. */
export default function AcademicHub() {
  const { nextClass, nextDeadline, gpa, today, loading, orbitActive } = useAcademicData();
  const [q, setQ] = useState("");

  const { data: assignments } = useQuery({
    queryKey: ["hub-assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 10),
    staleTime: 60000,
  });

  const dueCount = (assignments || []).filter(
    (a) => a.status === "pending" || a.status === "in_progress"
  ).length;

  const focusItem = nextDeadline
    ? { title: nextDeadline.title, sub: (nextDeadline.code ? `${nextDeadline.code} · ` : "") + dueLabel(nextDeadline.dueInDays), to: "/assignments" }
    : nextClass
    ? { title: nextClass.code, sub: `${nextClass.start} · ${nextClass.room}`, to: "/timetable" }
    : null;

  return (
    <div className="w-full max-w-[520px] mx-auto px-6 pt-6 pb-36 safe-area-pt">
      {/* Greeting + Title */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="mb-7"
      >
        <p className="text-[13px] text-muted-foreground font-medium">{greeting()},</p>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground leading-tight mt-0.5">Academics</h1>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses, assignments, notes…"
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 spring-tap transition-colors duration-300"
        />
      </div>

      {/* Orbit Building State */}
      {orbitActive && (
        <section className="mt-8">
          <OrbitBuildingCard />
        </section>
      )}

      {!orbitActive && (
      <>
      {/* Stats — divider-based */}
      <div className="mt-8 flex">
        <StatTile
          to="/timetable"
          icon={nextClass ? Clock : TrendingUp}
          label="Next class"
          value={loading ? "—" : nextClass ? nextClass.code : "Free"}
          sub={loading ? "…" : nextClass ? nextClass.start : "No classes"}
        />
        <div className="w-px bg-border shrink-0" />
        <StatTile
          to="/assignments"
          icon={AlertCircle}
          label="Due"
          value={loading ? "—" : dueCount > 0 ? `${dueCount}` : "None"}
          sub={loading ? "…" : nextDeadline ? dueLabel(nextDeadline.dueInDays) : "All caught up"}
        />
        <div className="w-px bg-border shrink-0" />
        <StatTile
          to="/results"
          icon={TrendingUp}
          label="GPA"
          value={loading ? "—" : gpa ? gpa.current.toFixed(2) : "—"}
          sub={gpa ? `/${gpa.scale.toFixed(1)}` : "—"}
        />
      </div>

      {/* Today's Focus — single premium recommendation */}
      {focusItem && (
        <section className="mt-10">
          <div className="flex items-center gap-1.5 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Today's Focus</span>
          </div>
          <Link to={focusItem.to} className="block spring-tap group">
            <div className="bg-card border border-border rounded-2xl p-5 premium-shadow transition-shadow duration-300 hover:shadow-hover">
              <p className="text-[17px] font-medium text-foreground leading-tight">{focusItem.title}</p>
              <p className="text-[13px] text-muted-foreground mt-1">{focusItem.sub}</p>
              <div className="flex items-center gap-1 mt-4 text-primary text-[13px] font-medium">
                Continue
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Tasks */}
      <section className="mt-10">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Tasks</span>
        <div className="divide-y divide-border border-t border-b border-border">
          <SummaryRow to="/assignments" icon={ClipboardList} label="Assignments" value={dueCount > 0 ? `${dueCount} due` : "All caught up"} />
          <SummaryRow to="/exams" icon={AlertCircle} label="Exams" value="View upcoming" />
          <SummaryRow to="/projects" icon={BookOpen} label="Projects" value="View active" />
        </div>
      </section>

      {/* Timetable */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Timetable</span>
          <Link to="/timetable" className="text-[12px] font-medium text-primary spring-tap">Full schedule</Link>
        </div>
        <div className="divide-y divide-border border-t border-b border-border">
          {loading ? (
            <div className="py-5"><div className="h-5 rounded shimmer" /></div>
          ) : today && today.length > 0 ? (
            today.slice(0, 3).map((s, i) => (
              <div key={i} className="flex items-center gap-3 py-4">
                <p className="text-[13px] font-semibold text-foreground tabular-nums w-14 shrink-0">{s.start}</p>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-foreground truncate">{s.code}</p>
                  <p className="text-[12px] text-muted-foreground truncate">{s.title}{s.room ? ` · ${s.room}` : ""}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-5">
              <p className="text-[14px] text-muted-foreground">No classes today — perfect for deep work.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quick Links */}
      <section className="mt-10">
        <div className="divide-y divide-border border-t border-b border-border">
          <SummaryRow to="/calendar" icon={CalendarDays} label="Calendar" value="View month" />
          <SummaryRow to="/courses" icon={BookOpen} label="Courses" value="All courses" />
        </div>
      </section>
      </>
      )}

      {/* Search results */}
      {q.trim() && (
        <section className="mt-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Results</p>
          <div className="divide-y divide-border border-t border-b border-border">
            {ACADEMIC_CATEGORIES.filter((c) =>
               c.to &&
               (c.title.toLowerCase().includes(q.toLowerCase()) ||
                c.desc.toLowerCase().includes(q.toLowerCase()))
             ).map((c) => (
              <SummaryRow key={c.key} to={c.to} icon={c.icon} label={c.title} value={c.desc} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatTile({ to, icon: Icon, label, value, sub }) {
  return (
    <Link to={to} className="flex-1 px-4 first:pl-0 last:pr-0 spring-tap">
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon className="w-3 h-3 text-primary" strokeWidth={2.2} />
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="text-[18px] font-bold text-foreground leading-tight tracking-tight">{value}</p>
      <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sub}</p>
    </Link>
  );
}

function SummaryRow({ to, icon: Icon, label, value }) {
  return (
    <Link to={to} className="flex items-center gap-3 py-4 spring-tap group">
      <Icon className="w-[18px] h-[18px] text-muted-foreground shrink-0" strokeWidth={1.8} />
      <span className="text-[15px] font-medium text-foreground flex-1">{label}</span>
      <span className="text-[13px] text-muted-foreground">{value}</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} />
    </Link>
  );
}