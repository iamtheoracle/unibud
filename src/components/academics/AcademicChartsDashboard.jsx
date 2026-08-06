import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import { TrendingUp, Flame, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { EASE } from "@/lib/motion/motionPresets";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import EmptyState from "@/components/ui/EmptyState";

// ── Data transforms (pure functions, no hooks) ──

/** Group grades by date → average GPA on 5.0 scale per date. */
function buildGpaTrend(grades) {
  if (!grades?.length) return [];
  const byDate = {};
  grades.forEach((g) => {
    const date = g.date || g.created_date?.slice(0, 10);
    if (!date) return;
    if (!byDate[date]) byDate[date] = [];
    const pct = (g.score || 0) / (g.max_score || 100);
    if (pct > 0) byDate[date].push(pct);
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, pcts]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      gpa: +((pcts.reduce((s, p) => s + p, 0) / pcts.length) * 5.0).toFixed(2),
    }));
}

/** Group study sessions by date → streak (max) and total minutes. */
function buildStreakData(sessions) {
  if (!sessions?.length) return [];
  const byDate = {};
  sessions.forEach((s) => {
    const date = s.session_date || s.started_at?.slice(0, 10) || s.created_date?.slice(0, 10);
    if (!date) return;
    if (!byDate[date]) byDate[date] = { streak: 0, minutes: 0 };
    byDate[date].streak = Math.max(byDate[date].streak, s.study_streak || 0);
    byDate[date].minutes += s.duration_minutes || 0;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([date, d]) => ({
      date,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      streak: d.streak,
      minutes: d.minutes,
    }));
}

/** Group assignments by week → completed vs pending counts. */
function buildAssignmentProgress(assignments) {
  if (!assignments?.length) return [];
  const byWeek = {};
  assignments.forEach((a) => {
    const dateStr = a.due_date?.slice(0, 10) || a.created_date?.slice(0, 10);
    if (!dateStr) return;
    const d = new Date(dateStr);
    const day = d.getDay();
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    const weekKey = d.toISOString().slice(0, 10);
    if (!byWeek[weekKey]) byWeek[weekKey] = { completed: 0, pending: 0 };
    if (["submitted", "graded"].includes(a.status)) byWeek[weekKey].completed += 1;
    else byWeek[weekKey].pending += 1;
  });
  return Object.entries(byWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([week, d]) => ({
      week,
      label: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      completed: d.completed,
      pending: d.pending,
    }));
}

// ── Shared tooltip style (token-based) ──
const tooltipStyle = {
  backgroundColor: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "12px",
  fontSize: "12px",
  color: "hsl(var(--popover-foreground))",
  boxShadow: "var(--shadow-soft)",
  padding: "8px 12px",
};

const axisTickStyle = { fontSize: 10, fill: "hsl(var(--muted-foreground))" };

/**
 * AcademicChartsDashboard — visual progress dashboard for the Academics tab.
 * Charts GPA trends, study streaks, and assignment completion from real entity data.
 *
 * Props:
 *  - grades: Grade[] (already fetched by parent)
 *  - sessions: StudySession[] (already fetched by parent)
 */
export default function AcademicChartsDashboard({ grades = [], sessions = [] }) {
  const isOnline = useOnlineStatus();

  // Fetch a larger set of assignments for trend charting
  const { data: assignments } = useQuery({
    queryKey: ["academics", "chart-assignments"],
    queryFn: () => base44.entities.Assignment.list("-due_date", 50),
    enabled: isOnline,
  });

  const gpaData = useMemo(() => buildGpaTrend(grades), [grades]);
  const streakData = useMemo(() => buildStreakData(sessions), [sessions]);
  const assignmentData = useMemo(() => buildAssignmentProgress(assignments || []), [assignments]);

  const hasAnyData = gpaData.length > 0 || streakData.length > 0 || assignmentData.length > 0;

  if (!hasAnyData) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="No progress data yet"
        description="Your GPA trends, study streaks, and assignment completion will appear here once you start logging grades, study sessions, and assignments."
        budGuidance="Add a grade or log a study session — I'll chart your progress automatically."
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="space-y-3"
    >
      <h2 className="text-[15px] font-bold text-foreground px-1">Progress Dashboard</h2>

      {/* GPA Trend */}
      {gpaData.length > 0 && (
        <ChartCard icon={TrendingUp} title="GPA Trend" subtitle="Average grade performance (5.0 scale)">
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={gpaData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={axisTickStyle} axisLine={false} tickLine={false} width={35} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [v, "GPA"]} />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#gpaGradient)"
                animationDuration={800}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Study Streak */}
      {streakData.length > 0 && (
        <ChartCard icon={Flame} title="Study Streak" subtitle="Consecutive days studied & study time">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={streakData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={35} allowDecimals={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v, name) => [
                  name === "streak" ? `${v} days` : `${v} min`,
                  name === "streak" ? "Streak" : "Study Time",
                ]}
              />
              <Bar dataKey="streak" radius={[6, 6, 0, 0]} animationDuration={600} animationEasing="ease-out">
                {streakData.map((_, i) => (
                  <Cell key={i} fill="hsl(var(--primary))" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Assignment Completion */}
      {assignmentData.length > 0 && (
        <ChartCard icon={CheckCircle} title="Assignment Completion" subtitle="Submitted vs pending over time">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={assignmentData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="label" tick={axisTickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} width={35} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="completed" stackId="a" fill="hsl(var(--primary))" animationDuration={600} animationEasing="ease-out" />
              <Bar dataKey="pending" stackId="a" fill="hsl(var(--muted-foreground))" fillOpacity={0.3} radius={[6, 6, 0, 0]} animationDuration={600} animationEasing="ease-out" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </motion.div>
  );
}

/** Reusable glass card wrapper for each chart. */
function ChartCard({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="p-4 rounded-[20px] glass">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-primary" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[13px] font-bold text-foreground truncate">{title}</h3>
          <p className="text-[10px] text-muted-foreground truncate">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}