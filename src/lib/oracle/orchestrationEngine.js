/**
 * Oracle Orchestration Engine
 *
 * Oracle operates as an Executive Chief of Staff — proactively coordinating
 * every Super Agent, breaking down tasks, detecting dependencies, and
 * generating structured recommendations with the 8-point execution standard.
 *
 * Pipeline: Intent → Analyze → Select Agents → Plan → Execute → Review
 */

import { SUPER_AGENTS, resolveAgentsForTask } from "./executiveMode";

// ─── Platform Service Registry ───────────────────────────────────────────
export const PLATFORM_SERVICES = [
  { id: "api", label: "API Gateway", domain: "infrastructure", critical: true },
  { id: "database", label: "Database", domain: "infrastructure", critical: true },
  { id: "auth", label: "Authentication", domain: "infrastructure", critical: true },
  { id: "storage", label: "File Storage", domain: "infrastructure", critical: true },
  { id: "ai", label: "AI Services", domain: "intelligence", critical: true },
  { id: "media", label: "Media Services", domain: "infrastructure", critical: false },
  { id: "community", label: "Community", domain: "social", critical: false },
  { id: "marketplace", label: "Marketplace", domain: "commerce", critical: false },
  { id: "banking", label: "Banking", domain: "finance", critical: true },
  { id: "academic", label: "Academic Systems", domain: "education", critical: false },
  { id: "notifications", label: "Notifications", domain: "communication", critical: false },
  { id: "search", label: "Search", domain: "intelligence", critical: false },
];

// ─── Task Categories ─────────────────────────────────────────────────────
export const TASK_CATEGORIES = {
  bug_fix: { label: "Bug Fix", priority: "high", agents: ["forge", "pulse"] },
  feature: { label: "New Feature", priority: "medium", agents: ["orbit", "forge"] },
  design: { label: "Design Improvement", priority: "medium", agents: ["orbit"] },
  security: { label: "Security Issue", priority: "critical", agents: ["sentinel", "forge"] },
  performance: { label: "Performance", priority: "high", agents: ["forge", "pulse"] },
  ux: { label: "UX Improvement", priority: "medium", agents: ["orbit", "bud"] },
  accessibility: { label: "Accessibility", priority: "high", agents: ["orbit", "sentinel"] },
  refactoring: { label: "Refactoring", priority: "low", agents: ["forge"] },
  integration: { label: "Integration", priority: "medium", agents: ["nexus", "forge"] },
  content: { label: "Content", priority: "low", agents: ["lens"] },
  infrastructure: { label: "Infrastructure", priority: "high", agents: ["forge", "pulse", "nexus"] },
  ai_improvement: { label: "AI Improvement", priority: "medium", agents: ["oracle", "bud"] },
};

// ─── Issue Types (Self-Improvement Scanner) ──────────────────────────────
export const ISSUE_TYPES = [
  "poor_ux", "weak_ui", "slow_workflow", "broken_logic", "duplicate_system",
  "security_weakness", "performance_bottleneck", "missing_feature",
  "accessibility_issue", "scalability_limitation",
];

// ─── Orchestration Pipeline ──────────────────────────────────────────────

/**
 * Analyze an incoming task or intent.
 * Returns a structured analysis with category, complexity, dependencies,
 * and recommended agents.
 */
export function analyzeTask(intent, context = {}) {
  const intentLower = intent.toLowerCase();

  // Detect task category from intent keywords
  let category = "feature";
  for (const [key, meta] of Object.entries(TASK_CATEGORIES)) {
    if (intentLower.includes(key.replace("_", " ")) || intentLower.includes(key)) {
      category = key;
      break;
    }
  }

  // Detect complexity from intent length and keywords
  const words = intent.split(/\s+/).length;
  let complexity = "low";
  if (words > 20 || /architect|redesign|overhaul|migrate|refactor/.test(intentLower)) complexity = "high";
  else if (words > 10 || /improve|enhance|optimize|integrate/.test(intentLower)) complexity = "medium";

  // Select agents based on category
  const agents = resolveAgentsForTask(context.authorityCode || "ADM-000", category);

  return {
    intent,
    category,
    categoryLabel: TASK_CATEGORIES[category]?.label || "Feature",
    priority: TASK_CATEGORIES[category]?.priority || "medium",
    complexity,
    recommendedAgents: agents,
    detectedDependencies: context.dependencies || [],
    timestamp: new Date().toISOString(),
  };
}

/**
 * Break down a large task into smaller, sequenced sub-tasks.
 * Oracle prevents duplicate work by checking for overlap.
 */
