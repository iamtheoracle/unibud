import React from "react";
import { motion } from "framer-motion";
import { Flame, Clock, Award, GraduationCap, Building2, Layers, CalendarRange } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1];

function computeStreak(sessions) {
  const dates = [...new Set(sessions.filter((s) => s.session_date).map((s) => s.session_date))].sort().reverse();
  let streak = 0;
  let check = new Date().toISOString().split("T")[0];
  for (const d of dates) {
    if (d === check) {
      streak++;
      const dt = new Date(check);
      dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().split("T")[0];
    } else if (d < check) break;
  }
  return streak;
}

/**
 * AcademicSnapshot — level, faculty, department, semester, streak,
 * learning hours, and CGPA (placeholder if unavailable) with elegant
 * progress indicators.
 */
export default function AcademicSnapshot({ user, sessions }) {
  const streak = computeStreak(sessions || []);
  const hours = (sessions || []).reduce((s, x) => s + (x.duration_minutes || 0), 0) / 60;
  const hoursRounded = Math.round(hours * 10) / 10;
  const cgpa = null;

  const items = [
    { icon: GraduationCap, label: "Current Level", value: user?.level || "—" },
    { icon: Building2, label: "Faculty", value: user?.faculty || "—" },
    { icon: Layers, label: "Department", value: user?.department || "—" },
    { icon: CalendarRange, label: "Semester", value: user?.semester || "—" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }} className="glass-card p-5">
      <h2 className="font-heading font-bold text-[16px] text-foreground mb-4">Academic Snapshot</h2>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-muted/40">
            <div className="w-9 h-9 rounded-xl bg-primary/12 text-primary flex items-center justify-center flex-shrink-0">
              <it.icon className="w-[18px] h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">{it.label}</p>
              <p className="text-[13px] font-semibold text-foreground truncate">{it.value}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={Flame} label="Streak" value={`${streak}d`} accent />
        <Stat icon={Clock} label="Hours" value={`${hoursRounded}h`} progress={Math.min(hours / 40, 1)} />
        <Stat icon={Award} label="CGPA" value={cgpa ? String(cgpa) : "—"} progress={cgpa ? cgpa / 5 : 0} />
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, progress, accent }) {
  return (
    <div className="flex flex-col items-center p-3 rounded-2xl bg-muted/40">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1.5 ${accent ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-heading font-bold text-[16px] text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      {progress !== undefined && (
        <div className="w-full h-1 rounded-full bg-muted mt-2 overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(progress * 100, 4)}%` }} />
        </div>
      )}
    </div>
  );
}