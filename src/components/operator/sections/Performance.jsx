import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, LoadingState } from "@/components/management/management-ui";
import { TrendingUp, CheckCircle2, Clock, Gauge, Hourglass } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const todayStr = () => new Date().toISOString().slice(0, 10);
const last7 = () => { const out = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push({ key: d.toISOString().slice(0, 10), label: d.toLocaleDateString(undefined, { weekday: "short" }) }); } return out; };

export default function Performance({ institutionId, user }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const tasks = await base44.entities.ManagementTask.filter({ institution_id: institutionId }, "-created_date", 500);
        const me = user?.full_name;
        const mine = tasks.filter((t) => t.assignee === me || t.created_by_id === user.id);
        const completed = mine.filter((t) => t.status === "completed");
        const pending = mine.filter((t) => t.status !== "completed" && t.status !== "archived");
        const avgMs = completed.reduce((s, t) => { if (t.created_date && t.updated_date) return s + (new Date(t.updated_date) - new Date(t.created_date)); return s; }, 0);
        const avgHrs = completed.length ? Math.round((avgMs / completed.length) / 3600000 * 10) / 10 : 0;
        const accuracy = mine.length ? Math.round((completed.length / mine.length) * 100) : 0;
        const days = last7();
        const productivity = days.map((d) => ({ ...d, done: completed.filter((t) => t.updated_date && t.updated_date.slice(0, 10) === d.key).length }));
        setData({ completed: completed.length, avgHrs, accuracy, pending: pending.length, productivity });
      } catch { setData({ completed: 0, avgHrs: 0, accuracy: 0, pending: 0, productivity: last7().map((d) => ({ ...d, done: 0 })) }); }
    })();
  }, [institutionId, user]);

  if (!data) return <LoadingState />;

  return (
    <div>
      <SectionHeader title="Performance" desc="Your productivity — tasks completed, average completion time, accuracy, pending tasks and daily productivity." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard icon={CheckCircle2} label="Tasks Completed" value={data.completed} tone="success" />
        <StatCard icon={Clock} label="Avg Completion" value={`${data.avgHrs}h`} tone="info" />
        <StatCard icon={Gauge} label="Accuracy" value={`${data.accuracy}%`} tone="primary" />
        <StatCard icon={Hourglass} label="Pending Tasks" value={data.pending} tone="warn" />
      </div>
      <Panel title="Daily Productivity (last 7 days)" icon={TrendingUp}>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.productivity}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <YAxis allowDecimals={false} stroke="hsl(var(--muted-foreground))" fontSize={11} />
            <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="done" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}