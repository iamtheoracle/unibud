import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Activity, Cpu, Shield, Zap,
  HardDrive, Globe, Eye, Bell, Search, Lock, BarChart3, FileText,
  Brain, MessageSquare, Settings, Clock, RefreshCw, AlertTriangle,
  RotateCw, TrendingUp,
} from "lucide-react";
import { PlatformCore } from "@/lib/platform/PlatformCore";
import { runtimeBoot } from "@/lib/runtime/boot";
import ScreenHeader from "@/components/layout/ScreenHeader";

const SERVICE_ICONS = {
  memory: Brain, conversation: MessageSquare, knowledge: FileText,
  search: Search, prompt: FileText, model: Cpu, audit: Shield,
  notification: Bell, identity: Lock, session: Settings,
  configuration: Settings, metrics: BarChart3, telemetry: Activity,
  health: Activity, media: Eye, analytics: BarChart3, permissions: Lock,
  integrations: Globe, storage: HardDrive,
};

const KERNEL_ICONS = {
  oracle: Brain, nexus: Activity, guardian: Shield, spark: Zap, orbit: Clock,
};

const LIFECYCLE_STYLES = {
  ready: { bg: "bg-success/5", text: "text-success", label: "Ready" },
  degraded: { bg: "bg-warning/5", text: "text-warning", label: "Degraded" },
  initializing: { bg: "bg-primary/5", text: "text-primary", label: "Initializing" },
  restarting: { bg: "bg-primary/5", text: "text-primary", label: "Restarting" },
  stopped: { bg: "bg-muted/30", text: "text-muted-foreground", label: "Stopped" },
  failed: { bg: "bg-destructive/5", text: "text-destructive", label: "Failed" },
  registered: { bg: "bg-muted/30", text: "text-muted-foreground", label: "Registered" },
};

function formatMs(ms) {
  if (ms == null) return "—";
  if (ms < 1) return "<1ms";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function timeAgo(iso) {
  if (!iso) return "never";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 5000) return "just now";
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  return `${Math.round(diff / 60000)}m ago`;
}

