import React from "react";
import { motion } from "framer-motion";
import { Gauge, Activity, CheckCircle2, XCircle, AlertTriangle, Cpu, MemoryStick, Timer, ListOrdered, Zap, GitBranch, Loader2, ShieldAlert } from "lucide-react";
import { useAIMonitor, THRESHOLDS } from "@/lib/oracle/useAIMonitor";
import { useToast } from "@/components/ui/use-toast";

/**
 * AIMonitoring — Oracle's AI Architecture Monitor. Tracks health of every
 * internal AI service, computes an AI Health Score, keeps historical trends,
 * and surfaces split recommendations for Super Admin approval. Oracle never
 * splits automatically.
 */
export default function AIMonitoring() {
  const { services, pending, decided, historyByService, analyze, analyzing, approve, dismiss, deciding, lastAnalyze } = useAIMonitor();
  const { toast } = useToast();

  const runCheck = () => {
    analyze(undefined, {
      onSuccess: (res) =>
        toast({
          title: "Health check complete",
          description: `${res.snapshots} service snapshot${res.snapshots === 1 ? "" : "s"} recorded${res.recommendations ? ` · ${res.recommendations} new recommendation${res.recommendations === 1 ? "" : "s"}` : ""}.`,
        }),
      onError: () => toast({ title: "Health check failed", variant: "destructive" }),
    });
  };

  return (
    <div className="space-y-5">
      <Header onRun={runCheck} analyzing={analyzing} pendingCount={pending.length} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {services.map((s) => (
          <ServiceCard key={s.name} service={s} history={historyByService[s.name] || []} />
        ))}
      </div>

      <ThresholdsLegend />

      <Recommendations
        pending={pending}
        decided={decided}
        approve={approve}
        dismiss={dismiss}
        deciding={deciding}
      />
    </div>
  );
}

function Header({ onRun, analyzing, pendingCount }) {
  return (
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <h2 className="font-heading font-bold text-[20px] text-foreground flex items-center gap-2">
          <Gauge className="w-5 h-5 text-primary" /> AI Architecture Monitoring
        </h2>
        <p className="text-[12px] text-muted-foreground mt-1 max-w-[560px]">
          Oracle continuously monitors Bud, Spark and every internal AI service — response time, memory, CPU, API calls, queue size, error rate, task complexity, request volume, dependencies and bottlenecks — and calculates an AI Health Score.
        </p>
      </div>
      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-warning px-2.5 py-1.5 rounded-full bg-warning/10">
            <AlertTriangle className="w-3 h-3" /> {pendingCount} pending
          </span>
        )}
        <button onClick={onRun} disabled={analyzing} className="flex items-center gap-1.5 px-3.5 py-2 rounded-[14px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-50">
          {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />} Run health check
        </button>
      </div>
    </div>
  );
}

function healthTone(score) {
  if (score >= 80) return { label: "Healthy", color: "text-success", bg: "bg-success/12", ring: "hsl(var(--success))" };
  if (score >= 60) return { label: "Watch", color: "text-warning", bg: "bg-warning/12", ring: "hsl(var(--warning))" };
  return { label: "Critical", color: "text-destructive", bg: "bg-destructive/12", ring: "hsl(var(--destructive))" };
}

