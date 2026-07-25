import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, GraduationCap, ClipboardList, TrendingUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, PortalPageHeader, DashboardCard } from "@/components/portal/PortalUI";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid,
} from "recharts";

const TOOLTIP = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 12,
  fontSize: 12,
  color: "hsl(var(--foreground))",
};
const ACCENT = "hsl(var(--primary))";
const MUTED = "hsl(var(--muted-foreground) / 0.4)";

export default function LecturerAnalytics() {
  const { data: grades } = useQuery({ queryKey: ["lecGrades"], queryFn: () => base44.entities.Grade.list(), retry: false });
  const { data: assignments } = useQuery({ queryKey: ["lecAssignments"], queryFn: () => base44.entities.Assignment.list(), retry: false });
  const { data: courses } = useQuery({ queryKey: ["lecCourses"], queryFn: () => base44.entities.Course.list(), retry: false });

  const allGrades = grades || [];
  const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  allGrades.forEach((g) => {
    const pct = (g.score / (g.max_score || 100)) * 100;
    const b = pct >= 70 ? "A" : pct >= 60 ? "B" : pct >= 50 ? "C" : pct >= 45 ? "D" : "F";
    buckets[b]++;
  });
  const gradeData = Object.entries(buckets).map(([name, value]) => ({ name, value }));

  const allAssignments = assignments || [];
  const completed = allAssignments.filter((a) => a.status === "completed" || a.status === "graded").length;
  const pending = allAssignments.filter((a) => a.status === "pending").length;
  const overdue = allAssignments.filter((a) => a.status === "overdue").length;
  const statusData = [
    { name: "Completed", value: completed, color: "hsl(var(--success))" },
    { name: "Pending", value: pending, color: "hsl(var(--warning))" },
    { name: "Overdue", value: overdue, color: "hsl(var(--error))" },
  ].filter((d) => d.value > 0);

  const allCourses = courses || [];
  const progressData = allCourses.slice(0, 8).map((c) => ({ name: c.code || (c.title || "").slice(0, 10), progress: c.progress || 0 }));

  const completionRate = allAssignments.length ? Math.round((completed / allAssignments.length) * 100) : 0;
  const avgScore = allGrades.length
    ? Math.round((allGrades.reduce((s, g) => s + (g.score / (g.max_score || 100)) * 100, 0) / allGrades.length))
    : 0;

  return (
    <div className="space-y-6">
      <PortalPageHeader title="Academic Analytics" subtitle="Performance, completion, and engagement insights." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={GraduationCap} value={`${avgScore}%`} title="Avg Score" accent="primary" delay={0} />
        <DashboardCard icon={ClipboardList} value={`${completionRate}%`} title="Completion" accent="success" delay={0.05} />
        <DashboardCard icon={BarChart3} value={allGrades.length} title="Grades Logged" accent="info" delay={0.1} />
        <DashboardCard icon={TrendingUp} value={allCourses.length} title="Active Courses" accent="warning" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Grade Distribution" description="Student performance bands" delay={0.2}>
          <div className="p-5 h-[260px]">
            {allGrades.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={MUTED} vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
                  <Bar dataKey="value" fill={ACCENT} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No grades logged yet" />
            )}
          </div>
        </SectionCard>

        <SectionCard title="Assignment Status" description="Completion across assessments" delay={0.25}>
          <div className="p-5 h-[260px] flex flex-col">
            {statusData.length > 0 ? (
              <>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3} stroke="none">
                        {statusData.map((d) => (
                          <Cell key={d.name} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span className="text-[11px] font-medium text-foreground">{d.name}</span>
                      <span className="text-[11px] font-bold text-foreground">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyChart label="No assignments yet" />
            )}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Course Progress" description="Completion across your courses" delay={0.3}>
        <div className="p-5 h-[240px]">
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={MUTED} horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={64} />
                <Tooltip contentStyle={TOOLTIP} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
                <Bar dataKey="progress" fill={ACCENT} radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="No courses yet" />
          )}
        </div>
      </SectionCard>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-full flex items-center justify-center">
      <p className="text-[13px] text-muted-foreground">{label}</p>
    </div>
  );
}