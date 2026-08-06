/**
 * UNIBUD Release Gate
 *
 * Every build must pass this certification before it can be released.
 * Only certify the release when every checklist item passes.
 *
 * If any certification item fails: do not release, create remediation
 * tasks, fix every blocking issue, and re-run all certification tests.
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const RELEASE_PREAMBLE = {
  title: "UNIBUD Release Gate",
  statement:
    "Every build must pass this certification before it can be released. A UNIBUD release " +
    "is considered complete only when every production, engineering, design, AI, security, " +
    "accessibility, and quality requirement has been verified. Shipping an incomplete feature, " +
    "unfinished workflow, or unresolved production blocker is prohibited.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const RELEASE_GLOBAL_RULE = {
  id: "release_global",
  rule:
    "A UNIBUD release is considered complete only when every production, engineering, design, " +
    "AI, security, accessibility, and quality requirement has been verified. Shipping an " +
    "incomplete feature, unfinished workflow, or unresolved production blocker is prohibited. " +
    "Only certify the release when every checklist item passes.",
  severity: "critical",
};

export const RELEASE_CATEGORIES = [
  { id: "release_cert", label: "Release Certification", icon: "PackageCheck" },
  { id: "visual_cert", label: "Visual Certification", icon: "Eye" },
  { id: "performance_cert", label: "Performance Certification", icon: "Gauge" },
  { id: "security_cert", label: "Security Certification", icon: "ShieldCheck" },
  { id: "ai_cert", label: "AI Certification", icon: "Brain" },
  { id: "production_cert", label: "Production Certification", icon: "Rocket" },
  { id: "launch_decision", label: "Launch Decision", icon: "Gate" },
];

export const RELEASE_RULES = [
  // ── Release Certification ──
  { id: "rc_features", category: "release_cert", rule: "Every feature is fully implemented", severity: "critical" },
  { id: "rc_workflows", category: "release_cert", rule: "Every workflow has been tested end-to-end", severity: "critical" },
  { id: "rc_screens", category: "release_cert", rule: "Every screen has been reviewed", severity: "high" },
  { id: "rc_apis", category: "release_cert", rule: "Every API has been validated", severity: "critical" },
  { id: "rc_migrations", category: "release_cert", rule: "Every database migration has been verified", severity: "critical" },
  { id: "rc_permissions", category: "release_cert", rule: "Every permission has been tested", severity: "critical" },
  { id: "rc_ai_workflows", category: "release_cert", rule: "Every AI workflow has been validated", severity: "high" },
  { id: "rc_notifications", category: "release_cert", rule: "Every notification has been verified", severity: "high" },
  { id: "rc_search", category: "release_cert", rule: "Every search result is accurate", severity: "high" },
  { id: "rc_uploads", category: "release_cert", rule: "Every upload succeeds", severity: "critical" },
  { id: "rc_downloads", category: "release_cert", rule: "Every download succeeds", severity: "critical" },
  { id: "rc_sync", category: "release_cert", rule: "Every synchronization completes successfully", severity: "critical" },
  { id: "rc_offline", category: "release_cert", rule: "Every offline workflow has been tested", severity: "high" },
  { id: "rc_realtime", category: "release_cert", rule: "Every real-time feature has been tested", severity: "high" },
  { id: "rc_accessibility", category: "release_cert", rule: "Every accessibility requirement has been verified", severity: "high" },

  // ── Visual Certification ──
  { id: "vc_placeholder_text", category: "visual_cert", rule: "No placeholder text", severity: "critical" },
  { id: "vc_placeholder_images", category: "visual_cert", rule: "No placeholder images", severity: "critical" },
  { id: "vc_lorem", category: "visual_cert", rule: "No lorem ipsum", severity: "critical" },
  { id: "vc_temp_icons", category: "visual_cert", rule: "No temporary icons", severity: "high" },
  { id: "vc_debug", category: "visual_cert", rule: "No debug components", severity: "critical" },
  { id: "vc_unfinished", category: "visual_cert", rule: "No unfinished screens", severity: "critical" },
  { id: "vc_spacing", category: "visual_cert", rule: "No inconsistent spacing", severity: "high" },
  { id: "vc_typography", category: "visual_cert", rule: "No inconsistent typography", severity: "high" },
  { id: "vc_colors", category: "visual_cert", rule: "No inconsistent colors", severity: "high" },
  { id: "vc_animations", category: "visual_cert", rule: "No inconsistent animations", severity: "medium" },
  { id: "vc_broken_layouts", category: "visual_cert", rule: "No broken layouts", severity: "critical" },
  { id: "vc_clipped", category: "visual_cert", rule: "No clipped content", severity: "high" },
  { id: "vc_overlapping", category: "visual_cert", rule: "No overlapping components", severity: "high" },
  { id: "vc_pixelation", category: "visual_cert", rule: "No pixelation", severity: "medium" },
  { id: "vc_blurry", category: "visual_cert", rule: "No blurry assets", severity: "medium" },

  // ── Performance Certification ──
  { id: "pc_startup", category: "performance_cert", rule: "Application startup meets target", severity: "high" },
  { id: "pc_nav", category: "performance_cert", rule: "Navigation is responsive", severity: "high" },
  { id: "pc_scroll", category: "performance_cert", rule: "Scrolling remains smooth", severity: "high" },
  { id: "pc_memory", category: "performance_cert", rule: "Memory usage is within budget", severity: "high" },
  { id: "pc_battery", category: "performance_cert", rule: "Battery usage is optimized", severity: "high" },
  { id: "pc_network", category: "performance_cert", rule: "Network usage is optimized", severity: "high" },
  { id: "pc_images", category: "performance_cert", rule: "Images are optimized", severity: "medium" },
  { id: "pc_videos", category: "performance_cert", rule: "Videos are optimized", severity: "medium" },
  { id: "pc_queries", category: "performance_cert", rule: "Database queries are optimized", severity: "high" },
  { id: "pc_api_latency", category: "performance_cert", rule: "API latency is within target", severity: "high" },
  { id: "pc_ai_latency", category: "performance_cert", rule: "AI response latency meets target", severity: "high" },

  // ── Security Certification ──
  { id: "sc_auth", category: "security_cert", rule: "Authentication verified", severity: "critical" },
  { id: "sc_authz", category: "security_cert", rule: "Authorization verified", severity: "critical" },
  { id: "sc_roles", category: "security_cert", rule: "Role permissions verified", severity: "critical" },
  { id: "sc_encryption", category: "security_cert", rule: "Encryption verified", severity: "critical" },
  { id: "sc_sensitive", category: "security_cert", rule: "Sensitive data protected", severity: "critical" },
  { id: "sc_audit", category: "security_cert", rule: "Audit logging enabled", severity: "high" },
  { id: "sc_scans", category: "security_cert", rule: "Security scans passed", severity: "critical" },
  { id: "sc_deps", category: "security_cert", rule: "Dependency vulnerabilities resolved", severity: "critical" },

  // ── AI Certification ──
  { id: "ac_accurate", category: "ai_cert", rule: "Bud answers accurately", severity: "critical" },
  { id: "ac_permissions", category: "ai_cert", rule: "Bud respects permissions", severity: "critical" },
  { id: "ac_uncertainty", category: "ai_cert", rule: "Bud explains uncertainty", severity: "high" },
  { id: "ac_no_fabricate", category: "ai_cert", rule: "Bud never fabricates university information", severity: "critical" },
  { id: "ac_modules", category: "ai_cert", rule: "Bud understands every module", severity: "high" },
  { id: "ac_features", category: "ai_cert", rule: "Bud integrates with every feature", severity: "high" },
  { id: "ac_sync", category: "ai_cert", rule: "Bud voice and text remain synchronized", severity: "high" },
  { id: "ac_context", category: "ai_cert", rule: "Bud maintains context correctly", severity: "high" },

  // ── Production Certification ──
  { id: "prc_critical", category: "production_cert", rule: "No critical bugs", severity: "critical" },
  { id: "prc_high", category: "production_cert", rule: "No high-priority bugs", severity: "critical" },
  { id: "prc_blockers", category: "production_cert", rule: "No production blockers", severity: "critical" },
  { id: "prc_integrations", category: "production_cert", rule: "No broken integrations", severity: "critical" },
  { id: "prc_tests", category: "production_cert", rule: "No failing automated tests", severity: "critical" },
  { id: "prc_assets", category: "production_cert", rule: "No missing assets", severity: "high" },
  { id: "prc_translations", category: "production_cert", rule: "No missing translations", severity: "medium" },
  { id: "prc_permissions", category: "production_cert", rule: "No missing permissions", severity: "critical" },
  { id: "prc_documentation", category: "production_cert", rule: "No missing documentation", severity: "medium" },

  // ── Launch Decision ──
  { id: "ld_no_release", category: "launch_decision", rule: "If any certification item fails: do not release", severity: "critical" },
  { id: "ld_remediation", category: "launch_decision", rule: "Automatically create remediation tasks", severity: "high" },
  { id: "ld_fix", category: "launch_decision", rule: "Fix every blocking issue", severity: "critical" },
  { id: "ld_rerun", category: "launch_decision", rule: "Re-run all certification tests", severity: "critical" },
  { id: "ld_all_pass", category: "launch_decision", rule: "Only certify the release when every checklist item passes", severity: "critical" },
];

export function getReleaseRulesByCategory(categoryId) {
  return RELEASE_RULES.filter((r) => r.category === categoryId);
}

export function getReleaseRuleCount() {
  return RELEASE_RULES.length;
}