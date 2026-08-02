/**
 * UNIBUD Engineering Constitution — Complete Rule Set
 *
 * These rules govern every engineering decision in UNIBUD. They are permanent
 * and must never be violated. Every future enhancement, bug fix, optimization,
 * AI capability, integration, or new module must comply with this constitution.
 *
 * The quality of the existing platform must never decline as UNIBUD evolves.
 */

export const CONSTITUTION_PREAMBLE = {
  title: "UNIBUD Engineering Constitution",
  statement:
    "Every future enhancement, bug fix, optimization, AI capability, integration, or new module " +
    "must comply with this Engineering Constitution. The quality of the existing platform must " +
    "never decline as UNIBUD evolves. New functionality should improve the operating system " +
    "without introducing regressions, inconsistencies, technical debt, or fragmented user experiences.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  enforcedBy: "oracle",
  stabilityClass: "permanent",
};

export const CONSTITUTION_CATEGORIES = [
  { id: "architecture", label: "Architecture", icon: "Box" },
  { id: "code_quality", label: "Code Quality", icon: "Code" },
  { id: "performance", label: "Performance", icon: "Gauge" },
  { id: "reliability", label: "Reliability", icon: "ShieldCheck" },
  { id: "security", label: "Security", icon: "Lock" },
  { id: "ux", label: "User Experience", icon: "Heart" },
  { id: "ai", label: "AI Principles", icon: "Brain" },
  { id: "maintainability", label: "Maintainability", icon: "Wrench" },
  { id: "release", label: "Release Standards", icon: "Rocket" },
];

