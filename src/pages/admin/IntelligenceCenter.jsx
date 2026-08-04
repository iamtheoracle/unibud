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
  Layers,
  Cpu,
} from "lucide-react";
import ScreenShell from "@/components/layout/ScreenShell";
import { intelligenceBus } from "@/lib/intelligence/bus";
import {
  INTELLIGENCE_REGISTRY,
  ALL_INTELLIGENCES,
} from "@/lib/intelligence/registry";
import {
  ALL_SPECIALISTS,
  STUDENT_SPECIALISTS,
  ENGINEERING_SPECIALISTS,
} from "@/lib/intelligence/specialist/registry";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const INTELLIGENCE_META = {
  bud:    { icon: Sparkles, color: "221 90% 56%",  description: "The only visible AI companion every student interacts with.", layer: "Visible" },
  spark:  { icon: Brain,    color: "262 80% 60%",  description: "Internal cognitive engine — reasoning, planning, memory orchestration.", layer: "Internal" },
  oracle: { icon: Eye,      color: "38 92% 50%",   description: "Research, knowledge discovery, and fact validation.", layer: "Internal" },
  orbit:  { icon: Activity, color: "142 70% 45%",  description: "Continuous monitoring of campus, education, tech, and global news.", layer: "Internal" },
  lens:   { icon: Search,   color: "200 85% 50%",  description: "Universal search across all platform surfaces and the web.", layer: "Internal" },
  artist: { icon: Palette,  color: "330 75% 55%",  description: "Visual creation — diagrams, illustrations, and educational graphics.", layer: "Internal" },
};

const FINAL_PRINCIPLE =
  "UNIBUD is one intelligent ecosystem. Every intelligence exists to serve the student. " +
  "Every intelligence strengthens the platform. Every intelligence works together.";

