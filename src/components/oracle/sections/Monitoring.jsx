import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, StatusPill } from "@/components/oracle/oracle-ui";
import {
  Activity, Timer, AlertTriangle, Webhook, Workflow, ShieldAlert,
  Cpu, CheckCircle2, XCircle, RotateCw, Skull, Clock,
} from "lucide-react";

const WH_STATUS = ["pending", "processing", "success", "retry", "dead_letter"];
const RUN_STATUS = ["success", "failed", "running"];
const SEV = ["critical", "warning", "info"];

const fmtTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.max(1, Math.round(diff))}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`;
  return d.toLocaleDateString();
};

/**
 * Monitoring — real infrastructure observability for Oracle.
 * Pulls live signals from ProviderLog (API latency/errors), WebhookEvent
 * (delivery health), AutomationRun (background-job health), SecurityEvent
 * (incidents) and AuditLog (critical system errors). No mock data.
 */
export default function Monitoring() {
  const { data: logs } = useQuery({ queryKey: ["monProviderLogs"], queryFn: () => base44.entities.ProviderLog.list("-created_date", 200) });
  const { data: webhooks } = useQuery({ queryKey: ["monWebhooks"], queryFn: () => base44.entities.WebhookEvent.list("-created_date", 100) });
  const { data: runs } = useQuery({ queryKey: ["monRuns"], queryFn: () => base44.entities.AutomationRun.list("-created_date", 100) });
  const { data: security } = useQuery({ queryKey: ["monSecurity"], queryFn: () => base44.entities.SecurityEvent.list("-created_date", 100) });
  const { data: audit } = useQuery({ queryKey: ["monAudit"], queryFn: () => base44.entities.AuditLog.filter({ severity: "critical" }) });

  const providerLogs = logs || [];
  const wh = webhooks || [];
  const ar = runs || [];
  const se = security || [];
  const critical = (audit || []).length;
  const loading = logs === undefined && webhooks === undefined && runs === undefined && security === undefined && audit === undefined;

  const m = useMemo(() => {
    const okCount = providerLogs.filter((l) => l.ok).length;
    const errCount = providerLogs.length - okCount;
    const avgLatency = providerLogs.length
      ? Math.round(providerLogs.reduce((a, l) => a + (l.latency_ms || 0), 0) / providerLogs.length)
      : 0;
    const whBy = WH_STATUS.map((s) => ({ label: s, value: wh.filter((w) => w.status === s).length }));
    const whDead = wh.filter((w) => w.status === "dead_letter").length;
    const whSuccess = wh.filter((w) => w.status === "success").length;
    const whRate = wh.length ? Math.round((whSuccess / wh.length) * 100) : 100;
    const runBy = RUN_STATUS.map((s) => ({ label: s, value: ar.filter((r) => r.status === s).length }));
    const runFailed = ar.filter((r) => r.status === "failed").length;
    const runRunning = ar.filter((r) => r.status === "running").length;
    const sevBy = SEV.map((s) => ({ label: s, value: se.filter((e) => e.severity === s).length }));
    const sevCritical = se.filter((e) => e.severity === "critical").length;
    const sevUnacked = se.filter((e) => e.severity === "critical" && !e.acknowledged).length;

    // Per-provider latency + error rate
    const byProvider = {};
    providerLogs.forEach((l) => {
      const p = l.provider || "unknown";
      if (!byProvider[p]) byProvider[p] = { provider: p, total: 0, ok: 0, lat: 0 };
      byProvider[p].total += 1;
      if (l.ok) byProvider[p].ok += 1;
      byProvider[p].lat += l.latency_ms || 0;
    });
    const providers = Object.values(byProvider).map((p) => ({
      provider: p.provider,
      avgLatency: p.total ? Math.round(p.lat / p.total) : 0,
      errorRate: p.total ? Math.round(((p.total - p.ok) / p.total) * 100) : 0,
      total: p.total,
    })).sort((a, b) => b.total - a.total);

    // Recent incidents feed: provider failures + dead-letter webhooks + failed runs + critical security
    const incidents = [
      ...providerLogs.filter((l) => !l.ok).map((l) => ({ kind: "provider", title: `${l.provider || "Provider"} · ${l.endpoint || ""}`, detail: l.error || `HTTP ${l.status_code}`, time: l.created_date, tone: "error" })),
      ...wh.filter((w) => w.status === "dead_letter" || w.status === "retry").map((w) => ({ kind: "webhook", title: `${w.provider || "Webhook"} · ${w.event_type || ""}`, detail: w.error || w.status, time: w.created_date, tone: "warn" })),
      ...ar.filter((r) => r.status === "failed").map((r) => ({ kind: "automation", title: r.automation_name || r.automation_id, detail: r.error || "run failed", time: r.started_at || r.created_date, tone: "error" })),
      ...se.filter((e) => e.severity === "critical" || e.severity === "warning").map((e) => ({ kind: "security", title: `${e.type?.replace(/_/g, " ") || "Security"} · ${e.user_name || ""}`, detail: e.description, time: e.created_date, tone: e.severity === "critical" ? "error" : "warn" })),
    ].sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime()).slice(0, 12);

    return { okCount, errCount, avgLatency, whBy, whDead, whSuccess, whRate, runBy, runFailed, runRunning, sevBy, sevCritical, sevUnacked, providers, incidents };
  }, [providerLogs, wh, ar, se]);

  if (loading) return <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-[20px] glass-card shimmer" />)}</div>;

  const overallHealthy = m.errCount === 0 && m.whDead === 0 && m.runFailed === 0 && m.sevUnacked === 0 && critical === 0;

  return (
    <div className="space-y-4">
      <SectionHeader title="Monitoring" desc="Live infrastructure health from provider calls, webhooks, background jobs, security events and critical audit logs." />

      {/* Overall + key KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Activity} label="System Status" value={<StatusPill status={overallHealthy ? "healthy" : "warn"} />} tone={overallHealthy ? "success" : "warn"} />
        <StatCard icon={Timer} label="Avg API Latency" value={m.avgLatency ? `${m.avgLatency}ms` : "—"} tone={m.avgLatency > 800 ? "danger" : m.avgLatency > 400 ? "warn" : "success"} />
        <StatCard icon={AlertTriangle} label="Provider Errors" value={m.errCount} tone={m.errCount > 0 ? "danger" : "success"} />
        <StatCard icon={Webhook} label="Webhook Delivery" value={`${m.whRate}%`} tone={m.whRate < 95 ? "danger" : "success"} />
        <StatCard icon={Cpu} label="Jobs Running" value={m.runRunning} tone="info" />
        <StatCard icon={XCircle} label="Jobs Failed" value={m.runFailed} tone={m.runFailed > 0 ? "danger" : "success"} />
        <StatCard icon={ShieldAlert} label="Critical Security" value={m.sevCritical} tone={m.sevCritical > 0 ? "danger" : "success"} />
        <StatCard icon={AlertTriangle} label="Critical Audit" value={critical} tone={critical > 0 ? "danger" : "success"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Provider performance */}
        <Panel title="Provider Performance" icon={Timer}>
          {m.providers.length === 0 ? (
            <Empty label="No provider calls recorded yet." />
          ) : (
            <div className="space-y-2">
              {m.providers.map((p) => (
                <div key={p.provider} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div className="min-w-0">
                    <span className="text-[12px] font-medium capitalize truncate">{p.provider}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">{p.total} calls</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-muted-foreground tabular-nums">{p.avgLatency}ms</span>
                    <span className={"text-[11px] font-semibold tabular-nums " + (p.errorRate > 0 ? "text-error" : "text-success")}>{p.errorRate}% err</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        {/* Webhook delivery */}
        <Panel title="Webhook Delivery" icon={Webhook}>
          <div className="space-y-2">
            {m.whBy.map((s) => {
              const Icon = s.label === "success" ? CheckCircle2 : s.label === "dead_letter" ? Skull : s.label === "retry" ? RotateCw : s.label === "processing" ? Cpu : Clock;
              const color = s.label === "success" ? "text-success" : s.label === "dead_letter" ? "text-error" : s.label === "retry" ? "text-warning" : "text-muted-foreground";
              return (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-[12px] font-medium capitalize">{s.label.replace(/_/g, " ")}</span>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums">{s.value}</span>
                </div>
              );
            })}
            {wh.length === 0 && <Empty label="No webhook events recorded yet." />}
          </div>
        </Panel>

        {/* Automation runs */}
        <Panel title="Background Jobs" icon={Workflow}>
          <div className="space-y-2">
            {m.runBy.map((s) => {
              const Icon = s.label === "success" ? CheckCircle2 : s.label === "failed" ? XCircle : RotateCw;
              const color = s.label === "success" ? "text-success" : s.label === "failed" ? "text-error" : "text-primary";
              return (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                    <span className="text-[12px] font-medium capitalize">{s.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums">{s.value}</span>
                </div>
              );
            })}
            {ar.length === 0 && <Empty label="No automation runs recorded yet." />}
          </div>
        </Panel>

        {/* Security events */}
        <Panel title="Security Events" icon={ShieldAlert}>
          <div className="space-y-2">
            {m.sevBy.map((s) => {
              const color = s.label === "critical" ? "text-error" : s.label === "warning" ? "text-warning" : "text-muted-foreground";
              return (
                <div key={s.label} className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${s.label === "critical" ? "bg-error" : s.label === "warning" ? "bg-warning" : "bg-muted-foreground"}`} />
                    <span className="text-[12px] font-medium capitalize">{s.label}</span>
                  </div>
                  <span className={"text-[11px] font-semibold tabular-nums " + color}>{s.value}</span>
                </div>
              );
            })}
            {se.length === 0 && <Empty label="No security events recorded yet." />}
          </div>
        </Panel>
      </div>

      {/* Recent incidents feed */}
      <Panel title="Recent Incidents" icon={AlertTriangle}>
        {m.incidents.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <CheckCircle2 className="w-8 h-8 text-success mb-2" />
            <p className="text-[13px] font-semibold text-foreground">All systems nominal</p>
            <p className="text-[12px] text-muted-foreground mt-1">No provider failures, dead-lettered webhooks, failed jobs or critical security events.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {m.incidents.map((inc, i) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                <span className={`mt-1 w-2 h-2 rounded-full shrink-0 ${inc.tone === "error" ? "bg-error" : "bg-warning"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{inc.kind}</span>
                    <span className="text-[11px] text-muted-foreground">{fmtTime(inc.time)}</span>
                  </div>
                  <p className="text-[12px] font-medium text-foreground truncate">{inc.title}</p>
                  {inc.detail && <p className="text-[11px] text-muted-foreground truncate">{inc.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Empty({ label }) {
  return <p className="text-[12px] text-muted-foreground py-4 text-center">{label}</p>;
}