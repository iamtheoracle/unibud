/**
 * UNIBUD Engineering Constitution
 *
 * This document is implementation-agnostic. It defines governing principles,
 * architecture rules, product standards, and engineering process. It should
 * rarely change — it is designed to remain stable for years.
 *
 * Implementation documents (Bud Personas, Orbit Config, Marketplace Spec,
 * Banking Spec, Campus Spec) live separately and change frequently.
 *
 * Structure:
 *   Principles → Governance → Architecture Rules → Product Standards →
 *   Engineering Process → Data Governance → System Architecture
 */

// ─── Preamble ─────────────────────────────────────────────────────────────
export const CONSTITUTION_PREAMBLE = {
  title: "Remove Replicants. Engineer the Future.",
  statement:
    "UNIBUD is not an application — it is a continuously evolving operating system. " +
    "It learns, improves, collaborates, researches, innovates, monitors, assists, " +
    "and scales globally. This constitution governs every engineering decision.",
  effectiveDate: "2026-07-29",
  authority: "ADM-000",
  enforcedBy: "oracle",
  stabilityClass: "permanent",
  amendmentProcess: "Requires Founder (ADM-000) approval. Constitution amendments must not be made casually.",
};

// ─── Part I: Principles ──────────────────────────────────────────────────
export const PRINCIPLES = [
  {
    id: "P1",
    title: "Originality Over Replication",
    rule: "Every feature must have a differentiator, not merely parity with an existing platform.",
    test: "Why would someone use UNIBUD instead of another app?",
    ifNoAnswer: "Redesign it.",
  },
  {
    id: "P2",
    title: "Agents Are Domain Systems",
    rule: "Super Agents are production-grade intelligent systems, not chat personas.",
    implication: "Each agent owns the complete lifecycle of its domain — monitoring, improving, validating, documenting, evolving.",
  },
  {
    id: "P3",
    title: "Structured Execution",
    rule: "Development follows structured engineering methodology, not ad hoc feature building.",
    methodology: ["Identify dependencies", "Create execution plans", "Parallelize workstreams", "Assign to correct agents", "Validate architecture", "Test continuously", "Improve continuously"],
  },
  {
    id: "P4",
    title: "Living Operating System",
    rule: "UNIBUD is a continuously evolving platform, not a collection of static applications.",
    characteristics: ["Learns", "Improves", "Collaborates", "Researches", "Innovates", "Monitors", "Assists", "Scales globally"],
  },
  {
    id: "P5",
    title: "Every Administrator Interacts Only With Bud",
    rule: "Administrators are people. Agents are platform intelligence that assist them. All interaction flows through Bud.",
    separation: "Authority Codes define WHO can decide. Agent Codes define WHICH AI performs the work.",
  },
];

// ─── Part II: Governance ────────────────────────────────────────────────
export const GOVERNANCE = {
  authorityCodes: "ADM-000 through ADM-160, organized into levels A0–A4",
  managementCenters: [
    "Founder Workspace",
    "Platform Operations",
    "Trust & Operations",
    "Experience & Business",
  ],
  ownershipRequirements: [
    "A responsible specialist agent",
    "A responsible management center",
    "A responsible operational owner",
    "Documentation",
    "Monitoring",
    "Security",
    "Analytics",
  ],
  permanentRule: "No feature, screen, service, workflow, dashboard, API, database, integration, or management system may exist without all ownership requirements.",
};

// ─── Part III: Architecture Rules ─────────────────────────────────────────
export const ARCHITECTURE_RULES = [
  {
    id: "AR1",
    title: "Modular Architecture",
    rule: "Every capability must exist as an independent module with clear ownership, interfaces, permissions, observability, and scalability.",
    prevents: "Monolithic architecture",
    exampleModules: [
      "Marketplace Service", "Bank Service", "Identity Service", "Campus Service",
      "Learning Service", "Community Service", "Events Service", "Research Service",
      "Notification Service", "Media Service",
    ],
    eachModule: "Independently deployable with clear API boundaries",
  },
  {
    id: "AR2",
    title: "Separation of Constitution and Implementation",
    rule: "The constitution remains stable. Implementation documents change frequently and live separately.",
    constitution: ["Principles", "Governance", "Architecture Rules", "Product Standards", "Engineering Process", "Data Governance", "System Architecture"],
    implementationDocs: ["Bud Personas", "Orbit Config", "Marketplace Spec", "Banking Spec", "Campus Spec"],
  },
  {
    id: "AR3",
    title: "Capability-Based Product Design",
    rule: "Products are built on reusable capability platforms, not as standalone feature lists.",
    examples: {
      marketplace: "Commerce primitives (Listings, Catalog, Orders, Payments, Escrow) → individual marketplaces are configurations of the same platform",
      banking: "Core capabilities (Ledger, Accounts, Identity, Compliance) → products (Wallet, Cards, Savings) are built on those capabilities",
    },
  },
  {
    id: "AR4",
    title: "Product Identity Uniqueness",
    rule: "Every product must have its own navigation, interactions, colors, motion, typography, illustrations, empty states, and dashboards.",
    rule_2: "They belong to one ecosystem but should never feel like copies.",
  },
];

