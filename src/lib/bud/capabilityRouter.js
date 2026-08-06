/**
 * Bud Capability Router v0.1
 * ─────────────────────────────────────────────────────────────────
 * The structured routing layer that sits between Bud and Oracle.
 *
 *   User message + workspace + context
 *          │
 *          ▼
 *   capabilityRouter.route()
 *          │
 *          ▼
 *   { intent, capabilities[], confidence }
 *          │
 *          ▼
 *   Oracle (executes domain agents based on routed capabilities)
 *
 * v0.1 is rule-based with lightweight intent classification.
 * Later versions can evolve into an LLM-assisted planner that
 * chains multiple capabilities into multi-step task execution.
 *
 * Nothing here is user-facing — Bud is the sole visible interface.
 */

/**
 * Capability definitions.
 * Each capability maps to:
 *   - intent: the primary intent label returned by the router
 *   - keywords: trigger phrases (lowercased substring match)
 *   - agents: which domain agents Oracle should invoke for this capability
 *   - weight: scoring weight when multiple capabilities match
 */
export const CAPABILITIES = [
  {
    id: "explain",
    intent: "explain",
    label: "Explain a concept",
    keywords: ["explain", "what is", "what are", "how does", "how do", "why is", "why does", "meaning of", "define", "understand", "concept"],
    agents: ["academic", "knowledge"],
    weight: 1.0,
  },
  {
    id: "quiz",
    intent: "quiz",
    label: "Generate practice questions",
    keywords: ["quiz", "practice question", "test myself", "practice test", "past question", "mock exam", "flashcard", "test me"],
    agents: ["academic"],
    weight: 1.2,
  },
  {
    id: "notes",
    intent: "notes",
    label: "Create or summarize notes",
    keywords: ["note", "summarize", "summary", "key point", "lecture note", "study note", "outline", "breakdown"],
    agents: ["academic", "knowledge"],
    weight: 1.0,
  },
  {
    id: "search",
    intent: "search",
    label: "Search across platform",
    keywords: ["search", "find", "look up", "lookup", "where can i find", "show me", "where is"],
    agents: ["search"],
    weight: 0.9,
  },
  {
    id: "plan",
    intent: "plan",
    label: "Plan and schedule",
    keywords: ["plan", "schedule", "organize", "remind", "calendar", "timetable", "to-do", "todo", "study plan", "study schedule", "prepare for tomorrow", "study block"],
    agents: ["productivity", "academic"],
    weight: 1.1,
  },
  {
    id: "campus",
    intent: "campus",
    label: "Campus information",
    keywords: ["campus", "event", "club", "building", "navigation", "shuttle", "map", "locate", "where is the", "campus news"],
    agents: ["campus"],
    weight: 1.0,
  },
  {
    id: "social",
    intent: "social",
    label: "Social and community",
    keywords: ["post", "feed", "story", "community", "share", "friend", "connect", "message", "social", "creator"],
    agents: ["social"],
    weight: 1.0,
  },
  {
    id: "career",
    intent: "career",
    label: "Career and opportunities",
    keywords: ["cv", "resume", "internship", "scholarship", "mentor", "interview", "portfolio", "job", "opportunity", "career", "company"],
    agents: ["career"],
    weight: 1.0,
  },
  {
    id: "translate",
    intent: "translate",
    label: "Translate text",
    keywords: ["translate", "translation", "in french", "in spanish", "in yoruba", "in hausa", "in igbo"],
    agents: ["academic"],
    weight: 1.3,
  },
  {
    id: "research",
    intent: "research",
    label: "Research assistance",
    keywords: ["research", "citation", "reference", "source", "literature", "paper", "journal", "bibliography"],
    agents: ["academic", "knowledge"],
    weight: 1.0,
  },
  {
    id: "general",
    intent: "general",
    label: "General conversation",
    keywords: [],
    agents: ["general"],
    weight: 0.1,
  },
];

const CAPABILITY_MAP = new Map(CAPABILITIES.map((c) => [c.id, c]));

/**
 * Workspace context hints — when the user is on a specific screen,
 * boost capabilities that are relevant to that workspace.
 */
const WORKSPACE_BOOSTS = {
  academic: { explain: 0.2, quiz: 0.2, notes: 0.15, plan: 0.15 },
  study: { explain: 0.2, quiz: 0.25, notes: 0.2, research: 0.15 },
  campus: { campus: 0.25, search: 0.1 },
  social: { social: 0.25 },
  connect: { social: 0.2, plan: 0.1 },
  career: { career: 0.25 },
  marketplace: { search: 0.15 },
};

