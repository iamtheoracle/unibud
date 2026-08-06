import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/academics/chartColors";
import ChartEmpty from "./ChartEmpty";

export default function GpaProgressChart({ data = [], reduced }) {
  const c = useChartTheme();
  if (!data.length) return <ChartEmpty label="No GPA history yet — published grades will chart here." />;
  return (
    <div className="w-full h-[180px]" role="img" aria-label="GPA progression across semesters">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -18 }}>
          <CartesianGrid stroke={c.border} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="semester" tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={{ stroke: c.border }} />
          <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: c.muted }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle()} formatter={(v) => [Number(v).toFixed(2), "GPA"]} />
          <Line type="monotone" dataKey="gpa" stroke={c.accent} strokeWidth={2.5} dot={{ r: 3, fill: c.accent }} isAnimationActive={!reduced} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}