const LAYER_TABS = [
  { id: "core",       label: "Core (6)",       icon: Brain },
  { id: "specialist", label: "Specialist (22)", icon: Cpu },
  { id: "bus",        label: "Event Bus",       icon: Network },
];

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const config = {
    healthy:     { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Healthy" },
    degraded:    { icon: AlertCircle,  color: "text-amber-500",   bg: "bg-amber-500/10",   label: "Degraded" },
    unavailable: { icon: Clock,        color: "text-muted-foreground", bg: "bg-muted/30",  label: "Unavailable" },
  }[status] ?? { icon: Clock, color: "text-muted-foreground", bg: "bg-muted/30", label: "Unknown" };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${config.color} ${config.bg}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function MetricPill({ label, value }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-[10px] bg-muted/60">
      <span className="text-[13px] font-bold text-foreground">{value}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}

function CoreIntelligenceCard({ id, onSelect, selected }) {
  const intel = INTELLIGENCE_REGISTRY[id];
  const meta  = INTELLIGENCE_META[id];
  if (!intel || !meta) return null;
  const Icon = meta.icon;
  const isSelected = selected === id;
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(isSelected ? null : id)}
      className={`w-full text-left rounded-[18px] border p-4 transition-colors ${
        isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `hsl(${meta.color} / 0.15)` }}>
          <Icon className="w-5 h-5" style={{ color: `hsl(${meta.color})` }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[14px] font-semibold text-foreground capitalize">{intel.name}</span>
            <StatusBadge status="healthy" />
            <span className="text-[10px] text-muted-foreground ml-auto">{meta.layer}</span>
          </div>
          <p className="text-[12px] text-muted-foreground truncate">{meta.description}</p>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </div>
    </motion.button>
  );
}

function CoreIntelligenceDetail({ id }) {
  const intel = INTELLIGENCE_REGISTRY[id];
  if (!intel) return null;
  const rows = [
    { label: "Mission",              value: intel.mission },
    { label: "Primary Responsibility", value: intel.primaryResponsibility },
    { label: "Personality",          value: intel.personality },
    { label: "Owner",                value: intel.owner },
    { label: "Version",              value: intel.version },
  ];
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-[18px] border border-primary/20 bg-primary/3 p-4 space-y-4">
      <div className="space-y-2">
        {rows.map(({ label, value }) => value ? (
          <div key={label}>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
            <p className="text-[12px] text-foreground mt-0.5 leading-relaxed">{value}</p>
          </div>
        ) : null)}
      </div>

      {intel.responsibilities?.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Responsibilities</span>
          <ul className="mt-1 space-y-0.5">
            {intel.responsibilities.map((r, i) => (
              <li key={i} className="text-[12px] text-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {intel.restrictions?.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Restrictions</span>
          <ul className="mt-1 space-y-0.5">
            {intel.restrictions.map((r, i) => (
              <li key={i} className="text-[12px] text-amber-600 flex items-start gap-1.5">
                <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />{r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {intel.metrics?.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Metrics</span>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {intel.metrics.map((m, i) => (
              <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{m}</span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SpecialistCard({ specialist, selected, onSelect }) {
  const isSelected = selected?.id === specialist.id;
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(isSelected ? null : specialist)}
      className={`w-full text-left rounded-[16px] border p-3 transition-colors ${
        isSelected ? "border-primary/40 bg-primary/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg leading-none">{specialist.icon ?? "🤖"}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[13px] font-semibold text-foreground">{specialist.name}</span>
            <StatusBadge status="healthy" />
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{specialist.primaryResponsibility}</p>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </div>
    </motion.button>
  );
}

function SpecialistDetail({ specialist }) {
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-[16px] border border-primary/20 bg-primary/3 p-4 space-y-3">
      <div>
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Mission</span>
        <p className="text-[12px] text-foreground mt-0.5 leading-relaxed">{specialist.mission}</p>
      </div>
      {specialist.responsibilities?.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Responsibilities</span>
          <ul className="mt-1 space-y-0.5">
            {specialist.responsibilities.map((r, i) => (
              <li key={i} className="text-[12px] text-foreground flex items-start gap-1.5">
                <span className="text-primary mt-0.5">•</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-3 flex-wrap">
        {specialist.orchestratedBy && (
          <div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Orchestrated by</span>
            <p className="text-[12px] text-foreground">{specialist.orchestratedBy.join(", ")}</p>
          </div>
        )}
        {specialist.failureBehaviour && (
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Failure Behaviour</span>
            <p className="text-[12px] text-muted-foreground">{specialist.failureBehaviour}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BusActivityFeed() {
  const log = intelligenceBus.getLog();
  const recent = [...log].reverse().slice(0, 20);
  return (
    <div className="rounded-[20px] border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[14px] font-bold text-foreground flex items-center gap-2">
          <Network className="w-4 h-4 text-muted-foreground" />
          Event Bus Activity
        </h3>
        <span className="text-[11px] text-muted-foreground">{log.length} total</span>
      </div>
      {recent.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">
          No bus events recorded yet. Activity appears here as intelligences collaborate.
        </p>
      ) : (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {recent.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 py-1 border-b border-border/50 last:border-0">
              <Zap className="w-3 h-3 text-primary flex-shrink-0" />
              <span className="text-[11px] font-mono text-foreground flex-1 min-w-0 truncate">{entry.event}</span>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">{entry.listenerCount}L</span>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function IntelligenceCenter() {
  const [activeTab, setActiveTab] = useState("core");
  const [selectedCore, setSelectedCore] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);

  const totalIntelligences = ALL_INTELLIGENCES.length + ALL_SPECIALISTS.length;

  return (
    <ScreenShell
      title="Intelligence Center"
      subtitle="Status, health, and configuration of all platform intelligences."
      back
      backTo="/admin"
    >
      <div className="px-4 pb-10 space-y-4 max-w-2xl mx-auto">

        {/* Final Principle */}
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[20px] p-4 bg-primary/5 border border-primary/15">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-foreground/80 leading-relaxed italic">"{FINAL_PRINCIPLE}"</p>
          </div>
        </motion.div>

        {/* Platform Stats */}
        <div className="grid grid-cols-3 gap-2">
          <MetricPill label="Intelligences" value={totalIntelligences} />
          <MetricPill label="Layers" value="4" />
          <MetricPill label="Bus Events" value={intelligenceBus.getLog().length} />
        </div>

        {/* Hierarchy Overview */}
        <div className="rounded-[20px] border border-border bg-card p-4">
          <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-muted-foreground" />
            Intelligence Hierarchy
          </h3>
          <div className="space-y-2 text-[12px]">
            {[
              { layer: "L1 — Core Super Agents",    items: "Bud · Spark · Oracle · Orbit · Lens · Artist",  color: "text-primary" },
              { layer: "L2 — Navigation Intelligence", items: "Square · Quad · Social AI · Academics AI · Connect · Me", color: "text-blue-500" },
              { layer: "L3 — Specialist Intelligence", items: `${ALL_SPECIALISTS.length} domain specialists`, color: "text-emerald-500" },
              { layer: "L4 — Platform Intelligence", items: "Recommendation · Moderation · Security · Privacy · Analytics · Automation · Notification · Integration", color: "text-amber-500" },
            ].map(({ layer, items, color }) => (
              <div key={layer} className="flex items-start gap-2">
                <span className={`text-[11px] font-semibold flex-shrink-0 mt-0.5 ${color}`}>{layer}</span>
                <span className="text-muted-foreground">{items}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-[14px] bg-muted/50 border border-border">
          {LAYER_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-[12px] font-medium transition-colors ${
                activeTab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}>
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Core Tab */}
        {activeTab === "core" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            <p className="text-[12px] text-muted-foreground px-1">
              Six executive intelligences that coordinate the entire UNIBUD ecosystem.
            </p>
            {ALL_INTELLIGENCES.map((id) => (
              <div key={id}>
                <CoreIntelligenceCard id={id} onSelect={setSelectedCore} selected={selectedCore} />
                {selectedCore === id && <div className="mt-1"><CoreIntelligenceDetail id={id} /></div>}
              </div>
            ))}
          </motion.div>
        )}

        {/* Specialist Tab */}
        {activeTab === "specialist" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {[
              { label: "Student Intelligences", specialists: STUDENT_SPECIALISTS, icon: "👨‍🎓" },
              { label: "Engineering Intelligences", specialists: ENGINEERING_SPECIALISTS, icon: "🏗" },
            ].map(({ label, specialists, icon }) => (
              <div key={label}>
                <h3 className="text-[12px] font-semibold text-muted-foreground mb-2 px-1">
                  {icon} {label} ({specialists.length})
                </h3>
                <div className="space-y-1.5">
                  {specialists.map((s) => (
                    <div key={s.id}>
                      <SpecialistCard specialist={s} selected={selectedSpecialist} onSelect={setSelectedSpecialist} />
                      {selectedSpecialist?.id === s.id && <div className="mt-1"><SpecialistDetail specialist={s} /></div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Bus Tab */}
        {activeTab === "bus" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-[12px] text-muted-foreground px-1">
              Live event log from the Intelligence Bus — all inter-intelligence communication.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <MetricPill label="Core Events" value="76+" />
              <MetricPill label="Specialist" value="46" />
              <MetricPill label="Platform" value="14" />
            </div>
            <BusActivityFeed />
            <div className="rounded-[20px] border border-border bg-card p-4">
              <h3 className="text-[13px] font-bold text-foreground flex items-center gap-2 mb-3">
                <Database className="w-4 h-4 text-muted-foreground" />
                Bus Architecture
              </h3>
              <div className="space-y-2 text-[12px]">
                {[
                  { label: "Pattern",     value: "Publish-Subscribe, event-driven" },
                  { label: "Execution",   value: "Parallel (publishAsync) + sync (publish)" },
                  { label: "Log",         value: "In-memory ring buffer (500 entries)" },
                  { label: "Scope",       value: "Core · Specialist · Platform intelligences" },
                  { label: "Singleton",   value: "intelligenceBus — single global instance" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-start gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground flex-shrink-0 w-20">{label}</span>
                    <span className="text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </ScreenShell>
  );
}
