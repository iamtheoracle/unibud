/**
 * UNIBUD Definition of Done (DoD)
 *
 * A feature is NOT complete because it exists. A feature is complete only
 * when all conditions in this checklist have been satisfied.
 *
 * No feature, screen, workflow, AI capability, integration, or service may
 * be marked "Complete" unless every applicable item has been satisfied.
 * Partial implementation must be tracked as "In Progress," not "Done."
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const DOD_PREAMBLE = {
  title: "UNIBUD Definition of Done",
  statement:
    "A feature is NOT complete because it exists. A feature is complete only when all " +
    "of the following conditions are satisfied. No feature, screen, workflow, AI capability, " +
    "integration, or service may be marked 'Complete' unless every applicable item in this " +
    "Definition of Done has been satisfied. Partial implementation must be tracked as " +
    "'In Progress,' not 'Done.'",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const DOD_GLOBAL_RULE = {
  id: "dod_global",
  rule:
    "No feature, screen, workflow, AI capability, integration, or service may be marked " +
    "'Complete' unless every applicable item in this Definition of Done has been satisfied. " +
    "Partial implementation must be tracked as 'In Progress,' not 'Done.'",
  severity: "critical",
};

export const DOD_CATEGORIES = [
  { id: "functional", label: "Functional", icon: "CheckCircle" },
  { id: "ux", label: "User Experience", icon: "MousePointerClick" },
  { id: "design", label: "Design", icon: "Palette" },
  { id: "backend", label: "Backend", icon: "Server" },
  { id: "performance", label: "Performance", icon: "Gauge" },
  { id: "ai", label: "AI", icon: "Brain" },
  { id: "security", label: "Security", icon: "ShieldCheck" },
  { id: "accessibility", label: "Accessibility", icon: "Accessibility" },
  { id: "qa", label: "Quality Assurance", icon: "FlaskConical" },
  { id: "production", label: "Production", icon: "Rocket" },
  { id: "documentation", label: "Documentation", icon: "FileText" },
];

export const DOD_RULES = [
  // ── Functional ──
  { id: "fn_performs", category: "functional", rule: "The feature performs every intended function", severity: "critical" },
  { id: "fn_buttons", category: "functional", rule: "Every button works", severity: "critical" },
  { id: "fn_menus", category: "functional", rule: "Every menu works", severity: "critical" },
  { id: "fn_gestures", category: "functional", rule: "Every gesture works", severity: "high" },
  { id: "fn_workflow", category: "functional", rule: "Every workflow completes successfully", severity: "critical" },
  { id: "fn_no_dead_ends", category: "functional", rule: "No dead ends exist", severity: "critical" },
  { id: "fn_no_placeholder", category: "functional", rule: "No placeholder functionality exists", severity: "critical" },

  // ── User Experience ──
  { id: "ux_intuitive", category: "ux", rule: "The interface is intuitive", severity: "high" },
  { id: "ux_consistent", category: "ux", rule: "Navigation is consistent", severity: "high" },
  { id: "ux_animations", category: "ux", rule: "Animations are smooth", severity: "medium" },
  { id: "ux_loading", category: "ux", rule: "Loading states exist", severity: "high" },
  { id: "ux_error", category: "ux", rule: "Error states exist", severity: "high" },
  { id: "ux_success", category: "ux", rule: "Success states exist", severity: "high" },
  { id: "ux_empty", category: "ux", rule: "Empty states are meaningful", severity: "high" },
  { id: "ux_accessibility", category: "ux", rule: "Accessibility requirements are met", severity: "high" },
  { id: "ux_production_ready", category: "ux", rule: "The feature feels production-ready", severity: "critical" },

  // ── Design ──
  { id: "design_system", category: "design", rule: "Uses the official Design System", severity: "high" },
  { id: "design_mirror_glass", category: "design", rule: "Uses Mirror Glass 350", severity: "high" },
  { id: "design_shadow", category: "design", rule: "Uses Shadow 350", severity: "high" },
  { id: "design_typography", category: "design", rule: "Uses official typography", severity: "high" },
  { id: "design_spacing", category: "design", rule: "Uses official spacing", severity: "high" },
  { id: "design_color", category: "design", rule: "Uses official color tokens", severity: "high" },
  { id: "design_iconography", category: "design", rule: "Uses official iconography", severity: "high" },
  { id: "design_matches", category: "design", rule: "Matches every other screen", severity: "high" },

  // ── Backend ──
  { id: "be_database", category: "backend", rule: "Database is complete", severity: "critical" },
  { id: "be_apis", category: "backend", rule: "APIs are complete", severity: "critical" },
  { id: "be_validation", category: "backend", rule: "Validation is complete", severity: "critical" },
  { id: "be_authorization", category: "backend", rule: "Authorization is complete", severity: "critical" },
  { id: "be_permissions", category: "backend", rule: "Permissions are complete", severity: "critical" },
  { id: "be_audit", category: "backend", rule: "Audit logging is complete", severity: "high" },
  { id: "be_errors", category: "backend", rule: "Error handling is complete", severity: "high" },

  // ── Performance ──
  { id: "perf_loading", category: "performance", rule: "Fast loading", severity: "high" },
  { id: "perf_responsive", category: "performance", rule: "Responsive interactions", severity: "high" },
  { id: "perf_media", category: "performance", rule: "Optimized media", severity: "high" },
  { id: "perf_queries", category: "performance", rule: "Optimized database queries", severity: "high" },
  { id: "perf_memory", category: "performance", rule: "Optimized memory usage", severity: "high" },
  { id: "perf_battery", category: "performance", rule: "Optimized battery usage", severity: "high" },
  { id: "perf_network", category: "performance", rule: "Optimized network usage", severity: "high" },

  // ── AI ──
  { id: "ai_understands", category: "ai", rule: "Bud understands the feature", severity: "high" },
  { id: "ai_explains", category: "ai", rule: "Bud can explain the feature", severity: "high" },
  { id: "ai_searches", category: "ai", rule: "Bud can search the feature", severity: "high" },
  { id: "ai_assists", category: "ai", rule: "Bud can assist inside the feature", severity: "high" },
  { id: "ai_permissions", category: "ai", rule: "Bud respects permissions", severity: "critical" },
  { id: "ai_info_only", category: "ai", rule: "Bud uses only available information", severity: "critical" },

  // ── Security ──
  { id: "sec_auth", category: "security", rule: "Authentication verified", severity: "critical" },
  { id: "sec_authz", category: "security", rule: "Authorization verified", severity: "critical" },
  { id: "sec_data", category: "security", rule: "Sensitive data protected", severity: "critical" },
  { id: "sec_privacy", category: "security", rule: "Privacy respected", severity: "critical" },
  { id: "sec_testing", category: "security", rule: "Security testing completed", severity: "critical" },

  // ── Accessibility ──
  { id: "a11y_reader", category: "accessibility", rule: "Screen reader compatible", severity: "high" },
  { id: "a11y_keyboard", category: "accessibility", rule: "Keyboard accessible where applicable", severity: "high" },
  { id: "a11y_contrast", category: "accessibility", rule: "High contrast supported", severity: "high" },
  { id: "a11y_text", category: "accessibility", rule: "Dynamic text supported", severity: "high" },
  { id: "a11y_motion", category: "accessibility", rule: "Reduced motion supported", severity: "high" },
  { id: "a11y_targets", category: "accessibility", rule: "Touch targets meet accessibility standards", severity: "high" },

  // ── Quality Assurance ──
  { id: "qa_unit", category: "qa", rule: "Unit tests pass", severity: "high" },
  { id: "qa_integration", category: "qa", rule: "Integration tests pass", severity: "high" },
  { id: "qa_e2e", category: "qa", rule: "End-to-end tests pass", severity: "critical" },
  { id: "qa_regression", category: "qa", rule: "Regression tests pass", severity: "high" },
  { id: "qa_performance", category: "qa", rule: "Performance tests pass", severity: "high" },
  { id: "qa_a11y", category: "qa", rule: "Accessibility audits pass", severity: "high" },
  { id: "qa_security", category: "qa", rule: "Security audits pass", severity: "critical" },

  // ── Production ──
  { id: "prod_no_placeholder", category: "production", rule: "No placeholder content", severity: "critical" },
  { id: "prod_no_fake", category: "production", rule: "No fake user-generated activity", severity: "critical" },
  { id: "prod_no_broken_nav", category: "production", rule: "No broken navigation", severity: "critical" },
  { id: "prod_no_broken_links", category: "production", rule: "No broken links", severity: "critical" },
  { id: "prod_no_broken_apis", category: "production", rule: "No broken APIs", severity: "critical" },
  { id: "prod_no_console_errors", category: "production", rule: "No console errors", severity: "high" },
  { id: "prod_no_critical_bugs", category: "production", rule: "No critical bugs", severity: "critical" },
  { id: "prod_no_visual_inconsistencies", category: "production", rule: "No visual inconsistencies", severity: "high" },
  { id: "prod_no_blockers", category: "production", rule: "No production blockers", severity: "critical" },

  // ── Documentation ──
  { id: "doc_user", category: "documentation", rule: "User documentation updated", severity: "medium" },
  { id: "doc_api", category: "documentation", rule: "API documentation updated", severity: "medium" },
  { id: "doc_developer", category: "documentation", rule: "Developer documentation updated", severity: "medium" },
  { id: "doc_release", category: "documentation", rule: "Release notes prepared", severity: "medium" },
];

export function getDodRulesByCategory(categoryId) {
  return DOD_RULES.filter((r) => r.category === categoryId);
}

export function getDodRuleCount() {
  return DOD_RULES.length;
}