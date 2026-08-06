import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/academics/chartColors";
import ChartEmpty from "./ChartEmpty";

const fmt = (d) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function StudyStreakTimeline({ sessions = [], reduced }) {
  const c = useChartTheme();
  const data = useMemo(() => {
    return sessions
      .map((s) => ({ date: (s.session_date || s.started_at || "").slice(0, 10), streak: s.study_streak || 0 }))
      .filter((d) => d.date)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ date: fmt(d.date), streak: d.streak }));
  }, [sessions]);
  if (!data.length) return <ChartEmpty label="No study streak data yet — log a session to begin." />;
  return (
    <div className="w-full h-[170px]" role="img" aria-label="Study streak over time">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
          <defs>
            <linearGradient id="streakGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.accent} stopOpacity={0.4} />
              <stop offset="100%" stopColor={c.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={{ stroke: c.border }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [`${v} days`, "Streak"]} />
          <Area type="monotone" dataKey="streak" stroke={c.accent} strokeWidth={2.5} fill="url(#streakGrad)" isAnimationActive={!reduced} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}