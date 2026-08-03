import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Activity, Cpu, Database, Shield, Zap,
  HardDrive, Globe, Eye, Bell, Search, Lock, BarChart3, FileText,
  Brain, MessageSquare, Settings, Clock, RefreshCw, AlertCircle,
} from "lucide-react";
import { PlatformCore } from "@/lib/platform/PlatformCore";
import { runtimeBoot } from "@/lib/runtime/boot";
import { healthService } from "@/lib/runtime/services/HealthService";
import ScreenHeader from "@/components/layout/ScreenHeader";

const SERVICE_ICONS = {
  memory: Brain, conversation: MessageSquare, knowledge: FileText,
  search: Search, prompt: FileText, model: Cpu, audit: Shield,
  notification: Bell, identity: Lock, session: Settings,
  configuration: Settings, metrics: BarChart3, telemetry: Activity,
  health: Heart, media: Eye, analytics: BarChart3, permissions: Lock,
  integrations: Globe, storage: HardDrive,
};

const KERNEL_ICONS = {
  oracle: Brain, nexus: Activity, guardian: Shield, spark: Zap, orbit: Clock,
};

function Heart(props) { return <Activity {...props} />; }

export default function PlatformCoreDashboard() {
  const [bootStatus, setBootStatus] = useState({ stage: runtimeBoot.stage, ready: runtimeBoot.ready });
  const [health, setHealth] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBootStatus({ stage: runtimeBoot.stage, ready: runtimeBoot.ready });
      forceUpdate((n) => n + 1);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const refreshHealth = async () => {
    setRefreshing(true);
    try {
      const result = await PlatformCore.checkHealth();
      setHealth(result.checks || {});
    } catch (e) {
      // Non-fatal
    }
    setRefreshing(false);
  };

  useEffect(() => {
    refreshHealth();
  }, [bootStatus.ready]);

  const services = useMemo(() => PlatformCore.getServiceCatalog(), [bootStatus]);
  const kernelComponents = useMemo(() => ([
    { id: 'oracle', label: 'Oracle', ready: PlatformCore.kernel.oracle.ready },
    { id: 'nexus', label: 'Nexus', ready: PlatformCore.kernel.nexus.ready },
    { id: 'guardian', label: 'Guardian', ready: PlatformCore.kernel.guardian.ready },
    { id: 'spark', label: 'Spark', ready: PlatformCore.kernel.spark.ready },
    { id: 'orbit', label: 'Orbit', ready: PlatformCore.kernel.orbit.ready },
  ]), [bootStatus]);

  const bootResults = runtimeBoot.results;
  const allHealthy = Object.values(health).every((h) => h?.status === 'healthy');
  const healthyCount = Object.values(health).filter((h) => h?.status === 'healthy').length;
  const totalChecks = Object.keys(health).length;

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
                  ? `${services.length} services · ${kernelComponents.length} kernel components · ${totalChecks} health checks`
                  : "Runtime is initializing services and kernel components..."}
              </p>
            </div>
            <button onClick={refreshHealth} className="p-2 rounded-xl hover:bg-muted/40 transition-colors" disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} strokeWidth={2} />
            </button>
          </div>
        </motion.div>

        {/* Health Summary */}
        {bootStatus.ready && totalChecks > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
            className={`crystal-card p-4 ${allHealthy ? "border-success/20" : "border-destructive/30"}`}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-primary" strokeWidth={2.2} />
              <h3 className="text-[14px] font-bold text-foreground">Health Summary</h3>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {healthyCount}/{totalChecks} healthy
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.entries(health).map(([name, check]) => {
                const Icon = SERVICE_ICONS[name] || Activity;
                const healthy = check?.status === 'healthy';
                return (
                  <div key={name} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${healthy ? "bg-success/5" : "bg-destructive/5"}`}>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${healthy ? "text-success" : "text-destructive"}`} strokeWidth={2} />
                    <span className="text-[11px] font-medium text-foreground flex-1 truncate">{name}</span>
                    {healthy ? <CheckCircle2 className="w-3 h-3 text-success" strokeWidth={2.2} /> : <XCircle className="w-3 h-3 text-destructive" strokeWidth={2.2} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Kernel Components */}
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

        {/* Service Registry */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}
          className="crystal-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-primary" strokeWidth={2.2} />
            <h3 className="text-[14px] font-bold text-foreground">Service Registry</h3>
            <span className="text-[10px] text-muted-foreground ml-auto">
              {services.filter((s) => s.ready).length}/{services.length} ready
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {services.map((svc) => {
              const Icon = SERVICE_ICONS[svc.id] || Activity;
              return (
                <div key={svc.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl ${svc.ready ? "bg-success/5" : "bg-muted/30"}`}>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${svc.ready ? "text-success" : "text-muted-foreground"}`} strokeWidth={2} />
                  <span className="text-[11px] font-medium text-foreground flex-1 truncate">{svc.id}</span>
                  {svc.ready ? <CheckCircle2 className="w-3 h-3 text-success" strokeWidth={2.2} /> : <Clock className="w-3 h-3 text-muted-foreground" strokeWidth={2} />}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Boot Results */}
        {bootStatus.ready && Object.keys(bootResults).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}
            className="crystal-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-primary" strokeWidth={2.2} />
              <h3 className="text-[14px] font-bold text-foreground">Boot Results</h3>
            </div>
            <div className="space-y-1">
              {Object.entries(bootResults).map(([stage, result]) => (
                <div key={stage} className="flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-muted-foreground w-28 truncate">{stage}</span>
                  <span className="text-foreground truncate">
                    {typeof result === 'string' ? result : typeof result === 'object' && result?.healthy !== undefined ? `${result.healthy ? 'healthy' : 'unhealthy'}` : JSON.stringify(result).slice(0, 80)}
                  </span>
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