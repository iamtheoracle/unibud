import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  BookOpen,
  FolderKanban,
  NotebookPen,
  CalendarClock,
  Building2,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from "lucide-react";

/**
 * UNIBUD dashboard — v3.
 *
 * Mirrors src/lib/unibud/design/ exactly (tokens.ts, motionPresets.ts,
 * budPresence.ts) — this artifact can't import repo files directly, so
 * every value/keyframe/function below is copied verbatim from that
 * module, not reinvented. Where that's true, the source function name
 * is noted in a comment.
 *
 * What changed from v2:
 *  - Gold (#C9A227) added — used in exactly ONE place, the study-streak
 *    badge, per the rule: achievement/premium only, never decoration.
 *  - Bud's presence states are wired to a real interaction: toggling a
 *    goal chip now visibly puts Bud into "thinking" (tilt) for ~700ms
 *    before settling back to "idle" (breathe) — matching budPresence.ts.
 *  - A memory-transparency line under Bud's greeting, produced by a
 *    direct copy of formatMemoryIndicator() over a mock trace object
 *    shaped exactly like Bud's real BudResponse['trace'].
 *  - Motion now comes from named presets (breathe/thinkTilt/fadeInUp/
 *    pressScale), matching motionPresets.ts 1:1, instead of ad-hoc
 *    per-component keyframes.
 */

const token = {
  background: "#000000",
  surface: "#141414",
  surfaceGlass: "rgba(20, 20, 20, 0.6)",
  border: "#2E2E2E",
  textPrimary: "#FFFFFF",
  textSecondary: "#B8B8B8",
  textMuted: "#6E6E6E",
  success: "#2E7D5B",
  warning: "#B8860B",
  error: "#B3261E",
  info: "#3A5CA8",
  gold: "#C9A227", // reserved: achievement / premium / brand only
};

// Copied from motionPresets.ts — same names, same keyframes, same rule
// (every preset respects prefers-reduced-motion).
const MOTION_CSS = `
@keyframes u-breathe { 0%,100% { transform: scale(1); opacity: 0.92; } 50% { transform: scale(1.06); opacity: 1; } }
.u-breathe { animation: u-breathe 3.6s cubic-bezier(0.2,0.8,0.2,1) infinite; }

@keyframes u-think-tilt { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-4deg); } }
.u-think-tilt { animation: u-think-tilt 1.6s cubic-bezier(0.2,0.8,0.2,1) infinite; }

@keyframes u-fade-in-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.u-fade-in-up { animation: u-fade-in-up 360ms cubic-bezier(0.2,0.8,0.2,1) both; }

@keyframes u-press-scale { 0% { transform: scale(1); } 50% { transform: scale(0.97); } 100% { transform: scale(1); } }

@media (prefers-reduced-motion: reduce) {
  .u-breathe, .u-think-tilt, .u-fade-in-up { animation: none !important; }
}
`;

const TOOLS = [
  { id: "assignments", name: "Assignments", icon: BookOpen, tags: ["deadlines", "coursework", "grades"] },
  { id: "projects", name: "Projects", icon: FolderKanban, tags: ["coursework", "collaboration", "deadlines"] },
  { id: "smart_notes", name: "Smart Notes", icon: NotebookPen, tags: ["coursework", "study", "review"] },
  { id: "study_plans", name: "Study Plans", icon: CalendarClock, tags: ["study", "review", "grades"] },
  { id: "campus", name: "Campus", icon: Building2, tags: ["campus_life", "community"] },
  { id: "connect", name: "Connect", icon: Users, tags: ["community", "collaboration"] },
];

const GOAL_OPTIONS = [
  { key: "grades", label: "Raise my grades" },
  { key: "review", label: "Get ready for exams" },
  { key: "deadlines", label: "Stop missing deadlines" },
  { key: "community", label: "Find people to work with" },
];

const ASSIGNMENTS_STATS = {
  upcoming: 3,
  overdue: 1,
  completed: 7,
  progressPercent: 64,
  estimatedWorkloadHours: 9,
  nextRecommendedTaskTitle: "Draft Cell Biology Lab Report",
};

// A mock BudResponse['trace'] — same shape as the real thing
// (src/lib/bud/types.ts), just not from an actual bud.respond() call
// in this static preview.
const MOCK_TRACE = { memoryHits: 2, knowledgeHits: 1, reasoningConfidence: 0.6, plannedTaskCount: 3, provider: "mock" };

