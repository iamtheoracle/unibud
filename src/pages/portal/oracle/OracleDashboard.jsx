import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Users, Boxes, LifeBuoy, Activity, Shield, Zap, Server, Database,
  Cpu, HardDrive, ScrollText, Crown, AlertTriangle, Power, Flag,
  Bot, BarChart3, Lock, Cpu as Automation, TrendingUp,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DashboardCard, SectionCard, StatusPill, PortalPageHeader, SmartList } from "@/components/portal/PortalUI";
import { PLATFORM_MODULES, MODULE_CATEGORIES } from "@/lib/portalConfig";
import { useNavigate } from "react-router-dom";

const SYSTEM_SERVICES = [
  { name: "API Gateway", icon: Server, status: "operational", detail: "42ms avg response", metric: "42ms" },
  { name: "Database", icon: Database, status: "operational", detail: "99.98% uptime", metric: "99.98%" },
  { name: "Realtime Service", icon: Zap, status: "operational", detail: "1,247 active connections", metric: "1,247" },
  { name: "Storage", icon: HardDrive, status: "operational", detail: "38.2 GB / 500 GB", metric: "7.6%" },
  { name: "Compute", icon: Cpu, status: "operational", detail: "24% CPU load", metric: "24%" },
];

const FEATURE_FLAGS = [
  { name: "AI Study Planner", enabled: true, audience: "All Universities" },
  { name: "Live Class Recording", enabled: true, audience: "Beta Cohort" },
  { name: "Marketplace Payments", enabled: false, audience: "Internal Only" },
  { name: "Mentorship Booking", enabled: true, audience: "All Universities" },
];

const EMERGENCY_CONTROLS = [
  { label: "Enable Maintenance Mode", icon: Power, severity: "warning", path: "/portal/maintenance" },
  { label: "Lock All Sessions", icon: Lock, severity: "critical", path: "/portal/security" },
  { label: "Pause Bud Service", icon: Bot, severity: "warning", path: "/portal/bud-config" },
];

