import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Activity, Bot, CheckCircle2, XCircle, Clock, Loader2, Cpu } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";

export default function SparkAgentObservability({ module }) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["sparkExecutionLogs"],
    queryFn: () => base44.entities.SparkExecutionLog.list("-created_date", 50),
  });

  const runs = logs || [];
  const total = runs.length;
  const complete = runs.filter((r) => r.status === "complete").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const successRate = total ? Math.round((complete / total) * 100) : 0;
  const avgLatency = total
    ? Math.round(runs.reduce((s, r) => s + (r.total_latency_ms || 0), 0) / total)
    : 0;
  const agentUsage = {};
  runs.forEach((r) => (r.agents_selected || []).forEach((a) => { agentUsage[a] = (agentUsage[a] || 0) + 1; }));
  const topAgents = Object.entries(agentUsage).sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[22px] font-heading font-bold tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary" /> Spark Agent Observability
        </h1>
        <p className="text-[13px] text-muted-foreground mt-1">Execution logs, success rates, agent usage and latency across the multi-agent orchestration engine.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi icon={Activity} label="Total Runs" value={total} />
        <Kpi icon={CheckCircle2} label="Success Rate" value={`${successRate}%`} tone="success" />
        <Kpi icon={XCircle} label="Failed" value={failed} tone={failed ? "error" : "muted"} />
        <Kpi icon={Clock} label="Avg Latency" value={`${avgLatency}ms`} />
      </div>

      {topAgents.length > 0 && (
        <div className="crystal-card p-4">
          <h3 className="text-[13px] font-heading font-semibold mb-3 flex items-center gap-2"><Bot className="w-4 h-4 text-primary" /> Most Used Agents</h3>
          <div className="space-y-2">
            {topAgents.map(([id, count]) => (
              <div key={id} className="flex items-center justify-between text-[12px]">
                <span className="font-mono text-muted-foreground">{id}</span>
                <div className="flex items-center gap-2 flex-1 max-w-[180px] ml-3">
                  <div className="h-1.5 rounded-full bg-muted flex-1 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(count / topAgents[0][1]) * 100}%` }} />
                  </div>
                  <span className="text-muted-foreground tabular-nums">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="crystal-card p-4">
        <h3 className="text-[13px] font-heading font-semibold mb-3">Recent Orchestration Runs</h3>
        {isLoading ? (
          <div className="grid place-items-center py-10"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : runs.length === 0 ? (
          <EmptyState icon={Bot} title="No runs yet" description="Spark execution logs will appear here once Bud routes requests through the multi-agent engine." />
        ) : (
          <div className="space-y-2">
            {runs.map((r) => (
              <div key={r.id} className="rounded-xl border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-mono text-muted-foreground truncate">{r.run_id}</span>
                  <StatusPill status={r.status} />
                </div>
                <p className="text-[13px] mt-1.5 line-clamp-2">{r.user_prompt}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span>Agents: {(r.agents_selected || []).join(", ") || "direct"}</span>
                  <span>· {r.total_latency_ms || 0}ms</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone = "muted" }) {
  const toneClass = tone === "success" ? "text-success" : tone === "error" ? "text-destructive" : "text-foreground";
  return (
    <div className="crystal-card p-4">
      <Icon className="w-4 h-4 text-primary mb-2" />
      <div className={`text-[20px] font-heading font-bold tabular-nums ${toneClass}`}>{value}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    complete: { c: "text-success", icon: CheckCircle2 },
    failed: { c: "text-destructive", icon: XCircle },
    executing: { c: "text-primary", icon: Loader2 },
    validating: { c: "text-primary", icon: Loader2 },
    planning: { c: "text-muted-foreground", icon: Clock },
  };
  const m = map[status] || map.planning;
  const Icon = m.icon;
  return <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${m.c}`}><Icon className="w-3 h-3" />{status}</span>;
}