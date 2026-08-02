/**
 * UNIBUD Product Vision Constitution — "Bud Is the Product"
 *
 * This document defines the foundational product direction of UNIBUD.
 * It is not a UI redesign — it is a change in how UNIBUD is built and experienced.
 *
 * Bud is not another feature inside UNIBUD. Bud is UNIBUD.
 * Everything else exists to support Bud.
 *
 * If any future feature, redesign, navigation change, or business decision
 * conflicts with this constitution, revise the implementation until it aligns
 * before shipping.
 *
 * Effective: 2026-08-02 · Authority: ADM-BUD-000 · Stability: permanent
 */

export const BUD_PRODUCT_VISION_PREAMBLE = {
  title: "Bud Is the Product",
  statement:
    "This is a foundational product direction. Bud is not another feature inside UNIBUD — " +
    "Bud is UNIBUD. Everything else exists to support Bud. The user should never feel like they " +
    "are navigating between dozens of unrelated features. They should feel like they are interacting " +
    "with one intelligent companion that understands every aspect of their university life. The same " +
    "way people think of ChatGPT, Grok, Claude, or DeepSeek as complete AI products, UNIBUD should " +
    "make people think of Bud. But Bud has a different purpose: Bud is built specifically to grow " +
    "with a student throughout their university journey. Bud learns. Bud remembers. Bud helps. " +
    "Bud builds. Bud grows with the student.",
  effectiveDate: "2026-08-02",
  authority: "ADM-BUD-000",
  stabilityClass: "permanent",
};

export const BUD_PRODUCT_VISION_GLOBAL_RULE = {
  id: "bud_vision_global",
  rule:
    "If any future feature, redesign, navigation change, or business decision conflicts with this " +
    "constitution, revise the implementation until Bud remains the center of the experience before " +
    "shipping.",
  severity: "critical",
};

export const BUD_PRODUCT_VISION_CATEGORIES = [
  { id: "core", label: "Core Principle", icon: "Command" },
  { id: "journey", label: "Student Journey", icon: "TrendingUp" },
  { id: "experience", label: "User Experience", icon: "MousePointerClick" },
  { id: "workspace", label: "Workspace Model", icon: "Layers" },
  { id: "role", label: "Bud's Role", icon: "Target" },
  { id: "design", label: "Design Principles", icon: "Palette" },
  { id: "personality", label: "Brand Personality", icon: "Heart" },
  { id: "longterm", label: "Long-Term Vision", icon: "Telescope" },
];

