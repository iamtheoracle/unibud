/**
 * UNIBUD Engineering Constitution — Rules
 *
 * The definitive set of permanent engineering rules that govern every
 * part of the platform. Organized into 9 categories matching the
 * Engineering Constitution document.
 *
 * Any code that violates these rules is a bug.
 */

// ─── Preamble ───────────────────────────────────────────────────────
export const CONSTITUTION_PREAMBLE = {
  title: "Engineering Constitution",
  statement:
    "UNIBUD must operate as a trustworthy, AI-native university operating system. " +
    "Every feature should be connected end-to-end, every piece of user-facing data " +
    "should be authentic, every AI response should be grounded in available information, " +
    "every workflow should be fully functional, and every interaction should respect " +
    "privacy, permissions, and transparency. The platform should feel alive because its " +
    "community is active and its official sources are up to date — not because the system " +
    "invents activity or user behavior.",
};

// ─── Global Rule ────────────────────────────────────────────────────
export const GLOBAL_RULE = {
  rule:
    "Every future enhancement, bug fix, optimization, AI capability, integration, or new " +
    "module must comply with this Engineering Constitution. The quality of the existing " +
    "platform must never decline as UNIBUD evolves. New functionality should improve the " +
    "operating system without introducing regressions, inconsistencies, technical debt, or " +
    "fragmented user experiences.",
};

// ─── Categories ─────────────────────────────────────────────────────
export const CONSTITUTION_CATEGORIES = [
  { id: "architecture", label: "Architecture" },
  { id: "code_quality", label: "Code Quality" },
  { id: "performance", label: "Performance" },
  { id: "reliability", label: "Reliability" },
  { id: "security", label: "Security" },
  { id: "ux", label: "User Experience" },
  { id: "ai", label: "AI Principles" },
  { id: "maintainability", label: "Maintainability" },
  { id: "release", label: "Release Standards" },
];