export function breakDownTask(analysis) {
  const { complexity, recommendedAgents } = analysis;

  if (complexity === "low") {
    return [{
      id: "sub_1",
      title: analysis.intent,
      agents: recommendedAgents.slice(0, 2),
      status: "pending",
      dependsOn: [],
    }];
  }

  const subTasks = [
    {
      id: "sub_1",
      title: "Research & Analysis",
      description: "Gather requirements, review existing implementation, identify constraints",
      agents: recommendedAgents.slice(0, 2),
      status: "pending",
      dependsOn: [],
    },
    {
      id: "sub_2",
      title: "Design & Architecture",
      description: "Propose solution architecture and design approach",
      agents: recommendedAgents.filter(a => a.id === "orbit" || a.id === "forge").slice(0, 2),
      status: "pending",
      dependsOn: ["sub_1"],
    },
    {
      id: "sub_3",
      title: "Implementation",
      description: "Execute the approved plan",
      agents: recommendedAgents.filter(a => a.id === "forge" || a.id === "nexus").slice(0, 2),
      status: "pending",
      dependsOn: ["sub_2"],
    },
    {
      id: "sub_4",
      title: "Review & Validation",
      description: "Verify results, check for regressions, ensure quality",
      agents: recommendedAgents.filter(a => a.id === "sentinel" || a.id === "pulse").slice(0, 2),
      status: "pending",
      dependsOn: ["sub_3"],
    },
  ];

  if (complexity === "high") {
    subTasks.splice(2, 0, {
      id: "sub_2b",
      title: "Risk Assessment",
      description: "Identify risks, security implications, and rollback strategy",
      agents: recommendedAgents.filter(a => a.id === "sentinel"),
      status: "pending",
      dependsOn: ["sub_2"],
    });
    subTasks[3].dependsOn = ["sub_2b"];
  }

  return subTasks;
}

/**
 * Generate a structured recommendation with the 8-point execution standard.
 * Every recommendation includes: problem, root cause, solution, impact,
 * dependencies, risks, testing plan, and rollback strategy.
 */
export function generateRecommendation(issue, analysis, context = {}) {
  return {
    id: `rec_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    // 8-Point Execution Standard
    problem: issue.description || issue.title,
    rootCause: issue.root_cause || analysis.intent,
    proposedSolution: issue.solution || "Solution to be determined by consulting agents",
    expectedImpact: issue.impact || "Platform improvement",
    dependencies: analysis.detectedDependencies,
    risks: issue.risks || ["Requires testing before deployment"],
    testingPlan: [
      "Unit tests for affected components",
      "Integration test for end-to-end flow",
      "Manual QA on target devices",
    ],
    rollbackStrategy: issue.rollback || "Revert to previous deployment via version control",
    // Metadata
    category: analysis.category,
    priority: analysis.priority,
    complexity: analysis.complexity,
    assignedAgents: analysis.recommendedAgents.map(a => ({ id: a.id, name: a.name, role: a.role })),
    status: "pending_review",
    service: issue.service || context.service,
  };
}

/**
 * Create a full execution plan for a task.
 * This is Oracle's primary orchestration output.
 */
export function createExecutionPlan(intent, context = {}) {
  const analysis = analyzeTask(intent, context);
  const subTasks = breakDownTask(analysis);

  return {
    planId: `plan_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    intent,
    analysis,
    subTasks,
    coordinationNote: `Oracle coordinates ${analysis.recommendedAgents.length} agents. Each contributes within its expertise only.`,
    phases: [
      { phase: 1, title: "Consultation", status: "pending", agents: analysis.recommendedAgents },
      { phase: 2, title: "Planning", status: "pending", agents: analysis.recommendedAgents.filter(a => a.id === "oracle") },
      { phase: 3, title: "Execution", status: "pending", agents: subTasks.flatMap(s => s.agents) },
      { phase: 4, title: "Review", status: "pending", agents: analysis.recommendedAgents.filter(a => a.id === "pulse" || a.id === "sentinel") },
    ],
    auditRequired: true,
    rollbackSupported: true,
    status: "draft",
  };
}

/**
 * Detect duplicate work by comparing new tasks against existing plans.
 */
export function detectDuplicateWork(newIntent, existingPlans = []) {
  const newWords = new Set(newIntent.toLowerCase().split(/\s+/));
  for (const plan of existingPlans) {
    const existingWords = new Set((plan.intent || "").toLowerCase().split(/\s+/));
    const overlap = [...newWords].filter(w => existingWords.has(w) && w.length > 3);
    const similarity = overlap.length / Math.max(newWords.size, 1);
    if (similarity > 0.6) {
      return { isDuplicate: true, similarPlan: plan, similarity };
    }
  }
  return { isDuplicate: false };
}