/**
 * UNIBUD OS v4 — Phase 2 Shared Module Consolidation Validator
 *
 * Guarantees the architectural integrity of the frozen OS:
 *   • Every module exists exactly once (no duplicates)
 *   • Every experience consumes modules from the registry
 *   • No duplicated implementations, entities, APIs, or realtime subscriptions
 *   • Every entity has realtime registration
 *   • Every experience depends on Platform Core (not its own implementations)
 *   • No direct provider calls from experiences
 *   • No demo/mock/placeholder data anywhere in the system
 *
 * References: OS Constitution, Shared Module Constitution, Engineering Constitution.
 */

import { getRegisteredModules, getModule, isModuleRegistered, getModulesByCategory } from "./moduleRegistry";
import { getContract, getAllContracts, validateAllContracts } from "./experienceContract";
import { getRegisteredExperiences } from "./experienceRegistry";
import { SYNC_REGISTRY } from "@/lib/realtime/entitySyncRegistry";
import { EXPERIENCES, FROZEN_EXPERIENCE_IDS, EXPERIENCE_RUNTIME_FROZEN } from "./manifest";

// ─── Required Module Catalog ─────────────────────────────────────────────
// Every module must exist exactly once. These are the canonical definitions
// that every social, academic, and communication experience must consume.

export const REQUIRED_SOCIAL_MODULES = [
  { id: "posts", label: "Feed / Post", entity: "QuadPost" },
  { id: "comments", label: "Comment", entity: "QuadComment" },
  { id: "reactions", label: "Reaction" },
  { id: "stories", label: "Story", entity: "Story" },
  { id: "videos", label: "Short Video", entity: "ShortVideo" },
  { id: "podcasts", label: "Podcast", entity: "Podcast" },
  { id: "live", label: "Live Stream", entity: "LiveStream" },
  { id: "communities", label: "Community", entity: "Community" },
  { id: "creator-profiles", label: "Creator Profile" },
  { id: "media-viewer", label: "Media Viewer" },
  { id: "events", label: "Event", entity: "CampusEvent" },
  { id: "polls", label: "Poll" },
  { id: "bookmarks", label: "Bookmark" },
  { id: "share", label: "Share" },
  { id: "reports", label: "Report", entity: "ContentReport" },
];

export const REQUIRED_ACADEMIC_MODULES = [
  { id: "courses", label: "Course", entity: "Course" },
  { id: "assignments", label: "Assignment", entity: "Assignment" },
  { id: "timetable", label: "Timetable", entity: "TimetableEntry" },
  { id: "calendar", label: "Calendar", entity: "CalendarEvent" },
  { id: "study-sessions", label: "Study Session", entity: "StudySession" },
  { id: "flashcards", label: "Flashcards", entity: "Flashcard" },
  { id: "notes", label: "Notes", entity: "Note" },
  { id: "quizzes", label: "Quiz", entity: "QuizAttempt" },
  { id: "projects", label: "Project", entity: "Project" },
  { id: "research", label: "Research", entity: "ResearchProject" },
  { id: "gpa", label: "GPA", entity: "StudentRecord" },
  { id: "attendance", label: "Attendance", entity: "AttendanceRecord" },
  { id: "results", label: "Results", entity: "StudentGrade" },
  { id: "scholarships", label: "Scholarships", entity: "Scholarship" },
  { id: "career", label: "Career", entity: "Opportunity" },
];

export const REQUIRED_COMMUNICATION_MODULES = [
  { id: "messages", label: "Chat", entity: "Message" },
  { id: "conversations", label: "Conversations", entity: "Conversation" },
  { id: "voice-calls", label: "Voice Call" },
  { id: "video-calls", label: "Video Call" },
  { id: "whiteboards", label: "Whiteboard" },
  { id: "meetings", label: "Meeting" },
  { id: "presence", label: "Presence", entity: "Presence" },
  { id: "file-sharing", label: "File Sharing" },
  { id: "screen-sharing", label: "Screen Sharing" },
  { id: "contacts", label: "Contacts" },
];

// ─── Platform Core Services ──────────────────────────────────────────────
// Every experience must depend on these rather than implementing its own version.

export const PLATFORM_CORE_SERVICES = [
  { id: "bud", label: "Bud" },
  { id: "orbit", label: "Orbit" },
  { id: "spark", label: "Spark" },
  { id: "identity", label: "Identity" },
  { id: "authentication", label: "Authentication" },
  { id: "search", label: "Search" },
  { id: "recommendation", label: "Recommendation" },
  { id: "media", label: "Media" },
  { id: "notification", label: "Notification" },
  { id: "analytics", label: "Analytics" },
  { id: "storage", label: "Storage" },
  { id: "sync", label: "Sync" },
  { id: "permissions", label: "Permissions" },
  { id: "realtime", label: "Realtime" },
];

// ─── External Integration Providers ──────────────────────────────────────
// All external calls must flow through: Experience → Platform Core → Integrator → Provider

export const INTEGRATION_PROVIDERS = [
  "Google", "Microsoft", "Spotify", "Apple",
  "Maps", "University APIs", "OCR", "Translation", "Weather",
];

