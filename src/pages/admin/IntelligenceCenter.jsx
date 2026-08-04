import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Search,
  Eye,
  Palette,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Zap,
  Database,
  Network,
  Shield,
} from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import { intelligenceBus } from "@/lib/intelligence/bus";
import {
  INTELLIGENCE_REGISTRY,
  ALL_INTELLIGENCES,
} from "@/lib/intelligence/registry";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INTELLIGENCE_META = {
  bud: {
    icon: Sparkles,
    color: "221 90% 56%",
    description: "The only visible AI companion every student interacts with.",
    layer: "Visible",
  },
  spark: {
    icon: Brain,
    color: "262 80% 60%",
    description: "Internal cognitive engine — reasoning, planning, memory orchestration.",
    layer: "Internal",
  },
  oracle: {
    icon: Eye,
    color: "38 92% 50%",
    description: "Research, knowledge discovery, and fact validation.",
    layer: "Internal",
  },
  orbit: {
    icon: Activity,
    color: "142 70% 45%",
    description: "Continuous monitoring of campus, education, tech, and global news.",
    layer: "Internal",
  },
  lens: {
    icon: Search,
    color: "200 85% 50%",
    description: "Universal search across all platform surfaces and the web.",
    layer: "Internal",
  },
  artist: {
    icon: Palette,
    color: "330 75% 55%",
    description: "Visual creation — diagrams, illustrations, and educational graphics.",
    layer: "Internal",
  },
};

