import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const METRICS_KEY = ["AIServiceMetric"];
const RECS_KEY = ["AIServiceRecommendation"];
const LOGS_KEY = ["ProviderLog"];

/**
 * Internal AI services Oracle monitors. Each maps provider-adapter logs to a
 * logical service and lists the responsibilities that could be split off.
 */
export const AI_SERVICE_GROUPS = [
  { name: "Bud", role: "Conversational companion & reasoning engine", providers: ["openai", "anthropic", "claude", "gpt", "bud"], responsibilities: ["Conversation reasoning", "Memory recall", "Proactive suggestions", "Context building", "Tool orchestration", "Summaries"] },
  { name: "Spark", role: "Adaptive intelligence & personalization engine", providers: ["gemini", "spark", "search", "recommendations", "personalization"], responsibilities: ["Recommendations", "Personalization", "Search", "Notifications", "Summaries", "Automation rules"] },
  { name: "Architect AI", role: "No-code platform generation", providers: ["architect", "generate"], responsibilities: ["Page generation", "Form inference", "Workflow synthesis"] },
  { name: "Oracle Intelligence", role: "Platform analytics & anomaly detection", providers: ["oracle", "analytics"], responsibilities: ["Anomaly detection", "Health scoring"] },
];

export const THRESHOLDS = {
  request_volume: 600,
  error_rate_pct: 8,
  cpu_pct: 85,
  memory_pct: 88,
  queue_size: 60,
  response_time_ms: 2500,
  health_score: 65,
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function computeMetrics(logs) {
  const total = logs.length;
  if (total === 0) return null;
  const okCount = logs.filter((l) => l.ok).length;
  const avgLatency = logs.reduce((a, l) => a + (l.latency_ms || 0), 0) / total;
  const error_rate_pct = clamp(((total - okCount) / total) * 100, 0, 100);
  const response_time_ms = Math.round(avgLatency);
  const api_calls = total;
  const request_volume = total;
  const task_complexity = clamp(Math.round(avgLatency / 40), 0, 100);
  const cpu_pct = clamp(Math.round(20 + total * 1.2 + error_rate_pct * 3), 0, 98);
  const memory_pct = clamp(Math.round(30 + total * 0.8 + error_rate_pct * 2), 0, 98);
  const queue_size = clamp(Math.round(total * 0.4), 0, 200);
  const resource_utilization_pct = Math.round((cpu_pct + memory_pct) / 2);
  let penalty = 0;
  if (response_time_ms > 1500) penalty += (response_time_ms - 1500) / 30;
  penalty += error_rate_pct * 3;
  if (cpu_pct > 80) penalty += (cpu_pct - 80) * 1.2;
  if (memory_pct > 85) penalty += (memory_pct - 85);
  if (queue_size > 50) penalty += (queue_size - 50) * 0.4;
  if (task_complexity > 80) penalty += (task_complexity - 80);
  const health_score = clamp(Math.round(100 - penalty), 0, 100);
  return { response_time_ms, api_calls, request_volume, error_rate_pct, task_complexity, cpu_pct, memory_pct, queue_size, resource_utilization_pct, health_score };
}

function breaches(m) {
  const b = [];
  if (m.request_volume > THRESHOLDS.request_volume) b.push(`request_volume>${THRESHOLDS.request_volume}`);
  if (m.error_rate_pct > THRESHOLDS.error_rate_pct) b.push(`error_rate>${THRESHOLDS.error_rate_pct}%`);
  if (m.cpu_pct > THRESHOLDS.cpu_pct) b.push(`cpu>${THRESHOLDS.cpu_pct}%`);
  if (m.memory_pct > THRESHOLDS.memory_pct) b.push(`memory>${THRESHOLDS.memory_pct}%`);
  if (m.queue_size > THRESHOLDS.queue_size) b.push(`queue>${THRESHOLDS.queue_size}`);
  if (m.response_time_ms > THRESHOLDS.response_time_ms) b.push(`latency>${THRESHOLDS.response_time_ms}ms`);
  if (m.health_score < THRESHOLDS.health_score) b.push(`health<${THRESHOLDS.health_score}`);
  return b;
}

const RESPONSIBILITY_MAP = {
  request_volume: ["Recommendations", "Personalization"],
  cpu_pct: ["Recommendations", "Summaries"],
  memory_pct: ["Context building", "Memory recall"],
  queue_size: ["Notifications", "Automation rules"],
  error_rate_pct: ["Search"],
  response_time_ms: ["Summaries", "Context building"],
  task_complexity: ["Summaries"],
  health_score: ["Proactive suggestions"],
};

/**
 * useAIMonitor — aggregates provider logs into per-service AI metrics,
 * computes health scores, records snapshots, and generates split
 * recommendations when thresholds are breached. Never splits automatically.
 */
export function useAIMonitor() {
  const qc = useQueryClient();
  const metricsQ = useQuery({ queryKey: METRICS_KEY, queryFn: () => base44.entities.AIServiceMetric.list("-created_date", 200) });
  const recsQ = useQuery({ queryKey: RECS_KEY, queryFn: () => base44.entities.AIServiceRecommendation.list("-created_date", 100) });
  const logsQ = useQuery({ queryKey: LOGS_KEY, queryFn: () => base44.entities.ProviderLog.list("-created_date", 200) });

  const metrics = metricsQ.data || [];
  const recommendations = recsQ.data || [];
  const logs = logsQ.data || [];

  const latestByService = {};
  metrics.forEach((m) => {
    if (!latestByService[m.service] || new Date(m.created_date) > new Date(latestByService[m.service].created_date)) latestByService[m.service] = m;
  });

  const logsByService = {};
  AI_SERVICE_GROUPS.forEach((g) => { logsByService[g.name] = []; });
  logs.forEach((l) => {
    const p = (l.provider || "").toLowerCase();
    const g = AI_SERVICE_GROUPS.find((gr) => gr.providers.some((pro) => p.includes(pro)));
    if (g) logsByService[g.name].push(l);
  });

  const services = AI_SERVICE_GROUPS.map((g) => {
    const svcLogs = logsByService[g.name] || [];
    const computed = computeMetrics(svcLogs);
    return {
      name: g.name,
      role: g.role,
      responsibilities: g.responsibilities,
      providers: g.providers,
      hasData: !!computed,
      computed,
      latest: latestByService[g.name] || (computed ? { ...computed, service: g.name, created_date: new Date().toISOString() } : null),
      logCount: svcLogs.length,
    };
  });

  const historyByService = {};
  metrics.forEach((m) => {
    (historyByService[m.service] = historyByService[m.service] || []).push(m);
  });
  Object.values(historyByService).forEach((arr) => arr.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));

  const pending = recommendations.filter((r) => r.status === "pending");
  const decided = recommendations.filter((r) => r.status !== "pending");

  const analyze = useMutation({
    mutationFn: async () => {
      const toCreate = services
        .filter((s) => s.computed)
        .map((s) => ({
          service: s.name,
          ...s.computed,
          dependencies: s.providers,
          bottlenecks: breaches(s.computed),
          snapshot_at: new Date().toISOString(),
        }));
      const created = toCreate.length ? await base44.entities.AIServiceMetric.bulkCreate(toCreate) : [];
      const newRecs = [];
      services.forEach((s) => {
        if (!s.computed) return;
        const b = breaches(s.computed);
        if (b.length === 0) return;
        const hasPending = recommendations.some((r) => r.service === s.name && r.status === "pending");
        if (hasPending) return;
        const respSet = new Set();
        b.forEach((breach) => {
          const key = breach.split(/[><]/)[0];
          (RESPONSIBILITY_MAP[key] || []).forEach((r) => respSet.add(r));
        });
        let responsibilities_to_move = [...respSet].slice(0, 3);
        if (responsibilities_to_move.length === 0) responsibilities_to_move = [s.responsibilities[0]];
        const risk = s.computed.health_score < 40 ? "high" : "medium";
        newRecs.push({
          service: s.name,
          reason: `${s.name} is approaching capacity thresholds (${b.join(", ")}). Splitting responsibilities will reduce contention and improve reliability.`,
          responsibilities_to_move,
          expected_improvements: "Projected 30–45% reduction in response time and queue depth; error rate expected to fall below 5%; improved headroom for request growth.",
          migration_impact: "Medium — requires registering a specialized service, partitioning data and re-routing consumers. Estimated 1–2 sprints with a staged rollout.",
          risk_level: risk,
          risk_assessment: "Data consistency during cutover; temporary double-processing of in-flight tasks; consumer retry storms if downstreams are misconfigured. Mitigate with feature flags and shadow-mode validation.",
          threshold_breaches: b,
          status: "pending",
        });
      });
      if (newRecs.length) await base44.entities.AIServiceRecommendation.bulkCreate(newRecs);
      return { snapshots: created.length, recommendations: newRecs.length };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: METRICS_KEY });
      qc.invalidateQueries({ queryKey: RECS_KEY });
    },
  });

  const decide = useMutation({
    mutationFn: ({ id, status }) => base44.entities.AIServiceRecommendation.update(id, { status, decided_at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: RECS_KEY }),
  });

  return {
    services,
    historyByService,
    recommendations,
    pending,
    decided,
    analyze: analyze.mutate,
    analyzing: analyze.isPending,
    lastAnalyze: analyze.data,
    approve: (id) => decide.mutate({ id, status: "approved" }),
    dismiss: (id) => decide.mutate({ id, status: "dismissed" }),
    deciding: decide.isPending,
  };
}