// Copied verbatim from budPresence.ts's formatMemoryIndicator().
function formatMemoryIndicator(trace) {
  const parts = [];
  if (trace.memoryHits > 0) parts.push(`${trace.memoryHits} memor${trace.memoryHits === 1 ? "y" : "ies"}`);
  if (trace.knowledgeHits > 0) parts.push(`${trace.knowledgeHits} note${trace.knowledgeHits === 1 ? "" : "s"}`);
  if (trace.plannedTaskCount > 0) parts.push(`a ${trace.plannedTaskCount}-step plan`);
  if (parts.length === 0) return null;
  return `Spark checked ${parts.join(" and ")}.`;
}

function rankTools(goalTags) {
  if (goalTags.length === 0) return null;
  const scored = TOOLS.map((tool) => {
    const overlap = tool.tags.filter((t) => goalTags.includes(t)).length;
    return { tool, score: overlap / goalTags.length };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored[0].score > 0 ? scored[0] : null;
}

function BudMark({ size = 26, presenceClass = "u-breathe" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={presenceClass}>
      <path d="M20 34 C20 26, 20 20, 20 14" stroke={token.textPrimary} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M20 20 C14 20, 10 16, 10 10 C16 10, 20 14, 20 20 Z" stroke={token.textPrimary} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M20 17 C26 17, 30 13, 30 8 C24 8, 20 12, 20 17 Z" stroke={token.textPrimary} strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <circle cx="20" cy="34" r="2.2" fill={token.textPrimary} />
    </svg>
  );
}

function CardShell({ children, highlight, style: extra = {} }) {
  return (
    <div
      style={{
        background: token.surface,
        border: `1px solid ${highlight ? token.textPrimary : token.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

export default function UnibudDashboardV3() {
  const [goalTags, setGoalTags] = useState([]);
  const [activeToolId, setActiveToolId] = useState(null);
  const [budPresence, setBudPresence] = useState("idle"); // matches BudPresenceState
  const thinkTimer = useRef(null);

  useEffect(() => () => clearTimeout(thinkTimer.current), []);

  const toggleGoal = (key) => {
    setGoalTags((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    // Wire a real interaction to Bud's presence state machine: briefly
    // "think" before settling, per BUD_PRESENCE.thinking in budPresence.ts.
    setBudPresence("thinking");
    clearTimeout(thinkTimer.current);
    thinkTimer.current = setTimeout(() => setBudPresence("idle"), 700);
  };

  const pick = useMemo(() => rankTools(goalTags), [goalTags]);
  const activeTool = TOOLS.find((t) => t.id === activeToolId) || null;
  const memoryIndicator = formatMemoryIndicator(MOCK_TRACE);

  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const greeting =
    goalTags.length === 0
      ? `${timeGreeting}, Andrew. Tell me what you're working toward and I'll point you at the right tool.`
      : `${timeGreeting}, Andrew. Here's where I'd start, based on what you told me.`;

  const budAnimClass = budPresence === "thinking" ? "u-think-tilt" : "u-breathe";
  const budAccessibleLabel = budPresence === "thinking" ? "Bud is thinking." : "Bud is here.";

  return (
    <div style={{ minHeight: "100vh", background: token.background, color: token.textPrimary, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
        ${MOTION_CSS}
        .u-card { transition: transform 220ms cubic-bezier(0.2,0.8,0.2,1), box-shadow 220ms cubic-bezier(0.2,0.8,0.2,1); }
        .u-card:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,0.36); }
        .u-card:focus-visible, .u-chip:focus-visible { outline: 2px solid ${token.textPrimary}; outline-offset: 2px; }
        .u-chip { transition: background 140ms ease, border-color 140ms ease, color 140ms ease; }
      `}</style>

      {/* Bud's surface — the one place glass is used */}
      <header style={{ background: token.surfaceGlass, backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)", borderBottom: `1px solid ${token.border}`, padding: "28px 20px 32px" }}>
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div
              role="status"
              aria-label={budAccessibleLabel}
              style={{ width: 44, height: 44, borderRadius: "9999px", border: `1px solid ${token.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >
              <BudMark size={26} presenceClass={budAnimClass} />
            </div>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: "0.08em", color: token.textMuted, textTransform: "uppercase" }}>
              Bud {budPresence === "thinking" ? "· thinking…" : ""}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "clamp(22px, 5vw, 30px)", lineHeight: 1.3, margin: 0, color: token.textPrimary }}>
            {greeting}
          </h1>
          {memoryIndicator && (
            <p style={{ margin: "10px 0 0", fontSize: 12.5, color: token.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
              {memoryIndicator}
            </p>
          )}
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 0" }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: token.textMuted, margin: "0 0 10px" }}>
          What are you working toward?
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {GOAL_OPTIONS.map((g) => {
            const active = goalTags.includes(g.key);
            return (
              <button
                key={g.key}
                onClick={() => toggleGoal(g.key)}
                className="u-chip"
                style={{
                  padding: "9px 16px",
                  minHeight: 44,
                  borderRadius: "9999px",
                  fontSize: 13.5,
                  fontWeight: 500,
                  border: `1px solid ${active ? token.textPrimary : token.border}`,
                  background: active ? token.textPrimary : "transparent",
                  color: active ? token.background : token.textSecondary,
                  cursor: "pointer",
                }}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 20px 0" }}>
        {pick ? (
          <div key={pick.tool.id} className="u-fade-in-up" style={{ background: token.surface, border: `1px solid ${token.textPrimary}`, borderRadius: 16, padding: "18px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.30)", maxWidth: 440 }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: token.textMuted, margin: "0 0 8px" }}>
              Bud's pick
            </p>
            <p style={{ margin: "0 0 4px", fontFamily: "'Fraunces', serif", fontSize: 19 }}>Start with {pick.tool.name}</p>
            <p style={{ margin: 0, fontSize: 13.5, color: token.textSecondary }}>Matches what you told me you're working on.</p>
          </div>
        ) : (
          <p style={{ fontSize: 13.5, color: token.textMuted, fontStyle: "italic" }}>
            Pick a goal above and I'll point you at one tool to start with.
          </p>
        )}
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "26px 20px 0" }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: token.textMuted, margin: "0 0 10px" }}>
          Assignments at a glance
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          <StatCard icon={Clock} label="Upcoming" value={ASSIGNMENTS_STATS.upcoming} />
          <StatCard icon={AlertTriangle} label="Overdue" value={ASSIGNMENTS_STATS.overdue} status={ASSIGNMENTS_STATS.overdue > 0 ? "error" : undefined} />
          <StatCard icon={CheckCircle2} label="Completed" value={ASSIGNMENTS_STATS.completed} status="success" />
          {/* The ONE gold use in this entire screen — an achievement, not a status. */}
          <CardShell>
            <Flame size={16} strokeWidth={1.6} color={token.gold} />
            <p style={{ margin: "10px 0 2px", fontFamily: "'Fraunces', serif", fontSize: 24, color: token.gold }}>5</p>
            <p style={{ margin: 0, fontSize: 12, color: token.textMuted }}>day streak</p>
          </CardShell>
        </div>
        <CardShell style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontSize: 13, color: token.textSecondary }}>
            {ASSIGNMENTS_STATS.progressPercent}% complete · ~{ASSIGNMENTS_STATS.estimatedWorkloadHours}h estimated this week
          </span>
          <span style={{ fontSize: 12.5, color: token.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
            next: {ASSIGNMENTS_STATS.nextRecommendedTaskTitle}
          </span>
        </CardShell>
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "26px 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isPick = pick?.tool.id === tool.id;
            const isActive = activeToolId === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveToolId(isActive ? null : tool.id)}
                className="u-card"
                style={{ textAlign: "left", background: token.surface, border: `1px solid ${isPick ? token.textPrimary : token.border}`, borderRadius: 16, padding: "18px 16px 16px", cursor: "pointer", fontFamily: "inherit", minHeight: 44 }}
              >
                <Icon size={20} strokeWidth={1.6} color={token.textPrimary} />
                <p style={{ margin: "12px 0 4px", fontFamily: "'Fraunces', serif", fontSize: 16.5 }}>{tool.name}</p>
                <p style={{ margin: 0, fontSize: 12.5, color: token.textMuted }}>{tool.tags.slice(0, 2).join(" · ")}</p>
              </button>
            );
          })}
        </div>

        {activeTool && (
          <div style={{ marginTop: 18, borderTop: `1px solid ${token.border}`, paddingTop: 16 }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: token.textMuted, margin: "0 0 6px" }}>
              Opening
            </p>
            <p style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 18 }}>{activeTool.name} — not built yet in this preview.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, status }) {
  const statusColor = status ? token[status] : token.textPrimary;
  return (
    <CardShell>
      <Icon size={16} strokeWidth={1.6} color={status ? statusColor : token.textMuted} />
      <p style={{ margin: "10px 0 2px", fontFamily: "'Fraunces', serif", fontSize: 24, color: status ? statusColor : token.textPrimary }}>{value}</p>
      <p style={{ margin: 0, fontSize: 12, color: token.textMuted }}>{label}</p>
    </CardShell>
  );
}
