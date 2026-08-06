import React, { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { SectionHeader, Panel, StatCard, StatusPill, LoadingState } from "@/components/oracle/oracle-ui";
import { Bot, Cpu, DollarSign, AlertTriangle, Gauge, MessageSquare, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const dayKey = (d) => d.toISOString().slice(0, 10);
const last7 = () => { const out = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); out.push(dayKey(d)); } return out; };

const MODELS = [
  { name: "Base 1", provider: "Base44", status: "active", calls: "1.2M", cost: "₦340k" },
  { name: "Gemini 3 Flash", provider: "Google", status: "active", calls: "420k", cost: "₦96k" },
  { name: "Claude Sonnet 4.6", provider: "Anthropic", status: "standby", calls: "88k", cost: "₦52k" },
  { name: "GPT-5 Mini", provider: "OpenAI", status: "standby", calls: "21k", cost: "₦14k" },
];

export default function AIGovernance() {
  const [conv, setConv] = useState([]);
  const [memCount, setMemCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, mem] = await Promise.all([
          base44.entities.BudConversation.list("-created_date", 200).catch(() => []),
          base44.entities.BudMemory.list("-created_date", 200).catch(() => []),
        ]);
        setConv(c); setMemCount(mem.length);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const usage = useMemo(() => {
    const days = last7(); const map = {}; days.forEach((k) => (map[k] = 0));
    conv.forEach((c) => { const k = c.created_date ? dayKey(new Date(c.created_date)) : null; if (k in map) map[k]++; });
    return days.map((k) => ({ name: k.slice(5), calls: map[k] }));
  }, [conv]);

  if (loading) return <LoadingState label="Loading AI telemetry…" />;

  const errors = conv.filter((c) => c.status === "error" || c.status === "failed").length;

  return (
    <div className="space-y-4">
      <SectionHeader title="AI Governance" desc="Monitor Bud, Spark, AI usage, cost, models, prompt logs and rate limits." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Bot} label="Bud Health" value={<StatusPill status="healthy" />} tone="success" />
        <StatCard icon={Cpu} label="Spark Health" value={<StatusPill status="healthy" />} tone="success" />
        <StatCard icon={MessageSquare} label="AI Usage (7d)" value={conv.length} tone="primary" />
        <StatCard icon={AlertTriangle} label="AI Errors" value={errors} tone={errors > 0 ? "danger" : "success"} />
        <StatCard icon={DollarSign} label="AI Cost (mo)" value="₦502k" tone="info" />
        <StatCard icon={Zap} label="Memory Records" value={memCount} tone="primary" />
        <StatCard icon={Gauge} label="Rate Limit" value="120/min" tone="info" />
        <StatCard icon={Cpu} label="Models Online" value={MODELS.filter((m) => m.status === "active").length} tone="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel title="AI Usage (7 days)" icon={MessageSquare} className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={usage} margin={{ left: -20, right: 6, top: 6 }}>
              <defs><linearGradient id="gAi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#7FD8FF" stopOpacity={0.5} /><stop offset="100%" stopColor="#7FD8FF" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="calls" stroke="#7FD8FF" strokeWidth={2} fill="url(#gAi)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="AI Models" icon={Cpu}>
          <div className="space-y-2.5">
            {MODELS.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <div><p className="text-[12px] font-medium">{m.name}</p><p className="text-[10px] text-muted-foreground">{m.provider} · {m.calls} calls</p></div>
                <StatusPill status={m.status} />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Prompt Logs" icon={MessageSquare}>
        <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar">
          {conv.slice(0, 20).map((c) => (
            <div key={c.id} className="flex items-start gap-2.5 py-1.5 border-b border-border/40 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] truncate">{c.title || c.summary || c.last_message || "Conversation"}</p>
                <p className="text-[10px] text-muted-foreground">{c.created_date ? new Date(c.created_date).toLocaleString() : ""} · {(c.message_count || c.messages_count || 0)} msgs</p>
              </div>
              <StatusPill status={c.status || "active"} />
            </div>
          ))}
          {conv.length === 0 && <p className="text-[12px] text-muted-foreground">No prompt logs yet.</p>}
        </div>
      </Panel>
    </div>
  );
}