import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/academics/chartColors";
import ChartEmpty from "./ChartEmpty";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function WeeklyStudyChart({ sessions = [], reduced }) {
  const c = useChartTheme();
  const data = useMemo(() => {
    const map = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      map[d.toISOString().slice(0, 10)] = { day: DAYS[d.getDay()], minutes: 0 };
    }
    sessions.forEach((s) => {
      const key = (s.session_date || s.started_at || "").slice(0, 10);
      if (map[key]) map[key].minutes += s.duration_minutes || 0;
    });
    return Object.values(map);
  }, [sessions]);
  const total = data.reduce((s, d) => s + d.minutes, 0);
  if (!sessions.length || total === 0) return <ChartEmpty label="No study time logged in the last 7 days." />;
  return (
    <div className="w-full h-[170px]" role="img" aria-label="Minutes studied over the last 7 days">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={{ stroke: c.border }} />
          <YAxis tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [`${v} min`, "Studied"]} />
          <Bar dataKey="minutes" fill={c.accent} radius={[6, 6, 0, 0]} isAnimationActive={!reduced} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}