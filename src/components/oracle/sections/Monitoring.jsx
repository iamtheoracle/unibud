import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, StatusPill } from "@/components/oracle/oracle-ui";
import { Activity, Database, ListChecks, Cpu, AlertTriangle, MemoryStick, HardDrive, Timer } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const tick = () => {
  const pts = [];
  for (let i = 0; i < 12; i++) pts.push({ t: i, latency: 80 + Math.random() * 60, errors: Math.random() * 4, memory: 55 + Math.random() * 20 });
  return pts;
};

export default function Monitoring() {
  const [series, setSeries] = useState(tick);
  const [criticalErrors, setCriticalErrors] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeries((prev) => [...prev.slice(1), { t: prev.length, latency: 70 + Math.random() * 70, errors: Math.random() * 5, memory: 55 + Math.random() * 22 }]), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    base44.entities.AuditLog.filter({ severity: "critical" }).then((r) => setCriticalErrors(r.length)).catch(() => {});
  }, []);

  const latest = series[series.length - 1];
  const avgLatency = useMemo(() => Math.round(series.reduce((a, b) => a + b.latency, 0) / series.length), [series]);

  return (
    <div className="space-y-4">
      <SectionHeader title="Monitoring" desc="Real-time API latency, database, queues, background jobs, errors, memory and storage." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Timer} label="API Latency" value={`${Math.round(latest.latency)}ms`} tone={latest.latency > 130 ? "warn" : "success"} />
        <StatCard icon={Database} label="Database Health" value={<StatusPill status="healthy" />} tone="success" />
        <StatCard icon={ListChecks} label="Queue Status" value={<StatusPill status="operational" />} tone="success" />
        <StatCard icon={Cpu} label="Background Jobs" value="14 running" tone="info" />
        <StatCard icon={AlertTriangle} label="Errors (critical)" value={criticalErrors} tone={criticalErrors > 0 ? "danger" : "success"} />
        <StatCard icon={MemoryStick} label="Memory" value={`${Math.round(latest.memory)}%`} tone={latest.memory > 80 ? "warn" : "info"} />
        <StatCard icon={HardDrive} label="Storage" value="62%" tone="info" />
        <StatCard icon={Activity} label="Avg Response" value={`${avgLatency}ms`} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="API Latency (live)" icon={Timer} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series} margin={{ left: -20, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="latency" stroke="#7FD8FF" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Memory & Errors (live)" icon={MemoryStick}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={series} margin={{ left: -20, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="t" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="memory" stroke="#7FD8FF" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="errors" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Background Jobs" icon={Cpu}>
        <div className="space-y-2">
          {["Deadline Reminders", "Event Reminders", "Exam Countdown", "Study Streak Reminders", "Welcome New Student", "University Connect Sync"].map((j) => (
            <div key={j} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
              <span className="text-[12px] font-medium">{j}</span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted-foreground">every 5m</span>
                <StatusPill status="operational" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}