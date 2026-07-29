/**
 * Oracle Executive Mode Coordinator
 *
 * After authority verification, Oracle enters Executive Mode — the central
 * governance intelligence that coordinates every Super Agent, organizes
 * complex work, and executes authorized administrative operations.
 *
 * This module provides the orchestration logic for:
 *  • Determining which specialist agents to consult for a given task
 *  • Sequencing agent consultations
 *  · Merging agent outputs into a final executive decision
 *  • Ensuring every action is audit-logged
 */

import { AUTHORITY_AGENT_MAPPING, getSupportingAgents } from "./authorityCodes";

// ─── Super Agent Registry ───────────────────────────────────────────────
// Each agent contributes specialized knowledge. Oracle NEVER works alone —
// it consults relevant agents before finalizing any executive decision.
export const SUPER_AGENTS = {
  bud: {
    id: "bud",
    name: "Bud",
    role: "Primary Interface & Companion",
    expertise: ["user interaction", "conversational AI", "task delegation"],
    consultFor: ["user-facing decisions", "communication", "onboarding"],
  },
  oracle: {
    id: "oracle",
    name: "Oracle",
    role: "Executive Coordination Intelligence",
    expertise: ["governance", "orchestration", "architecture", "strategy"],
    consultFor: ["platform-wide decisions", "cross-domain coordination", "executive operations"],
  },
  orbit: {
    id: "orbit",
    name: "Orbit",
    role: "Design Intelligence",
    expertise: ["UI/UX", "design system", "layouts", "accessibility", "responsiveness"],
    consultFor: ["design changes", "layout improvements", "visual hierarchy", "navigation reorganization"],
  },
  forge: {
    id: "forge",
    name: "Forge",
    role: "Engineering Intelligence",
    expertise: ["code architecture", "performance", "deployments", "technical debt"],
    consultFor: ["technical decisions", "releases", "rollbacks", "infrastructure"],
  },
  sentinel: {
    id: "sentinel",
    name: "Sentinel",
    role: "Trust & Security Intelligence",
    expertise: ["security", "moderation", "verification", "compliance", "incident response"],
    consultFor: ["security operations", "moderation", "access control", "fraud", "audit"],
  },
  pulse: {
    id: "pulse",
    name: "Pulse",
    role: "Operations & Monitoring Intelligence",
    expertise: ["monitoring", "health", "incident routing", "operational metrics"],
    consultFor: ["system health", "performance", "incident management", "operational support"],
  },
  lens: {
    id: "lens",
    name: "Lens",
    role: "Knowledge & Search Intelligence",
    expertise: ["search", "indexing", "content discovery", "knowledge retrieval"],
    consultFor: ["content management", "search", "knowledge organization"],
  },
  atlas: {
    id: "atlas",
    name: "Atlas",
    role: "Institutional Knowledge Intelligence",
    expertise: ["institutional data", "academic structures", "governance documentation"],
    consultFor: ["institutional operations", "academic administration", "compliance records"],
  },
  nexus: {
    id: "nexus",
    name: "Nexus",
    role: "Integration & Connectivity Intelligence",
    expertise: ["integrations", "APIs", "external services", "data pipelines"],
    consultFor: ["integration management", "external service coordination", "data flows"],
  },
  echo: {
    id: "echo",
    name: "Echo",
    role: "Communication & Messaging Intelligence",
    expertise: ["messaging", "notifications", "real-time communication", "channels"],
    consultFor: ["communication features", "notification systems", "messaging architecture"],
  },
};

// ─── Executive Task Categories ──────────────────────────────────────────
// Maps task types to the agents that should be consulted.
const TASK_AGENT_MAP = {
  module_management: ["forge", "pulse"],
  feature_flags: ["forge", "pulse"],
  maintenance_mode: ["pulse", "forge", "sentinel"],
  deployment: ["forge", "pulse"],
  rollback: ["forge", "pulse", "sentinel"],
  user_management: ["sentinel", "atlas"],
  permission_management: ["sentinel", "atlas"],
  community_management: ["sentinel", "orbit"],
  institution_management: ["atlas", "orbit"],
  design_changes: ["orbit"],
  navigation_reorganization: ["orbit", "pulse"],
  ai_configuration: ["oracle", "bud"],
  workflow_configuration: ["oracle", "nexus"],
  security_operations: ["sentinel", "pulse"],
  audit_review: ["sentinel", "atlas"],
  communication_config: ["echo"],
  integration_management: ["nexus", "pulse"],
  performance_optimization: ["forge", "pulse"],
};

/**
 * Resolve which agents should be consulted for a given executive task,
 * combining the task-type mapping with the admin's authority-level mapping.
 */
export function resolveAgentsForTask(authorityCode, taskType) {
  const taskAgents = TASK_AGENT_MAP[taskType] || ["oracle"];
  const authorityAgents = getSupportingAgents(authorityCode);
  // Union: task-specific agents + authority-level agents, deduplicated.
  const all = [...new Set([...taskAgents, ...authorityAgents])];
  // Oracle is always included as coordinator.
  if (!all.includes("oracle")) all.unshift("oracle");
  return all.map((id) => SUPER_AGENTS[id]).filter(Boolean);
}

/**
 * Build an executive consultation plan.
 * Oracle sequences agent consultations and merges their outputs.
 */
export function buildConsultationPlan(authorityCode, taskType, taskDescription) {
  const agents = resolveAgentsForTask(authorityCode, taskType);
  const mapping = AUTHORITY_AGENT_MAPPING[authorityCode];

  return {
    taskType,
    description: taskDescription,
    authorityCode,
    primaryInterface: mapping?.primaryInterface || "bud",
    coordinator: "oracle",
    consultationSequence: agents.map((agent, i) => ({
      step: i + 1,
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      expertise: agent.expertise.join(", "),
      status: "pending",
    })),
    totalSteps: agents.length,
    note: mapping?.note || "Oracle coordinates specialist agents as needed.",
  };
}

/**
 * Generate an executive implementation plan.
 * Oracle synthesizes agent consultations into an actionable plan.
 */
export function generateExecutivePlan(authorityCode, taskType, taskDescription) {
  const plan = buildConsultationPlan(authorityCode, taskType, taskDescription);

  return {
    ...plan,
    phases: [
      {
        phase: 1,
        title: "Consultation",
        description: `${plan.consultationSequence.length} specialist agents contribute expertise`,
        agents: plan.consultationSequence.map((s) => s.agentName),
        status: "pending",
      },
      {
        phase: 2,
        title: "Synthesis",
        description: "Oracle merges agent outputs into a unified recommendation",
        agent: "Oracle",
        status: "pending",
      },
      {
        phase: 3,
        title: "Execution",
        description: "Authorized operation is executed with audit logging",
        agent: "Oracle",
        status: "pending",
      },
      {
        phase: 4,
        title: "Verification",
        description: "Result is verified and audit record is finalized",
        agent: "Pulse",
        status: "pending",
      },
    ],
    auditRequired: true,
    rollbackSupported: true,
  };
}

/**
 * Check if an authority level can perform a given executive action.
 */
export function canPerformAction(authorityCode, taskType) {
  const agents = resolveAgentsForTask(authorityCode, taskType);
  return agents.length > 0;
}