import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Users, Building2, LifeBuoy, Flag, Layers, Bell, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

export default function OracleOverview({ onActive }) {
  const [data, setData] = useState({ users: 0, institutions: 0, tickets: [], reports: 0, modules: 0, audit: [] });

  useEffect(() => {
    (async () => {
      try {
        const [users, inst, tickets, reports, modules, audit] = await Promise.all([
          base44.entities.User.list("-created_date", 1).catch(() => []),
          base44.entities.Institution.list("-created_date", 1).catch(() => []),
          base44.entities.SupportTicket.list("-created_date", 50).catch(() => []),
          base44.entities.ContentReport.filter({ status: "pending" }).catch(() => []),
          base44.entities.PlatformModule.filter({ enabled: true }).catch(() => []),
          base44.entities.AuditLog.list("-created_date", 8).catch(() => []),
        ]);
        setData({ users: users.length, institutions: inst.length, tickets, reports: reports.length, modules: modules.length, audit });
      } catch {}
    })();
  }, []);

  const byStatus = ["open", "in_progress", "resolved", "escalated"].map((s) => ({ name: s, count: data.tickets.filter((t) => t.status === s).length }));

  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Oracle</h1><p className="text-[13px] text-muted-foreground">Platform command center — real-time overview.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Widget icon={Users} label="Users" value={data.users} onClick={() => onActive("users")} />
        <Widget icon={Building2} label="Institutions" value={data.institutions} onClick={() => onActive("institutions")} />
        <Widget icon={LifeBuoy} label="Tickets" value={data.tickets.length} onClick={() => onActive("support")} />
        <Widget icon={Flag} label="Pending reports" value={data.reports} tone="warn" onClick={() => onActive("moderation")} />
        <Widget icon={Layers} label="Modules on" value={data.modules} onClick={() => onActive("featureflags")} />
        <Widget icon={Bell} label="Notifs" value={data.audit.length} onClick={() => onActive("notifications")} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card radius-lg p-4 lg:col-span-1">
          <p className="text-[13px] font-heading font-semibold mb-2 flex items-center gap-1.5"><Activity className="w-4 h-4 text-primary" />Activity feed</p>
          {data.audit.length === 0 ? <p className="text-[12px] text-muted-foreground">No activity.</p> :
            <div className="space-y-2.5">{data.audit.map((a) => (
              <div key={a.id} className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" /><div className="min-w-0"><p className="text-[12px] font-medium truncate">{a.action}</p><p className="text-[11px] text-muted-foreground truncate">{a.actor_name} · {a.created_date ? new Date(a.created_date).toLocaleString() : ""}</p></div></div>
            ))}</div>}
        </div>

        <div className="glass-card radius-lg p-4 lg:col-span-2">
          <p className="text-[13px] font-heading font-semibold mb-2 flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary" />Support tickets by status</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byStatus}><XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" /><Tooltip cursor={{ fill: "hsl(var(--muted)/0.3)" }} /><Bar dataKey="count" radius={[6, 6, 0, 0]}><Cell fill="#7FD8FF" /></Bar></BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-heading font-semibold mb-2">Support Kanban</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {["open", "in_progress", "resolved", "escalated"].map((s) => (
            <div key={s} className="glass-card radius-lg p-3 min-h-[160px]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 capitalize">{s.replace("_", " ")} ({data.tickets.filter((t) => t.status === s).length})</p>
              <div className="space-y-2">{data.tickets.filter((t) => t.status === s).slice(0, 5).map((t) => (
                <div key={t.id} className="bg-muted/30 rounded-lg p-2"><p className="text-[12px] font-medium truncate">{t.subject}</p><p className="text-[11px] text-muted-foreground capitalize">{t.category} · {t.priority}</p></div>
              ))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const Widget = ({ icon: Icon, label, value, tone, onClick }) => (
  <button onClick={onClick} className="glass-card radius-lg p-4 text-left card-hover">
    <div className="flex items-center gap-2"><Icon className={`w-4 h-4 ${tone === "warn" ? "text-warning" : "text-primary"}`} /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span></div>
    <p className="text-[26px] font-heading font-bold mt-1">{value}</p>
  </button>
);