function ServiceCard({ service, history }) {
  const m = service.latest;
  const tone = m ? healthTone(m.health_score) : { label: "Idle", color: "text-muted-foreground", bg: "bg-muted", ring: "hsl(var(--muted-foreground))" };
  const trend = history.map((h) => h.health_score);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-[22px] p-4 glass-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-foreground">{service.name}</p>
          <p className="text-[11px] text-muted-foreground truncate">{service.role}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {trend.length > 1 && <Sparkline values={trend} color={tone.ring} />}
          <div className={`px-2.5 py-1 rounded-full ${tone.bg} ${tone.color} text-[11px] font-bold flex items-center gap-1`}>
            <Gauge className="w-3 h-3" /> {m ? Math.round(m.health_score) : "—"}
          </div>
        </div>
      </div>

      {!m ? (
        <p className="text-[11px] text-muted-foreground/70 mt-4">No recent activity — idle service.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Metric icon={Timer} label="Response" value={`${m.response_time_ms}ms`} />
            <Metric icon={Zap} label="Error rate" value={`${m.error_rate_pct.toFixed(1)}%`} />
            <Metric icon={Cpu} label="CPU" value={`${m.cpu_pct}%`} />
            <Metric icon={MemoryStick} label="Memory" value={`${m.memory_pct}%`} />
            <Metric icon={ListOrdered} label="Queue" value={`${m.queue_size}`} />
            <Metric icon={Activity} label="Volume" value={`${m.request_volume}`} />
          </div>
          {service.latest?.bottlenecks?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {service.latest.bottlenecks.map((b) => (
                <span key={b} className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded-full bg-destructive/10 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> {b}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground/70 flex-wrap">
            <GitBranch className="w-3 h-3" />
            {service.providers.map((p) => (
              <span key={p} className="px-1.5 py-0.5 rounded bg-muted/50">{p}</span>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 rounded-[12px] bg-muted/40 px-2.5 py-2">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-foreground leading-none truncate">{value}</p>
        <p className="text-[9px] text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function Sparkline({ values, color }) {
  const w = 56, h = 22, max = 100, min = 0;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / (max - min)) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThresholdsLegend() {
  const items = [
    ["Response time", `> ${THRESHOLDS.response_time_ms}ms`],
    ["Error rate", `> ${THRESHOLDS.error_rate_pct}%`],
    ["CPU", `> ${THRESHOLDS.cpu_pct}%`],
    ["Memory", `> ${THRESHOLDS.memory_pct}%`],
    ["Queue size", `> ${THRESHOLDS.queue_size}`],
    ["Request volume", `> ${THRESHOLDS.request_volume}`],
    ["Health score", `< ${THRESHOLDS.health_score}`],
  ];
  return (
    <div className="rounded-[20px] p-4 glass-card">
      <p className="text-[12px] font-bold text-foreground mb-2">Split thresholds</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {items.map(([k, v]) => (
          <div key={k} className="rounded-[12px] bg-muted/40 px-2.5 py-2">
            <p className="text-[10px] text-muted-foreground">{k}</p>
            <p className="text-[11px] font-semibold text-foreground">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const RISK_TONE = {
  low: "text-success bg-success/10",
  medium: "text-warning bg-warning/10",
  high: "text-destructive bg-destructive/10",
};

function Recommendations({ pending, decided, approve, dismiss, deciding }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[14px] font-bold text-foreground flex items-center gap-1.5 mb-2">
          <ShieldAlert className="w-4 h-4 text-primary" /> Split recommendations
        </h3>
        <p className="text-[11px] text-muted-foreground mb-3">Oracle only recommends — services are never split automatically. Approve to queue a migration plan with the Super Admin.</p>
        {pending.length === 0 ? (
          <div className="rounded-[18px] p-5 glass-card text-center">
            <CheckCircle2 className="w-7 h-7 text-success mx-auto mb-1.5" />
            <p className="text-[13px] font-semibold text-foreground">No split recommendations</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">All AI services are within safe thresholds.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <RecommendationCard key={r.id} r={r} approve={approve} dismiss={dismiss} deciding={deciding} />
            ))}
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold text-muted-foreground mb-2">History</p>
          <div className="space-y-2">
            {decided.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-[14px] p-3 glass-card">
                {r.status === "approved" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-foreground truncate">{r.service} — {r.status}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{r.reason}</p>
                </div>
                <span className="text-[10px] text-muted-foreground/70">{r.decided_at ? new Date(r.decided_at).toLocaleDateString() : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ r, approve, dismiss, deciding }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] p-4 glass-card border-l-4 border-l-warning"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[14px] font-bold text-foreground">{r.service}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${RISK_TONE[r.risk_level] || RISK_TONE.medium} uppercase`}>{r.risk_level} risk</span>
      </div>
      <p className="text-[12px] text-muted-foreground mt-1">{r.reason}</p>

      <Section title="Why the split is needed">
        {r.threshold_breaches?.map((b) => (
          <span key={b} className="text-[10px] font-semibold text-destructive px-2 py-0.5 rounded-full bg-destructive/10 mr-1.5">{b}</span>
        ))}
      </Section>

      <Section title="Responsibilities to move">
        <div className="flex flex-wrap gap-1.5">
          {r.responsibilities_to_move?.map((x) => (
            <span key={x} className="text-[11px] font-medium text-foreground px-2 py-1 rounded-full bg-primary/8">{x}</span>
          ))}
        </div>
      </Section>

      <Section title="Expected improvements"><p className="text-[11px] text-muted-foreground">{r.expected_improvements}</p></Section>
      <Section title="Migration impact"><p className="text-[11px] text-muted-foreground">{r.migration_impact}</p></Section>
      <Section title="Risk assessment"><p className="text-[11px] text-muted-foreground">{r.risk_assessment}</p></Section>

      <div className="flex gap-2 mt-3">
        <button onClick={() => dismiss(r.id)} disabled={deciding} className="flex-1 py-2 rounded-[12px] bg-muted/50 text-[12px] font-semibold text-muted-foreground spring-tap disabled:opacity-50">Dismiss</button>
        <button onClick={() => approve(r.id)} disabled={deciding} className="flex-1 py-2 rounded-[12px] bg-primary text-primary-foreground text-[12px] font-semibold spring-tap disabled:opacity-50">Approve split</button>
      </div>
    </motion.div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mt-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 mb-1">{title}</p>
      {children}
    </div>
  );
}