/**
 * UNIBUD Non-Negotiables
 *
 * These rules are permanent and cannot be violated without explicit approval
 * from the Founder.
 *
 * When there is uncertainty between adding a feature and preserving the
 * integrity, simplicity, trustworthiness, performance, or consistency of
 * UNIBUD, always preserve the integrity of the operating system first.
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const NON_NEGOTIABLES_PREAMBLE = {
  title: "UNIBUD Non-Negotiables",
  statement:
    "These rules are permanent and cannot be violated without explicit approval from the Founder. " +
    "They govern every product decision, engineering change, AI behavior, design update, and future " +
    "feature across the entire platform.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const NON_NEGOTIABLES_GLOBAL_RULE = {
  id: "nn_global",
  rule:
    "When there is uncertainty between adding a feature and preserving the integrity, simplicity, " +
    "trustworthiness, performance, or consistency of UNIBUD, always preserve the integrity of the " +
    "operating system first.",
  severity: "critical",
};

export const NON_NEGOTIABLES_RULES = [
  // ── AI & Identity ──
  { id: "nn_bud_only_ai", rule: "Bud is the only visible AI throughout the entire platform", severity: "critical" },
  { id: "nn_home_os", rule: "Home is the operating system, not a traditional dashboard", severity: "critical" },
  { id: "nn_me_fixed", rule: "Me is permanently fixed in navigation and must never be moved or renamed", severity: "critical" },

  // ── Feature Integration ──
  { id: "nn_bud_integration", rule: "Every feature must integrate with Bud where appropriate", severity: "high" },
  { id: "nn_search_integration", rule: "Every feature must integrate with Search", severity: "high" },
  { id: "nn_notifications_integration", rule: "Every feature must integrate with Notifications", severity: "high" },
  { id: "nn_design_system", rule: "Every feature must respect the Design System", severity: "high" },
  { id: "nn_accessibility", rule: "Every feature must respect accessibility standards", severity: "high" },
  { id: "nn_privacy_permissions", rule: "Every feature must respect user privacy and permissions", severity: "critical" },
  { id: "nn_no_isolation", rule: "No feature may exist in isolation", severity: "high" },

  // ── Production Standards ──
  { id: "nn_no_placeholder", rule: "No placeholder content may exist in production", severity: "critical" },
  { id: "nn_no_unfinished", rule: "No unfinished workflows may exist in production", severity: "critical" },
  { id: "nn_no_fake_activity", rule: "No fake user-generated activity may exist in production", severity: "critical" },

  // ── Authenticity ──
  { id: "nn_distinguish_official", rule: "Official university information must be distinguishable from community content", severity: "critical" },
  { id: "nn_ai_no_invent", rule: "AI must never invent university facts or user activity", severity: "critical" },

  // ── Student Experience ──
  { id: "nn_improve_student", rule: "Every new feature must improve the student experience", severity: "critical" },

  // ── Constitution Alignment ──
  { id: "nn_release_gate", rule: "Every release must pass the Release Gate before deployment", severity: "critical" },
  { id: "nn_design_consistency", rule: "Every design change must preserve consistency across the operating system", severity: "high" },
  { id: "nn_eng_constitution", rule: "Every engineering change must follow the Engineering Constitution", severity: "critical" },
  { id: "nn_product_constitution", rule: "Every product decision must follow the Product Constitution", severity: "critical" },
  { id: "nn_evolution_constitution", rule: "Every future evolution must follow the Evolution Constitution", severity: "critical" },

  // ── Integrity Over Features ──
  { id: "nn_simplicity_over_features", rule: "Simplicity, trust, reliability, and usability take precedence over adding more features", severity: "critical" },
  { id: "nn_maintainability", rule: "Long-term maintainability is more important than short-term shortcuts", severity: "critical" },
  { id: "nn_unified_os", rule: "UNIBUD must always feel like one unified operating system rather than separate applications", severity: "critical" },
  { id: "nn_premium_ux", rule: "The user experience must remain premium, intuitive, and production-ready across every platform and every release", severity: "critical" },
];

export function getNonNegotiableRuleCount() {
  return NON_NEGOTIABLES_RULES.length;
}