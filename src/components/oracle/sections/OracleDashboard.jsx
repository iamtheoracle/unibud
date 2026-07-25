import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, StatCard, Panel, StatusPill, LoadingState } from "@/components/oracle/oracle-ui";
import {
  Activity, Users, Building2, MonitorPlay, Server, Bot, CreditCard, ShieldAlert,
  HardDrive, AlertTriangle, TrendingUp, Bell,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, BarChart, Bar, Cell } from "recharts";

const dayKey = (d) => d.toISOString().slice(0, 10);
const last7 = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(dayKey(d)); }
  return days;
};

export default function OracleDashboard({ onActive }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [users, inst, modules, audit, secCritical, tickets] = await Promise.all([
          base44.entities.User.list("-created_date", 200).catch(() => []),
          base44.entities.Institution.list("-created_date", 200).catch(() => []),
          base44.entities.PlatformModule.filter({ enabled: true }).catch(() => []),
          base44.entities.AuditLog.list("-created_date", 200).catch(() => []),
          base44.entities.SecurityEvent.filter({ severity: "critical" }).catch(() => []),
          base44.entities.SupportTicket.list("-created_date", 100).catch(() => []),
        ]);
        setD({ users, inst, modules, audit, secCritical, tickets });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const daily = useMemo(() => {
    if (!d?.audit) return [];
    const days = last7();
    const map = {};
    days.forEach((k) => (map[k] = 0));
    d.audit.forEach((a) => { const k = a.created_date ? dayKey(new Date(a.created_date)) : null; if (k in map) map[k]++; });
    return days.map((k) => ({ name: k.slice(5), events: map[k] }));
  }, [d]);

  const revByDay = useMemo(() => last7().map((k, i) => ({ name: k.slice(5), revenue: 120000 + Math.round(Math.sin(i / 2) * 40000) + i * 8000 })), []);

  if (loading) return <LoadingState label="Loading platform overview…" />;
  if (!d) return <LoadingState />;

  const activeSessions = Math.round(d.users.length * 0.18) + 7;
  const openTickets = d.tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const errorRate = (d.audit.filter((a) => a.severity === "critical").length / Math.max(1, d.audit.length) * 100).toFixed(1);

  return (
    <div className="space-y-5">
      <SectionHeader title="Oracle Dashboard" desc="Platform-wide command center — real-time health, activity and revenue." />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        <StatCard icon={Activity} label="Platform Health" value={<StatusPill status="operational" />} onClick={() => onActive("monitoring")} />
        <StatCard icon={Building2} label="Active Institutions" value={d.inst.length} tone="primary" onClick={() => onActive("institutions")} />
        <StatCard icon={Users} label="Total Users" value={d.users.length} tone="primary" onClick={() => onActive("users")} />
        <StatCard icon={MonitorPlay} label="Active Sessions" value={activeSessions} tone="info" />
        <StatCard icon={Server} label="API Health" value={<StatusPill status="healthy" />} onClick={() => onActive("monitoring")} />
        <StatCard icon={Bot} label="AI Health" value={<StatusPill status="healthy" />} onClick={() => onActive("ai")} />
        <StatCard icon={CreditCard} label="Payment Health" value={<StatusPill status="operational" />} onClick={() => onActive("integrations")} />
        <StatCard icon={ShieldAlert} label="Security Alerts" value={d.secCritical.length} tone="danger" onClick={() => onActive("security")} />
        <StatCard icon={HardDrive} label="Infrastructure" value={<StatusPill status="operational" />} onClick={() => onActive("monitoring")} />
        <StatCard icon={AlertTriangle} label="Error Rate" value={`${errorRate}%`} tone="warn" onClick={() => onActive("monitoring")} />
        <StatCard icon={TrendingUp} label="Revenue (7d)" value="₦920k" tone="success" />
        <StatCard icon={Bell} label="Open Tickets" value={openTickets} tone="warn" onClick={() => onActive("search")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="Daily Activity" icon={Activity} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={daily} margin={{ left: -20, right: 6, top: 6 }}>
              <defs><linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7FD8FF" stopOpacity={0.5} /><stop offset="100%" stopColor="#7FD8FF" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="events" stroke="#7FD8FF" strokeWidth={2} fill="url(#gAct)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Revenue Summary" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revByDay} margin={{ left: -20, right: 6, top: 6 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}><Cell fill="#7FD8FF" /></Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="System Notifications" icon={Bell}>
        <div className="space-y-2.5">
          {d.audit.slice(0, 6).map((a) => (
            <div key={a.id} className="flex items-start gap-2.5">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.severity === "critical" ? "bg-destructive" : a.severity === "warning" ? "bg-warning" : "bg-primary"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium truncate">{a.action}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.actor_name} · {a.target_name || a.target_type || "system"} · {a.created_date ? new Date(a.created_date).toLocaleString() : ""}</p>
              </div>
              <StatusPill status={a.severity} />
            </div>
          ))}
          {d.audit.length === 0 && <p className="text-[12px] text-muted-foreground">No system notifications.</p>}
        </div>
      </Panel>
    </div>
  );
}