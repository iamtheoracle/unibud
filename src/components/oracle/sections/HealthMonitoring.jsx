import React, { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertTriangle, Server, Database, HardDrive, Cpu, Zap } from "lucide-react";

const SERVICES = [
  { name: "Authentication", icon: Server, status: "operational" },
  { name: "Database", icon: Database, status: "operational" },
  { name: "File Storage", icon: HardDrive, status: "operational" },
  { name: "Integrations", icon: Zap, status: "degraded" },
  { name: "Workflows", icon: Cpu, status: "operational" },
  { name: "Notifications", icon: Activity, status: "operational" },
];

export default function HealthMonitoring() {
  const [uptime] = useState(99.97);
  const ok = SERVICES.filter((s) => s.status === "operational").length;
  return (
    <div className="space-y-5">
      <div><h1 className="text-[20px] font-heading font-bold">Health Monitoring</h1><p className="text-[13px] text-muted-foreground">Real-time system health and uptime.</p></div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi label="Uptime (30d)" value={`${uptime}%`} icon={CheckCircle2} tone="success" />
        <Kpi label="Services OK" value={`${ok}/${SERVICES.length}`} icon={Activity} />
        <Kpi label="Incidents" value="0" icon={AlertTriangle} tone="warn" />
        <Kpi label="Avg latency" value="142ms" icon={Zap} />
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {SERVICES.map((s) => {
          const Icon = s.icon;
          const on = s.status === "operational";
          return (
            <div key={s.name} className="glass-card radius-lg p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted/40 grid place-items-center"><Icon className="w-5 h-5 text-muted-foreground" /></div>
              <div className="flex-1"><p className="font-semibold text-[14px]">{s.name}</p><p className="text-[12px] text-muted-foreground capitalize">{s.status}</p></div>
              <span className={`w-2.5 h-2.5 rounded-full ${on ? "bg-success" : "bg-warning"} ${!on ? "animate-pulse" : ""}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

const Kpi = ({ label, value, icon: Icon, tone }) => (
  <div className="glass-card radius-lg p-4"><div className="flex items-center gap-2"><Icon className={`w-4 h-4 ${tone === "success" ? "text-success" : tone === "warn" ? "text-warning" : "text-primary"}`} /><span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span></div><p className="text-[22px] font-heading font-bold mt-1">{value}</p></div>
);