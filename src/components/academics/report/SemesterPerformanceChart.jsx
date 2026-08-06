import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/academics/chartColors";
import ChartEmpty from "./ChartEmpty";

export default function SemesterPerformanceChart({ courses = [], reduced }) {
  const c = useChartTheme();
  const data = courses.slice(0, 8).map((co) => ({ code: co.course_code, average: Math.round(co.average) }));
  if (!data.length) return <ChartEmpty label="No course averages yet — grades will populate this chart." />;
  return (
    <div className="w-full h-[180px]" role="img" aria-label="Course averages this semester">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="code" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={{ stroke: c.border }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [`${v}%`, "Average"]} />
          <Bar dataKey="average" radius={[6, 6, 0, 0]} isAnimationActive={!reduced}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.average >= 70 ? c.success : d.average >= 50 ? c.accent : d.average >= 40 ? c.warning : c.primary} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}