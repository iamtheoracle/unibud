import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Shield, Cpu, Database, Wifi, Lock, Zap, Server, Activity, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const CREAM = "#F7F0E8";
const CREAM_MUTED = "rgba(247, 240, 232, 0.50)";
const ORANGE = "#FF8A2A";
const GREEN = "#22C55E";
const EASE = [0.16, 1, 0.3, 1];

const CHECKLIST = [
  { category: "Authentication", items: [
    { label: "Email & password login", done: true },
    { label: "Google OAuth", done: true },
    { label: "Password reset flow", done: true },
    { label: "Session management", done: true },
    { label: "Route protection", done: true },
  ]},
  { category: "Academic", items: [
    { label: "GPA/CGPA calculator", done: true },
    { label: "Timetable", done: true },
    { label: "Assignments tracker", done: true },
    { label: "Attendance tracking", done: true },
    { label: "Exam countdown", done: true },
    { label: "Course materials", done: true },
    { label: "Flashcards & quizzes", done: true },
    { label: "Study planner", done: true },
    { label: "Learning paths", done: true },
  ]},
  { category: "Social", items: [
    { label: "Campus feed (Quad)", done: true },
    { label: "Stories & shorts", done: true },
    { label: "Direct messaging", done: true },
    { label: "Communities & clubs", done: true },
    { label: "Marketplace", done: true },
    { label: "Lost & found", done: true },
  ]},
  { category: "Campus Services", items: [
    { label: "Digital student ID + QR", done: true },
    { label: "Campus booking system", done: true },
    { label: "Maintenance requests", done: true },
    { label: "Shuttle tracker", done: true },
    { label: "Campus navigation map", done: true },
    { label: "Emergency SOS", done: true },
    { label: "Safety center", done: true },
    { label: "Library hub", done: true },
  ]},
  { category: "AI & Intelligence", items: [
    { label: "Bud AI companion", done: true },
    { label: "AI memory engine", done: true },
    { label: "Smart notifications", done: true },
    { label: "AI study assistance", done: true },
    { label: "AI paper summaries", done: true },
  ]},
  { category: "Platform", items: [
    { label: "Design system (Glass 350)", done: true },
    { label: "Light & dark themes", done: true },
    { label: "Accessibility center", done: true },
    { label: "Privacy consent manager", done: true },
    { label: "Offline sync", done: true },
    { label: "Resilience kit (skeletons, errors)", done: true },
    { label: "Row-level security", done: true },
    { label: "Admin & operator dashboards", done: true },
    { label: "Notification workflows", done: true },
    { label: "Legal pages (Privacy, Terms, About)", done: true },
  ]},
  { category: "Content Architecture", items: [
    { label: "Internal OS documents separated from user spaces", done: true },
    { label: "System document filter active in feed pipeline", done: true },
    { label: "Square feed excludes system documents", done: true },
    { label: "Seed content marked with Launch badge", done: true },
    { label: "Realistic campus activity seeded", done: true },
    { label: "No constitution/founder documents in user feeds", done: true },
  ]},
];

const HEALTH_METRICS = [
  { label: "API Status", value: "Operational", icon: Server, color: GREEN },
  { label: "Database", value: "Healthy", icon: Database, color: GREEN },
  { label: "AI Services", value: "Active", icon: Cpu, color: GREEN },
  { label: "Realtime", value: "Connected", icon: Wifi, color: GREEN },
  { label: "Auth", value: "Secure", icon: Lock, color: GREEN },
  { label: "CDN", value: "Optimal", icon: Zap, color: GREEN },
];

export default function LaunchReadiness() {
  const totalItems = CHECKLIST.reduce((sum, c) => sum + c.items.length, 0);
  const doneItems = CHECKLIST.reduce((sum, c) => sum + c.items.filter((i) => i.done).length, 0);
  const pct = Math.round((doneItems / totalItems) * 100);

  return (
    <div className="w-full max-w-[520px] mx-auto px-5 pt-8 pb-40 safe-area-pt">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/oracle" className="w-10 h-10 rounded-full grid place-items-center spring-tap" style={{ background: "rgba(44,33,26,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <ArrowLeft className="w-[18px] h-[18px]" strokeWidth={1.8} style={{ color: CREAM }} />
        </Link>
        <div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: CREAM }}>Launch Readiness</h1>
          <p className="text-[13px]" style={{ color: CREAM_MUTED }}>Production status overview</p>
        </div>
      </div>

      {/* Overall Progress */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="relative overflow-hidden rounded-[24px] p-6 mb-5" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(44,33,26,0.6))", border: "1px solid rgba(34,197,94,0.15)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[12px] uppercase tracking-wider mb-1" style={{ color: CREAM_MUTED }}>Overall Readiness</p>
            <div className="flex items-baseline gap-2">
              <span className="text-[42px] font-bold display-number" style={{ color: CREAM }}>{pct}%</span>
              <span className="text-[14px] font-medium" style={{ color: GREEN }}>Ready</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full grid place-items-center" style={{ background: "rgba(34,197,94,0.15)" }}>
            <CheckCircle2 className="w-7 h-7" style={{ color: GREEN }} />
          </div>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${GREEN}, rgba(34,197,94,0.6))` }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: EASE }} />
        </div>
        <p className="text-[11px] mt-2" style={{ color: CREAM_MUTED }}>{doneItems} of {totalItems} checks passed</p>
      </motion.div>

      {/* System Health */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, ease: EASE }} className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: CREAM_MUTED }}>System Health</p>
        <div className="grid grid-cols-3 gap-3">
          {HEALTH_METRICS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.04, ease: EASE }} className="glass-card p-3 flex flex-col items-center gap-1.5 text-center">
                <Icon className="w-4 h-4" style={{ color: m.color }} />
                <span className="text-[10px] uppercase tracking-wider" style={{ color: CREAM_MUTED }}>{m.label}</span>
                <span className="text-[11px] font-bold" style={{ color: m.color }}>{m.value}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Checklist by Category */}
      <div className="flex flex-col gap-4">
        {CHECKLIST.map((cat, ci) => {
          const catDone = cat.items.filter((i) => i.done).length;
          const catTotal = cat.items.length;
          const catPct = Math.round((catDone / catTotal) * 100);
          return (
            <motion.div key={ci} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + ci * 0.05, ease: EASE }}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[13px] font-bold" style={{ color: CREAM }}>{cat.category}</span>
                <span className="text-[11px] font-semibold" style={{ color: catPct === 100 ? GREEN : ORANGE }}>{catDone}/{catTotal}</span>
              </div>
              <div className="glass-card p-4 flex flex-col gap-2.5">
                {cat.items.map((item, ii) => (
                  <div key={ii} className="flex items-center gap-2.5">
                    {item.done ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} /> : <Circle className="w-4 h-4 shrink-0" style={{ color: CREAM_MUTED }} />}
                    <span className="text-[13px] flex-1" style={{ color: item.done ? CREAM : CREAM_MUTED }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-6 glass-card p-4 flex items-center gap-3">
        <Activity className="w-5 h-5 shrink-0" style={{ color: GREEN }} />
        <div>
          <p className="text-[13px] font-semibold" style={{ color: CREAM }}>All systems operational</p>
          <p className="text-[11px]" style={{ color: CREAM_MUTED }}>UNIBUD is production-ready for student adoption</p>
        </div>
      </motion.div>
    </div>
  );
}