// ─── Part IV: Product Standards ───────────────────────────────────────────
export const PRODUCT_STANDARDS = [
  "Every screen must answer: Why would someone use UNIBUD instead of another app?",
  "No placeholders without real activity — UNIBUD must feel alive",
  "No non-functional buttons or dead-end navigation",
  "Empty states must be elegantly designed and guide the user toward their next action",
  "Every product has its own identity — no reused interfaces",
  "Accessibility is a first-class requirement, not an afterthought",
  "Bud adapts multidimensionally — not one persona, but multiple attributes simultaneously",
];

// ─── Part V: Engineering Process ────────────────────────────────────────
export const ENGINEERING_GATES = [
  { order: 1, gate: "Discovery", owner: "orbit", description: "Problem identification, user research, competitive analysis" },
  { order: 2, gate: "Architecture", owner: "oracle", description: "System design, dependency mapping, module boundaries" },
  { order: 3, gate: "Design", owner: "orbit", description: "UX, UI, interaction design, product identity" },
  { order: 4, gate: "Implementation", owner: "forge", description: "Production code, infrastructure, automation" },
  { order: 5, gate: "Testing", owner: "forge", description: "Unit, integration, end-to-end, regression" },
  { order: 6, gate: "Security Review", owner: "sentinel", description: "Threat modeling, vulnerability assessment, permission audit" },
  { order: 7, gate: "Performance Review", owner: "pulse", description: "Latency, throughput, resource usage, scalability" },
  { order: 8, gate: "Accessibility Review", owner: "orbit", description: "WCAG compliance, assistive tech, inclusive design" },
  { order: 9, gate: "Documentation", owner: "atlas", description: "API docs, user guides, architectural decisions" },
  { order: 10, gate: "Deployment", owner: "forge", description: "Release, rollback plan, feature flags" },
  { order: 11, gate: "Monitoring", owner: "pulse", description: "Health checks, alerting, dashboards, SLOs" },
];

export const GATE_RULE = "No shortcuts. Oracle prevents unfinished systems from shipping — every gate must pass before the next begins.";

// ─── Part VI: Data Governance ────────────────────────────────────────────
export const DATA_GOVERNANCE = {
  title: "Data Governance Directive",
  enforcedBy: "oracle",
  securedBy: "sentinel",
  principles: [
    "Single source of truth — no duplicated authoritative data stores",
    "Schema ownership — every schema has a designated owning module and agent",
    "Audit logs — every data mutation is logged for compliance and traceability",
    "Permissions — row-level security enforced on every entity",
    "Versioning — schema changes are versioned and backward-compatible",
    "Lifecycle rules — data retention, archival, and deletion policies enforced automatically",
  ],
  rule: "Without data governance, growth becomes difficult. Oracle enforces these principles silently.",
};

// ─── Part VII: System Architecture Directive ─────────────────────────────
export const SYSTEM_ARCHITECTURE_DIRECTIVE = {
  number: 11,
  title: "Modular Architecture — Every Capability Is an Independent Module",
  rule: "Every capability must exist as an independent module with clear ownership, interfaces, permissions, observability, and scalability.",
  rationale: "This prevents monolithic architecture and enables independent deployment, scaling, and evolution.",
  moduleRequirements: [
    "Clear ownership — one owning agent and one operational owner",
    "Defined interfaces — stable API contracts between modules",
    "Permissions — module-level access control enforced by Sentinel",
    "Observability — health, performance, and usage metrics surfaced to Pulse",
    "Scalability — each module scales independently based on demand",
  ],
  coreModules: [
    { name: "Marketplace Service", agent: "orbit", capabilities: "Commerce platform" },
    { name: "Bank Service", agent: "oracle", capabilities: "Financial platform" },
    { name: "Identity Service", agent: "sentinel", capabilities: "Auth, verification, access control" },
    { name: "Campus Service", agent: "orbit", capabilities: "Academic operations" },
    { name: "Learning Service", agent: "orbit", capabilities: "Courses, materials, assessments" },
    { name: "Community Service", agent: "sentinel", capabilities: "Social, clubs, communities" },
    { name: "Events Service", agent: "pulse", capabilities: "Discovery, scheduling, attendance" },
    { name: "Research Service", agent: "atlas", capabilities: "Projects, publications, collaboration" },
    { name: "Notification Service", agent: "pulse", capabilities: "Smart notifications, digest, delivery" },
    { name: "Media Service", agent: "forge", capabilities: "Upload, processing, delivery" },
    { name: "Integrations Service", agent: "nexus", capabilities: "External service connections" },
    { name: "Communications Service", agent: "echo", capabilities: "Cross-channel messaging" },
  ],
};

