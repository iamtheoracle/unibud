/**
 * UNIBUD Product Constitution
 *
 * This constitution governs every product decision, feature, screen, AI
 * capability, workflow, and future release. It complements the Engineering
 * Constitution (which governs technical implementation) by governing the
 * product itself — what we build, why we build it, and how it serves students.
 *
 * If a proposed change conflicts with these principles, revise the change
 * before implementation rather than weakening the platform's consistency,
 * trustworthiness, or user experience.
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const PRODUCT_PREAMBLE = {
  title: "UNIBUD Product Constitution",
  statement:
    "This constitution governs every product decision, feature, screen, AI capability, " +
    "workflow, and future release. Every future design decision, engineering task, AI " +
    "enhancement, integration, or release must comply with this Product Constitution. " +
    "If a proposed change conflicts with these principles, revise the change before " +
    "implementation rather than weakening the platform's consistency, trustworthiness, " +
    "or user experience.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const PRODUCT_GLOBAL_RULE = {
  id: "product_global",
  rule:
    "Every future design decision, engineering task, AI enhancement, integration, or release " +
    "must comply with this Product Constitution. If a proposed change conflicts with these " +
    "principles, revise the change before implementation rather than weakening the platform's " +
    "consistency, trustworthiness, or user experience.",
  severity: "critical",
};

export const PRODUCT_CATEGORIES = [
  { id: "core", label: "Core Principles", icon: "Sparkles" },
  { id: "design", label: "Design Principles", icon: "Palette" },
  { id: "feature", label: "Feature Principles", icon: "Puzzle" },
  { id: "data", label: "Data Principles", icon: "Database" },
  { id: "ai", label: "AI Principles", icon: "Brain" },
  { id: "engineering", label: "Engineering Principles", icon: "Wrench" },
  { id: "performance", label: "Performance Principles", icon: "Gauge" },
  { id: "launch", label: "Launch Principles", icon: "Rocket" },
];

export const PRODUCT_RULES = [
  // ── Core Principles ──
  { id: "core_os", category: "core", rule: "UNIBUD is an Operating System, not a collection of apps", severity: "critical" },
  { id: "core_bud_only", category: "core", rule: "Bud is the only visible AI", severity: "critical" },
  { id: "core_student_life", category: "core", rule: "Every feature exists to improve student life", severity: "critical" },
  { id: "core_simplicity", category: "core", rule: "Simplicity is preferred over complexity", severity: "high" },
  { id: "core_quality", category: "core", rule: "Quality is preferred over quantity", severity: "high" },
  { id: "core_trust", category: "core", rule: "Trust is preferred over engagement", severity: "critical" },
  { id: "core_maintainability", category: "core", rule: "Long-term maintainability is preferred over shortcuts", severity: "high" },

  // ── Design Principles ──
  { id: "design_purpose", category: "design", rule: "Every screen has a clear purpose", severity: "high" },
  { id: "design_few_steps", category: "design", rule: "Every action should require as few steps as practical", severity: "high" },
  { id: "design_predictable", category: "design", rule: "Navigation should always feel predictable", severity: "high" },
  { id: "design_never_lost", category: "design", rule: "Users should never feel lost", severity: "high" },
  { id: "design_feedback", category: "design", rule: "Every interaction should provide immediate feedback", severity: "high" },
  { id: "design_animation", category: "design", rule: "Every animation should communicate state, not distract", severity: "medium" },
  { id: "design_system", category: "design", rule: "Every visual element should belong to the design system", severity: "high" },
  { id: "design_accessible", category: "design", rule: "Every interface should be accessible", severity: "high" },

  // ── Feature Principles ──
  { id: "feat_real_problem", category: "feature", rule: "Does it solve a real problem?", severity: "critical" },
  { id: "feat_vision", category: "feature", rule: "Does it fit the UNIBUD vision?", severity: "critical" },
  { id: "feat_bud", category: "feature", rule: "Does it integrate with Bud?", severity: "high" },
  { id: "feat_search", category: "feature", rule: "Does it integrate with Search?", severity: "high" },
  { id: "feat_notifications", category: "feature", rule: "Does it integrate with Notifications?", severity: "high" },
  { id: "feat_analytics", category: "feature", rule: "Does it integrate with Analytics?", severity: "high" },
  { id: "feat_profiles", category: "feature", rule: "Does it integrate with User Profiles?", severity: "high" },
  { id: "feat_permissions", category: "feature", rule: "Does it integrate with Permissions?", severity: "high" },
  { id: "feat_student_xp", category: "feature", rule: "Does it improve the student experience?", severity: "critical" },
  { id: "feat_redesign", category: "feature", rule: "If any answer is No, redesign the feature before implementation", severity: "critical" },

  // ── Data Principles ──
  { id: "data_necessary", category: "data", rule: "Store only necessary data", severity: "high" },
  { id: "data_minimize", category: "data", rule: "Minimize personal data collection", severity: "high" },
  { id: "data_control", category: "data", rule: "Give users control over their data", severity: "critical" },
  { id: "data_export", category: "data", rule: "Make exports straightforward", severity: "high" },
  { id: "data_deletion", category: "data", rule: "Make deletion straightforward", severity: "high" },
  { id: "data_retention", category: "data", rule: "Respect data retention policies", severity: "high" },
  { id: "data_regulations", category: "data", rule: "Respect privacy regulations", severity: "critical" },

  // ── AI Principles ──
  { id: "ai_helpful", category: "ai", rule: "Bud must be helpful", severity: "high" },
  { id: "ai_truthful", category: "ai", rule: "Bud must be truthful", severity: "critical" },
  { id: "ai_uncertainty", category: "ai", rule: "Bud must explain uncertainty", severity: "high" },
  { id: "ai_no_fabricate", category: "ai", rule: "Bud must not fabricate facts", severity: "critical" },
  { id: "ai_privacy", category: "ai", rule: "Bud must protect privacy", severity: "critical" },
  { id: "ai_clarification", category: "ai", rule: "Bud must request clarification when needed", severity: "high" },
  { id: "ai_official_info", category: "ai", rule: "Bud must always identify official information when available", severity: "critical" },

  // ── Engineering Principles ──
  { id: "eng_production_ready", category: "engineering", rule: "Every feature must be production-ready", severity: "critical" },
  { id: "eng_testable", category: "engineering", rule: "Every release must be testable", severity: "high" },
  { id: "eng_documented", category: "engineering", rule: "Every API must be documented", severity: "high" },
  { id: "eng_reusable", category: "engineering", rule: "Every component must be reusable", severity: "high" },
  { id: "eng_complete", category: "engineering", rule: "Every workflow must be complete", severity: "critical" },
  { id: "eng_justified_deps", category: "engineering", rule: "Every dependency must be justified", severity: "medium" },
  { id: "eng_no_regressions", category: "engineering", rule: "Every change must avoid regressions", severity: "critical" },

  // ── Performance Principles ──
  { id: "perf_startup", category: "performance", rule: "Fast startup", severity: "high" },
  { id: "perf_responsive", category: "performance", rule: "Responsive interactions", severity: "high" },
  { id: "perf_smooth", category: "performance", rule: "Smooth animations", severity: "medium" },
  { id: "perf_memory", category: "performance", rule: "Efficient memory usage", severity: "high" },
  { id: "perf_battery", category: "performance", rule: "Efficient battery usage", severity: "high" },
  { id: "perf_network", category: "performance", rule: "Efficient network usage", severity: "high" },

  // ── Launch Principles ──
  { id: "launch_no_placeholder", category: "launch", rule: "Never ship placeholder content", severity: "critical" },
  { id: "launch_no_broken", category: "launch", rule: "Never ship broken workflows", severity: "critical" },
  { id: "launch_no_dead", category: "launch", rule: "Never ship dead buttons", severity: "critical" },
  { id: "launch_no_incomplete", category: "launch", rule: "Never ship incomplete integrations", severity: "critical" },
  { id: "launch_no_fake", category: "launch", rule: "Never ship fake user activity", severity: "critical" },
  { id: "launch_no_unverified", category: "launch", rule: "Never ship unverified university information", severity: "critical" },
  { id: "launch_no_defects", category: "launch", rule: "Never ship critical defects", severity: "critical" },
  { id: "launch_no_inconsistent", category: "launch", rule: "Never ship inconsistent UI", severity: "high" },
];

export function getProductRulesByCategory(categoryId) {
  return PRODUCT_RULES.filter((r) => r.category === categoryId);
}

export function getProductRuleCount() {
  return PRODUCT_RULES.length;
}