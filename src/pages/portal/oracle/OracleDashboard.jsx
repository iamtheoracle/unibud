import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, Boxes, LifeBuoy, Activity, Shield, Zap, Server, Database, Cpu, HardDrive, ScrollText } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { KpiCard, SectionCard, StatusPill, DataTable } from "@/components/portal/PortalUI";
import { PLATFORM_MODULES, MODULE_CATEGORIES } from "@/lib/portalConfig";

export default function OracleDashboard({ user }) {
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

  const { data: auditLogs } = useQuery({
    queryKey: ["portalAuditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 8),
    retry: false,
  });

  const { data: tickets } = useQuery({
    queryKey: ["portalTickets"],
    queryFn: () => base44.entities.SupportTicket.filter({ status: "open" }),
    retry: false,
  });

  const moduleList = modules || PLATFORM_MODULES;
  const enabledCount = moduleList.filter((m) => m.enabled !== false).length;
  const disabledCount = moduleList.length - enabledCount;

  const universities = [...new Set((users || []).map((u) => u.university).filter(Boolean))];

  const auditColumns = [
    { key: "action", header: "Action", render: (row) => <span className="font-medium">{row.action}</span> },
    { key: "actor_name", header: "Actor", render: (row) => row.actor_name },
    { key: "target_name", header: "Target", render: (row) => row.target_name || "—" },
    {
      key: "severity", header: "Severity", render: (row) => <StatusPill status={row.severity} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-extrabold text-[26px] tracking-tight text-foreground">Oracle Console</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">Supreme platform authority — full control over UNIBUD.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Total Users" value={users?.length || 0} sublabel={`${universities.length} universities`} accent="primary" delay={0} />
        <KpiCard icon={Boxes} label="Active Modules" value={enabledCount} sublabel={`${disabledCount} disabled`} accent="success" delay={0.05} />
        <KpiCard icon={LifeBuoy} label="Open Tickets" value={tickets?.length || 0} sublabel="Awaiting response" accent="warning" delay={0.1} />
        <KpiCard icon={Activity} label="System Status" value="Healthy" sublabel="All systems operational" accent="info" delay={0.15} />
      </div>

      {/* Module Status Overview */}
      <SectionCard title="Module Status" description="Platform module health by category" delay={0.2}>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODULE_CATEGORIES.map((cat) => {
            const catModules = moduleList.filter((m) => m.category === cat.key);
            const catEnabled = catModules.filter((m) => m.enabled !== false).length;
            return (
              <div key={cat.key} className="bg-muted/40 rounded-xl p-3.5 border border-border/20">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{cat.label}</p>
                <p className="text-[20px] font-heading font-bold text-foreground">{catEnabled}/{catModules.length}</p>
                <div className="mt-2 h-1.5 rounded-full bg-border/30 overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${catModules.length ? (catEnabled / catModules.length) * 100 : 0}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* System Health + Recent Audit */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="System Health" description="Real-time platform monitoring" delay={0.25}>
          <div className="p-5 space-y-3">
            {[
              { name: "API Gateway", icon: Server, status: "operational", detail: "42ms avg response" },
              { name: "Database", icon: Database, status: "operational", detail: "99.98% uptime" },
              { name: "Realtime Service", icon: Zap, status: "operational", detail: "1,247 active connections" },
              { name: "Storage", icon: HardDrive, status: "operational", detail: "38.2 GB / 500 GB used" },
              { name: "Compute", icon: Cpu, status: "operational", detail: "24% CPU load" },
            ].map((sys) => (
              <div key={sys.name} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <sys.icon className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{sys.name}</p>
                  <p className="text-[11px] text-muted-foreground">{sys.detail}</p>
                </div>
                <StatusPill status={sys.status} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" description="Latest platform audit events" delay={0.3}>
          <DataTable
            columns={auditColumns}
            data={auditLogs || []}
            emptyMessage="No audit events recorded yet"
          />
        </SectionCard>
      </div>

      {/* Quick Actions */}
      <SectionCard title="Oracle Quick Actions" description="Execute platform-wide commands" delay={0.35}>
        <div className="p-5 flex flex-wrap gap-3">
          {[
            { label: "Module Control", icon: Boxes, path: "/portal/modules" },
            { label: "User Management", icon: Users, path: "/portal/users" },
            { label: "Security Center", icon: Shield, path: "/portal/security" },
            { label: "Audit Logs", icon: ScrollText, path: "/portal/audit-logs" },
            { label: "System Health", icon: Activity, path: "/portal/system-health" },
          ].map((action) => (
            <motion.a
              key={action.label}
              href={action.path}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-muted/40 border border-border/30 hover:bg-muted/60 transition-colors spring-tap"
            >
              <action.icon className="w-4 h-4 text-primary" strokeWidth={2} />
              <span className="text-[13px] font-semibold text-foreground">{action.label}</span>
            </motion.a>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}