export const CONSTITUTION_RULES = [
  // ── Architecture ──
  { id: "unified_os", category: "architecture", rule: "One unified operating system", severity: "critical", automated: false },
  { id: "bud_only_ai", category: "architecture", rule: "Bud is the only visible AI", severity: "critical", automated: false },
  { id: "module_integration", category: "architecture", rule: "Every module must integrate with every relevant module", severity: "high", automated: false },
  { id: "no_isolated_features", category: "architecture", rule: "No isolated features", severity: "high", automated: false },
  { id: "no_duplicate_functionality", category: "architecture", rule: "No duplicate functionality", severity: "critical", automated: false },
  { id: "no_duplicated_logic", category: "architecture", rule: "No duplicated business logic", severity: "critical", automated: false },
  { id: "no_duplicated_ui", category: "architecture", rule: "No duplicated UI components", severity: "high", automated: false },
  { id: "no_duplicated_apis", category: "architecture", rule: "No duplicated APIs", severity: "high", automated: false },
  { id: "reuse_shared", category: "architecture", rule: "Reuse shared services whenever possible", severity: "high", automated: false },

  // ── Code Quality ──
  { id: "modular_architecture", category: "code_quality", rule: "Modular architecture", severity: "high", automated: false },
  { id: "clean_architecture", category: "code_quality", rule: "Clean architecture", severity: "high", automated: false },
  { id: "feature_first", category: "code_quality", rule: "Feature-first organization", severity: "medium", automated: false },
  { id: "shared_design_system", category: "code_quality", rule: "Shared design system", severity: "high", automated: true },
  { id: "shared_component_library", category: "code_quality", rule: "Shared component library", severity: "high", automated: false },
  { id: "strong_typing", category: "code_quality", rule: "Strong typing", severity: "medium", automated: false },
  { id: "strict_validation", category: "code_quality", rule: "Strict validation", severity: "high", automated: false },
  { id: "consistent_naming", category: "code_quality", rule: "Consistent naming conventions", severity: "medium", automated: false },
  { id: "comprehensive_docs", category: "code_quality", rule: "Comprehensive documentation", severity: "medium", automated: false },
  { id: "versioned_apis", category: "code_quality", rule: "Versioned APIs", severity: "medium", automated: false },
  { id: "backward_compat", category: "code_quality", rule: "Backward compatibility where appropriate", severity: "medium", automated: false },

  // ── Performance ──
  { id: "fast_screen_open", category: "performance", rule: "Every screen should open quickly", severity: "high", automated: false },
  { id: "responsive_interactions", category: "performance", rule: "Every interaction should feel responsive", severity: "high", automated: false },
  { id: "lazy_load", category: "performance", rule: "Lazy load heavy resources", severity: "high", automated: false },
  { id: "optimize_queries", category: "performance", rule: "Optimize database queries", severity: "high", automated: true },
  { id: "cache_safely", category: "performance", rule: "Cache safely where appropriate", severity: "medium", automated: false },
  { id: "minimize_network", category: "performance", rule: "Minimize unnecessary network requests", severity: "medium", automated: false },
  { id: "compress_media", category: "performance", rule: "Compress images and videos", severity: "medium", automated: false },
  { id: "prevent_memory_leaks", category: "performance", rule: "Prevent memory leaks", severity: "high", automated: true },
  { id: "prevent_rerenders", category: "performance", rule: "Prevent unnecessary re-renders", severity: "medium", automated: false },
  { id: "smooth_scrolling", category: "performance", rule: "Maintain smooth scrolling and animations", severity: "medium", automated: false },

  // ── Reliability ──
  { id: "loading_success_error", category: "reliability", rule: "Every operation must have loading, success, and error handling", severity: "high", automated: true },
  { id: "retry_logic", category: "reliability", rule: "Every API must have retry logic where appropriate", severity: "medium", automated: false },
  { id: "graceful_recovery", category: "reliability", rule: "Every workflow must recover gracefully from failures", severity: "high", automated: false },
  { id: "prevent_corruption", category: "reliability", rule: "Prevent data corruption", severity: "critical", automated: false },
  { id: "prevent_duplicate_submissions", category: "reliability", rule: "Prevent duplicate submissions", severity: "high", automated: false },
  { id: "prevent_race_conditions", category: "reliability", rule: "Protect against race conditions", severity: "high", automated: false },
  { id: "validate_input", category: "reliability", rule: "Validate all user input", severity: "high", automated: false },
  { id: "log_errors", category: "reliability", rule: "Log unexpected errors for administrators", severity: "medium", automated: false },

  // ── Security ──
  { id: "auth_every_request", category: "security", rule: "Authenticate every protected request", severity: "critical", automated: true },
  { id: "authorize_every_action", category: "security", rule: "Authorize every protected action", severity: "critical", automated: false },
  { id: "encrypt_sensitive", category: "security", rule: "Encrypt sensitive data", severity: "critical", automated: false },
  { id: "protect_pii", category: "security", rule: "Protect personal information", severity: "critical", automated: false },
  { id: "validate_uploads", category: "security", rule: "Validate uploaded files", severity: "high", automated: false },
  { id: "sanitize_ugc", category: "security", rule: "Sanitize user-generated content", severity: "high", automated: false },
  { id: "prevent_vulns", category: "security", rule: "Prevent common web vulnerabilities", severity: "critical", automated: false },
  { id: "audit_logs", category: "security", rule: "Record audit logs for sensitive actions", severity: "high", automated: false },

  // ── User Experience ──
  { id: "no_dead_ends", category: "ux", rule: "Never leave users at a dead end", severity: "high", automated: false },
  { id: "meaningful_feedback", category: "ux", rule: "Always provide meaningful feedback", severity: "high", automated: false },
  { id: "consistent_nav", category: "ux", rule: "Maintain consistent navigation", severity: "high", automated: false },
  { id: "consistent_terminology", category: "ux", rule: "Maintain consistent terminology", severity: "medium", automated: false },
  { id: "consistent_visual", category: "ux", rule: "Maintain consistent visual language", severity: "medium", automated: false },
  { id: "accessibility_standards", category: "ux", rule: "Respect accessibility standards", severity: "high", automated: false },
  { id: "respect_privacy", category: "ux", rule: "Respect user privacy", severity: "critical", automated: false },
  { id: "respect_preferences", category: "ux", rule: "Respect user preferences", severity: "high", automated: false },

  // ── AI Principles ──
  { id: "bud_truthful", category: "ai", rule: "Bud must be truthful", severity: "critical", automated: true },
  { id: "bud_explain_uncertainty", category: "ai", rule: "Bud must explain uncertainty", severity: "high", automated: false },
  { id: "bud_never_invent", category: "ai", rule: "Bud must never invent university information", severity: "critical", automated: false },
  { id: "bud_use_official_data", category: "ai", rule: "Bud must use official data where available", severity: "critical", automated: true },
  { id: "bud_request_clarification", category: "ai", rule: "Bud must request clarification when required", severity: "high", automated: false },
  { id: "bud_respect_permissions", category: "ai", rule: "Bud must respect permissions", severity: "critical", automated: false },
  { id: "bud_protect_privacy", category: "ai", rule: "Bud must protect user privacy", severity: "critical", automated: false },
  { id: "bud_context_aware", category: "ai", rule: "Bud must remain context-aware", severity: "high", automated: false },

  // ── Maintainability ──
  { id: "integrate_existing", category: "maintainability", rule: "Every new feature must integrate with the existing architecture", severity: "high", automated: false },
  { id: "refactor_before_duplicate", category: "maintainability", rule: "Refactor before duplicating", severity: "high", automated: false },
  { id: "remove_obsolete_code", category: "maintainability", rule: "Remove obsolete code", severity: "medium", automated: false },
  { id: "remove_unused_assets", category: "maintainability", rule: "Remove unused assets", severity: "low", automated: false },
  { id: "remove_unused_tables", category: "maintainability", rule: "Remove unused database tables", severity: "medium", automated: false },
  { id: "remove_unused_apis", category: "maintainability", rule: "Remove unused APIs", severity: "low", automated: false },
  { id: "keep_deps_updated", category: "maintainability", rule: "Keep dependencies up to date", severity: "medium", automated: false },
  { id: "keep_docs_synced", category: "maintainability", rule: "Keep documentation synchronized with implementation", severity: "medium", automated: false },

  // ── Release Standards ──
  { id: "no_placeholders", category: "release", rule: "No placeholder content", severity: "critical", automated: false },
  { id: "no_unfinished_workflows", category: "release", rule: "No unfinished workflows", severity: "critical", automated: false },
  { id: "no_broken_nav", category: "release", rule: "No broken navigation", severity: "critical", automated: false },
  { id: "no_inaccessible_screens", category: "release", rule: "No inaccessible screens", severity: "critical", automated: false },
  { id: "no_blockers", category: "release", rule: "No production blockers", severity: "critical", automated: false },
  { id: "no_failing_tests", category: "release", rule: "No failing tests", severity: "high", automated: false },
  { id: "no_critical_bugs", category: "release", rule: "No unresolved critical bugs", severity: "critical", automated: false },
  { id: "no_inconsistent_ui", category: "release", rule: "No inconsistent UI", severity: "high", automated: false },
];

export const GLOBAL_RULE = {
  id: "global",
  rule:
    "Every future enhancement, bug fix, optimization, AI capability, integration, or new module " +
    "must comply with this Engineering Constitution. The quality of the existing platform must " +
    "never decline as UNIBUD evolves.",
  severity: "critical",
};

export function getRulesByCategory(categoryId) {
  return CONSTITUTION_RULES.filter((r) => r.category === categoryId);
}

export function getAutomatedRules() {
  return CONSTITUTION_RULES.filter((r) => r.automated);
}

export function getRuleCount() {
  return CONSTITUTION_RULES.length;
}