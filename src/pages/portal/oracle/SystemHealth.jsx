import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Server, Database, Zap, HardDrive, Cpu, Activity, Shield, Clock, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, StatusPill } from "@/components/portal/PortalUI";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";

const apiResponseData = [
  { time: "00:00", ms: 38 }, { time: "04:00", ms: 42 }, { time: "08:00", ms: 55 },
  { time: "12:00", ms: 48 }, { time: "16:00", ms: 62 }, { time: "20:00", ms: 41 },
];

const activeSessionsData = [
  { time: "Mon", sessions: 420 }, { time: "Tue", sessions: 510 }, { time: "Wed", sessions: 480 },
  { time: "Thu", sessions: 620 }, { time: "Fri", sessions: 590 }, { time: "Sat", sessions: 310 },
  { time: "Sun", sessions: 280 },
];

export default function SystemHealth() {
  const { data: users } = useQuery({
    queryKey: ["portalUsers"],
    queryFn: () => base44.entities.User.list(),
    retry: false,
  });

  const { data: modules } = useQuery({
    queryKey: ["portalModules"],
    queryFn: () => base44.entities.PlatformModule.list(),
    retry: false,
  });

  const systems = [
    { name: "API Gateway", icon: Server, status: "operational", detail: "42ms avg response", uptime: "99.98%" },
    { name: "Database", icon: Database, status: "operational", detail: "MongoDB cluster", uptime: "99.99%" },
    { name: "Realtime Service", icon: Zap, status: "operational", detail: "WebSocket connections", uptime: "99.95%" },
    { name: "File Storage", icon: HardDrive, status: "operational", detail: "38.2 GB / 500 GB", uptime: "100%" },
    { name: "Compute", icon: Cpu, status: "operational", detail: "24% CPU load", uptime: "99.97%" },
    { name: "Authentication", icon: Shield, status: "operational", detail: "JWT + OAuth", uptime: "99.99%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">System Health</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Real-time monitoring of all platform services and infrastructure.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Activity} label="Overall Status" value="Healthy" sublabel="All systems operational" accent="success" />
        <KpiCard icon={Users} label="Active Users" value={users?.length || 0} sublabel="Total registered" accent="primary" />
        <KpiCard icon={Server} label="Avg Response" value="42ms" sublabel="API gateway" accent="info" />
        <KpiCard icon={Clock} label="Uptime" value="99.98%" sublabel="Last 30 days" accent="success" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="API Response Time" description="Average response time over 24 hours">
          <div className="p-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiResponseData}>
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                <Line type="monotone" dataKey="ms" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Active Sessions" description="Daily active sessions this week">
          <div className="p-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activeSessionsData}>
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", fontSize: "12px" }} />
                <defs>
                  <linearGradient id="sessionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#sessionGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Service Status */}
      <SectionCard title="Service Status" description="All platform services and their current health">
        <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map((sys) => (
            <div key={sys.name} className="bg-muted/30 rounded-xl p-4 border border-border/20">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <sys.icon className="w-5 h-5 text-success" />
                </div>
                <StatusPill status={sys.status} />
              </div>
              <p className="text-[13px] font-semibold text-foreground">{sys.name}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{sys.detail}</p>
              <p className="text-[11px] text-success font-semibold mt-1.5">{sys.uptime} uptime</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}