export const BUD_PRODUCT_VISION_RULES = [
  // ── Core Principle ──
  { id: "core_not_feature", category: "core", rule: "Bud is not another feature inside UNIBUD — Bud is UNIBUD", severity: "critical" },
  { id: "core_supports_bud", category: "core", rule: "Everything else exists to support Bud", severity: "critical" },
  { id: "core_no_fragmentation", category: "core", rule: "The user should never feel like they are navigating between dozens of unrelated features or apps", severity: "critical" },
  { id: "core_one_companion", category: "core", rule: "The user should feel like they are interacting with one intelligent companion that understands every aspect of their university life", severity: "critical" },
  { id: "core_not_chatbot", category: "core", rule: "Bud is not simply an AI chatbot — Bud is a long-term university companion", severity: "critical" },

  // ── Student Journey ──
  { id: "j_learns_necessary", category: "journey", rule: "When a student joins, Bud starts learning only the information necessary to provide better assistance", severity: "high" },
  { id: "j_gradual", category: "journey", rule: "Bud gradually understands academic goals, study habits, preferred learning style, strengths, weak subjects, campus activities, interests, communities, projects, and career ambitions", severity: "high" },
  { id: "j_more_valuable", category: "journey", rule: "Bud should become more valuable every semester", severity: "critical" },
  { id: "j_grows_smarter", category: "journey", rule: "A fourth-year student should have a noticeably smarter and more personalized Bud than they had in first year", severity: "critical" },
  { id: "j_learns", category: "journey", rule: "Bud learns", severity: "critical" },
  { id: "j_remembers", category: "journey", rule: "Bud remembers", severity: "critical" },
  { id: "j_helps", category: "journey", rule: "Bud helps", severity: "critical" },
  { id: "j_builds", category: "journey", rule: "Bud builds", severity: "high" },
  { id: "j_grows", category: "journey", rule: "Bud grows with the student", severity: "critical" },

  // ── User Experience ──
  { id: "ux_no_disconnected", category: "experience", rule: "The application should never feel like a collection of disconnected pages", severity: "critical" },
  { id: "ux_bud_first", category: "experience", rule: "Bud should be the first thing the student encounters", severity: "critical" },
  { id: "ux_introduces", category: "experience", rule: "Bud introduces what matters today", severity: "high" },
  { id: "ux_recommends", category: "experience", rule: "Bud recommends actions", severity: "high" },
  { id: "ux_highlights", category: "experience", rule: "Bud highlights important information", severity: "high" },
  { id: "ux_surfaces_cards", category: "experience", rule: "Bud surfaces the correct Academic and Social cards based on context", severity: "high" },
  { id: "ux_calm", category: "experience", rule: "The interface should feel calm, intelligent, and focused", severity: "high" },

  // ── Workspace Model ──
  { id: "w_three_only", category: "workspace", rule: "UNIBUD exposes only three primary workspaces: Academic, Social, and Me", severity: "critical" },
  { id: "w_modular", category: "workspace", rule: "Everything else is modular", severity: "critical" },
  { id: "w_cards_not_destinations", category: "workspace", rule: "Every feature should become a reusable card or capability rather than another navigation destination", severity: "critical" },
  { id: "w_bud_prioritizes", category: "workspace", rule: "Bud decides which cards deserve attention based on the student's current situation", severity: "high" },
  { id: "w_dynamic_ranking", category: "workspace", rule: "Cards remain modular while Bud dynamically prioritizes them", severity: "high" },

  // ── Bud's Role ──
  { id: "r_os_interface", category: "role", rule: "Bud is more than a conversational assistant — Bud is the operating system interface", severity: "critical" },
  { id: "r_understands_who", category: "role", rule: "Bud understands who the student is", severity: "critical" },
  { id: "r_understands_goal", category: "role", rule: "Bud understands what the student is trying to accomplish", severity: "critical" },
  { id: "r_understands_today", category: "role", rule: "Bud understands what is happening today", severity: "high" },
  { id: "r_understands_next", category: "role", rule: "Bud understands what should happen next", severity: "high" },
  { id: "r_coordinates", category: "role", rule: "Bud coordinates every capability without exposing complexity", severity: "critical" },
  { id: "r_just_ask", category: "role", rule: "The user simply asks Bud — Bud decides what tools, services, and data are required", severity: "critical" },

  // ── Design Principles ──
  { id: "d_simplicity", category: "design", rule: "Simplicity", severity: "high" },
  { id: "d_clarity", category: "design", rule: "Clarity", severity: "high" },
  { id: "d_speed", category: "design", rule: "Speed", severity: "high" },
  { id: "d_focus", category: "design", rule: "Focus", severity: "high" },
  { id: "d_minimal_nav", category: "design", rule: "Minimal navigation", severity: "high" },
  { id: "d_conversational", category: "design", rule: "Conversational interaction", severity: "high" },
  { id: "d_contextual", category: "design", rule: "Contextual intelligence", severity: "high" },
  { id: "d_bud_center", category: "design", rule: "Every screen should reinforce that Bud is the center of the experience", severity: "critical" },
  { id: "d_no_imitation", category: "design", rule: "Do not imitate another product's visual identity — create a unique identity for UNIBUD", severity: "high" },

  // ── Brand Personality ──
  { id: "p_intelligent", category: "personality", rule: "Bud should feel intelligent", severity: "high" },
  { id: "p_dependable", category: "personality", rule: "Bud should feel dependable", severity: "high" },
  { id: "p_encouraging", category: "personality", rule: "Bud should feel encouraging", severity: "high" },
  { id: "p_calm", category: "personality", rule: "Bud should feel calm", severity: "high" },
  { id: "p_proactive", category: "personality", rule: "Bud should feel proactive", severity: "high" },
  { id: "p_respectful", category: "personality", rule: "Bud should feel respectful", severity: "high" },
  { id: "p_trustworthy", category: "personality", rule: "Bud should feel trustworthy", severity: "critical" },
  { id: "p_not_robotic", category: "personality", rule: "Bud should never feel robotic or gimmicky", severity: "high" },
  { id: "p_confidence", category: "personality", rule: "Bud should communicate with confidence and clarity", severity: "high" },

  // ── Long-Term Vision ──
  { id: "lt_os", category: "longterm", rule: "The goal is to build the AI operating system for university life", severity: "critical" },
  { id: "lt_not_campus_app", category: "longterm", rule: "The goal is not to build another campus application with an AI feature", severity: "critical" },
  { id: "lt_open_bud", category: "longterm", rule: "Students should eventually say 'I open Bud' — not 'I open UNIBUD to use features'", severity: "critical" },
  { id: "lt_trusted_companion", category: "longterm", rule: "Over months and years, Bud should become the student's trusted academic companion", severity: "critical" },
  { id: "lt_helps_all", category: "longterm", rule: "Bud should help students learn, create, collaborate, connect, discover opportunities, build projects, prepare for their career, and succeed throughout university", severity: "high" },
  { id: "lt_every_decision", category: "longterm", rule: "Every product decision should strengthen the Bud relationship", severity: "critical" },
];

export function getBudProductVisionRulesByCategory(categoryId) {
  return BUD_PRODUCT_VISION_RULES.filter((r) => r.category === categoryId);
}

export function getBudProductVisionRuleCount() {
  return BUD_PRODUCT_VISION_RULES.length;
}