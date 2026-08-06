/**
 * UNIBUD Product Vision Constitution — "Bud Is the Product"
 *
 * This document defines the foundational product direction of UNIBUD.
 * It is not a UI redesign — it is a change in how UNIBUD is built and experienced.
 *
 * Bud is not another feature inside UNIBUD. Bud is UNIBUD.
 * Everything else exists to support Bud.
 *
 * The Bud a student meets on day one should be the same Bud they interact with
 * in their final year. The difference is that Bud knows them better and can help
 * with more things — not that Bud has a different personality.
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
    "Bud is the heart of UNIBUD. Bud is not a chatbot, not a feature, and not an assistant that " +
    "appears only when needed. Bud is the student's companion throughout university. Bud stays the " +
    "same — Bud does not change personalities, voices, or identities over time. Instead, Bud grows by " +
    "understanding the student better and becoming more capable. The student's experience should feel " +
    "like talking to the same trusted companion who simply knows them better over time. The same way " +
    "people think of ChatGPT, Grok, Claude, or DeepSeek as complete AI products, UNIBUD should make " +
    "people think of Bud. But Bud has a different purpose: Bud is built specifically to grow with a " +
    "student throughout their university journey. Bud learns. Bud remembers. Bud helps. Bud builds. " +
    "Bud grows with the student — without ever becoming a different character.",
  effectiveDate: "2026-08-02",
  authority: "ADM-BUD-000",
  stabilityClass: "permanent",
};

export const BUD_PRODUCT_VISION_GLOBAL_RULE = {
  id: "bud_vision_global",
  rule:
    "Every feature in UNIBUD should answer one question: 'How does this help Bud help the student?' " +
    "If a feature cannot naturally become part of Bud's relationship with the student, it should be " +
    "reconsidered. If any future feature, redesign, navigation change, or business decision conflicts " +
    "with this constitution, revise the implementation until Bud remains the center of the experience " +
    "before shipping.",
  severity: "critical",
};

export const BUD_PRODUCT_VISION_CATEGORIES = [
  { id: "identity", label: "Bud Identity — Non-Negotiable", icon: "Command" },
  { id: "relationship", label: "Bud's Relationship With the Student", icon: "Heart" },
  { id: "evolution", label: "Bud Learns, Not Changes", icon: "TrendingUp" },
  { id: "builds", label: "Bud Builds With the Student", icon: "Target" },
  { id: "experience", label: "User Experience", icon: "MousePointerClick" },
  { id: "workspace", label: "Workspace Model", icon: "Layers" },
  { id: "design", label: "Design Principles", icon: "Palette" },
  { id: "longterm", label: "The Goal", icon: "Telescope" },
];

export const BUD_PRODUCT_VISION_RULES = [
  // ── Bud Identity — Non-Negotiable ──
  { id: "id_heart", category: "identity", rule: "Bud is the heart of UNIBUD", severity: "critical" },
  { id: "id_not_chatbot", category: "identity", rule: "Bud is not a chatbot", severity: "critical" },
  { id: "id_not_feature", category: "identity", rule: "Bud is not a feature", severity: "critical" },
  { id: "id_not_on_demand", category: "identity", rule: "Bud is not an assistant that appears only when needed", severity: "critical" },
  { id: "id_companion", category: "identity", rule: "Bud is the student's companion throughout university", severity: "critical" },
  { id: "id_stays_same", category: "identity", rule: "Bud stays the same", severity: "critical" },
  { id: "id_no_personality_change", category: "identity", rule: "Bud does not change personalities, voices, or identities over time", severity: "critical" },
  { id: "id_same_bud", category: "identity", rule: "The Bud a student meets on day one should be the same Bud they interact with in their final year", severity: "critical" },
  { id: "id_grows_capability", category: "identity", rule: "Bud grows by understanding the student better and becoming more capable — not by becoming a different character", severity: "critical" },
  { id: "id_supports_bud", category: "identity", rule: "Everything else exists to support Bud", severity: "critical" },

  // ── Bud's Relationship With the Student ──
  { id: "rel_trusted", category: "relationship", rule: "Bud is a trusted companion", severity: "critical" },
  { id: "rel_comfortable", category: "relationship", rule: "A student should feel comfortable asking Bud anything", severity: "critical" },
  { id: "rel_anything", category: "relationship", rule: "Examples of what a student should be able to ask Bud: 'Help me understand this assignment', 'I'm stressed about tomorrow's exam', 'Find me a study partner', 'Summarize today's lecture', 'Help me write my CV', 'Let's build this project together', 'Show me what's happening on campus', 'Help me prepare for an interview'", severity: "high" },
  { id: "rel_calm_reliable", category: "relationship", rule: "Bud should solve problems in the same calm, reliable way every time", severity: "critical" },
  { id: "rel_consistent", category: "relationship", rule: "Bud's problem-solving approach should be consistent from the first day to graduation", severity: "critical" },
  { id: "rel_trustworthy", category: "relationship", rule: "Bud should feel trustworthy at every stage of the relationship", severity: "critical" },

  // ── Bud Learns, Not Changes ──
  { id: "ev_learns_not_changes", category: "evolution", rule: "Bud learns, not changes — Bud does not become a different person", severity: "critical" },
  { id: "ev_remembers", category: "evolution", rule: "Bud remembers information that helps the student", severity: "critical" },
  { id: "ev_smarter", category: "evolution", rule: "Bud becomes smarter because it learns preferences, goals, and history", severity: "high" },
  { id: "ev_same_companion", category: "evolution", rule: "The student's experience should feel like talking to the same trusted companion who simply knows them better over time", severity: "critical" },
  { id: "ev_more_valuable", category: "evolution", rule: "Bud should become more valuable every semester", severity: "critical" },
  { id: "ev_grows_smarter", category: "evolution", rule: "A fourth-year student should have a noticeably smarter and more capable Bud than they had in first year — but the same Bud", severity: "critical" },
  { id: "ev_learns", category: "evolution", rule: "Bud learns", severity: "critical" },
  { id: "ev_remembers_short", category: "evolution", rule: "Bud remembers", severity: "critical" },
  { id: "ev_helps", category: "evolution", rule: "Bud helps", severity: "critical" },
  { id: "ev_builds", category: "evolution", rule: "Bud builds", severity: "high" },
  { id: "ev_grows", category: "evolution", rule: "Bud grows with the student", severity: "critical" },

  // ── Bud Builds With the Student ──
  { id: "b_not_only_answers", category: "builds", rule: "Bud should not only answer questions — Bud should actively help create outcomes", severity: "critical" },
  { id: "b_learn", category: "builds", rule: "Bud helps students learn", severity: "high" },
  { id: "b_study", category: "builds", rule: "Bud helps students study", severity: "high" },
  { id: "b_projects", category: "builds", rule: "Bud helps students build projects", severity: "high" },
  { id: "b_presentations", category: "builds", rule: "Bud helps students prepare presentations", severity: "high" },
  { id: "b_reports", category: "builds", rule: "Bud helps students write reports", severity: "high" },
  { id: "b_schedules", category: "builds", rule: "Bud helps students organize schedules", severity: "high" },
  { id: "b_opportunities", category: "builds", rule: "Bud helps students discover opportunities", severity: "high" },
  { id: "b_collaborate", category: "builds", rule: "Bud helps students collaborate with classmates", severity: "high" },
  { id: "b_careers", category: "builds", rule: "Bud helps students prepare for careers", severity: "high" },
  { id: "b_everyday", category: "builds", rule: "Bud helps students solve everyday university problems", severity: "high" },
  { id: "b_partner", category: "builds", rule: "Bud becomes a partner in the student's progress", severity: "critical" },

  // ── User Experience ──
  { id: "ux_no_disconnected", category: "experience", rule: "The application should never feel like a collection of disconnected pages", severity: "critical" },
  { id: "ux_bud_first", category: "experience", rule: "Bud should be the first thing the student encounters", severity: "critical" },
  { id: "ux_introduces", category: "experience", rule: "Bud introduces what matters today", severity: "high" },
  { id: "ux_recommends", category: "experience", rule: "Bud recommends actions", severity: "high" },
  { id: "ux_highlights", category: "experience", rule: "Bud highlights important information", severity: "high" },
  { id: "ux_surfaces_cards", category: "experience", rule: "Bud surfaces the correct Academic and Social cards based on context", severity: "high" },
  { id: "ux_calm", category: "experience", rule: "The interface should feel calm, intelligent, and focused", severity: "high" },
  { id: "ux_no_fragmentation", category: "experience", rule: "The user should never feel like they are navigating between dozens of unrelated features", severity: "critical" },

  // ── Workspace Model ──
  { id: "w_three_only", category: "workspace", rule: "UNIBUD exposes only three primary workspaces: Academic, Social, and Me", severity: "critical" },
  { id: "w_modular", category: "workspace", rule: "Everything else is modular", severity: "critical" },
  { id: "w_cards_not_destinations", category: "workspace", rule: "Every feature should become a reusable card or capability rather than another navigation destination", severity: "critical" },
  { id: "w_bud_prioritizes", category: "workspace", rule: "Bud decides which cards deserve attention based on the student's current situation", severity: "high" },
  { id: "w_dynamic_ranking", category: "workspace", rule: "Cards remain modular while Bud dynamically prioritizes them", severity: "high" },

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
  { id: "d_help_bud_help", category: "design", rule: "Every feature should answer: 'How does this help Bud help the student?'", severity: "critical" },

  // ── The Goal ──
  { id: "lt_os", category: "longterm", rule: "The goal is to build the AI operating system for university life", severity: "critical" },
  { id: "lt_not_campus_app", category: "longterm", rule: "The goal is not to build another campus application with an AI feature", severity: "critical" },
  { id: "lt_not_screens", category: "longterm", rule: "When students think about UNIBUD, they should not think about screens, pages, or tools", severity: "critical" },
  { id: "lt_emotional_core", category: "longterm", rule: "Students should think: 'Bud helped me get through university'", severity: "critical" },
  { id: "lt_open_bud", category: "longterm", rule: "Students should eventually say 'I open Bud' — not 'I open UNIBUD to use features'", severity: "critical" },
  { id: "lt_trusted_companion", category: "longterm", rule: "Over months and years, Bud should become the student's trusted academic companion", severity: "critical" },
  { id: "lt_strengthen_relationship", category: "longterm", rule: "Every capability, every workspace, and every new feature should strengthen the relationship between the student and Bud", severity: "critical" },
  { id: "lt_consistent_identity", category: "longterm", rule: "Bud's personality, trustworthiness, and problem-solving approach must remain consistent from the first day to graduation", severity: "critical" },
];

export function getBudProductVisionRulesByCategory(categoryId) {
  return BUD_PRODUCT_VISION_RULES.filter((r) => r.category === categoryId);
}

export function getBudProductVisionRuleCount() {
  return BUD_PRODUCT_VISION_RULES.length;
}