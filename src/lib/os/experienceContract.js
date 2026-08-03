/**
 * UNIBUD OS v4 — Experience Contract
 *
 * Every experience implements this standard interface:
 *   ├── Registry Metadata
 *   ├── Context Rules
 *   ├── Module List (from Module Registry only)
 *   ├── Hidden Service Access
 *   ├── Bud Hooks
 *   ├── Orbit Hooks
 *   ├── Spark Hooks
 *   ├── Realtime Hooks
 *   └── Permissions
 *
 * No experience may bypass this contract.
 * References: OS Constitution, Phase 5 Migration Framework.
 */

import { isModuleRegistered, getModule } from "./moduleRegistry";
import { getExperience } from "./experienceRegistry";
import { getService } from "./hiddenServiceRegistry";
import { EXPERIENCES } from "./manifest";

const CONTRACTS = new Map();

/**
 * Register an experience contract.
 * @param {Object} contract
 * @param {string} contract.experienceId - Must match a registered experience
 * @param {string[]} contract.modules - Module IDs from the Module Registry
 * @param {string[]} contract.permissions - Required permissions
 * @param {Object} contract.contextRules - How context affects this experience
 * @param {string[]} contract.hiddenServices - Hidden services this experience can access
 * @param {Object} contract.hooks - Platform Core hooks { bud, orbit, spark, realtime }
 * @param {string} contract.migrationStatus - "pending" | "in-progress" | "migrated"
 * @param {string[]} contract.legacyComponents - Names of remaining legacy components
 */
export function registerExperienceContract(contract) {
  const { experienceId } = contract;
  if (!experienceId) throw new Error("Contract requires an experienceId");

  const exp = getExperience(experienceId);
  if (!exp) {
    throw new Error(`Cannot register contract for unregistered experience "${experienceId}"`);
  }

  CONTRACTS.set(experienceId, {
    ...contract,
    registeredAt: Date.now(),
  });

  return CONTRACTS.get(experienceId);
}

/**
 * Get a contract by experience ID.
 */
export function getContract(experienceId) {
  return CONTRACTS.get(experienceId);
}

/**
 * Get all registered contracts.
 */
export function getAllContracts() {
  return Array.from(CONTRACTS.values());
}

/**
 * Validate a single contract against constitutional rules.
 */