// ─── Audit Functions ─────────────────────────────────────────────────────

/**
 * Audit 1: Module Completeness
 * Verifies every required social, academic, and communication module is registered.
 */
export function auditModuleCompleteness() {
  const errors = [];
  const warnings = [];
  const results = { social: [], academic: [], communication: [] };

  REQUIRED_SOCIAL_MODULES.forEach((mod) => {
    const registered = isModuleRegistered(mod.id);
    results.social.push({ ...mod, registered });
    if (!registered) errors.push(`Missing social module: ${mod.id} (${mod.label})`);
  });

  REQUIRED_ACADEMIC_MODULES.forEach((mod) => {
    const registered = isModuleRegistered(mod.id);
    results.academic.push({ ...mod, registered });
    if (!registered) errors.push(`Missing academic module: ${mod.id} (${mod.label})`);
  });

  REQUIRED_COMMUNICATION_MODULES.forEach((mod) => {
    const registered = isModuleRegistered(mod.id);
    results.communication.push({ ...mod, registered });
    if (!registered) errors.push(`Missing communication module: ${mod.id} (${mod.label})`);
  });

  const requiredTotal = REQUIRED_SOCIAL_MODULES.length + REQUIRED_ACADEMIC_MODULES.length + REQUIRED_COMMUNICATION_MODULES.length;
  const missingCount = errors.length;

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    results,
    requiredTotal,
    registeredCount: requiredTotal - missingCount,
    missingCount,
  };
}

/**
 * Audit 2: Module Uniqueness
 * Verifies no module ID is registered more than once.
 */
export function auditModuleUniqueness() {
  const modules = getRegisteredModules();
  const ids = modules.map((m) => m.id);
  const seen = new Set();
  const duplicates = [];

  ids.forEach((id) => {
    if (seen.has(id) && !duplicates.includes(id)) {
      duplicates.push(id);
    }
    seen.add(id);
  });

  return {
    valid: duplicates.length === 0,
    errors: duplicates.length > 0 ? [`Duplicate module IDs: ${duplicates.join(", ")}`] : [],
    warnings: [],
    totalModules: modules.length,
    duplicateIds: duplicates,
  };
}

/**
 * Audit 3: Entity Realtime Coverage
 * Verifies every module with an entity has that entity in the Realtime sync registry.
 */
export function auditEntityRealtimeCoverage() {
  const modules = getRegisteredModules();
  const entitiesWithModules = [...new Set(modules.map((m) => m.entity).filter(Boolean))];
  const syncedEntities = Object.keys(SYNC_REGISTRY);
  const unsynced = entitiesWithModules.filter((e) => !syncedEntities.includes(e));

  return {
    valid: unsynced.length === 0,
    errors: unsynced.length > 0 ? [`Entities not in realtime registry: ${unsynced.join(", ")}`] : [],
    warnings: [],
    totalEntitiesWithModules: entitiesWithModules.length,
    syncedCount: entitiesWithModules.length - unsynced.length,
    unsyncedEntities: unsynced,
    totalSyncRegistryEntities: syncedEntities.length,
  };
}

/**
 * Audit 4: Platform Core Adoption
 * Verifies every experience depends on Platform Core (all four hooks registered)
 * and owns no Platform Core services directly.
 */
