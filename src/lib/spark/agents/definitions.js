// Spark Multi-Agent Registry — 25 specialist agents across 6 divisions.
// Configuration-driven: each agent is a data record, not hardcoded logic.
// Admins may add/remove/rename/enable/disable/reorder agents by editing the
// SparkAgent entity (seeded from this file); the orchestrator reads the
// entity at runtime and falls back to these defaults if the entity is empty.

function defineAgent(partial) {
  return {
    responsibilities: [],
    tools: [],
    context_scope: "platform",
    memory_scope: "own domain only",
    permissions: [],
    input_schema: { type: "object", properties: { prompt: { type: "string" }, context: { type: "object" } } },
    output_schema: { type: "object", properties: { result: { type: "string" }, structured: { type: "object" } } },
    validation_rules: ["Output must directly address the assigned task"],
    success_criteria: ["Response is coherent and actionable"],
    failure_handling: "Return a short diagnostic; Spark may retry or reassign",
    retry_max: 2,
    handoff_rules: "Return to Spark on completion or ambiguity",
    dependencies: [],
    integration_rules: ["Integrate with Bud, Spark, Pulse, Oracle"],
    enabled: true,
    order: 0,
    ...partial,
  };
}

export const SPARK_AGENT_DEFINITIONS = [
  // ── VISION DIVISION ──
  defineAgent({
    agent_id: "forge", name: "Forge", division: "Vision", order: 1, role: "Product Architecture",
    responsibilities: ["Define product direction", "Own feature architecture", "Validate product coherence"],
    tools: ["PlatformModule", "ArchitectConfig"], context_scope: "product roadmap + module registry",
    memory_scope: "architecture decisions", permissions: ["read:PlatformModule", "read:ArchitectConfig"],
    validation_rules: ["Aligns with Founder Constitution", "No duplicate modules"],
    success_criteria: ["Architecture is coherent and extensible"], focus: "Product architecture and platform coherence.",
  }),
  defineAgent({
    agent_id: "canvas", name: "Canvas", division: "Vision", order: 2, role: "UX/UI Architecture",
    responsibilities: ["Design system integrity", "Screen hierarchy", "Accessibility of layouts"],
    tools: ["DesignTokens", "UDS"], context_scope: "design system + screen registry",
    memory_scope: "design decisions", permissions: ["read:design tokens"],
    validation_rules: ["Follows UDS tokens", "Passes Organization Test"],
    success_criteria: ["Consistent, accessible UI"], focus: "UX/UI architecture and design-system integrity.",
  }),
  defineAgent({
    agent_id: "flow", name: "Flow", division: "Vision", order: 3, role: "Workflow Architecture",
    responsibilities: ["User journeys", "Workflow completeness", "State transitions"],
    tools: ["Automation", "WorkflowBuilder"], context_scope: "workflows + automations",
    memory_scope: "workflow definitions", permissions: ["read:Automation"],
    validation_rules: ["No broken journeys", "Every workflow completes"],
    success_criteria: ["End-to-end journeys validated"], focus: "Workflow architecture and journey completeness.",
  }),
  defineAgent({
    agent_id: "script", name: "Script", division: "Vision", order: 4, role: "Documentation & Knowledge",
    responsibilities: ["Documentation", "Knowledge base", "Onboarding content"],
    tools: ["KnowledgeHub", "LibraryResource"], context_scope: "knowledge + docs",
    memory_scope: "documentation state", permissions: ["read:KnowledgeHub"],
    validation_rules: ["Accurate and current"], success_criteria: ["Docs complete and discoverable"],
    focus: "Documentation, knowledge base, and onboarding content.",
  }),

  // ── ENGINEERING DIVISION ──
  defineAgent({
    agent_id: "frontend", name: "Frontend", division: "Engineering", order: 5, role: "Frontend",
    responsibilities: ["React/Tailwind surfaces", "Component architecture", "Responsive behavior"],
    tools: ["Components", "Pages"], context_scope: "frontend codebase",
    memory_scope: "component inventory", permissions: ["read:components"],
    validation_rules: ["No missing imports", "Responsive + accessible"],
    success_criteria: ["Builds clean, renders on all breakpoints"], focus: "Frontend engineering and component architecture.",
  }),
  defineAgent({
    agent_id: "backend", name: "Backend", division: "Engineering", order: 6, role: "Backend",
    responsibilities: ["Backend functions", "Integrations", "Server logic"],
    tools: ["BackendFunctions", "Core integrations"], context_scope: "backend functions + integrations",
    memory_scope: "function inventory", permissions: ["read:functions"],
    validation_rules: ["Validated inputs", "Errors logged"], success_criteria: ["Functions tested and reliable"],
    focus: "Backend engineering, functions, and integrations.",
  }),
  defineAgent({
    agent_id: "foundation", name: "Foundation", division: "Engineering", order: 7, role: "Database Architecture",
    responsibilities: ["Entity schemas", "Relationships", "Data integrity", "RLS"],
    tools: ["Entities", "RLS"], context_scope: "entity schemas + RLS",
    memory_scope: "schema versions", permissions: ["read:entities"],
    validation_rules: ["Schemas complete", "RLS enforces isolation"],
    success_criteria: ["Data integrity and tenancy isolation verified"], focus: "Database architecture, schemas, and RLS.",
  }),
  defineAgent({
    agent_id: "bridge", name: "Bridge", division: "Engineering", order: 8, role: "API & Integration",
    responsibilities: ["API design", "Connector integrations", "Webhooks"],
    tools: ["Connectors", "WebhookEvent"], context_scope: "apis + connectors",
    memory_scope: "integration map", permissions: ["read:connectors"],
    validation_rules: ["No undocumented endpoints", "Integrations tested"],
    success_criteria: ["APIs documented and connected"], focus: "API and integration architecture.",
  }),
  defineAgent({
    agent_id: "deploy", name: "Deploy", division: "Engineering", order: 9, role: "Infrastructure & DevOps",
    responsibilities: ["Deployment", "Environments", "Release pipelines"],
    tools: ["ProviderLog", "AuditLog"], context_scope: "deployment + infra",
    memory_scope: "release history", permissions: ["read:ProviderLog"],
    validation_rules: ["Reproducible deployments"], success_criteria: ["Pipelines validated"],
    focus: "Infrastructure, DevOps, and release pipelines.",
  }),

  // ── INTELLIGENCE DIVISION ──
  defineAgent({
    agent_id: "bud", name: "Bud", division: "Intelligence", order: 10, role: "Primary Assistant",
    responsibilities: ["User-facing interaction", "Natural communication", "Unified answers"],
    tools: ["InvokeLLM", "BudMemory", "BudConversation"], context_scope: "user context + conversations",
    memory_scope: "conversation memory", permissions: ["read:BudMemory", "write:BudConversation"],
    validation_rules: ["Never exposes internal orchestration", "Calm, mentor tone"],
    success_criteria: ["User receives one unified, helpful answer"], focus: "Primary user-facing AI companion.",
  }),
  defineAgent({
    agent_id: "oracle", name: "Oracle", division: "Intelligence", order: 11, role: "Platform Operations Intelligence",
    responsibilities: ["Platform analytics", "Governance", "Monitoring intelligence"],
    tools: ["OracleModules", "AuditLog", "SecurityEvent"], context_scope: "platform operations",
    memory_scope: "platform metrics", permissions: ["read:Oracle modules"],
    validation_rules: ["Admin-gated"], success_criteria: ["Platform health surfaced"],
    focus: "Platform operations and governance intelligence.",
  }),
  defineAgent({
    agent_id: "atlas", name: "Atlas", division: "Intelligence", order: 12, role: "Search & Knowledge",
    responsibilities: ["Search", "Knowledge retrieval", "Recommendations"],
    tools: ["KnowledgeHub", "Search"], context_scope: "knowledge graph + search",
    memory_scope: "relevance signals", permissions: ["read:KnowledgeHub"],
    validation_rules: ["Results relevant"], success_criteria: ["Accurate retrieval"],
    focus: "Search and knowledge retrieval.",
  }),

  // ── TRUST DIVISION ──
  defineAgent({
    agent_id: "sentinel", name: "Sentinel", division: "Trust", order: 13, role: "Security",
    responsibilities: ["Threat detection", "RLS review", "Secrets posture"],
    tools: ["SecurityEvent", "AuditLog", "ApiKey"], context_scope: "security surface",
    memory_scope: "threat history", permissions: ["read:SecurityEvent"],
    validation_rules: ["No exposed secrets", "RLS enforced"],
    success_criteria: ["Security requirements verified"], focus: "Security and threat protection.",
  }),
  defineAgent({
    agent_id: "velocity", name: "Velocity", division: "Trust", order: 14, role: "Performance",
    responsibilities: ["Latency", "Query efficiency", "Scalability review"],
    tools: ["ProviderLog", "RegistryMetrics"], context_scope: "performance metrics",
    memory_scope: "perf baselines", permissions: ["read:ProviderLog"],
    validation_rules: ["Meets latency targets"], success_criteria: ["Performance validated"],
    focus: "Performance and scalability.",
  }),
  defineAgent({
    agent_id: "access", name: "Access", division: "Trust", order: 15, role: "Accessibility & Compliance",
    responsibilities: ["WCAG review", "Reduced motion", "Compliance posture"],
    tools: ["UDS tokens"], context_scope: "accessibility surface",
    memory_scope: "a11y findings", permissions: ["read:design tokens"],
    validation_rules: ["WCAG AA", "Reduced-motion respected"],
    success_criteria: ["Accessibility verified"], focus: "Accessibility and compliance.",
  }),

  // ── OPERATIONS DIVISION ──
  defineAgent({
    agent_id: "pulse", name: "Pulse", division: "Operations", order: 16, role: "Analytics & Monitoring",
    responsibilities: ["Live metrics", "Monitoring", "Incident feed"],
    tools: ["Monitoring", "ProviderLog", "WebhookEvent"], context_scope: "real-time metrics",
    memory_scope: "metric history", permissions: ["read:Monitoring"],
    validation_rules: ["Real signals only"], success_criteria: ["Observability complete"],
    focus: "Analytics and real-time monitoring.",
  }),
  defineAgent({
    agent_id: "ops", name: "Ops", division: "Operations", order: 17, role: "Operations",
    responsibilities: ["Operational workflows", "Runbooks", "On-call"],
    tools: ["Operator", "ManagementTask"], context_scope: "operations",
    memory_scope: "ops state", permissions: ["read:ManagementTask"],
    validation_rules: ["Runbooks complete"], success_criteria: ["Operations smooth"],
    focus: "Day-to-day operations and runbooks.",
  }),
  defineAgent({
    agent_id: "launch", name: "Launch", division: "Operations", order: 18, role: "Release Management",
    responsibilities: ["Release readiness", "Rollout", "Rollback"],
    tools: ["PlatformModule", "AuditLog"], context_scope: "release state",
    memory_scope: "release log", permissions: ["read:PlatformModule"],
    validation_rules: ["Go/no-go criteria met"], success_criteria: ["Safe release"],
    focus: "Release management and rollout.",
  }),
  defineAgent({
    agent_id: "campus", name: "Campus", division: "Operations", order: 19, role: "Institution Success",
    responsibilities: ["Institution onboarding", "Tenant health", "Success metrics"],
    tools: ["Institution", "InstitutionRegistry"], context_scope: "institutions",
    memory_scope: "tenant health", permissions: ["read:Institution"],
    validation_rules: ["Tenants healthy"], success_criteria: ["Institutions successful"],
    focus: "Institution success and tenant health.",
  }),
  defineAgent({
    agent_id: "ledger", name: "Ledger", division: "Operations", order: 20, role: "Marketplace & Finance",
    responsibilities: ["Payments", "Wallet flow", "Marketplace integrity"],
    tools: ["Wallet", "FinancialTransaction", "MarketplaceListing"], context_scope: "finance + marketplace",
    memory_scope: "financial state", permissions: ["read:FinancialTransaction"],
    validation_rules: ["Reconciliation balanced"], success_criteria: ["Finance healthy"],
    focus: "Marketplace and finance operations.",
  }),

  // ── GOVERNANCE DIVISION ──
  defineAgent({
    agent_id: "review", name: "Review", division: "Governance", order: 21, role: "Founder Review",
    responsibilities: ["Founder audit", "Phase lock", "Quality gate"],
    tools: ["AuditLog", "PlatformModule"], context_scope: "platform state",
    memory_scope: "review history", permissions: ["read:platform state"],
    validation_rules: ["Phase checklist passes"], success_criteria: ["Founder approved"],
    focus: "Founder review and quality gates.",
  }),
  defineAgent({
    agent_id: "audit", name: "Audit", division: "Governance", order: 22, role: "Integration Validation",
    responsibilities: ["Integration validation", "Dependency checks", "Connection tests"],
    tools: ["AuditLog", "ProviderLog"], context_scope: "integrations",
    memory_scope: "integration health", permissions: ["read:integrations"],
    validation_rules: ["Every integration connected"], success_criteria: ["Integrations validated"],
    focus: "Integration validation and dependency checks.",
  }),
  defineAgent({
    agent_id: "certify", name: "Certify", division: "Governance", order: 23, role: "Global Certification",
    responsibilities: ["Production certification", "Launch readiness", "Compliance sign-off"],
    tools: ["AuditLog", "SecurityEvent"], context_scope: "certification surface",
    memory_scope: "certification state", permissions: ["read:certification"],
    validation_rules: ["All checklist items true"], success_criteria: ["Certified"],
    focus: "Global certification and launch readiness.",
  }),
  defineAgent({
    agent_id: "guardian", name: "Guardian", division: "Governance", order: 24, role: "Risk & Compliance",
    responsibilities: ["Risk register", "Compliance", "Privacy"],
    tools: ["SecurityEvent", "AuditLog"], context_scope: "risk + compliance",
    memory_scope: "risk register", permissions: ["read:risk"],
    validation_rules: ["Risks documented"], success_criteria: ["Compliance maintained"],
    focus: "Risk and compliance.",
  }),
  defineAgent({
    agent_id: "insight", name: "Insight", division: "Governance", order: 25, role: "Executive Intelligence",
    responsibilities: ["Executive summaries", "Cross-platform insight", "Decision support"],
    tools: ["Oracle", "RegistryMetrics"], context_scope: "platform-wide metrics",
    memory_scope: "executive briefs", permissions: ["read:Oracle"],
    validation_rules: ["Accurate aggregation"], success_criteria: ["Clear executive picture"],
    focus: "Executive intelligence and decision support.",
  }),
];

export const SPARK_DIVISIONS = ["Vision", "Engineering", "Intelligence", "Trust", "Operations", "Governance"];

export const agentById = (id) => SPARK_AGENT_DEFINITIONS.find((a) => a.agent_id === id);