/**
 * UNIBUD Evolution Constitution
 *
 * UNIBUD is a living Operating System. It must continuously evolve without
 * losing quality, consistency, trust, or architectural integrity.
 *
 * This constitution governs every future release, refactoring, optimization,
 * and innovation. It ensures the platform becomes more capable with every
 * release while remaining simple to use, trustworthy, maintainable,
 * scalable, and architecturally consistent.
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const EVOLUTION_PREAMBLE = {
  title: "UNIBUD Evolution Constitution",
  statement:
    "UNIBUD is a living Operating System. It must continuously evolve without losing " +
    "quality, consistency, trust, or architectural integrity. Every improvement must " +
    "strengthen the platform without compromising user trust, system quality, or the " +
    "long-term vision of UNIBUD as an AI-native university operating system.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const EVOLUTION_GLOBAL_RULE = {
  id: "evolution_global",
  rule:
    "UNIBUD should become more capable with every release while remaining simple to use, " +
    "trustworthy, maintainable, scalable, and architecturally consistent. Every improvement " +
    "must strengthen the platform without compromising user trust, system quality, or the " +
    "long-term vision of UNIBUD as an AI-native university operating system.",
  severity: "critical",
};

export const EVOLUTION_CATEGORIES = [
  { id: "features", label: "Future Features", icon: "Puzzle" },
  { id: "compatibility", label: "Backward Compatibility", icon: "Undo2" },
  { id: "refactoring", label: "Continuous Refactoring", icon: "Recycle" },
  { id: "optimization", label: "Continuous Optimization", icon: "Gauge" },
  { id: "testing", label: "Continuous Testing", icon: "FlaskConical" },
  { id: "learning", label: "Continuous Learning", icon: "GraduationCap" },
  { id: "scalability", label: "Scalability", icon: "Expand" },
  { id: "innovation", label: "Innovation", icon: "Lightbulb" },
];

export const EVOLUTION_RULES = [
  // ── Future Features ──
  { id: "feat_bud", category: "features", rule: "Every new feature must integrate with Bud", severity: "high" },
  { id: "feat_search", category: "features", rule: "Every new feature must integrate with Search", severity: "high" },
  { id: "feat_notifications", category: "features", rule: "Every new feature must integrate with Notifications", severity: "high" },
  { id: "feat_analytics", category: "features", rule: "Every new feature must integrate with Analytics", severity: "high" },
  { id: "feat_profiles", category: "features", rule: "Every new feature must integrate with Profiles", severity: "high" },
  { id: "feat_permissions", category: "features", rule: "Every new feature must integrate with Permissions", severity: "high" },
  { id: "feat_accessibility", category: "features", rule: "Every new feature must integrate with Accessibility", severity: "high" },
  { id: "feat_design_system", category: "features", rule: "Every new feature must integrate with the Design System", severity: "high" },

  // ── Backward Compatibility ──
  { id: "compat_workflows", category: "compatibility", rule: "Existing user workflows should continue working whenever practical", severity: "high" },
  { id: "compat_data", category: "compatibility", rule: "Existing data should remain compatible after upgrades", severity: "critical" },
  { id: "compat_integrations", category: "compatibility", rule: "Existing integrations should be validated before release", severity: "high" },
  { id: "compat_apis", category: "compatibility", rule: "Existing APIs should follow a documented deprecation process", severity: "high" },

  // ── Continuous Refactoring ──
  { id: "refac_code", category: "refactoring", rule: "Remove obsolete code", severity: "medium" },
  { id: "refac_ui", category: "refactoring", rule: "Remove obsolete UI", severity: "medium" },
  { id: "refac_apis", category: "refactoring", rule: "Remove obsolete APIs", severity: "medium" },
  { id: "refac_assets", category: "refactoring", rule: "Remove obsolete assets", severity: "medium" },
  { id: "refac_db_fields", category: "refactoring", rule: "Remove obsolete database fields", severity: "medium" },
  { id: "refac_flags", category: "refactoring", rule: "Remove obsolete feature flags", severity: "medium" },
  { id: "refac_debt", category: "refactoring", rule: "Eliminate technical debt continuously", severity: "high" },

  // ── Continuous Optimization ──
  { id: "opt_startup", category: "optimization", rule: "Improve startup time", severity: "high" },
  { id: "opt_ai_response", category: "optimization", rule: "Improve AI response time", severity: "high" },
  { id: "opt_database", category: "optimization", rule: "Improve database performance", severity: "high" },
  { id: "opt_search", category: "optimization", rule: "Improve search performance", severity: "high" },
  { id: "opt_media", category: "optimization", rule: "Improve media performance", severity: "high" },
  { id: "opt_battery", category: "optimization", rule: "Improve battery efficiency", severity: "high" },
  { id: "opt_network", category: "optimization", rule: "Improve network efficiency", severity: "high" },
  { id: "opt_accessibility", category: "optimization", rule: "Improve accessibility", severity: "high" },
  { id: "opt_maintainability", category: "optimization", rule: "Improve maintainability", severity: "high" },

  // ── Continuous Testing ──
  { id: "test_automated", category: "testing", rule: "Run automated tests before every deployment", severity: "critical" },
  { id: "test_regression", category: "testing", rule: "Run regression tests after every major change", severity: "high" },
  { id: "test_accessibility", category: "testing", rule: "Run accessibility audits", severity: "high" },
  { id: "test_security", category: "testing", rule: "Run security audits", severity: "critical" },
  { id: "test_performance", category: "testing", rule: "Run performance audits", severity: "high" },
  { id: "test_integration", category: "testing", rule: "Run integration audits", severity: "high" },
  { id: "test_ai_quality", category: "testing", rule: "Run AI quality audits", severity: "high" },
  { id: "test_production", category: "testing", rule: "Run production readiness validation", severity: "critical" },

  // ── Continuous Learning ──
  { id: "learn_policies", category: "learning", rule: "Bud should learn new university policies", severity: "high" },
  { id: "learn_curriculum", category: "learning", rule: "Bud should learn curriculum updates", severity: "high" },
  { id: "learn_campus", category: "learning", rule: "Bud should learn campus changes", severity: "high" },
  { id: "learn_resources", category: "learning", rule: "Bud should learn new academic resources", severity: "medium" },
  { id: "learn_preferences", category: "learning", rule: "Bud should learn user preferences with permission", severity: "critical" },
  { id: "learn_recommendations", category: "learning", rule: "Bud should improve recommendations using genuine interactions only", severity: "critical" },

  // ── Scalability ──
  { id: "scale_single_uni", category: "scalability", rule: "UNIBUD should support one university", severity: "high" },
  { id: "scale_multi_uni", category: "scalability", rule: "UNIBUD should support multiple universities", severity: "high" },
  { id: "scale_national", category: "scalability", rule: "UNIBUD should support national deployments", severity: "high" },
  { id: "scale_international", category: "scalability", rule: "UNIBUD should support international deployments", severity: "high" },
  { id: "scale_million_users", category: "scalability", rule: "UNIBUD should support millions of users", severity: "critical" },
  { id: "scale_million_docs", category: "scalability", rule: "UNIBUD should support millions of documents", severity: "critical" },
  { id: "scale_million_ai", category: "scalability", rule: "UNIBUD should support millions of AI conversations", severity: "critical" },
  { id: "scale_million_media", category: "scalability", rule: "UNIBUD should support millions of media files", severity: "critical" },

  // ── Innovation ──
  { id: "innov_student_xp", category: "innovation", rule: "New technologies should improve the student experience", severity: "critical" },
  { id: "innov_reliability", category: "innovation", rule: "New technologies should improve reliability", severity: "high" },
  { id: "innov_security", category: "innovation", rule: "New technologies should improve security", severity: "critical" },
  { id: "innov_accessibility", category: "innovation", rule: "New technologies should improve accessibility", severity: "high" },
  { id: "innov_maintainability", category: "innovation", rule: "New technologies should improve maintainability", severity: "high" },
  { id: "innov_product_constitution", category: "innovation", rule: "New technologies should align with the Product Constitution", severity: "high" },
  { id: "innov_eng_constitution", category: "innovation", rule: "New technologies should align with the Engineering Constitution", severity: "high" },
  { id: "innov_not_just_new", category: "innovation", rule: "Never adopt technology solely because it is new", severity: "critical" },
];

export function getEvolutionRulesByCategory(categoryId) {
  return EVOLUTION_RULES.filter((r) => r.category === categoryId);
}

export function getEvolutionRuleCount() {
  return EVOLUTION_RULES.length;
}