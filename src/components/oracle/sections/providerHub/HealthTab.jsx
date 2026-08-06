import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, EmptyState, LoadingState, StatCard } from "@/components/oracle/oracle-ui";
import { Activity, Gauge, CheckCircle2, AlertTriangle, Timer } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const fmt = (iso) => (iso ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "");

export default function HealthTab() {
  const [logs, setLogs] = useState(null);

  const load = async () => { setLogs(null); try { setLogs(await base44.entities.ProviderLog.list("-created_date", 200)); } catch { setLogs([]); } };
  useEffect(() => { load(); }, []);

  if (!logs) return <LoadingState />;
  if (!logs.length) return (
    <div>
      <SectionHeader title="API Health" desc="Uptime, latency, rate limits, quotas, error and success rates." />
      <div className="mt-4"><EmptyState icon={Activity} message="No provider logs yet. Run a health check on a provider to generate logs." /></div>
    </div>
  );

  const byProvider = {};
  logs.forEach((l) => { (byProvider[l.provider] ||= []).push(l); });
  const summary = Object.entries(byProvider).map(([p, arr]) => {
    const ok = arr.filter((x) => x.ok).length;
    const avg = Math.round(arr.reduce((s, x) => s + (x.latency_ms || 0), 0) / arr.length);
    return { provider: p, calls: arr.length, ok, successRate: Math.round((ok / arr.length) * 100), avgLatency: avg, errors: arr.length - ok };
  });
  const recent = logs.slice(0, 40).reverse().map((l, i) => ({ i, t: fmt(l.created_date), latency: l.latency_ms || 0, ok: l.ok ? 1 : 0 }));
  const totalCalls = logs.length;
  const totalOk = logs.filter((l) => l.ok).length;
  const avgLatency = Math.round(logs.reduce((s, x) => s + (x.latency_ms || 0), 0) / logs.length);

  return (
    <div>
      <SectionHeader title="API Health" desc="Uptime, latency, rate limits, quotas, error and success rates across all providers." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard icon={Activity} label="Total Calls" value={totalCalls} tone="muted" />
        <StatCard icon={CheckCircle2} label="Success Rate" value={`${Math.round((totalOk / totalCalls) * 100)}%`} tone="success" />
        <StatCard icon={Timer} label="Avg Latency" value={`${avgLatency}ms`} tone="primary" />
        <StatCard icon={AlertTriangle} label="Errors" value={totalCalls - totalOk} tone="danger" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Latency Trend" icon={Gauge}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={recent}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="t" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="latency" stroke="hsl(var(--information))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Per-Provider Summary" icon={Activity}>
          <div className="space-y-2">{summary.map((s) => (
            <div key={s.provider} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
              <div className="min-w-0 flex-1"><p className="text-[12px] font-medium truncate">{s.provider}</p><p className="text-[10px] text-muted-foreground">{s.calls} calls · {s.errors} errors</p></div>
              <span className="text-[11px] text-muted-foreground">{s.avgLatency}ms</span>
              <span className={`text-[11px] font-semibold ${s.successRate >= 95 ? "text-success" : s.successRate >= 70 ? "text-warning" : "text-destructive"}`}>{s.successRate}%</span>
            </div>
          ))}</div>
        </Panel>
      </div>
    </div>
  );
}