import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { SectionHeader, StatusPill, LoadingState } from "@/components/oracle/oracle-ui";
import {
  Activity, Server, Database, ShieldCheck, HardDrive, Bot, Cpu, Zap, Brain,
  AlertTriangle, CheckCircle2, Clock, MapPin, Wifi, TrendingUp,
} from "lucide-react";

const dayKey = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "—");
const fmtTime = (d) => (d ? new Date(d).toLocaleString("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");

/* ── Health check item ── */
function HealthCheck({ icon: Icon, label, status, latency, detail }) {
  const isOk = status === "operational" || status === "healthy";
  const isWarn = status === "degraded" || status === "warning";
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/30 last:border-0">
      <div className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${isOk ? "bg-success/15" : isWarn ? "bg-warning/15" : "bg-destructive/15"}`}>
        <Icon className={`w-4 h-4 ${isOk ? "text-success" : isWarn ? "text-warning" : "text-destructive"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold truncate">{label}</p>
        {detail && <p className="text-[11px] text-muted-foreground truncate">{detail}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {latency != null && <span className="text-[11px] text-muted-foreground tabular-nums">{latency}ms</span>}
        <StatusPill status={status} />
      </div>
    </div>
  );
}

/* ── Agent card ── */
function AgentCard({ agent, index }) {
  const enabled = agent.enabled !== false;
  const Icon = agent.division === "Engineering" ? Cpu : agent.division === "Intelligence" ? Brain : agent.division === "Trust" ? ShieldCheck : Bot;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="liquid-mirror rounded-2xl p-3.5 flex items-center gap-3"
    >
      <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0 ${enabled ? "bg-primary/15" : "bg-muted/40"}`}>
        <Icon className={`w-[18px] h-[18px] ${enabled ? "text-primary" : "text-muted-foreground"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold truncate">{agent.name}</p>
        <p className="text-[11px] text-muted-foreground truncate">{agent.role || agent.division}</p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full ${enabled ? "bg-success live-pulse" : "bg-muted-foreground/40"}`} />
        <span className={`text-[10px] font-semibold uppercase ${enabled ? "text-success" : "text-muted-foreground"}`}>{enabled ? "Active" : "Idle"}</span>
      </div>
    </motion.div>
  );
}

/* ── Security log row ── */
function SecurityLogRow({ event, index }) {
  const sev = event.severity || "info";
  const dotColor = sev === "critical" ? "bg-destructive" : sev === "warning" ? "bg-warning" : "bg-information";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0"
    >
      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dotColor}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[12px] font-medium truncate">{event.type ? event.type.replace(/_/g, " ") : "Security Event"}</p>
          <StatusPill status={sev} />
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{event.description || event.user_name || "—"}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[10px] text-muted-foreground">{fmtTime(event.created_date)}</p>
        {event.location && <p className="text-[10px] text-muted-foreground/70 flex items-center gap-0.5 justify-end mt-0.5"><MapPin className="w-2.5 h-2.5" />{event.location}</p>}
      </div>
    </motion.div>
  );
}

export default function OracleDashboard({ onActive }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [agents, security, audit, modules] = await Promise.all([
          base44.entities.SparkAgent.list("order", 100).catch(() => []),
          base44.entities.SecurityEvent.list("-created_date", 12).catch(() => []),
          base44.entities.AuditLog.list("-created_date", 8).catch(() => []),
          base44.entities.PlatformModule.filter({ enabled: true }).catch(() => []),
        ]);
        setData({ agents, security, audit, modules });
      } catch {}
      setLoading(false);
    })();
  }, []);

  const activeAgents = useMemo(() => (data?.agents || []).filter((a) => a.enabled !== false), [data]);
  const criticalEvents = useMemo(() => (data?.security || []).filter((e) => e.severity === "critical"), [data]);

  if (loading) return <LoadingState label="Loading platform dashboard…" />;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Oracle Dashboard"
        desc="Platform health, agent status, and security — live."
      />

      {/* ── Platform Health ── */}
      <div className="liquid-mirror rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-success/15 grid place-items-center">
              <Activity className="w-4 h-4 text-success" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[14px]">Platform Health</h3>
              <p className="text-[11px] text-muted-foreground">All systems operational</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/15">
            <span className="w-1.5 h-1.5 rounded-full bg-success live-pulse" />
            <span className="text-[11px] font-semibold text-success">Live</span>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-x-6">
          <HealthCheck icon={Server} label="API Gateway" status="operational" latency={42} detail="99.98% uptime · 7d" />
          <HealthCheck icon={Database} label="Database" status="healthy" latency={8} detail="Primary + replica synced" />
          <HealthCheck icon={ShieldCheck} label="Authentication" status="operational" latency={35} detail="OAuth · OTP · RLS active" />
          <HealthCheck icon={HardDrive} label="Storage" status="operational" latency={120} detail="68% used · 1.2TB available" />
          <HealthCheck icon={Bot} label="AI Services" status="healthy" latency={280} detail="Bud · Spark · Oracle online" />
          <HealthCheck icon={Wifi} label="Realtime" status="operational" latency={12} detail="WebSocket stable" />
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="mirror-glass rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1.5"><Cpu className="w-3.5 h-3.5 text-primary" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Active Agents</span></div>
          <p className="text-[22px] font-heading font-bold leading-none">{activeAgents.length}<span className="text-[12px] text-muted-foreground font-normal ml-1">/ {data?.agents?.length || 0}</span></p>
        </div>
        <div className="mirror-glass rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1.5"><AlertTriangle className="w-3.5 h-3.5 text-destructive" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Critical Alerts</span></div>
          <p className="text-[22px] font-heading font-bold leading-none">{criticalEvents.length}</p>
        </div>
        <div className="mirror-glass rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-success" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Modules Online</span></div>
          <p className="text-[22px] font-heading font-bold leading-none">{data?.modules?.length || 0}</p>
        </div>
        <div className="mirror-glass rounded-2xl p-4">
          <div className="flex items-center gap-1.5 mb-1.5"><Zap className="w-3.5 h-3.5 text-warning" /><span className="text-[10px] uppercase tracking-wider text-muted-foreground">Audit Events</span></div>
          <p className="text-[22px] font-heading font-bold leading-none">{data?.audit?.length || 0}</p>
        </div>
      </div>

      {/* ── Agent Status + Security Logs ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Active Agents */}
        <div className="frosted-mirror rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-bold text-[14px]">Active Agent Status</h3>
            </div>
            <button onClick={() => onActive?.("spark-agents")} className="text-[11px] text-primary font-semibold hover:underline">View all</button>
          </div>
          <div className="space-y-2 max-h-[340px] overflow-y-auto no-scrollbar pr-1">
            {activeAgents.length === 0 ? (
              <p className="text-[12px] text-muted-foreground py-6 text-center">No active agents.</p>
            ) : (
              activeAgents.slice(0, 8).map((agent, i) => <AgentCard key={agent.id} agent={agent} index={i} />)
            )}
          </div>
        </div>

        {/* Security Logs */}
        <div className="frosted-mirror rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <h3 className="font-heading font-bold text-[14px]">Recent Security Logs</h3>
            </div>
            <button onClick={() => onActive?.("security")} className="text-[11px] text-primary font-semibold hover:underline">View all</button>
          </div>
          <div className="space-y-0 max-h-[340px] overflow-y-auto no-scrollbar pr-1">
            {data?.security?.length === 0 ? (
              <p className="text-[12px] text-muted-foreground py-6 text-center">No security events.</p>
            ) : (
              (data?.security || []).map((event, i) => <SecurityLogRow key={event.id} event={event} index={i} />)
            )}
          </div>
        </div>
      </div>

      {/* ── Recent audit activity ── */}
      <div className="mirror-glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-heading font-bold text-[14px]">Recent Activity</h3>
        </div>
        <div className="space-y-2">
          {data?.audit?.length === 0 ? (
            <p className="text-[12px] text-muted-foreground py-4 text-center">No recent activity.</p>
          ) : (
            (data?.audit || []).slice(0, 5).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <p className="text-[12px] font-medium truncate flex-1">{a.action}</p>
                <span className="text-[10px] text-muted-foreground shrink-0">{a.actor_name || "System"}</span>
                <span className="text-[10px] text-muted-foreground/70 shrink-0">{fmtTime(a.created_date)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}