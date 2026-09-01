import React from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Layers, Boxes, Flag, Activity, Plug, Database, Settings,
  ChevronRight, Server, HardDrive, Cpu, Zap, GitBranch, Shield,
  Building2, Cloud, Lock, Workflow, GitCommit,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { SectionCard, StatusPill, PortalPageHeader, SmartList } from "@/components/portal/PortalUI";
import { PLATFORM_MODULES, MODULE_CATEGORIES } from "@/lib/portalConfig";
import {
  SPRING, hoverLift, glassEntrance, scaleEntranceDelay, slideInRight,
} from "@/lib/glassPresets";
import { GlassSheen, DynamicLighting } from "@/components/portal/Glass";

const ARCHITECT_SECTIONS = [
  { label: "Module Architecture", icon: Boxes, path: "/portal/modules", description: "Platform module registry and health monitoring", color: "text-primary", bg: "bg-primary/10" },
  { label: "Feature Flags", icon: Flag, path: "/portal/feature-flags", description: "Live feature toggle management and rollout control", color: "text-success", bg: "bg-success/10" },
  { label: "System Health", icon: Activity, path: "/portal/system-health", description: "Real-time platform monitoring and diagnostics", color: "text-info", bg: "bg-info/10" },
  { label: "APIs & Integrations", icon: Plug, path: "/portal/architect", description: "External API management, connector oversight, and data pipelines", color: "text-purple", bg: "bg-purple/10" },
  { label: "Entity Schema", icon: Database, path: "/portal/architect", description: "Data model, entity registry, and database relationships", color: "text-warning", bg: "bg-warning/10" },
  { label: "Workflows & Automation", icon: GitBranch, path: "/portal/architect", description: "Workflow engine, automation rules, and event-driven processes", color: "text-info", bg: "bg-info/10" },
  { label: "Permissions & RBAC", icon: Shield, path: "/portal/security", description: "Role-based access control matrix and permission management", color: "text-error", bg: "bg-error/10" },
  { label: "Institution Templates", icon: Building2, path: "/portal/institution-config", description: "Configurable institution templates and academic structures", color: "text-primary", bg: "bg-primary/10" },
  { label: "Deployment Settings", icon: Settings, path: "/portal/maintenance", description: "Release management, deployment controls, and maintenance mode", color: "text-warning", bg: "bg-warning/10" },
];

const SYSTEM_METRICS = [
  { name: "API Gateway", icon: Server, value: "42ms", detail: "Avg response time", status: "operational" },
  { name: "Database", icon: HardDrive, value: "99.98%", detail: "Uptime this month", status: "operational" },
  { name: "Compute", icon: Cpu, value: "24%", detail: "CPU load", status: "operational" },
  { name: "Realtime", icon: Zap, value: "1,247", detail: "Active connections", status: "operational" },
];

function MetricCard({ metric, delay, onClick }) {
  return (
    <motion.div
      {...scaleEntranceDelay(delay)}
      {...hoverLift}
      onClick={onClick}
      className="relative overflow-hidden rounded-[28px] glass border border-border/30 p-5 cursor-pointer"
    >
      <GlassSheen />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/4 to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-[14px] bg-muted/40 flex items-center justify-center">
            <metric.icon className="w-5 h-5 text-foreground" strokeWidth={2.2} />
          </div>
          <StatusPill status={metric.status} />
        </div>
        <p className="text-[24px] font-heading font-extrabold text-foreground tracking-tight leading-none">{metric.value}</p>
        <p className="text-[12px] font-semibold text-foreground mt-2">{metric.name}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{metric.detail}</p>
      </div>
    </motion.div>
  );
}