export default function OracleDashboard() {
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

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
    queryFn: () => base44.entities.AuditLog.list("-created_date", 10),
    retry: false,
  });

  const { data: tickets } = useQuery({
    queryKey: ["portalTickets"],
    queryFn: () => base44.entities.SupportTicket.filter({ status: "open" }),
    retry: false,
  });

  const moduleList = modules || PLATFORM_MODULES;
  const enabledCount = moduleList.filter((m) => m.enabled !== false).length;
  const universities = [...new Set((users || []).map((u) => u.university).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Mission status banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[32px] glass-strong elevated-shadow p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[20px] bg-primary/15 flex items-center justify-center gold-glow">
              <Crown className="w-7 h-7 text-primary" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading font-extrabold text-[24px] tracking-tight text-foreground">Oracle Mission Control</h1>
                <StatusPill status="operational" label="All Systems Go" />
              </div>
              <p className="text-[13px] text-muted-foreground">Supreme platform authority — full control over UNIBUD.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-[20px] font-heading font-extrabold text-success">99.98%</p>
              <p className="text-[10px] text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-heading font-extrabold text-primary">1,247</p>
              <p className="text-[10px] text-muted-foreground">Active Now</p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-heading font-extrabold text-info">{users?.length || 0}</p>
              <p className="text-[10px] text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard icon={Users} value={users?.length || 0} title="Total Users" subtitle={`${universities.length} universities`} accent="primary" delay={0} onClick={() => navigate("/portal/users")} />
        <DashboardCard icon={Boxes} value={enabledCount} title="Active Modules" subtitle={`${moduleList.length - enabledCount} disabled`} accent="success" delay={0.05} onClick={() => navigate("/portal/modules")} />
        <DashboardCard icon={LifeBuoy} value={tickets?.length || 0} title="Open Tickets" subtitle="Awaiting response" accent="warning" delay={0.1} onClick={() => navigate("/portal/support")} />
        <DashboardCard icon={Activity} value="Healthy" title="System Status" subtitle="All systems operational" status="operational" accent="info" delay={0.15} onClick={() => navigate("/portal/system-health")} />
      </div>

      {/* System Health + Emergency Controls */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="lg:col-span-2">
          <SectionCard title="System Health" description="Real-time platform monitoring" delay={0.2}
            action={<button onClick={() => navigate("/portal/system-health")} className="text-[12px] font-semibold text-primary hover:underline">View details</button>}
          >
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SYSTEM_SERVICES.map((sys, i) => (
                <motion.div
                  key={sys.name}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-[20px] bg-muted/30 border border-border/20"
                >
                  <div className="w-10 h-10 rounded-[14px] bg-success/10 flex items-center justify-center flex-shrink-0">
                    <sys.icon className="w-[18px] h-[18px] text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground">{sys.name}</p>
                    <p className="text-[11px] text-muted-foreground">{sys.detail}</p>
                  </div>
                  <StatusPill status={sys.status} />
                </motion.div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Emergency Controls */}
        <SectionCard title="Emergency Controls" description="Critical platform actions" delay={0.25}>
          <div className="p-5 space-y-3">
            {EMERGENCY_CONTROLS.map((ctrl, i) => (
              <motion.button
                key={ctrl.label}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                onClick={() => navigate(ctrl.path)}
                className={`w-full flex items-center gap-3 p-4 rounded-[20px] border spring-tap transition-colors ${
                  ctrl.severity === "critical"
                    ? "border-error/30 bg-error/5 hover:bg-error/10"
                    : "border-warning/30 bg-warning/5 hover:bg-warning/10"
                }`}
              >
                <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                  ctrl.severity === "critical" ? "bg-error/15 text-error" : "bg-warning/15 text-warning"
                }`}>
                  <ctrl.icon className="w-[18px] h-[18px]" />
                </div>
                <span className="flex-1 text-left text-[12px] font-semibold text-foreground">{ctrl.label}</span>
                <AlertTriangle className={`w-4 h-4 ${ctrl.severity === "critical" ? "text-error" : "text-warning"}`} />
              </motion.button>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Feature Flags + Security + Bud Config */}
      <div className="grid lg:grid-cols-3 gap-6">
        <SectionCard title="Feature Flags" description="Live toggle status" delay={0.3}
          action={<button onClick={() => navigate("/portal/feature-flags")} className="text-[12px] font-semibold text-primary hover:underline">Manage</button>}
        >
          <div className="p-5 space-y-3">
            {FEATURE_FLAGS.map((flag, i) => (
              <motion.div
                key={flag.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.05 }}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-[13px] font-semibold text-foreground">{flag.name}</p>
                  <p className="text-[10px] text-muted-foreground">{flag.audience}</p>
                </div>
                <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${flag.enabled ? "bg-success justify-end pr-0.5" : "bg-muted justify-start pl-0.5"}`}>
                  <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Security Center" description="Platform security overview" delay={0.35}
          action={<button onClick={() => navigate("/portal/security")} className="text-[12px] font-semibold text-primary hover:underline">Open</button>}
        >
          <div className="p-5 space-y-3">
            {[
              { label: "2FA Adoption", value: "87%", icon: Shield, color: "text-success" },
              { label: "Active Sessions", value: "1,247", icon: Activity, color: "text-info" },
              { label: "Blocked Threats", value: "12", icon: Lock, color: "text-warning" },
              { label: "Security Score", value: "A+", icon: Shield, color: "text-success" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-[12px] bg-muted/50 flex items-center justify-center">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <span className="text-[14px] font-heading font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Bud Configuration" description="Companion service status" delay={0.4}
          action={<button onClick={() => navigate("/portal/bud-config")} className="text-[12px] font-semibold text-primary hover:underline">Configure</button>}
        >
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-[16px] bg-primary/5 border border-primary/15">
              <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-foreground">Bud Service</p>
                <p className="text-[10px] text-muted-foreground">Online · 3,420 conversations today</p>
              </div>
              <StatusPill status="operational" label="Online" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-[16px] bg-muted/30 text-center">
                <p className="text-[18px] font-heading font-bold text-primary">3.4k</p>
                <p className="text-[10px] text-muted-foreground">Daily Chats</p>
              </div>
              <div className="p-3 rounded-[16px] bg-muted/30 text-center">
                <p className="text-[18px] font-heading font-bold text-success">98%</p>
                <p className="text-[10px] text-muted-foreground">Satisfaction</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Module Status + Audit Timeline */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Module Status" description="Platform module health by category" delay={0.45}>
          <div className="p-5 grid grid-cols-2 gap-3">
            {MODULE_CATEGORIES.map((cat, i) => {
              const catModules = moduleList.filter((m) => m.category === cat.key);
              const catEnabled = catModules.filter((m) => m.enabled !== false).length;
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.04 }}
                  className="p-3.5 rounded-[20px] bg-muted/30 border border-border/20"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{cat.label}</p>
                  <p className="text-[20px] font-heading font-bold text-foreground">{catEnabled}/{catModules.length}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-border/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${catModules.length ? (catEnabled / catModules.length) * 100 : 0}%` }}
                      transition={{ delay: 0.6 + i * 0.04, duration: 0.5 }}
                      className="h-full bg-success rounded-full"
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Audit Timeline" description="Latest platform events" delay={0.5}
          action={<button onClick={() => navigate("/portal/audit-logs")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
        >
          <SmartList
            items={auditLogs || []}
            emptyMessage="No audit events recorded yet"
            renderRow={(log) => (
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-[12px] bg-muted/50 flex items-center justify-center flex-shrink-0">
                  <ScrollText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{log.action || "System event"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{log.actor_name || "System"} → {log.target_name || "—"}</p>
                </div>
                {log.severity && <StatusPill status={log.severity} />}
              </div>
            )}
          />
        </SectionCard>
      </div>
    </div>
  );
}