/**
 * Maps a screen context name to a workspace bucket for boosting.
 */
function resolveWorkspace(screenContext) {
  if (!screenContext?.name) return "general";
  const name = screenContext.name.toLowerCase();
  if (name.includes("study") || name.includes("flashcard") || name.includes("quiz") || name.includes("exam")) return "study";
  if (name.includes("academic") || name.includes("course") || name.includes("assignment") || name.includes("timetable") || name.includes("grade") || name.includes("attendance")) return "academic";
  if (name.includes("campus") || name.includes("event") || name.includes("club") || name.includes("library") || name.includes("map")) return "campus";
  if (name.includes("social") || name.includes("quad") || name.includes("feed") || name.includes("community") || name.includes("marketplace")) return "social";
  if (name.includes("connect") || name.includes("message") || name.includes("chat") || name.includes("call")) return "connect";
  if (name.includes("career") || name.includes("opportunity") || name.includes("scholarship") || name.includes("portfolio")) return "career";
  if (name.includes("market") || name.includes("sell") || name.includes("buy")) return "marketplace";
  return "general";
}

/**
 * Scores each capability against the message using keyword matching + workspace boosts.
 * Returns a sorted array of { capability, score } descending by score.
 */
function scoreCapabilities(message, workspace) {
  const text = message.toLowerCase();
  const scores = new Map();

  for (const cap of CAPABILITIES) {
    let score = 0;

    // Keyword matching
    for (const kw of cap.keywords) {
      if (text.includes(kw)) {
        score += cap.weight;
      }
    }

    // Workspace boost
    const boost = WORKSPACE_BOOSTS[workspace]?.[cap.id];
    if (boost) score += boost;

    if (score > 0 || cap.id === "general") {
      scores.set(cap.id, score);
    }
  }

  // Ensure general is always available as fallback with minimal score
  if (!scores.has("general")) scores.set("general", 0.05);

  return Array.from(scores.entries())
    .map(([id, score]) => ({ capability: id, score }))
    .sort((a, b) => b.score - a.score);
}

/**
 * route — the main v0.1 entry point.
 *
 * @param {string} message — the user's message
 * @param {object} screenContext — { name, description } from budScreenContext
 * @param {array} history — conversation history [{ role, content }]
 * @returns {{ intent: string, capabilities: string[], confidence: number, agents: string[] }}
 */
export function route(message, screenContext = {}, history = []) {
  const workspace = resolveWorkspace(screenContext);
  const ranked = scoreCapabilities(message, workspace);

  // Primary intent = highest-scoring capability (excluding general unless it's the only one)
  const top = ranked[0];
  const intent = top.capability === "general" && ranked.length > 1
    ? ranked[1].capability
    : top.capability;

  // Collect capabilities above a threshold relative to the top score
  const threshold = Math.max(top.score * 0.4, 0.15);
  const capabilities = ranked
    .filter((r) => r.score >= threshold && r.capability !== "general")
    .slice(0, 4)
    .map((r) => r.capability);

  // Always include general as a fallback capability
  if (capabilities.length === 0) capabilities.push("general");

  // Determine which domain agents to invoke based on selected capabilities
  const agentSet = new Set();
  for (const capId of capabilities) {
    const cap = CAPABILITY_MAP.get(capId);
    if (cap) cap.agents.forEach((a) => agentSet.add(a));
  }
  // If only general, keep the general agent
  if (agentSet.size === 0) agentSet.add("general");
  const agents = Array.from(agentSet).slice(0, 3);

  // Confidence: normalized top score (capped at 0.99)
  const confidence = Math.min(Math.round(top.score * 10) / 10, 0.99) || 0.5;

  return {
    intent,
    capabilities,
    confidence,
    agents,
    workspace,
    _ranked: ranked.slice(0, 5),
  };
}

/**
 * Returns the capability definition by id (for labels, metadata).
 */
export function getCapability(id) {
  return CAPABILITY_MAP.get(id);
}

/**
 * Returns a human-readable label for a routed intent (for tracing/debugging only).
 */
export function getIntentLabel(intent) {
  return CAPABILITY_MAP.get(intent)?.label || "General";
}