export function validateContract(experienceId) {
  const contract = CONTRACTS.get(experienceId);
  if (!contract) return { valid: false, errors: ["No contract registered"] };

  const errors = [];
  const warnings = [];

  // Every experience must declare modules
  if (!contract.modules || contract.modules.length === 0) {
    warnings.push("Experience declares no consumed modules");
  }

  // Every module must come from the Module Registry
  contract.modules?.forEach((moduleId) => {
    if (!isModuleRegistered(moduleId)) {
      errors.push(`Module "${moduleId}" is not registered in the Module Registry`);
    }
  });

  // Must declare Platform Core hooks
  const requiredHooks = ["bud", "orbit", "spark", "realtime"];
  requiredHooks.forEach((hook) => {
    if (contract.hooks?.[hook] === undefined) {
      errors.push(`Missing Platform Core hook: "${hook}"`);
    }
  });

  // Must declare permissions
  if (!contract.permissions || contract.permissions.length === 0) {
    warnings.push("Experience declares no permissions");
  }

  // Must declare migration status
  if (!["pending", "in-progress", "migrated"].includes(contract.migrationStatus)) {
    errors.push(`Invalid migration status "${contract.migrationStatus}"`);
  }

  // Hidden services must be registered
  contract.hiddenServices?.forEach((serviceId) => {
    if (!getService(serviceId)) {
      warnings.push(`Hidden service "${serviceId}" is not registered`);
    }
  });

  // No experience may own Platform Core services
  const platformCoreServices = ["search", "notifications", "identity", "ai", "realtime", "integrations"];
  contract.modules?.forEach((moduleId) => {
    const mod = getModule(moduleId);
    if (mod?.category === "platform-core") {
      errors.push(`Experience owns Platform Core service "${moduleId}" — must consume from Platform Core`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate all contracts.
 */
export function validateAllContracts() {
  const results = { valid: true, errors: [], warnings: [], perExperience: {} };

  for (const contract of CONTRACTS.values()) {
    const result = validateContract(contract.experienceId);
    results.perExperience[contract.experienceId] = result;
    if (!result.valid) {
      results.valid = false;
      results.errors.push(...result.errors.map((e) => `[${contract.experienceId}] ${e}`));
    }
    results.warnings.push(...result.warnings.map((w) => `[${contract.experienceId}] ${w}`));
  }

  // Check all 7 experiences have contracts
  EXPERIENCES.forEach((exp) => {
    if (!CONTRACTS.has(exp.id)) {
      results.warnings.push(`Experience "${exp.id}" has no registered contract`);
    }
  });

  return results;
}

// ─── Campus Experience Contract (first migration) ──────────────────────────
// Campus owns presentation only. It consumes academic modules from the
// Module Registry and registers all four Platform Core hooks.

registerExperienceContract({
  experienceId: "campus",
  modules: ["files", "resources", "events", "announcements", "discussions", "members"],
  permissions: ["read:courses", "read:assignments", "read:grades", "read:attendance"],
  contextRules: {
    academic: "Prioritize timetable, assignments, notes, exams, research",
    social: "Prioritize upcoming classes and deadlines",
    hybrid: "Balanced academic overview",
  },
  hiddenServices: ["marketplace", "wallet", "student-id", "printing", "tutors"],
  hooks: {
    bud: true,      // Bud reacts to grade changes, overdue assignments, exam reminders
    orbit: true,     // Orbit receives announcements, exam schedules, calendar events
    spark: true,    // Spark triggers deadline reminders, task automation, achievement checks
    realtime: true,  // Realtime syncs grades, assignments, timetable changes
  },
  migrationStatus: "in-progress",
  legacyComponents: ["AcademicHub", "AcademicsTab", "AcademicChartsDashboard"],
});

// ─── Square Experience Contract ───────────────────────────────────────────
registerExperienceContract({
  experienceId: "square",
  modules: ["posts", "stories", "communities", "podcasts", "live", "videos", "media", "events", "announcements"],
  permissions: ["read:posts", "create:posts", "read:communities"],
  contextRules: {
    academic: "Prioritize academic communities and campus events",
    social: "Prioritize feed, stories, and media",
    hybrid: "Balanced presentation",
  },
  hiddenServices: ["marketplace"],
  hooks: { bud: true, orbit: true, spark: true, realtime: true },
  migrationStatus: "pending",
  legacyComponents: ["SocialHub", "SocialTab", "QuadFeed"],
});

// ─── Connect Experience Contract ───────────────────────────────────────────
registerExperienceContract({
  experienceId: "connect",
  modules: ["messages", "conversations", "calls", "communities", "members"],
  permissions: ["read:messages", "create:messages", "read:conversations"],
  contextRules: {
    academic: "Prioritize academic group discussions",
    social: "Prioritize social messages and calls",
    hybrid: "Balanced communication",
  },
  hiddenServices: [],
  hooks: { bud: true, orbit: true, spark: true, realtime: true },
  migrationStatus: "pending",
  legacyComponents: ["Connect", "Messages", "ConversationList"],
});

// ─── Quad Experience Contract ──────────────────────────────────────────────
registerExperienceContract({
  experienceId: "quad",
  modules: ["search", "recommendations", "events", "communities", "posts", "announcements"],
  permissions: ["read:all"],
  contextRules: {
    academic: "Prioritize academic opportunities and campus events",
    social: "Prioritize trending content and community activity",
    hybrid: "Balanced discovery across all content",
  },
  hiddenServices: ["marketplace", "wallet", "tutors"],
  hooks: { bud: true, orbit: true, spark: true, realtime: true },
  migrationStatus: "pending",
  legacyComponents: ["Quad", "Discover", "DiscoverFeed"],
});

// ─── Lens Experience Contract ──────────────────────────────────────────────
registerExperienceContract({
  experienceId: "lens",
  modules: ["search", "recommendations", "notifications"],
  permissions: ["read:all"],
  contextRules: {
    academic: "Surface academic search and quick actions",
    social: "Surface social search and quick actions",
    hybrid: "Surface all search and quick actions",
  },
  hiddenServices: ["marketplace", "wallet", "student-id", "printing", "transport", "food", "healthcare"],
  hooks: { bud: true, orbit: true, spark: true, realtime: true },
  migrationStatus: "pending",
  legacyComponents: ["Lens", "UniversalSearchOverlay"],
});

// ─── Services Experience Contract ──────────────────────────────────────────
registerExperienceContract({
  experienceId: "services",
  modules: [],
  permissions: ["read:services"],
  contextRules: {
    academic: "Surface academic services (printing, library, study rooms)",
    social: "Surface social services (food, events, marketplace)",
    hybrid: "Surface all available services",
  },
  hiddenServices: ["marketplace", "wallet", "student-id", "housing", "printing", "transport", "food", "healthcare", "campus-services", "campus-utilities", "payments", "ticketing", "student-jobs", "tutors"],
  hooks: { bud: true, orbit: true, spark: true, realtime: true },
  migrationStatus: "pending",
  legacyComponents: ["Services"],
});

// ─── Me Experience Contract ───────────────────────────────────────────────
registerExperienceContract({
  experienceId: "me",
  modules: ["student-profile", "public-profiles", "notifications", "recommendations"],
  permissions: ["read:own-profile", "update:own-profile"],
  contextRules: {
    academic: "Prioritize academic identity and achievements",
    social: "Prioritize social identity and activity",
    hybrid: "Balanced identity presentation",
  },
  hiddenServices: ["wallet", "student-id"],
  hooks: { bud: true, orbit: true, spark: true, realtime: true },
  migrationStatus: "pending",
  legacyComponents: ["Me", "MeTab", "ProfileHeader"],
});