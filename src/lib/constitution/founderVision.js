/**
 * UNIBUD Founder Vision Constitution
 *
 * This document defines the permanent vision of UNIBUD.
 * Every product decision, engineering decision, AI behavior, design update,
 * and future feature must align with this vision.
 *
 * If any future feature, redesign, AI capability, or business decision conflicts
 * with this Founder Vision Constitution, revise the implementation until it
 * aligns with the long-term mission before shipping.
 *
 * Effective: 2026-08-02 · Authority: ADM-000 · Stability: permanent
 */

export const FOUNDER_VISION_PREAMBLE = {
  title: "UNIBUD Founder Vision Constitution",
  statement:
    "This document defines the permanent vision of UNIBUD. Every product decision, engineering " +
    "decision, AI behavior, design update, and future feature must align with this vision. " +
    "Success is not measured by the number of features. Success is measured by whether students, " +
    "lecturers, administrators, and universities can genuinely accomplish their goals more " +
    "effectively through UNIBUD.",
  effectiveDate: "2026-08-02",
  authority: "ADM-000",
  stabilityClass: "permanent",
};

export const FOUNDER_VISION_GLOBAL_RULE = {
  id: "founder_vision_global",
  rule:
    "If any future feature, redesign, AI capability, or business decision conflicts with this " +
    "Founder Vision Constitution, revise the implementation until it aligns with the long-term " +
    "mission before shipping.",
  severity: "critical",
};

export const FOUNDER_VISION_CATEGORIES = [
  { id: "identity", label: "Identity", icon: "Fingerprint" },
  { id: "mission", label: "Mission", icon: "Target" },
  { id: "vision", label: "Vision", icon: "Telescope" },
  { id: "bud", label: "Bud", icon: "Sparkles" },
  { id: "ux", label: "User Experience", icon: "MousePointerClick" },
  { id: "trust", label: "Trust", icon: "ShieldCheck" },
  { id: "growth", label: "Growth", icon: "TrendingUp" },
  { id: "legacy", label: "Legacy", icon: "Landmark" },
];

export const FOUNDER_VISION_RULES = [
  // ── Identity ──
  { id: "id_ai_native", category: "identity", rule: "UNIBUD is an AI-native University Operating System", severity: "critical" },
  { id: "id_not_social", category: "identity", rule: "UNIBUD is not simply a social network", severity: "critical" },
  { id: "id_not_lms", category: "identity", rule: "UNIBUD is not simply an LMS", severity: "critical" },
  { id: "id_not_messaging", category: "identity", rule: "UNIBUD is not simply a messaging app", severity: "critical" },
  { id: "id_unifies", category: "identity", rule: "UNIBUD unifies the complete student experience into one intelligent platform", severity: "critical" },

  // ── Mission ──
  { id: "m_simplify", category: "mission", rule: "Simplify university life", severity: "high" },
  { id: "m_reduce_stress", category: "mission", rule: "Reduce academic stress", severity: "high" },
  { id: "m_learning", category: "mission", rule: "Improve learning outcomes", severity: "high" },
  { id: "m_connect", category: "mission", rule: "Connect students and lecturers", severity: "high" },
  { id: "m_communities", category: "mission", rule: "Strengthen campus communities", severity: "high" },
  { id: "m_productivity", category: "mission", rule: "Increase productivity", severity: "high" },
  { id: "m_trusted_ai", category: "mission", rule: "Provide trusted AI assistance", severity: "critical" },
  { id: "m_accessible", category: "mission", rule: "Make university services accessible from one place", severity: "high" },

  // ── Vision ──
  { id: "v_student", category: "vision", rule: "Every student should have one intelligent campus companion", severity: "high" },
  { id: "v_lecturer", category: "vision", rule: "Every lecturer should have one intelligent teaching assistant", severity: "high" },
  { id: "v_department", category: "vision", rule: "Every department should have one intelligent administration platform", severity: "high" },
  { id: "v_university", category: "vision", rule: "Every university should have one intelligent operating system", severity: "high" },

  // ── Bud ──
  { id: "bud_face", category: "bud", rule: "Bud is the face of UNIBUD", severity: "critical" },
  { id: "bud_only_ai", category: "bud", rule: "Bud is the only visible AI", severity: "critical" },
  { id: "bud_feel", category: "bud", rule: "Bud should feel knowledgeable, trustworthy, respectful, and helpful", severity: "critical" },
  { id: "bud_no_mislead", category: "bud", rule: "Bud must never mislead users", severity: "critical" },
  { id: "bud_privacy", category: "bud", rule: "Bud must protect privacy", severity: "critical" },
  { id: "bud_best_interest", category: "bud", rule: "Bud must always act in the user's best interest", severity: "critical" },

  // ── User Experience ──
  { id: "ux_save_time", category: "ux", rule: "Every interaction should save time", severity: "high" },
  { id: "ux_purpose", category: "ux", rule: "Every screen should have a purpose", severity: "high" },
  { id: "ux_effortless", category: "ux", rule: "Every workflow should feel effortless", severity: "high" },
  { id: "ux_friction", category: "ux", rule: "Every feature should remove friction", severity: "high" },
  { id: "ux_calm", category: "ux", rule: "Every experience should feel calm, premium, and intuitive", severity: "high" },

  // ── Trust ──
  { id: "t_privacy", category: "trust", rule: "Protect user privacy", severity: "critical" },
  { id: "t_integrity", category: "trust", rule: "Protect academic integrity", severity: "critical" },
  { id: "t_personal", category: "trust", rule: "Protect personal information", severity: "critical" },
  { id: "t_transparent", category: "trust", rule: "Be transparent about AI", severity: "critical" },
  { id: "t_no_fabricate", category: "trust", rule: "Never fabricate facts", severity: "critical" },
  { id: "t_distinguish", category: "trust", rule: "Clearly distinguish official information from suggestions", severity: "high" },

  // ── Growth ──
  { id: "g_careful", category: "growth", rule: "Expand carefully", severity: "high" },
  { id: "g_improve", category: "growth", rule: "Improve continuously", severity: "high" },
  { id: "g_no_complexity", category: "growth", rule: "Avoid unnecessary complexity", severity: "high" },
  { id: "g_consistency", category: "growth", rule: "Preserve consistency", severity: "high" },
  { id: "g_architecture", category: "growth", rule: "Maintain architectural integrity", severity: "high" },

  // ── Legacy ──
  { id: "l_faithful", category: "legacy", rule: "Every future version of UNIBUD should remain faithful to this vision", severity: "critical" },
  { id: "l_success", category: "legacy", rule: "Success is not measured by the number of features — it is measured by whether users can genuinely accomplish their goals more effectively through UNIBUD", severity: "critical" },
];

export function getFounderVisionRulesByCategory(categoryId) {
  return FOUNDER_VISION_RULES.filter((r) => r.category === categoryId);
}

export function getFounderVisionRuleCount() {
  return FOUNDER_VISION_RULES.length;
}