const FINAL_PRINCIPLE =
  "UNIBUD is one intelligent ecosystem. Every intelligence exists to serve the student. " +
  "Every intelligence strengthens the platform. Every intelligence works together.";

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    healthy:     { color: "text-emerald-600 bg-emerald-500/10", icon: CheckCircle2, label: "Healthy" },
    degraded:    { color: "text-amber-600 bg-amber-500/10",     icon: AlertCircle,  label: "Degraded" },
    unavailable: { color: "text-red-600 bg-red-500/10",         icon: AlertCircle,  label: "Unavailable" },
    unknown:     { color: "text-muted-foreground bg-muted",     icon: Clock,        label: "Unknown" },
  };
  const s = map[status] ?? map.unknown;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.color}`}>
      <Icon className="w-3 h-3" />
      {s.label}
    </span>
  );
}

function MetricPill({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-[10px] bg-muted/60">
      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      <span className="text-[13px] font-bold text-foreground">{value}</span>
    </div>
  );
}

function IntelligenceCard({ id, onSelect, selected }) {
  const def = INTELLIGENCE_REGISTRY[id];
  const meta = INTELLIGENCE_META[id];
  const Icon = meta.icon;

  // Bus: count live listeners for this intelligence's events
  const subscribedEvents = def.events.filter((e) => e.direction === "subscribes");
  const listenerCount = subscribedEvents.reduce(
    (acc, e) => acc + intelligenceBus.listenerCount(e.name),
    0
  );

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(id === selected ? null : id)}
      className={`w-full text-left rounded-[20px] p-4 border transition-all ${
        selected === id
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: `hsl(${meta.color} / 0.12)` }}
        >
          <Icon className="w-5 h-5" style={{ color: `hsl(${meta.color})` }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-bold text-foreground">{def.name}</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{
                color: `hsl(${meta.color})`,
                background: `hsl(${meta.color} / 0.10)`,
              }}
            >
              {meta.layer}
            </span>
            <StatusBadge status="healthy" />
          </div>
          <p className="text-[12px] text-muted-foreground line-clamp-2">{meta.description}</p>

          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] text-muted-foreground">
              {def.events.length} events
            </span>
            <span className="text-[11px] text-muted-foreground">
              {def.responsibilities.length} responsibilities
            </span>
            {listenerCount > 0 && (
              <span className="text-[11px] text-emerald-600">
                {listenerCount} live listener{listenerCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <ChevronRight
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 transition-transform ${
            selected === id ? "rotate-90" : ""
          }`}
        />
      </div>
    </motion.button>
  );
}

function IntelligenceDetail({ id }) {
  const def = INTELLIGENCE_REGISTRY[id];
  const meta = INTELLIGENCE_META[id];
  const Icon = meta.icon;

  const publishedEvents = def.events.filter((e) => e.direction === "publishes");
  const subscribedEvents = def.events.filter((e) => e.direction === "subscribes");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border bg-card p-5 space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-[16px] flex items-center justify-center"
          style={{ background: `hsl(${meta.color} / 0.12)` }}
        >
          <Icon className="w-6 h-6" style={{ color: `hsl(${meta.color})` }} />
        </div>
        <div>
          <h3 className="text-[16px] font-bold text-foreground">{def.name}</h3>
          <p className="text-[12px] text-muted-foreground">{def.purpose}</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <MetricPill label="Events" value={def.events.length} />
        <MetricPill label="Duties" value={def.responsibilities.length} />
        <MetricPill label="Metrics" value={def.metrics.length} />
      </div>

      {/* Mission */}
      <div>
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Mission</h4>
        <p className="text-[13px] text-foreground leading-relaxed">{def.mission}</p>
      </div>

      {/* Primary Responsibility */}
      <div>
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Primary Responsibility</h4>
        <p className="text-[13px] text-foreground">{def.primaryResponsibility}</p>
      </div>

      {/* Events */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Publishes ({publishedEvents.length})
          </h4>
          <div className="space-y-1">
            {publishedEvents.map((e) => (
              <div key={e.name} className="flex items-start gap-1.5">
                <Zap className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-foreground font-mono">{e.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Subscribes ({subscribedEvents.length})
          </h4>
          <div className="space-y-1">
            {subscribedEvents.map((e) => (
              <div key={e.name} className="flex items-start gap-1.5">
                <Network className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-[11px] text-foreground font-mono">{e.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Dependencies → Consumers */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Depends On
          </h4>
          {def.dependencies.length === 0 ? (
            <span className="text-[12px] text-muted-foreground">None</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {def.dependencies.map((d) => (
                <span key={d} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground font-medium capitalize">
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
            Consumed By
          </h4>
          {def.consumers.length === 0 ? (
            <span className="text-[12px] text-muted-foreground">None</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {def.consumers.map((c) => (
                <span key={c} className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-foreground font-medium capitalize">
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restrictions */}
      <div>
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          Restrictions
        </h4>
        <ul className="space-y-1">
          {def.restrictions.map((r) => (
            <li key={r} className="text-[12px] text-muted-foreground flex items-start gap-1.5">
              <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground/50 flex-shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Failure / Fallback */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Failure Behaviour</h4>
          <p className="text-[12px] text-foreground leading-relaxed">{def.failureBehaviour}</p>
        </div>
        <div>
          <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Fallback Strategy</h4>
          <p className="text-[12px] text-foreground leading-relaxed">{def.fallbackStrategy}</p>
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h4 className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          Observability Metrics
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {def.metrics.map((m) => (
            <span key={m} className="text-[11px] px-2 py-1 rounded-[8px] bg-muted text-muted-foreground font-mono">
              {m}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Bus Activity Feed
// ─────────────────────────────────────────────────────────────────────────────

function BusActivityFeed() {
  const log = intelligenceBus.getLog();
  const recent = [...log].reverse().slice(0, 20);

  if (recent.length === 0) {
    return (
      <div className="rounded-[20px] border border-border bg-card p-5">
        <h3 className="text-[14px] font-bold text-foreground mb-3 flex items-center gap-2">
          <Network className="w-4 h-4 text-muted-foreground" />
          Event Bus Activity
        </h3>
        <p className="text-[12px] text-muted-foreground">
          No bus events recorded yet. Activity will appear here as intelligences collaborate.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
          <Network className="w-4 h-4 text-muted-foreground" />
          Event Bus Activity
        </h3>
        <span className="text-[11px] text-muted-foreground">{log.length} total events</span>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {recent.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/50 last:border-0">
            <Zap className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-[11px] font-mono text-foreground flex-1 min-w-0 truncate">{entry.event}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {entry.listenerCount} listener{entry.listenerCount !== 1 ? "s" : ""}
            </span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function IntelligenceCenter() {
  const [selected, setSelected] = useState(null);

  return (
    <ScreenShell
      title="Intelligence Center"
      subtitle="Status, health, and configuration of all six platform intelligences."
      back
      backTo="/admin"
    >
      <div className="px-4 pb-10 space-y-5 max-w-2xl mx-auto">

        {/* Final Principle Banner */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-4 bg-primary/5 border border-primary/15"
        >
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-foreground/80 leading-relaxed italic">
              "{FINAL_PRINCIPLE}"
            </p>
          </div>
        </motion.div>

        {/* Platform Stats */}
        <div className="grid grid-cols-3 gap-3">
          <MetricPill label="Intelligences" value={ALL_INTELLIGENCES.length} />
          <MetricPill label="Bus Events" value={intelligenceBus.getLog().length} />
          <MetricPill label="Status" value="Healthy" />
        </div>

        {/* Intelligence Cards */}
        <div>
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            The Six Intelligences
          </h2>
          <div className="space-y-2.5">
            {ALL_INTELLIGENCES.map((def, i) => (
              <motion.div
                key={def.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <IntelligenceCard
                  id={def.id}
                  selected={selected}
                  onSelect={setSelected}
                />
                {selected === def.id && (
                  <div className="mt-2">
                    <IntelligenceDetail id={def.id} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bus Activity */}
        <BusActivityFeed />

      </div>
    </ScreenShell>
  );
}