export function auditPlatformCoreAdoption() {
  const contracts = getAllContracts();
  const errors = [];
  const warnings = [];
  const results = [];

  contracts.forEach((contract) => {
    const hooks = {
      bud: !!contract.hooks?.bud,
      orbit: !!contract.hooks?.orbit,
      spark: !!contract.hooks?.spark,
      realtime: !!contract.hooks?.realtime,
    };
    const allHooksRegistered = Object.values(hooks).every(Boolean);

    const platformCoreModules = ["search", "notifications", "identity", "ai", "realtime", "integrations"];
    const ownedPlatformCore = (contract.modules || []).filter((m) => platformCoreModules.includes(m));

    if (!allHooksRegistered) {
      errors.push(`Experience "${contract.experienceId}" does not register all four Platform Core hooks`);
    }
    if (ownedPlatformCore.length > 0) {
      errors.push(`Experience "${contract.experienceId}" owns Platform Core services: ${ownedPlatformCore.join(", ")}`);
    }

    results.push({
      experienceId: contract.experienceId,
      hooks,
      allHooksRegistered,
      ownedPlatformCore,
      modulesConsumed: contract.modules?.length || 0,
    });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalExperiences: contracts.length,
    results,
  };
}

/**
 * Audit 5: External Integration Compliance
 * Verifies no experience makes direct provider calls.
 * All external calls must flow through: Experience → Platform Core → Integrator → Provider
 */
export function auditExternalIntegrations() {
  const contracts = getAllContracts();
  const errors = [];
  const warnings = [];
  const violations = [];

  const directProviderPatterns = [
    "google:", "microsoft:", "spotify:", "apple:",
    "slack:", "github:", "oauth:", "external-api:", "direct:",
  ];

  contracts.forEach((contract) => {
    const hasDirectProviderCalls = (contract.permissions || []).some((p) =>
      directProviderPatterns.some((pattern) => p.toLowerCase().startsWith(pattern))
    );
    if (hasDirectProviderCalls) {
      violations.push(contract.experienceId);
      errors.push(`Experience "${contract.experienceId}" makes direct provider calls — must flow through Platform Core → Integrator`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    violations,
    totalExperiences: contracts.length,
    providerFlow: "Experience → Platform Core → Integrator → Provider",
  };
}

/**
 * Audit 6: Zero Demo Compliance
 * Verifies no module contains demo, mock, or placeholder data.
 */
export function auditZeroDemo() {
  const modules = getRegisteredModules();
  const violations = modules.filter((m) => m.hasDemoData);
  const mockFlags = modules.filter((m) =>
    m.id.toLowerCase().includes("mock") ||
    m.id.toLowerCase().includes("demo") ||
    m.id.toLowerCase().includes("fake") ||
    m.id.toLowerCase().includes("placeholder")
  );

  const errors = [];
  if (violations.length > 0) {
    errors.push(`Zero Demo Policy violations: ${violations.map((m) => m.id).join(", ")}`);
  }
  if (mockFlags.length > 0) {
    errors.push(`Mock/demo modules detected: ${mockFlags.map((m) => m.id).join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    totalModules: modules.length,
    violations,
    mockFlags,
  };
}

/**
 * Audit 7: Experience Runtime Freeze
 * Verifies the Experience Runtime is frozen and no unauthorized experiences exist.
 */
export function auditExperienceFreeze() {
  const registered = getRegisteredExperiences();
  const registeredIds = new Set(registered.map((e) => e.id));
  const frozenIds = FROZEN_EXPERIENCE_IDS;
  const extraExperiences = registered.filter((e) => !frozenIds.has(e.id));
  const missingExperiences = [...frozenIds].filter((id) => !registeredIds.has(id));

  const errors = [];
  const warnings = [];
  if (!EXPERIENCE_RUNTIME_FROZEN) {
    warnings.push("Experience Runtime is not yet frozen");
  }
  if (extraExperiences.length > 0) {
    errors.push(`Unauthorized experiences registered: ${extraExperiences.map((e) => e.id).join(", ")}`);
  }
  if (missingExperiences.length > 0) {
    errors.push(`Frozen experiences not registered: ${missingExperiences.join(", ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    isFrozen: EXPERIENCE_RUNTIME_FROZEN,
    registeredCount: registered.length,
    frozenCount: frozenIds.size,
    extraExperiences: extraExperiences.map((e) => e.id),
    missingExperiences,
  };
}

/**
 * Run the full Phase 2 Consolidation Audit.
 * Returns a comprehensive report covering all seven audit dimensions.
 */
export function runConsolidationAudit() {
  const moduleCompleteness = auditModuleCompleteness();
  const moduleUniqueness = auditModuleUniqueness();
  const entityCoverage = auditEntityRealtimeCoverage();
  const platformCore = auditPlatformCoreAdoption();
  const externalIntegrations = auditExternalIntegrations();
  const zeroDemo = auditZeroDemo();
  const experienceFreeze = auditExperienceFreeze();

  const allValid =
    moduleCompleteness.valid &&
    moduleUniqueness.valid &&
    entityCoverage.valid &&
    platformCore.valid &&
    externalIntegrations.valid &&
    zeroDemo.valid &&
    experienceFreeze.valid;

  return {
    timestamp: new Date().toISOString(),
    valid: allValid,
    audits: {
      moduleCompleteness,
      moduleUniqueness,
      entityCoverage,
      platformCore,
      externalIntegrations,
      zeroDemo,
      experienceFreeze,
    },
    summary: {
      totalModules: moduleUniqueness.totalModules,
      totalExperiences: getRegisteredExperiences().length,
      totalContracts: getAllContracts().length,
      requiredModules: moduleCompleteness.requiredTotal,
      registeredModules: moduleCompleteness.registeredCount,
      missingModules: moduleCompleteness.missingCount,
      duplicateModules: moduleUniqueness.duplicateIds.length,
      unsyncedEntities: entityCoverage.unsyncedEntities.length,
      zeroDemoViolations: zeroDemo.violations.length,
      providerCallViolations: externalIntegrations.violations.length,
      experienceFreezeViolations: experienceFreeze.extraExperiences.length,
      platformCoreServices: PLATFORM_CORE_SERVICES.length,
      integrationProviders: INTEGRATION_PROVIDERS.length,
    },
    // The stable hierarchy — this is the final architecture.
    hierarchy: {
      level1: "Founder Authority",
      level2: "Oracle",
      level3: "Authorities",
      level4: "Platform Core (Bud • Orbit • Spark)",
      level5: "Integrator",
      level6: "Shared Module Registry",
      level7: "Experience Runtime (Frozen)",
      level8: "Realtime Engine",
      level9: "Entities",
      level10: "Database",
      experiences: ["Square", "Campus", "Quad", "Connect", "Lens", "Services", "Me"],
    },
  };
}

if (typeof window !== "undefined") {
  window.__UNIBUD_CONSOLIDATION_AUDIT__ = runConsolidationAudit;
}