// ─── Part VIII: Platform KPIs ────────────────────────────────────────────
export const PLATFORM_KPIS = {
  title: "Platform KPIs — Agents Optimize Against Measurable Objectives",
  enforcedBy: "oracle",
  measuredBy: "pulse",
  categories: {
    engineering: [
      { kpi: "Task completion rate", owner: "oracle", target: "≥ 95%" },
      { kpi: "Feature adoption", owner: "spark", target: "Track per feature" },
      { kpi: "Latency (p95)", owner: "pulse", target: "< 200ms API, < 2s page load" },
      { kpi: "Error rate", owner: "pulse", target: "< 0.1%" },
    ],
    academic: [
      { kpi: "Learning outcomes", owner: "spark", target: "Improvement over baseline" },
      { kpi: "Assignment completion", owner: "orbit", target: "≥ 90% on-time" },
    ],
    engagement: [
      { kpi: "Retention (D7/D30)", owner: "spark", target: "Track cohort retention" },
      { kpi: "Community engagement", owner: "pulse", target: "Active participation growth" },
      { kpi: "Search success rate", owner: "lens", target: "≥ 80% find what they need" },
    ],
    commerce: [
      { kpi: "Marketplace GMV", owner: "orbit", target: "Month-over-month growth" },
    ],
    support: [
      { kpi: "Support resolution time", owner: "pulse", target: "Median < 24h" },
    ],
    ai: [
      { kpi: "AI satisfaction", owner: "spark", target: "User-rated quality ≥ 4/5" },
    ],
  },
  rule: "Oracle measures success automatically. Agents optimize against these measurable objectives.",
};

// ─── Complete Directive Index (1-11) ──────────────────────────────────────
export const ALL_DIRECTIVES = [
  { number: 1, title: "Remove Replication", part: "Principles" },
  { number: 2, title: "Expand Super Agents", part: "Principles" },
  { number: 3, title: "Social Intelligence", part: "Product Standards" },
  { number: 4, title: "Living Content", part: "Product Standards" },
  { number: 5, title: "Engineer the Marketplace (as Capability Platform)", part: "Architecture Rules" },
  { number: 6, title: "Engineer the Bank (as Capability Platform)", part: "Architecture Rules" },
  { number: 7, title: "Every Product Has Its Own Identity", part: "Architecture Rules" },
  { number: 8, title: "Re-engineer Instead of Patching", part: "Engineering Process" },
  { number: 9, title: "Think Like an Engineering Organization", part: "Engineering Process" },
  { number: 10, title: "Build a Living Operating System", part: "Principles" },
  { number: 11, title: "Modular Architecture — Independent Modules", part: "System Architecture" },
];

// ─── Organizational Structure ────────────────────────────────────────────
export const ORG_STRUCTURE = {
  oracle: {
    role: "Chief Intelligence & Workflow Orchestrator",
    owns: ["Governance", "Architecture", "Security oversight", "Quality", "Planning"],
    coordinates: true,
  },
  bud: {
    role: "Unified Super Agent",
    owns: ["Learning Intelligence", "Universal conversational interface"],
    userFacing: true,
  },
  orbit: {
    role: "Chief Product Organization",
    owns: ["Product discovery", "Architecture", "UX", "Design systems", "Innovation pipeline"],
  },
  forge: {
    role: "Engineering & Delivery",
    owns: ["Production code", "Infrastructure", "CI/CD", "Deployments", "Internal tooling"],
  },
  sentinel: {
    role: "Trust Platform",
    owns: ["Authentication", "Authorization", "Verification", "Moderation", "Fraud", "Compliance", "Audit", "Security"],
  },
  pulse: {
    role: "Platform Intelligence (Realtime)",
    owns: ["Notifications", "Live updates", "Event streams", "Monitoring", "Health checks"],
  },
  lens: {
    role: "Research & Discovery",
    owns: ["Universal search", "Discovery", "Content indexing", "Semantic retrieval"],
  },
  atlas: {
    role: "Knowledge Intelligence",
    owns: ["Institutional knowledge", "Documentation", "Memory", "Policies", "Knowledge graph"],
  },
  nexus: {
    role: "Integrations",
    owns: ["External service connections", "API adapters", "Connector management", "Webhook routing"],
  },
  echo: {
    role: "Communications",
    owns: ["Cross-channel messaging", "External comms", "Notification delivery", "Conversation routing"],
  },
};