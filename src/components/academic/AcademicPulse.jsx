import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, AlertCircle, TrendingUp, MapPin, CheckCircle2 } from "lucide-react";
import { useAcademicData } from "@/lib/academic/useAcademicData";

const EASE = [0.16, 1, 0.3, 1];

/**
 * AcademicPulse — the live academic "Today" surface on the AcademicHub.
 * Shows the next class, the next deadline, and current GPA in one glass card.
 * Falls back to a shimmer skeleton while the academic API resolves.
 */
export default function AcademicPulse() {
  const { nextClass, nextDeadline, gpa, loading } = useAcademicData();

  if (loading) return <PulseSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="crystal-card p-3 flex divide-x divide-border/40"
    >
      <PulseTile
        to="/timetable"
        icon={nextClass ? Clock : CheckCircle2}
        accent={nextClass ? nextClass.color : "173 75% 38%"}
        label="Next class"
        value={nextClass ? nextClass.code : "Free today"}
        sub={nextClass ? `${nextClass.start} · ${nextClass.room}` : "Nothing scheduled"}
      />
      <PulseTile
        to="/assignments"
        icon={AlertCircle}
        accent={nextDeadline && nextDeadline.dueInDays < 0 ? "0 70% 55%" : nextDeadline ? nextDeadline.color : "173 75% 38%"}
        label="Next due"
        value={nextDeadline ? nextDeadline.title : "All caught up"}
        sub={nextDeadline ? dueLabel(nextDeadline.dueInDays, nextDeadline.code) : "No deadlines"}
      />
      <PulseTile
        to="/results"
        icon={TrendingUp}
        accent="221 83% 50%"
        label="GPA"
        value={gpa ? `${gpa.current.toFixed(2)}` : "—"}
        sub={gpa ? `Proj. ${gpa.projected.toFixed(2)} / ${gpa.scale.toFixed(1)}` : "—"}
      />
    </motion.div>
  );
}

function dueLabel(days, code) {
  if (days < 0) return `Overdue · ${code}`;
  if (days === 0) return `Today · ${code}`;
  if (days === 1) return `Tomorrow · ${code}`;
  return `In ${days} days · ${code}`;
}

function PulseTile({ to, icon: Icon, accent, label, value, sub }) {
  return (
    <Link to={to} className="flex-1 min-w-0 px-3 first:pl-0 last:pr-0 spring-tap">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `hsl(${accent} / 0.16)` }}>
          <Icon className="w-3 h-3" style={{ color: `hsl(${accent})` }} strokeWidth={2.2} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      </div>
      <p className="text-[13px] font-bold text-foreground leading-tight truncate">{value}</p>
      <p className="text-[10.5px] text-muted-foreground truncate mt-0.5">{sub}</p>
    </Link>
  );
}

function PulseSkeleton() {
  return (
    <div className="crystal-card p-3 flex divide-x divide-border/40">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex-1 px-3 first:pl-0 last:pr-0">
          <div className="h-5 w-16 rounded-md shimmer mb-1.5" />
          <div className="h-4 w-full rounded shimmer mb-1" />
          <div className="h-3 w-20 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}