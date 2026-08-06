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

// ─── Campus Experience Contract (Phase 6 — MIGRATED) ───────────────────────
// Campus is the reference implementation for experience migration.
// It owns presentation only and consumes 15 academic modules + 6 community
// modules from the Module Registry. All Platform Core hooks are registered.
//
// Campus does NOT own: search, notifications, identity, AI, realtime, or
// integrations — these come from Platform Core.
//
// Realtime: Grade, Assignment, TimetableEntry, AttendanceRecord, CalendarEvent,
// StudentGrade are synced by RealtimeSyncProvider → entitySyncRegistry.
// Bud: Receives academic context for proactive assistance.
// Orbit: Surfaces scholarships, research, announcements, competitions.
// Spark: Handles indexing, OCR, reminders, workflow execution.

registerExperienceContract({
  experienceId: "campus",
  modules: [
    // Academic modules (registered in academicModules.js)
    "timetable", "courses", "assignments", "gpa", "grades", "results",
    "attendance", "notes", "flashcards", "projects", "research",
    "scholarships", "exams", "study-sessions", "calendar",
    // Community modules (shared with other experiences)
    "files", "resources", "events", "announcements", "discussions", "members",
  ],
  permissions: [
    "read:courses", "read:assignments", "read:grades", "read:attendance",
    "read:timetable", "read:exams", "read:notes", "read:scholarships",
    "read:research", "read:calendar",
  ],
  contextRules: {
    academic: "Prioritize today's timetable, assignment deadlines, GPA trends, upcoming exams, study streak, research, academic recommendations",
    social: "Prioritize upcoming classes, deadlines, and campus events",
    hybrid: "Balanced academic overview with community activity",
  },
  hiddenServices: ["marketplace", "wallet", "student-id", "printing", "tutors", "campus-services"],
  hooks: {
    bud: true,       // Overdue assignments, GPA changes, exam prep, study recommendations, scholarship opportunities
    orbit: true,      // Scholarships, research papers, university announcements, conferences, competitions
    spark: true,      // Background indexing, document processing, OCR, reminder automation, cache invalidation
    realtime: true,   // GPA changes, assignment status, new grades, attendance, timetable changes, calendar updates
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
});

// ─── Square Experience Contract (Phase 7 — MIGRATED) ──────────────────────
// Square is the canonical social implementation — the reference for every
// social experience. It owns presentation only and consumes registered
// modules from the Module Registry. All Platform Core hooks are registered.
//
// Square does NOT own: search, notifications, identity, AI, realtime, or
// integrations — these come from Platform Core.
//
// Realtime: QuadPost, Story, ShortVideo, Community, Podcast, LiveStream,
// CampusEvent, QuadComment are synced by RealtimeSyncProvider.
// Bud: Receives social context for proactive assistance.
// Orbit: Supplies trending topics, university news, campus events, recommendations.
// Spark: Handles indexing, OCR, reminders, workflow execution, cache invalidation.

registerExperienceContract({
  experienceId: "square",
  modules: [
    // Content modules (registered in moduleRegistry + socialModules)
    "posts", "stories", "podcasts", "live", "videos", "media",
    "comments", "reactions", "media-viewer",
    // Community modules (shared with other experiences)
    "communities", "events", "announcements", "members",
    // Identity modules
    "creator-profiles",
    // Discovery modules (consumed from Platform Core, not owned)
    "notifications", "recommendations",
  ],
  permissions: [
    "read:posts", "create:posts", "read:communities", "create:comments",
    "read:stories", "create:stories", "read:live", "read:podcasts",
  ],
  contextRules: {
    academic: "Prioritize academic communities and campus events; social modules lower priority",
    social: "Prioritize feed, stories, live, podcasts, and communities",
    hybrid: "Balanced presentation of social and academic content",
  },
  hiddenServices: ["marketplace"],
  hooks: {
    bud: true,       // Summarize discussions, recommend communities, surface posts, assist content creation
    orbit: true,      // Trending topics, university news, campus events, verified announcements, recommendations
    spark: true,      // Background indexing, document processing, OCR, reminder automation, cache invalidation
    realtime: true,   // Feed updates, stories, comments, reactions, community activity, live viewer counts, notifications
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
  isCanonicalSocialImplementation: true,
});

// ─── Connect Experience Contract (Phase 8 — MIGRATED) ─────────────────────
// Connect is the canonical communication implementation — the reference for
// every communication experience. It owns communication workflows only.
// Everything else comes from Platform Core.
//
// Connect does NOT own: authentication, search, notifications, identity,
// realtime, or external integrations — these come from Platform Core.
//
// Realtime: Message, Conversation, Presence, Follow, FriendRequest are synced
// by RealtimeSyncProvider. Messages, presence, typing, read receipts, meeting
// state, shared files, and whiteboard changes update instantly.
// Bud: Summarize conversations, highlight action items, draft replies, surface unread priorities.
// Orbit: Recommend communities, collaborators, study partners, networking opportunities.
// Spark: Background uploads, media processing, OCR, meeting recordings, search indexing.

registerExperienceContract({
  experienceId: "connect",
  modules: [
    // Communication modules (registered in moduleRegistry + communicationModules)
    "messages", "conversations", "calls",
    "group-chats", "voice-calls", "video-calls", "meetings",
    "whiteboards", "screen-sharing", "presence", "contacts", "file-sharing",
    // Community modules (shared with other experiences)
    "communities", "members",
    // Discovery modules (consumed from Platform Core, not owned)
    "notifications", "recommendations",
  ],
  permissions: [
    "read:messages", "create:messages", "read:conversations", "create:conversations",
    "read:calls", "create:calls", "read:presence",
  ],
  contextRules: {
    academic: "Prioritize academic group discussions and study groups; messages lower priority",
    social: "Prioritize messages, calls, and conversations",
    hybrid: "Balanced communication across all channels",
  },
  hiddenServices: [],
  hooks: {
    bud: true,       // Summarize conversations, highlight action items, draft replies, surface unread priorities
    orbit: true,      // Recommend communities, collaborators, study partners, networking opportunities
    spark: true,      // Background uploads, media processing, OCR, meeting recordings, search indexing
    realtime: true,   // Messages, calls, presence, typing, read receipts, meeting state, shared files, whiteboard changes
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
  isCanonicalCommunicationImplementation: true,
});

// ─── Quad Experience Contract (Phase 9 — MIGRATED) ────────────────────────
// Quad is the canonical discovery implementation — the universal discovery
// workspace. It composes Platform Core only: Orbit, Search, Recommendation
// Engine, and Realtime Engine. Quad never owns feeds, communities, media,
// search, identity, or realtime.
//
// Bud simply explains discovery results.

registerExperienceContract({
  experienceId: "quad",
  modules: [
    // Discovery modules (consumed from Platform Core — Quad owns none)
    "search", "recommendations", "notifications",
    // Content modules (consumed from Module Registry)
    "posts", "communities", "events", "announcements",
    // Community modules (shared)
    "clubs", "members",
  ],
  permissions: ["read:all"],
  contextRules: {
    academic: "Prioritize academic discovery: study groups, research, scholarships, internships",
    social: "Prioritize trending content, campus traditions, and community activity",
    hybrid: "Balanced discovery across all content",
  },
  hiddenServices: ["marketplace", "wallet", "tutors"],
  hooks: {
    bud: true,       // Simply explains discovery results
    orbit: true,      // Supplies trending topics, campus highlights, recommendations
    spark: true,      // Search indexing, cache invalidation
    realtime: true,   // Discovery results update instantly
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
  isCanonicalDiscoveryImplementation: true,
});

// ─── Lens Experience Contract (Phase 10 — MIGRATED) ───────────────────────
// Lens is the canonical command center implementation — the OS command center.
// It owns: Universal Search UI, Command Palette, AI Actions, Cross-workspace
// Search, Filters, Saved Searches, Recent Activity, Recommendations.
// Lens never owns data — everything comes from Platform Core.

registerExperienceContract({
  experienceId: "lens",
  modules: [
    // Discovery modules (consumed from Platform Core — Lens owns none)
    "search", "recommendations", "notifications",
  ],
  permissions: ["read:all"],
  contextRules: {
    academic: "Surface academic search and quick actions",
    social: "Surface social search and quick actions",
    hybrid: "Surface all search and quick actions",
  },
  hiddenServices: ["marketplace", "wallet", "student-id", "printing", "transport", "food", "healthcare"],
  hooks: {
    bud: true,       // AI actions and suggestions flow through Bud
    orbit: true,      // Cross-workspace search and recommendations
    spark: true,      // Search indexing and cache invalidation
    realtime: true,   // Search results and recent activity update instantly
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
  isCanonicalCommandCenterImplementation: true,
});

// ─── Services Experience Contract (Phase 11 — MIGRATED) ───────────────────
// Services is the canonical services gateway implementation — the gateway to
// hidden products. It exposes workflows for Marketplace, Wallet, Housing,
// Tutors, Printing, Food, Transport, Healthcare, Campus Services, Student ID,
// and Payments.
//
// Marketplace and Wallet remain hidden products — launched through Services
// or by user intent, never as permanent navigation destinations.

registerExperienceContract({
  experienceId: "services",
  modules: [
    // Services composes hidden products and platform services.
    // No owned modules — everything is consumed from Platform Core.
    "recommendations", "notifications",
  ],
  permissions: ["read:services"],
  contextRules: {
    academic: "Surface academic services (printing, library, study rooms)",
    social: "Surface social services (food, events, marketplace)",
    hybrid: "Surface all available services",
  },
  hiddenServices: ["marketplace", "wallet", "student-id", "housing", "printing", "transport", "food", "healthcare", "campus-services", "campus-utilities", "payments", "ticketing", "student-jobs", "tutors"],
  hooks: {
    bud: true,       // Personalized service recommendations
    orbit: true,      // Context-aware service surfacing
    spark: true,      // Workflow automation for service requests
    realtime: true,   // Service availability updates instantly
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
  isCanonicalServicesGatewayImplementation: true,
});

// ─── Me Experience Contract (Phase 12 — MIGRATED) ─────────────────────────
// Me is the canonical operating profile implementation — the user's operating
// profile. It owns: Identity, Preferences, Settings, Privacy, Security, Devices,
// Notifications, Achievements, Portfolio, Academic Profile, Social Profile,
// and Wallet Profile.
// Me consumes Platform Core — it owns no infrastructure.

registerExperienceContract({
  experienceId: "me",
  modules: [
    // Identity modules (consumed from Module Registry)
    "student-profile", "public-profiles", "creator-profiles",
    // Discovery modules (consumed from Platform Core)
    "notifications", "recommendations",
  ],
  permissions: ["read:own-profile", "update:own-profile"],
  contextRules: {
    academic: "Prioritize academic identity, achievements, and academic profile",
    social: "Prioritize social identity, activity, and social profile",
    hybrid: "Balanced identity presentation",
  },
  hiddenServices: ["wallet", "student-id"],
  hooks: {
    bud: true,       // Academic insights, smart reminders, achievement recommendations
    orbit: true,      // Context-aware profile recommendations
    spark: true,      // Background indexing of portfolio and achievements
    realtime: true,   // Profile data, achievements, wallet updates sync instantly
  },
  migrationStatus: "migrated",
  legacyComponents: [],
  isReferenceImplementation: true,
  isCanonicalProfileImplementation: true,
});