function SectionButton({ section, delay, navigate }) {
  return (
    <motion.button
      {...scaleEntranceDelay(delay)}
      {...hoverLift}
      onClick={() => navigate(section.path)}
      className="relative overflow-hidden text-left p-5 rounded-[24px] glass border border-border/20"
    >
      <GlassSheen />
      <div className={`w-11 h-11 rounded-[14px] ${section.bg} flex items-center justify-center mb-3`}>
        <section.icon className={`w-5 h-5 ${section.color}`} strokeWidth={2.2} />
      </div>
      <h4 className="font-heading font-bold text-[14px] text-foreground">{section.label}</h4>
      <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{section.description}</p>
      <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-primary">
        Open <ChevronRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

function ShimmerRow() {
  return (
    <div className="flex items-center gap-3 p-3.5">
      <div className="w-9 h-9 rounded-[12px] shimmer flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="w-2/3 h-3 rounded shimmer" />
        <div className="w-1/3 h-2.5 rounded shimmer" />
      </div>
      <div className="w-16 h-5 rounded-full shimmer" />
    </div>
  );
}

export default function ArchitectCenter() {
  const navigate = useNavigate();

  const { data: modules } = useQuery({
    queryKey: ["portalModules"],
    queryFn: () => base44.entities.PlatformModule.list(),
    retry: false,
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["portalAuditLogs"],
    queryFn: () => base44.entities.AuditLog.list("-created_date", 8),
    retry: false,
  });

  const moduleList = modules || PLATFORM_MODULES;
  const enabledCount = moduleList.filter((m) => m.enabled !== false).length;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Architect Center"
        subtitle="Co-Founder system architecture — module health, feature engineering, integrations, schema, and platform engineering."
        action={<StatusPill status="operational" label="Architecture Stable" />}
      />

      {/* Architecture Overview — Premium Glass Hero */}
      <motion.div
        {...glassEntrance}
        className="relative overflow-hidden rounded-[32px] glass-strong elevated-shadow p-6 lg:p-8"
      >
        <DynamicLighting color="primary" secondary="265 60% 50%" />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={SPRING.bouncy}
              className="w-14 h-14 rounded-[20px] bg-purple/15 flex items-center justify-center"
            >
              <Layers className="w-7 h-7 text-purple" strokeWidth={2.2} />
            </motion.div>
            <div>
              <h2 className="font-heading font-extrabold text-[22px] tracking-tight text-foreground">System Architecture</h2>
              <p className="text-[13px] text-muted-foreground">{enabledCount} of {moduleList.length} modules active · {MODULE_CATEGORIES.length} categories</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { value: enabledCount, label: "Active", color: "text-success" },
              { value: moduleList.length - enabledCount, label: "Disabled", color: "text-error" },
              { value: MODULE_CATEGORIES.length, label: "Categories", color: "text-info" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING.gentle, delay: 0.15 + i * 0.08 }}
                className="text-center"
              >
                <p className={`text-[20px] font-heading font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* System Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {SYSTEM_METRICS.map((metric, i) => (
          <MetricCard key={metric.name} metric={metric} delay={0.1 + i * 0.05} onClick={() => navigate("/portal/system-health")} />
        ))}
      </div>

      {/* Architecture Sections */}
      <SectionCard title="Architecture Modules" description="System architecture management tools" delay={0.15}>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ARCHITECT_SECTIONS.map((section, i) => (
            <SectionButton key={section.label} section={section} delay={0.2 + i * 0.05} navigate={navigate} />
          ))}
        </div>
      </SectionCard>

      {/* Module Health + Integration Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Module Health" description="Active modules by category" delay={0.25}>
          <div className="p-5 grid grid-cols-2 gap-3">
            {MODULE_CATEGORIES.map((cat, i) => {
              const catModules = moduleList.filter((m) => m.category === cat.key);
              const catEnabled = catModules.filter((m) => m.enabled !== false).length;
              const pct = catModules.length ? Math.round((catEnabled / catModules.length) * 100) : 0;
              return (
                <motion.div
                  key={cat.key}
                  {...scaleEntranceDelay(0.3 + i * 0.04)}
                  className="relative overflow-hidden p-3.5 rounded-[20px] glass border border-border/20"
                >
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">{cat.label}</p>
                  <p className="text-[18px] font-heading font-bold text-foreground">{catEnabled}/{catModules.length}</p>
                  <div className="mt-2 h-1.5 rounded-full bg-border/30 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ ...SPRING.smooth, delay: 0.4 + i * 0.04 }}
                      className={`h-full rounded-full ${pct === 100 ? "bg-success" : pct >= 50 ? "bg-info" : "bg-warning"}`}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Integration Status" description="External connectors and data pipelines" delay={0.3}>
          <div className="p-5 space-y-3">
            {[
              { name: "Google Calendar Sync", icon: GitBranch, status: "operational", detail: "Bi-directional · 3 events synced today" },
              { name: "University Portal Sync", icon: Server, status: "operational", detail: "4 institutions connected" },
              { name: "Student Search API", icon: Database, status: "operational", detail: "Instant lookups · 0 errors" },
              { name: "Background Sync Worker", icon: Cpu, status: "operational", detail: "Running every 5 minutes" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...slideInRight(0.35 + i * 0.05)}
                className="flex items-center gap-3 p-3.5 rounded-[18px] glass border border-border/15"
              >
                <div className="w-9 h-9 rounded-[12px] bg-info/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-info" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-foreground">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.detail}</p>
                </div>
                <StatusPill status={item.status} />
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Infrastructure + Deployment */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SectionCard title="Infrastructure" description="Platform infrastructure and cloud resources" delay={0.35}>
          <div className="p-5 space-y-3">
            {[
              { label: "Cloud Provider", value: "Base44 Cloud", icon: Cloud, color: "text-info", status: "operational" },
              { label: "Database Engine", value: "PostgreSQL", icon: Database, color: "text-success", status: "operational" },
              { label: "Storage", value: "38.2 GB / 500 GB", icon: HardDrive, color: "text-info", status: "operational" },
              { label: "Caching Layer", value: "Redis · Active", icon: Zap, color: "text-warning", status: "operational" },
              { label: "Background Jobs", value: "4 workers", icon: Cpu, color: "text-primary", status: "operational" },
              { label: "Encryption", value: "AES-256", icon: Lock, color: "text-error", status: "operational" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...slideInRight(0.4 + i * 0.05)}
                className="flex items-center gap-3 p-3.5 rounded-[18px] glass border border-border/15"
              >
                <div className="w-9 h-9 rounded-[12px] bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <span className="text-[13px] font-heading font-bold text-foreground">{item.value}</span>
                <StatusPill status={item.status} />
              </motion.div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Deployment & Automation" description="Release management and automated workflows" delay={0.4}>
          <div className="p-5 space-y-3">
            {[
              { label: "Current Version", value: "v3.2.1", icon: GitCommit, color: "text-primary" },
              { label: "Deployment Status", value: "Stable", icon: GitBranch, color: "text-success", status: "operational" },
              { label: "CI/CD Pipeline", value: "Active", icon: Workflow, color: "text-info", status: "operational" },
              { label: "Automated Tests", value: "847 passing", icon: Shield, color: "text-success", status: "operational" },
              { label: "Search Indexing", value: "Real-time", icon: Zap, color: "text-warning", status: "operational" },
              { label: "Audit Logging", value: "Immutable", icon: Lock, color: "text-error", status: "operational" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...slideInRight(0.45 + i * 0.05)}
                className="flex items-center gap-3 p-3.5 rounded-[18px] glass border border-border/15"
              >
                <div className="w-9 h-9 rounded-[12px] bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <span className="flex-1 text-[12px] font-medium text-foreground">{item.label}</span>
                <span className="text-[13px] font-heading font-bold text-foreground">{item.value}</span>
                {item.status && <StatusPill status={item.status} />}
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Recent Architecture Changes */}
      <SectionCard title="Recent Architecture Changes" description="Latest system modifications and deployments" delay={0.45}
        action={<button onClick={() => navigate("/portal/audit-logs")} className="text-[12px] font-semibold text-primary hover:underline">View all</button>}
      >
        {logsLoading ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <ShimmerRow key={i} />)}
          </div>
        ) : (
          <SmartList
            items={auditLogs || []}
            emptyMessage="No architecture events recorded yet"
            renderRow={(log) => (
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-[12px] bg-purple/10 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-4 h-4 text-purple" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-foreground truncate">{log.action || "System event"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{log.actor_name || "System"} → {log.target_name || "—"}</p>
                </div>
                {log.severity && <StatusPill status={log.severity} />}
              </div>
            )}
          />
        )}
      </SectionCard>
    </div>
  );
}