// ─── Rules ──────────────────────────────────────────────────────────
export const CONSTITUTION_RULES = [
  // ── Architecture ──
  { id: "arch_01", category: "architecture", rule: "One unified operating system.", severity: "critical", automated: false },
  { id: "arch_02", category: "architecture", rule: "Bud is the only visible AI.", severity: "critical", automated: false },
  { id: "arch_03", category: "architecture", rule: "Every module must integrate with every relevant module.", severity: "high", automated: false },
  { id: "arch_04", category: "architecture", rule: "No isolated features.", severity: "high", automated: false },
  { id: "arch_05", category: "architecture", rule: "No duplicate functionality.", severity: "critical", automated: false },
  { id: "arch_06", category: "architecture", rule: "No duplicated business logic.", severity: "critical", automated: false },
  { id: "arch_07", category: "architecture", rule: "No duplicated UI components.", severity: "high", automated: false },
  { id: "arch_08", category: "architecture", rule: "No duplicated APIs.", severity: "high", automated: false },
  { id: "arch_09", category: "architecture", rule: "Reuse shared services whenever possible.", severity: "high", automated: false },

  // ── Code Quality ──
  { id: "code_01", category: "code_quality", rule: "Modular architecture.", severity: "high", automated: false },
  { id: "code_02", category: "code_quality", rule: "Clean architecture.", severity: "high", automated: false },
  { id: "code_03", category: "code_quality", rule: "Feature-first organization.", severity: "high", automated: false },
  { id: "code_04", category: "code_quality", rule: "Shared design system.", severity: "high", automated: false },
  { id: "code_05", category: "code_quality", rule: "Shared component library.", severity: "high", automated: false },
  { id: "code_06", category: "code_quality", rule: "Strong typing.", severity: "medium", automated: false },
  { id: "code_07", category: "code_quality", rule: "Strict validation.", severity: "high", automated: false },
  { id: "code_08", category: "code_quality", rule: "Consistent naming conventions.", severity: "medium", automated: false },
  { id: "code_09", category: "code_quality", rule: "Comprehensive documentation.", severity: "medium", automated: false },
  { id: "code_10", category: "code_quality", rule: "Versioned APIs.", severity: "medium", automated: false },
  { id: "code_11", category: "code_quality", rule: "Backward compatibility where appropriate.", severity: "medium", automated: false },

  // ── Performance ──
  { id: "perf_01", category: "performance", rule: "Every screen should open quickly.", severity: "high", automated: true },
  { id: "perf_02", category: "performance", rule: "Every interaction should feel responsive.", severity: "high", automated: false },
  { id: "perf_03", category: "performance", rule: "Lazy load heavy resources.", severity: "high", automated: true },
  { id: "perf_04", category: "performance", rule: "Optimize database queries.", severity: "high", automated: false },
  { id: "perf_05", category: "performance", rule: "Cache safely where appropriate.", severity: "medium", automated: false },
  { id: "perf_06", category: "performance", rule: "Minimize unnecessary network requests.", severity: "medium", automated: false },
  { id: "perf_07", category: "performance", rule: "Compress images and videos.", severity: "medium", automated: false },
  { id: "perf_08", category: "performance", rule: "Prevent memory leaks.", severity: "high", automated: false },
  { id: "perf_09", category: "performance", rule: "Prevent unnecessary re-renders.", severity: "high", automated: false },
  { id: "perf_10", category: "performance", rule: "Maintain smooth scrolling and animations.", severity: "medium", automated: false },

  // ── Reliability ──
  { id: "rel_01", category: "reliability", rule: "Every operation must have loading, success, and error handling.", severity: "critical", automated: false },
  { id: "rel_02", category: "reliability", rule: "Every API must have retry logic where appropriate.", severity: "high", automated: false },
  { id: "rel_03", category: "reliability", rule: "Every workflow must recover gracefully from failures.", severity: "high", automated: false },
  { id: "rel_04", category: "reliability", rule: "Prevent data corruption.", severity: "critical", automated: false },
  { id: "rel_05", category: "reliability", rule: "Prevent duplicate submissions.", severity: "high", automated: false },
  { id: "rel_06", category: "reliability", rule: "Protect against race conditions.", severity: "high", automated: false },
  { id: "rel_07", category: "reliability", rule: "Validate all user input.", severity: "high", automated: false },
  { id: "rel_08", category: "reliability", rule: "Log unexpected errors for administrators.", severity: "high", automated: true },

  // ── Security ──
  { id: "sec_01", category: "security", rule: "Authenticate every protected request.", severity: "critical", automated: true },
  { id: "sec_02", category: "security", rule: "Authorize every protected action.", severity: "critical", automated: true },
  { id: "sec_03", category: "security", rule: "Encrypt sensitive data.", severity: "critical", automated: false },
  { id: "sec_04", category: "security", rule: "Protect personal information.", severity: "critical", automated: false },
  { id: "sec_05", category: "security", rule: "Validate uploaded files.", severity: "high", automated: false },
  { id: "sec_06", category: "security", rule: "Sanitize user-generated content.", severity: "high", automated: false },
  { id: "sec_07", category: "security", rule: "Prevent common web vulnerabilities.", severity: "high", automated: false },
  { id: "sec_08", category: "security", rule: "Record audit logs for sensitive actions.", severity: "high", automated: true },

  // ── User Experience ──
  { id: "ux_01", category: "ux", rule: "Never leave users at a dead end.", severity: "high", automated: false },
  { id: "ux_02", category: "ux", rule: "Always provide meaningful feedback.", severity: "high", automated: false },
  { id: "ux_03", category: "ux", rule: "Maintain consistent navigation.", severity: "high", automated: false },
  { id: "ux_04", category: "ux", rule: "Maintain consistent terminology.", severity: "medium", automated: false },
  { id: "ux_05", category: "ux", rule: "Maintain consistent visual language.", severity: "high", automated: false },
  { id: "ux_06", category: "ux", rule: "Respect accessibility standards.", severity: "high", automated: true },
  { id: "ux_07", category: "ux", rule: "Respect user privacy.", severity: "critical", automated: false },
  { id: "ux_08", category: "ux", rule: "Respect user preferences.", severity: "high", automated: false },

  // ── AI Principles ──
  { id: "ai_01", category: "ai", rule: "Bud must be truthful.", severity: "critical", automated: false },
  { id: "ai_02", category: "ai", rule: "Bud must explain uncertainty.", severity: "high", automated: false },
  { id: "ai_03", category: "ai", rule: "Bud must never invent university information.", severity: "critical", automated: false },
  { id: "ai_04", category: "ai", rule: "Bud must use official data where available.", severity: "high", automated: false },
  { id: "ai_05", category: "ai", rule: "Bud must request clarification when required.", severity: "high", automated: false },
  { id: "ai_06", category: "ai", rule: "Bud must respect permissions.", severity: "critical", automated: false },
  { id: "ai_07", category: "ai", rule: "Bud must protect user privacy.", severity: "critical", automated: false },
  { id: "ai_08", category: "ai", rule: "Bud must remain context-aware.", severity: "high", automated: false },

  // ── Maintainability ──
  { id: "maint_01", category: "maintainability", rule: "Every new feature must integrate with the existing architecture.", severity: "high", automated: false },
  { id: "maint_02", category: "maintainability", rule: "Refactor before duplicating.", severity: "high", automated: false },
  { id: "maint_03", category: "maintainability", rule: "Remove obsolete code.", severity: "medium", automated: false },
  { id: "maint_04", category: "maintainability", rule: "Remove unused assets.", severity: "medium", automated: false },
  { id: "maint_05", category: "maintainability", rule: "Remove unused database tables.", severity: "medium", automated: false },
  { id: "maint_06", category: "maintainability", rule: "Remove unused APIs.", severity: "medium", automated: false },
  { id: "maint_07", category: "maintainability", rule: "Keep dependencies up to date.", severity: "medium", automated: false },
  { id: "maint_08", category: "maintainability", rule: "Keep documentation synchronized with implementation.", severity: "medium", automated: false },

  // ── Release Standards ──
  { id: "rel_std_01", category: "release", rule: "No placeholder content.", severity: "critical", automated: true },
  { id: "rel_std_02", category: "release", rule: "No unfinished workflows.", severity: "high", automated: false },
  { id: "rel_std_03", category: "release", rule: "No broken navigation.", severity: "critical", automated: true },
  { id: "rel_std_04", category: "release", rule: "No inaccessible screens.", severity: "high", automated: false },
  { id: "rel_std_05", category: "release", rule: "No production blockers.", severity: "critical", automated: false },
  { id: "rel_std_06", category: "release", rule: "No failing tests.", severity: "high", automated: true },
  { id: "rel_std_07", category: "release", rule: "No unresolved critical bugs.", severity: "critical", automated: true },
  { id: "rel_std_08", category: "release", rule: "No inconsistent UI.", severity: "high", automated: false },
];

// ─── Helpers ────────────────────────────────────────────────────────
export function getRulesByCategory(categoryId) {
  return CONSTITUTION_RULES.filter((r) => r.category === categoryId);
}

export function getRuleById(ruleId) {
  return CONSTITUTION_RULES.find((r) => r.id === ruleId);
}

export function getAutomatedRules() {
  return CONSTITUTION_RULES.filter((r) => r.automated);
}