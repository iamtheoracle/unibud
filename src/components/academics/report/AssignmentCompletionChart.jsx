import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useChartTheme, tooltipStyle } from "@/lib/academics/chartColors";
import ChartEmpty from "./ChartEmpty";

export default function AssignmentCompletionChart({ report, reduced }) {
  const c = useChartTheme();
  if (!report.totalAssignments) return <ChartEmpty label="No assignments tracked yet." />;
  const completed = report.completedAssignments;
  const remaining = Math.max(0, report.totalAssignments - completed);
  const data = [
    { name: "Completed", value: completed },
    { name: "Remaining", value: remaining },
  ];
  return (
    <div className="w-full h-[170px] flex items-center" role="img" aria-label="Assignment completion donut">
      <div className="w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={42} outerRadius={66} paddingAngle={2} stroke={c.border} isAnimationActive={!reduced}>
              <Cell fill={c.success} />
              <Cell fill={c.muted} />
            </Pie>
            <Tooltip contentStyle={tooltipStyle()} formatter={(v, n) => [`${v} ${n.toLowerCase()}`, "Assignments"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-1/2 pl-3">
        <p className="font-heading font-extrabold text-[26px] text-foreground leading-none">
          {Math.round(report.assignmentCompletionRate * 100)}%
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">completion rate</p>
        <div className="flex items-center gap-3 mt-3 text-[11px] text-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.success }} /> Done {completed}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.muted }} /> Left {remaining}
          </span>
        </div>
      </div>
    </div>
  );
}