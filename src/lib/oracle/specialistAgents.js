/**
 * UNIBUD Specialist Agent Registry — Canonical Agent-First Architecture
 *
 * Every platform capability belongs to a responsible specialist agent.
 * Agents own capabilities. Services implement capabilities. APIs expose
 * capabilities. Users interact only with Bud.
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
    codename: "The Visible Companion",
    icon: Sparkles,
    color: "text-primary",
    bg: "bg-primary/10",
    role: "Unified Super Agent",
    tagline: "The single intelligent interface for the entire platform",
    description:
      "Bud is the sole user-facing intelligence across all of UNIBUD. Every specialist capability is delivered through Bud's warm, conversational interface. Users never see, choose, or interact with specialist agents — only Bud.",
    owns: [
      "Universal conversational interface",
      "User assistance across every module",
      "Cross-platform actions",
      "Natural language execution of authorized tasks",
      "Proactive guidance and recommendations",
    ],
    coordinatesWith: [],
    userFacing: true,
    accessLevel: 0,
  },
  {
    id: "oracle",
    name: "Oracle",
    codename: "The Invisible Operating System",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    role: "Workflow Orchestration & Decision Intelligence",
    tagline: "Silently evaluates every session before any interface renders",
    description:
      "Oracle is the invisible operating system. It never has its own login page or public dashboard. It silently determines identity, permissions, workspace, navigation, features, agent access, security, APIs, and platform operations for every authenticated session.",
    owns: [
      "Identity evaluation & workspace routing",
      "Workflow orchestration",
      "Decision intelligence",
      "Task delegation to specialist agents",
      "Agent coordination & conflict resolution",
      "Priority management",
      "Permission-driven navigation assembly",
    ],
    coordinatesWith: ["orbit", "forge", "spark", "pulse", "lens", "atlas", "sentinel"],
    userFacing: false,
    accessLevel: 99,
  },
  {
    id: "orbit",
    name: "Orbit",
    codename: "Product Architecture",
    icon: Compass,
    color: "text-info",
    bg: "bg-info/10",
    role: "Product Design & Platform Engineering",
    tagline: "Designs, evolves, and engineers every product surface",
    description:
      "Orbit owns product architecture, product design, UI/UX, platform engineering, feature generation, and product evolution. Every screen, layout, and interaction pattern is registered to Orbit.",
    owns: [
      "Product architecture & design",
      "UI / UX across all workspaces",
      "Platform engineering",
      "Feature generation & evolution",
      "Layout & navigation patterns",
      "Design system governance",
    ],
    coordinatesWith: ["forge", "spark", "lens"],
    userFacing: false,
    accessLevel: 10,
  },
  {
    id: "forge",
    name: "Forge",
    codename: "Engineering & Infrastructure",
    icon: Hammer,
    color: "text-purple",
    bg: "bg-purple/10",
    role: "Code Generation & Deployment",
    tagline: "Builds, deploys, and automates the platform",
    description:
      "Forge owns code generation, software engineering, infrastructure, deployment, build pipelines, and automation. Every backend function, workflow, and infrastructure change is registered to Forge.",
    owns: [
      "Code generation & software engineering",
      "Infrastructure & deployment",
      "Build pipelines",
      "Automation & background jobs",
      "Backend function implementation",
      "Workflow engine execution",
    ],
    coordinatesWith: ["orbit", "pulse", "sentinel"],
    userFacing: false,
    accessLevel: 10,
  },
  {
    id: "spark",
    name: "Spark",
    codename: "Personalization Intelligence",
    icon: Zap,
    color: "text-warning",
    bg: "bg-warning/10",
    role: "Adaptive Experiences & Recommendations",
    tagline: "Personalizes every experience for every user",
    description:
      "Spark owns personalization, adaptive experiences, recommendations, and user intelligence. Every recommendation, adaptive layout, and personalized insight is registered to Spark.",
    owns: [
      "Personalization & adaptive experiences",
      "Recommendations across all modules",
      "User intelligence & preference learning",
      "Adaptive navigation & content surfacing",
      "Study & academic recommendations",
      "Smart feed ranking",
    ],
    coordinatesWith: ["lens", "atlas", "pulse"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "pulse",
    name: "Pulse",
    codename: "Realtime & Notification Intelligence",
    icon: Activity,
    color: "text-error",
    bg: "bg-error/10",
    role: "Notifications, Realtime & Event Processing",
    tagline: "Powers every notification, feed, and realtime signal",
    description:
      "Pulse owns notifications, realtime systems, activity feeds, monitoring, and event processing. Every reminder, alert, activity entry, and realtime update is registered to Pulse.",
    owns: [
      "Smart notification prioritization",
      "Realtime systems & live updates",
      "Activity feeds & timelines",
      "System monitoring & event processing",
      "Deadline & reminder engines",
      "Digest & quiet-hours management",
    ],
    coordinatesWith: ["spark", "lens", "sentinel"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "lens",
    name: "Lens",
    codename: "Universal Search & Discovery",
    icon: Search,
    color: "text-info",
    bg: "bg-info/10",
    role: "Search, Discovery & Navigation",
    tagline: "Universal search across all platform data",
    description:
      "Lens owns universal search, discovery, navigation, and search-driven recommendations. Every search query, discovery surface, and navigation path is registered to Lens.",
    owns: [
      "Universal search across all data",
      "Discovery & content surfacing",
      "Navigation intelligence",
      "Search-driven recommendations",
      "Global search index",
      "People, course & opportunity discovery",
    ],
    coordinatesWith: ["spark", "atlas"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "atlas",
    name: "Atlas",
    codename: "Knowledge & Memory",
    icon: Library,
    color: "text-success",
    bg: "bg-success/10",
    role: "Knowledge, Documentation & Institutional Intelligence",
    tagline: "The platform's collective knowledge and memory",
    description:
      "Atlas owns knowledge, documentation, institutional intelligence, and memory. Every knowledge article, institutional record, document library entry, and memory store is registered to Atlas.",
    owns: [
      "Knowledge graph & documentation",
      "Institutional intelligence & records",
      "Memory network (user, institution, global)",
      "Document library & knowledge hub",
      "Academic knowledge base",
      "Verified information stores",
    ],
    coordinatesWith: ["lens", "spark", "oracle"],
    userFacing: false,
    accessLevel: 8,
  },
  {
    id: "sentinel",
    name: "Sentinel",
    codename: "Security & Trust",
    icon: ShieldCheck,
    color: "text-warning",
    bg: "bg-warning/10",
    role: "Security, Authorization & Trust",
    tagline: "Protects every surface, every session, every transaction",
    description:
      "Sentinel owns security, authentication, authorization, verification, moderation, fraud detection, compliance, and audit. Every access check, moderation action, and security event is registered to Sentinel.",
    owns: [
      "Authentication & session security",
      "Authorization & permission enforcement",
      "Identity verification & trust scoring",
      "Content moderation & policy enforcement",
      "Fraud detection & threat prevention",
      "Compliance & audit logging",
    ],
    coordinatesWith: ["oracle", "pulse", "forge"],
    userFacing: false,
    accessLevel: 9,
  },
];

// ─── Capability → Agent Registry ──────────────────────────────────────────
// Every module/feature mapped to its responsible specialist agent.
export const CAPABILITY_REGISTRY = {
  // Bud — universal interface
  "bud-conversation": { agent: "bud", label: "Conversational interface" },
  "bud-proactive": { agent: "bud", label: "Proactive guidance" },
  "bud-cross-platform": { agent: "bud", label: "Cross-platform actions" },

  // Oracle — orchestration
  "oracle-routing": { agent: "oracle", label: "Session evaluation & workspace routing" },
  "oracle-orchestration": { agent: "oracle", label: "Workflow orchestration" },
  "oracle-delegation": { agent: "oracle", label: "Agent task delegation" },
  "oracle-priority": { agent: "oracle", label: "Priority & conflict resolution" },

  // Orbit — product & design
  "orbit-design": { agent: "orbit", label: "Product design & UI/UX" },
  "orbit-architecture": { agent: "orbit", label: "Product architecture" },
  "orbit-navigation": { agent: "orbit", label: "Navigation patterns" },
  "orbit-design-system": { agent: "orbit", label: "Design system governance" },

  // Forge — engineering
  "forge-backend": { agent: "forge", label: "Backend functions" },
  "forge-workflows": { agent: "forge", label: "Workflow engine" },
  "forge-infrastructure": { agent: "forge", label: "Infrastructure & deployment" },
  "forge-automation": { agent: "forge", label: "Automation & jobs" },

  // Spark — personalization
  "spark-recommendations": { agent: "spark", label: "Adaptive recommendations" },
  "spark-personalization": { agent: "spark", label: "Personalized experiences" },
  "spark-intelligence": { agent: "spark", label: "User intelligence" },

  // Pulse — notifications & realtime
  "pulse-notifications": { agent: "pulse", label: "Smart notifications" },
  "pulse-realtime": { agent: "pulse", label: "Realtime updates" },
  "pulse-activity": { agent: "pulse", label: "Activity feeds" },
  "pulse-reminders": { agent: "pulse", label: "Deadline reminders" },

  // Lens — search & discovery
  "lens-search": { agent: "lens", label: "Universal search" },
  "lens-discovery": { agent: "lens", label: "Discovery surfaces" },
  "lens-navigation": { agent: "lens", label: "Search-driven navigation" },

  // Atlas — knowledge & memory
  "atlas-knowledge": { agent: "atlas", label: "Knowledge base" },
  "atlas-memory": { agent: "atlas", label: "Memory network" },
  "atlas-institutional": { agent: "atlas", label: "Institutional intelligence" },
  "atlas-documents": { agent: "atlas", label: "Document library" },

  // Sentinel — security & trust
  "sentinel-auth": { agent: "sentinel", label: "Authentication" },
  "sentinel-authz": { agent: "sentinel", label: "Authorization & permissions" },
  "sentinel-moderation": { agent: "sentinel", label: "Content moderation" },
  "sentinel-fraud": { agent: "sentinel", label: "Fraud detection" },
  "sentinel-compliance": { agent: "sentinel", label: "Compliance & audit" },
};

// ─── Orchestration Protocol ───────────────────────────────────────────────
export const ORCHESTRATION_FLOW = [
  { step: 1, from: "User", to: "Bud", description: "User interacts with Bud" },
  { step: 2, from: "Bud", to: "Oracle", description: "Bud routes to Oracle for orchestration" },
  { step: 3, from: "Oracle", to: "Specialist Agent", description: "Oracle selects & activates the right agent(s)" },
  { step: 4, from: "Specialist Agent", to: "Oracle", description: "Agent processes & returns result" },
  { step: 5, from: "Oracle", to: "Bud", description: "Oracle synthesizes result" },
  { step: 6, from: "Bud", to: "User", description: "Bud responds as one cohesive companion" },
];

export const ORCHESTRATION_RULES = [
  "Agents never expose their identity to users — only Bud is visible",
  "Oracle resolves conflicts when multiple agents provide conflicting guidance",
  "Agent priority: Sentinel > Oracle > Atlas > Spark > Pulse > Lens > Orbit > Forge",
  "All agent decisions are logged to Sentinel's audit store",
  "Agents request data from other agents through Oracle mediation only",
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