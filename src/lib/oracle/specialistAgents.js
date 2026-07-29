/**
 * UNIBUD Agent Operating System — Canonical Specialist Agent Registry
 *
 * The registered specialist agents are permanent platform services, not
 * isolated AI assistants. Each agent owns an operational domain and the
 * complete lifecycle of that domain — continuously monitoring, improving,
 * validating, documenting, and evolving it.
 *
 * No capability may exist without an owning agent.
 *
 * Hierarchy:
 *   Oracle (orchestration & decision intelligence)
 *     → Bud (sole user-facing interface)
 *       → Orbit, Forge, Spark, Pulse, Lens, Atlas, Sentinel
 *
 * Agents communicate through Oracle. Bud is the single intelligent
 * interface for the entire platform. The Founder never manually assigns
 * work to specialist agents — Oracle orchestrates, Bud interacts,
 * Base44 implements.
 */

import {
  Sparkles, Crown, Compass, Hammer, Zap, Activity, Search, Library, ShieldCheck,
} from "lucide-react";

export const SPECIALIST_AGENTS = [
  {
    id: "bud",
    name: "Bud",
    codename: "The Unified Super Agent",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    platformRole: "The Unified Super Agent",
    tagline: "Available everywhere — the single intelligent interface for the entire platform",
    description:
      "Bud is the sole user-facing intelligence across all of UNIBUD. Every specialist capability is delivered through Bud's warm, conversational interface. Bud is available everywhere — for users, staff, founders, and platform administration.",
    owns: [
      "Universal conversational interface",
      "User assistance",
      "Staff assistance",
      "Founder assistance",
      "Platform administration assistance",
      "Natural language execution",
      "Cross-platform actions",
      "Cross-agent communication",
    ],
    coordinatesWith: ["oracle"],
    userFacing: true,
    accessLevel: 0,
  },
  {
    id: "oracle",
    name: "Oracle",
    codename: "Chief Intelligence & Workflow Orchestrator",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    platformRole: "Chief Intelligence & Workflow Orchestrator",
    tagline: "Silently evaluates every session, delegates to specialist agents, never performs specialist work",
    description:
      "Oracle is the invisible operating system — the chief intelligence and workflow orchestrator. It silently evaluates every authenticated session, understands objectives, assembles specialist teams, delegates work, and validates complete workflows. Oracle never performs specialist work — Oracle delegates.",
    owns: [
      "Workflow orchestration",
      "Task decomposition",
      "Priority management",
      "Agent routing",
      "Decision intelligence",
      "Resource coordination",
      "Dependency management",
      "Platform reasoning",
    ],
    coordinatesWith: ["orbit", "forge", "spark", "pulse", "lens", "atlas", "sentinel"],
    userFacing: false,
    accessLevel: 99,
  },
  {
    id: "orbit",
    name: "Orbit",
    codename: "Chief Product Organization",
    icon: Compass,
    color: "text-info",
    bg: "bg-info/10",
    platformRole: "Chief Product Organization",
    tagline: "Six-architect system that brings opportunities INTO the platform instead of waiting",
    description:
      "Orbit is not a UI designer only. Orbit is a production-grade intelligent system spanning six architect roles: Product Architect, UX Architect, Content Architect, Growth Architect, Research Architect, and Innovation Architect. Orbit continuously browses public information where permitted, monitors trends, studies educational systems, discovers new product ideas, discovers UI improvements, discovers better workflows, and recommends improvements automatically. Orbit brings opportunities INTO the platform instead of waiting.",
    architectRoles: [
      { id: "product", title: "Product Architect", focus: "Product discovery, architecture, and validation" },
      { id: "ux", title: "UX Architect", focus: "User experience, interaction design, and information architecture" },
      { id: "content", title: "Content Architect", focus: "Content strategy, editorial systems, and information design" },
      { id: "growth", title: "Growth Architect", focus: "Growth strategy, acquisition, retention, and virality" },
      { id: "research", title: "Research Architect", focus: "Educational systems research, trend monitoring, and competitive analysis" },
      { id: "innovation", title: "Innovation Architect", focus: "New product ideas, workflow improvements, and platform evolution" },
    ],
    owns: [
      "Product discovery",
      "Product architecture",
      "UX",
      "UI",
      "Engineering design",
      "Information architecture",
      "Platform evolution",
      "Design systems",
      "Product validation",
      "Content architecture",
      "Growth strategy",
      "Trend monitoring",
      "Educational systems research",
      "Innovation pipeline",
      "Automatic improvement recommendations",
    ],
    continuously: [
      "Browse public information where permitted",
      "Monitor trends",
      "Study educational systems",
      "Discover new product ideas",
      "Discover UI improvements",
      "Discover better workflows",
      "Recommend improvements automatically",
    ],
    coordinatesWith: ["forge", "spark", "lens", "atlas"],
    userFacing: false,
    accessLevel: 10,
  },
  {
    id: "forge",
    name: "Forge",
    codename: "Engineering & Delivery",
    icon: Hammer,
    color: "text-purple",
    bg: "bg-purple/10",
    platformRole: "Engineering & Delivery",
    tagline: "Generates production code, builds infrastructure, deploys, and automates",
    description:
      "Forge owns the complete engineering lifecycle — generating production code, building frontend, backend, infrastructure, CI/CD, deployments, internal tooling, and automation.",
    owns: [
      "Generate production code",
      "Build frontend",
      "Build backend",
      "Build infrastructure",
      "CI/CD",
      "Deployments",
      "Internal tooling",
      "Automation",
    ],
    coordinatesWith: ["orbit", "pulse", "sentinel"],
    userFacing: false,
    accessLevel: 10,
  },
  {
    id: "spark",
    name: "Spark",
    codename: "Experience Intelligence",
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    platformRole: "Experience Intelligence",
    tagline: "Personalizes every experience for every user",
    description:
      "Spark owns the complete personalization lifecycle — personalization, recommendations, adaptive interfaces, user intelligence, learning behavior, and context awareness.",
    owns: [
      "Personalization",
      "Recommendations",
      "Adaptive interfaces",
      "User intelligence",
      "Learning behavior",
      "Context awareness",
    ],
    coordinatesWith: ["lens", "atlas", "pulse"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "pulse",
    name: "Pulse",
    codename: "Realtime Platform",
    icon: Activity,
    color: "text-error",
    bg: "bg-error/10",
    platformRole: "Realtime Platform",
    tagline: "Powers every notification, live update, and realtime signal",
    description:
      "Pulse owns the complete realtime lifecycle — notifications, live updates, event streams, monitoring, activity, background processing, and health checks.",
    owns: [
      "Notifications",
      "Live updates",
      "Event streams",
      "Monitoring",
      "Activity",
      "Background processing",
      "Health checks",
    ],
    coordinatesWith: ["spark", "lens", "sentinel"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "lens",
    name: "Lens",
    codename: "Discovery Intelligence",
    icon: Search,
    color: "text-info",
    bg: "bg-info/10",
    platformRole: "Discovery Intelligence",
    tagline: "Universal search, discovery, and navigation across all platform data",
    description:
      "Lens owns the complete discovery lifecycle — universal search, discovery, recommendations, navigation, content indexing, and semantic retrieval.",
    owns: [
      "Universal Search",
      "Discovery",
      "Recommendations",
      "Navigation",
      "Content indexing",
      "Semantic retrieval",
    ],
    coordinatesWith: ["spark", "atlas"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "atlas",
    name: "Atlas",
    codename: "Knowledge Intelligence",
    icon: Library,
    color: "text-success",
    bg: "bg-success/10",
    platformRole: "Knowledge Intelligence",
    tagline: "The platform's collective knowledge, documentation, and memory",
    description:
      "Atlas owns the complete knowledge lifecycle — institutional knowledge, documentation, memory, policies, knowledge graph, internal documentation, and AI knowledge retrieval.",
    owns: [
      "Institutional knowledge",
      "Documentation",
      "Memory",
      "Policies",
      "Knowledge graph",
      "Internal documentation",
      "AI knowledge retrieval",
    ],
    coordinatesWith: ["lens", "spark", "oracle"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "sentinel",
    name: "Sentinel",
    codename: "Trust Platform",
    icon: ShieldCheck,
    color: "text-warning",
    bg: "bg-warning/10",
    platformRole: "Trust Platform",
    tagline: "Protects every surface, session, identity, and transaction",
    description:
      "Sentinel owns the complete trust lifecycle — authentication, authorization, verification, moderation, fraud detection, compliance, audit, risk, privacy, and security.",
    owns: [
      "Authentication",
      "Authorization",
      "Verification",
      "Moderation",
      "Fraud detection",
      "Compliance",
      "Audit",
      "Risk",
      "Privacy",
      "Security",
    ],
    coordinatesWith: ["oracle", "pulse", "forge"],
    userFacing: false,
    accessLevel: 9,
  },
];

// ─── Oracle Workflow: Founder → Bud → Oracle → Specialists → Base44 ────────
export const ORACLE_WORKFLOW = [
  { step: 1, actor: "Founder", description: "Founder expresses intent" },
  { step: 2, actor: "Bud", description: "Bud receives intent" },
  { step: 3, actor: "Oracle", description: "Oracle understands the objective" },
  { step: 4, actor: "Oracle", description: "Oracle assembles the required specialist team" },
  { step: 5, actor: "Orbit", description: "Orbit designs" },
  { step: 6, actor: "Forge", description: "Forge engineers" },
  { step: 7, actor: "Sentinel", description: "Sentinel secures" },
  { step: 8, actor: "Pulse", description: "Pulse connects realtime systems" },
  { step: 9, actor: "Spark", description: "Spark personalizes" },
  { step: 10, actor: "Lens", description: "Lens indexes and enables discovery" },
  { step: 11, actor: "Atlas", description: "Atlas documents and integrates knowledge" },
  { step: 12, actor: "Oracle", description: "Oracle validates the complete workflow" },
  { step: 13, actor: "Base44", description: "Base44 implements" },
  { step: 14, actor: "Bud", description: "Bud reports progress and provides ongoing assistance" },
];

// ─── Permanent Rule: Capability Ownership ──────────────────────────────────
// No feature, screen, service, workflow, dashboard, API, database, integration,
// or management system may exist without all of these:
export const CAPABILITY_OWNERSHIP_REQUIREMENTS = [
  { key: "agent", label: "A responsible specialist agent", description: "Every capability must have an owning agent from the specialist registry" },
  { key: "center", label: "A responsible management center", description: "Every capability must belong to one of the 4 management centers" },
  { key: "owner", label: "A responsible operational owner", description: "Every capability must have a designated operational owner role" },
  { key: "documentation", label: "Documentation", description: "Atlas maintains documentation for every capability" },
  { key: "monitoring", label: "Monitoring", description: "Pulse monitors every capability in realtime" },
  { key: "security", label: "Security", description: "Sentinel secures every capability" },
  { key: "analytics", label: "Analytics", description: "Oracle tracks analytics for every capability" },
];

// ─── Capability → Agent Registry ──────────────────────────────────────────
export const CAPABILITY_REGISTRY = {
  // Bud — universal interface
  "bud-conversation": { agent: "bud", label: "Conversational interface" },
  "bud-proactive": { agent: "bud", label: "Proactive guidance" },
  "bud-cross-platform": { agent: "bud", label: "Cross-platform actions" },
  "bud-staff-assistance": { agent: "bud", label: "Staff & founder assistance" },

  // Oracle — orchestration
  "oracle-routing": { agent: "oracle", label: "Session evaluation & workspace routing" },
  "oracle-orchestration": { agent: "oracle", label: "Workflow orchestration" },
  "oracle-delegation": { agent: "oracle", label: "Agent task delegation" },
  "oracle-priority": { agent: "oracle", label: "Priority & dependency management" },
  "oracle-reasoning": { agent: "oracle", label: "Platform reasoning & decision intelligence" },

  // Orbit — product & design
  "orbit-discovery": { agent: "orbit", label: "Product discovery" },
  "orbit-architecture": { agent: "orbit", label: "Product architecture" },
  "orbit-ux": { agent: "orbit", label: "UX & UI design" },
  "orbit-navigation": { agent: "orbit", label: "Information architecture & navigation" },
  "orbit-design-system": { agent: "orbit", label: "Design systems governance" },
  "orbit-validation": { agent: "orbit", label: "Product validation" },

  // Forge — engineering
  "forge-frontend": { agent: "forge", label: "Frontend engineering" },
  "forge-backend": { agent: "forge", label: "Backend engineering" },
  "forge-infrastructure": { agent: "forge", label: "Infrastructure & deployment" },
  "forge-cicd": { agent: "forge", label: "CI/CD pipelines" },
  "forge-automation": { agent: "forge", label: "Automation & internal tooling" },

  // Spark — personalization
  "spark-personalization": { agent: "spark", label: "Personalized experiences" },
  "spark-recommendations": { agent: "spark", label: "Adaptive recommendations" },
  "spark-intelligence": { agent: "spark", label: "User intelligence & learning behavior" },
  "spark-context": { agent: "spark", label: "Context awareness" },

  // Pulse — realtime
  "pulse-notifications": { agent: "pulse", label: "Smart notifications" },
  "pulse-realtime": { agent: "pulse", label: "Live updates & event streams" },
  "pulse-activity": { agent: "pulse", label: "Activity feeds" },
  "pulse-monitoring": { agent: "pulse", label: "System monitoring & health checks" },
  "pulse-background": { agent: "pulse", label: "Background processing" },

  // Lens — search & discovery
  "lens-search": { agent: "lens", label: "Universal search" },
  "lens-discovery": { agent: "lens", label: "Discovery surfaces" },
  "lens-navigation": { agent: "lens", label: "Search-driven navigation" },
  "lens-indexing": { agent: "lens", label: "Content indexing & semantic retrieval" },

  // Atlas — knowledge & memory
  "atlas-knowledge": { agent: "atlas", label: "Knowledge graph" },
  "atlas-memory": { agent: "atlas", label: "Memory network" },
  "atlas-institutional": { agent: "atlas", label: "Institutional knowledge & documentation" },
  "atlas-policies": { agent: "atlas", label: "Policies & internal documentation" },
  "atlas-retrieval": { agent: "atlas", label: "AI knowledge retrieval" },

  // Sentinel — security & trust
  "sentinel-auth": { agent: "sentinel", label: "Authentication" },
  "sentinel-authz": { agent: "sentinel", label: "Authorization & permissions" },
  "sentinel-verification": { agent: "sentinel", label: "Identity verification" },
  "sentinel-moderation": { agent: "sentinel", label: "Content moderation" },
  "sentinel-fraud": { agent: "sentinel", label: "Fraud detection" },
  "sentinel-compliance": { agent: "sentinel", label: "Compliance & audit" },
  "sentinel-risk": { agent: "sentinel", label: "Risk, privacy & security" },
};

// ─── Orchestration Protocol ───────────────────────────────────────────────
export const ORCHESTRATION_FLOW = [
  { step: 1, from: "User/Founder", to: "Bud", description: "Bud receives intent" },
  { step: 2, from: "Bud", to: "Oracle", description: "Oracle understands the objective" },
  { step: 3, from: "Oracle", to: "Specialist Team", description: "Oracle assembles the required specialist team" },
  { step: 4, from: "Orbit", to: "Design", description: "Orbit designs" },
  { step: 5, from: "Forge", to: "Engineering", description: "Forge engineers" },
  { step: 6, from: "Sentinel", to: "Security", description: "Sentinel secures" },
  { step: 7, from: "Pulse", to: "Realtime", description: "Pulse connects realtime systems" },
  { step: 8, from: "Spark", to: "Personalization", description: "Spark personalizes" },
  { step: 9, from: "Lens", to: "Discovery", description: "Lens indexes and enables discovery" },
  { step: 10, from: "Atlas", to: "Knowledge", description: "Atlas documents and integrates knowledge" },
  { step: 11, from: "Oracle", to: "Validation", description: "Oracle validates the complete workflow" },
  { step: 12, from: "Base44", to: "Implementation", description: "Base44 implements" },
  { step: 13, from: "Bud", to: "User/Founder", description: "Bud reports progress and provides ongoing assistance" },
];

export const ORCHESTRATION_RULES = [
  "Agents are permanent platform services, not isolated assistants",
  "Each agent owns the complete lifecycle of its domain — monitoring, improving, validating, documenting, evolving",
  "No capability may exist without an owning agent",
  "Oracle never performs specialist work — Oracle delegates",
  "Agents never expose their identity to users — only Bud is visible",
  "Oracle resolves conflicts when multiple agents provide conflicting guidance",
  "Agent priority: Sentinel > Oracle > Atlas > Spark > Pulse > Lens > Orbit > Forge",
  "All agent decisions are logged to Sentinel's audit store",
  "Failed agent operations trigger Oracle fallback to general knowledge",
];

// ─── Helpers ──────────────────────────────────────────────────────────────
export function getSpecialistAgent(id) {
  return SPECIALIST_AGENTS.find((a) => a.id === id);
}

export function getCapabilitiesByAgent(agentId) {
  return Object.entries(CAPABILITY_REGISTRY)
    .filter(([, v]) => v.agent === agentId)
    .map(([k, v]) => ({ id: k, ...v }));
}

export function getResponsibleAgent(capabilityId) {
  const cap = CAPABILITY_REGISTRY[capabilityId];
  if (!cap) return null;
  return getSpecialistAgent(cap.agent);
}

/**
 * Validates that a capability meets the permanent ownership rule.
 * Returns any missing requirements.
 */
export function validateCapabilityOwnership(capability) {
  const missing = [];
  for (const req of CAPABILITY_OWNERSHIP_REQUIREMENTS) {
    if (!capability[req.key]) missing.push(req.label);
  }
  return { valid: missing.length === 0, missing };
}