export default function PlatformCoreDashboard() {
  const [bootStatus, setBootStatus] = useState({ stage: runtimeBoot.stage, ready: runtimeBoot.ready });
  const [catalog, setCatalog] = useState([]);
  const [healthResults, setHealthResults] = useState({});
  const [recoveryLog, setRecoveryLog] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [health, cat, log] = await Promise.all([
        PlatformCore.checkHealth(),
        Promise.resolve(PlatformCore.getServiceCatalog()),
        Promise.resolve(PlatformCore.getRecoveryLog()),
      ]);
      setHealthResults(health);
      setCatalog(cat);
      setRecoveryLog(log);
    } catch (e) {
      // Non-fatal
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    setBootStatus({ stage: runtimeBoot.stage, ready: runtimeBoot.ready });
    refresh();

    const interval = setInterval(() => {
      setBootStatus({ stage: runtimeBoot.stage, ready: runtimeBoot.ready });
      refresh();
    }, 10000);

    return () => clearInterval(interval);
  }, [refresh]);

  const kernelComponents = [
    { id: "oracle", label: "Oracle", ready: PlatformCore.kernel.oracle.ready },
    { id: "nexus", label: "Nexus", ready: PlatformCore.kernel.nexus.ready },
    { id: "guardian", label: "Guardian", ready: PlatformCore.kernel.guardian.ready },
    { id: "spark", label: "Spark", ready: PlatformCore.kernel.spark.ready },
    { id: "orbit", label: "Orbit", ready: PlatformCore.kernel.orbit.ready },
  ];

  const healthyCount = Object.values(healthResults).filter((h) => h?.state === "healthy").length;
  const degradedCount = Object.values(healthResults).filter((h) => h?.state === "unhealthy").length;
  const totalServices = catalog.length || 19;

  return (
    <div className="min-h-screen bg-background pb-12">
      <ScreenHeader title="Platform Core" subtitle="Service Health & Observability" backTo="/admin" />

      <div className="max-w-[960px] mx-auto px-4 pt-4 space-y-5">
        {/* Boot Status */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className={`crystal-card p-5 ${bootStatus.ready ? "border-success/30" : "border-warning/30"}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bootStatus.ready ? "bg-success/10" : "bg-warning/10"}`}>
              {bootStatus.ready ? <CheckCircle2 className="w-6 h-6 text-success" strokeWidth={2.2} /> : <Clock className="w-6 h-6 text-warning" strokeWidth={2.2} />}
            </div>
            <div className="flex-1">
              <h2 className="text-[18px] font-bold text-foreground">
                {bootStatus.ready ? "Platform Core Ready" : `Booting: ${bootStatus.stage}`}
              </h2>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {bootStatus.ready
                  ? `${totalServices} services · ${healthyCount} healthy · ${degradedCount} degraded · ${kernelComponents.length} kernel components`
                  : "Runtime is initializing services and kernel components..."}
              </p>
            </div>
            <button onClick={refresh} className="p-2 rounded-xl hover:bg-muted/40 transition-colors" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} strokeWidth={2} />
            </button>
          </div>
        </motion.div>

        {/* Kernel */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}
          className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Kernel</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {kernelComponents.filter((k) => k.ready).length}/{kernelComponents.length} ready
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {kernelComponents.map((comp) => {
              const Icon = KERNEL_ICONS[comp.id] || Cpu;
              return (
                <div key={comp.id} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${comp.ready ? "bg-success/5" : "bg-muted/30"}`}>
                  <Icon className={`w-5 h-5 ${comp.ready ? "text-success" : "text-muted-foreground"}`} strokeWidth={2} />
                  <span className="text-[10px] font-bold text-foreground">{comp.label}</span>
                  <span className={`text-[8px] ${comp.ready ? "text-success" : "text-muted-foreground"}`}>
                    {comp.ready ? "Ready" : "Idle"}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Service Health — Real Probes */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
          className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Service Health</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {healthyCount}/{totalServices} healthy · probes refresh every 30s
            </span>
          </div>
          <div className="space-y-1.5">
            {catalog.map((svc) => {
              const Icon = SERVICE_ICONS[svc.id] || Activity;
              const healthResult = healthResults[svc.id] || {};
              const isHealthy = healthResult.state === "healthy";
              const lc = LIFECYCLE_STYLES[svc.lifecycle] || LIFECYCLE_STYLES.ready;
              const m = svc.metrics || {};

              return (
                <div key={svc.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${lc.bg}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isHealthy ? "text-success" : healthResult.state === "unhealthy" ? "text-destructive" : "text-muted-foreground"}`} strokeWidth={2} />

                  {/* Service name + version */}
                  <div className="w-28 shrink-0">
                    <div className="text-[12px] font-bold text-foreground truncate">{svc.id}</div>
                    <div className="text-[8px] text-muted-foreground">v{svc.version}</div>
                  </div>

                  {/* Lifecycle badge */}
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${lc.bg} ${lc.text} shrink-0`}>
                    {lc.label}
                  </div>

                  {/* Health detail */}
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] truncate ${isHealthy ? "text-muted-foreground" : "text-destructive"}`}>
                      {healthResult.detail || "No probe data"}
                    </div>
                    <div className="text-[8px] text-muted-foreground">
                      {timeAgo(healthResult.lastCheck)} · {formatMs(healthResult.latencyMs)}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-2 shrink-0">
                    {m.requestCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[8px] text-muted-foreground">
                        <TrendingUp className="w-2.5 h-2.5" /> {m.requestCount}
                      </span>
                    )}
                    {m.errorCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[8px] text-destructive">
                        <AlertTriangle className="w-2.5 h-2.5" /> {m.errorCount}
                      </span>
                    )}
                    {m.restartCount > 0 && (
                      <span className="flex items-center gap-0.5 text-[8px] text-warning">
                        <RotateCw className="w-2.5 h-2.5" /> {m.restartCount}
                      </span>
                    )}
                  </div>

                  {/* Status icon */}
                  {isHealthy
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" strokeWidth={2.2} />
                    : healthResult.state === "unhealthy"
                      ? <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" strokeWidth={2.2} />
                      : <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" strokeWidth={2} />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recovery Log */}
        {recoveryLog.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
            className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <RotateCw className="w-4 h-4 text-warning" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Recovery Activity</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">{recoveryLog.length} recent attempts</span>
          </div>
          <div className="space-y-1">
            {recoveryLog.slice(0, 5).map((entry, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className="font-bold text-muted-foreground w-20 truncate">{entry.service}</span>
                <span className="text-muted-foreground">attempt {entry.attempt}</span>
                <span className={`flex-1 truncate ${entry.result === "recovered" ? "text-success" : entry.result?.startsWith("error") ? "text-destructive" : "text-warning"}`}>
                  {entry.result}
                </span>
                <span className="text-[8px] text-muted-foreground">{timeAgo(entry.timestamp)}</span>
              </div>
            ))}
          </div>
        </motion.div>
        )}

        {/* Architecture Flow */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }}
          className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Platform Core Flow</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {["Experience", "PlatformCore", "Kernel", "Services", "Entities"].map((node, i, arr) => (
              <React.Fragment key={node}>
                <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg ${i === 0 ? "bg-primary/10 text-primary" : i === arr.length - 1 ? "bg-muted/40 text-muted-foreground" : "bg-accent/10 text-accent"}`}>
                  {node}
                </span>
                {i < arr.length - 1 && <span className="text-muted-foreground text-[10px]">→</span>}
              </React.Fragment>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}