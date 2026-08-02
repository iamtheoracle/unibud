/**
 * Content Architecture Validator
 *
 * Enforces the permanent separation between internal OS documents and
 * user-facing spaces (Square, Campus, Discovery, Quad, Me).
 *
 * System documents (Constitutions, Founder Vision, Release Gates, AI Rules,
 * Non-Negotiables, Developer Notes) are source code in src/lib/constitution/ —
 * they are never stored as database records. This validator is a defense-in-depth
 * layer that filters any record matching system-document patterns from feed
 * results, ensuring the architecture rule is enforced at runtime.
 *
 * Production-blocking: if validation fails, the build must not ship.
 */

import { CONTENT_ARCH_GLOBAL_RULE } from "@/lib/constitution/contentArchitecture";

// ── Visibility Model ──
// Every content item must include a visibility level.
// Only these levels are allowed in user-facing spaces.
export const ALLOWED_USER_VISIBILITY = [
  "public",
  "campus",
  "followers",
  "friends",
  "club",
  "department",
  "faculty",
];

// These visibility levels are NEVER returned in user-facing spaces.
export const RESTRICTED_VISIBILITY = ["admin", "founder", "system"];

// All valid visibility values (for schema validation).
export const ALL_VISIBILITY_LEVELS = [...ALLOWED_USER_VISIBILITY, ...RESTRICTED_VISIBILITY];

// ── Patterns that indicate an internal OS document ──
// If any user-facing record matches these, it is treated as a system document
// leak and removed from the feed immediately.
const SYSTEM_DOCUMENT_PATTERNS = [
  /constitution/i,
  /founder\s*vision/i,
  /release\s*gate/i,
  /definition\s*of\s*done/i,
  /non[-_\s]?negotiable/i,
  /ai\s*rules?/i,
  /oracle\s*rules?/i,
  /bud\s*rules?/i,
  /developer\s*notes?/i,
  /internal\s*documentation/i,
  /system\s*configuration/i,
  /permanent\s*principles?/i,
  /engineering\s*constitution/i,
  /product\s*constitution/i,
  /evolution\s*constitution/i,
  /content\s*architecture/i,
];

// ── Post types that are legitimate user-facing types ──
const VALID_USER_POST_TYPES = [
  "text", "photo", "video", "document", "note", "poll", "event", "question",
  "marketplace", "lost_found", "achievement", "club_update", "research",
  "study_resource", "discussion", "post", "news",
];

// ── Post types that indicate a system document leak ──
const SYSTEM_POST_TYPES = [
  "constitution",
  "founder_vision",
  "release_gate",
  "definition_of_done",
  "non_negotiable",
  "ai_rule",
  "oracle_rule",
  "bud_rule",
  "developer_note",
  "internal_document",
  "system_config",
];

/**
 * Checks if a single record matches system-document patterns.
 * Returns true if the record is a suspected system document leak.
 */
export function isSystemDocumentLeak(record) {
  if (!record || typeof record !== "object") return false;

  // Check explicit type field
  if (record.type && SYSTEM_POST_TYPES.includes(record.type)) {
    return true;
  }

  // Check title/content/tags for system document patterns
  const fieldsToCheck = [
    record.title,
    record.content,
    record.subject,
    record.message,
    record.name,
    record.description,
  ].filter(Boolean);

  for (const field of fieldsToCheck) {
    if (typeof field === "string") {
      for (const pattern of SYSTEM_DOCUMENT_PATTERNS) {
        if (pattern.test(field)) {
          return true;
        }
      }
    }
  }

  // Check tags array
  if (Array.isArray(record.tags)) {
    for (const tag of record.tags) {
      if (typeof tag === "string") {
        for (const pattern of SYSTEM_DOCUMENT_PATTERNS) {
          if (pattern.test(tag)) return true;
        }
      }
    }
  }

  // Check hashtags array
  if (Array.isArray(record.hashtags)) {
    for (const tag of record.hashtags) {
      if (typeof tag === "string") {
        for (const pattern of SYSTEM_DOCUMENT_PATTERNS) {
          if (pattern.test(tag)) return true;
        }
      }
    }
  }

  return false;
}

/**
 * Filters an array of records, removing any that match system-document patterns.
 * Use this in every feed query pipeline to enforce the content architecture rule.
 *
 * @param {Array} records - Feed results from entity queries
 * @param {Object} options - { space: 'square'|'campus'|'discovery'|'quad'|'me' }
 * @returns {Array} Filtered records with system documents removed
 */
export function filterSystemDocuments(records, options = {}) {
  if (!Array.isArray(records)) return [];
  const filtered = records.filter((record) => !isSystemDocumentLeak(record));

  if (import.meta.env?.DEV && filtered.length < records.length) {
    const removed = records.length - filtered.length;
    console.warn(
      `[ContentArchitecture] Removed ${removed} system document(s) from ${options.space || "user"} feed`
    );
  }

  return filtered;
}

/**
 * Validates that a feed result set contains no system documents.
 * Returns { valid: boolean, violations: Array }.
 *
 * Use this as a production-blocking check before launch.
 */
export function validateFeedSpace(records, space = "unknown") {
  const violations = [];
  if (!Array.isArray(records)) {
    return { valid: true, violations: [], space };
  }

  records.forEach((record, idx) => {
    if (isSystemDocumentLeak(record)) {
      violations.push({
        index: idx,
        id: record.id || record._id || "unknown",
        type: record.type || "unknown",
        space,
        reason: "Record matches system-document pattern",
      });
    }
  });

  return {
    valid: violations.length === 0,
    violations,
    space,
    checked: records.length,
  };
}

/**
 * Runs a full content architecture validation across multiple feed result sets.
 * Returns a summary suitable for the Launch Readiness dashboard.
 *
 * @param {Object} feeds - { square: [...], campus: [...], discovery: [...], quad: [...], me: [...] }
 * @returns {Object} { passed: boolean, results: Array, totalViolations: number }
 */
export function validateAllUserSpaces(feeds = {}) {
  const spaces = ["square", "campus", "discovery", "quad", "me"];
  const results = spaces.map((space) => {
    const records = feeds[space] || [];
    return validateFeedSpace(records, space);
  });

  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

  return {
    passed: totalViolations === 0,
    results,
    totalViolations,
    spacesChecked: spaces.length,
    rule: CONTENT_ARCH_GLOBAL_RULE.rule,
  };
}

/**
 * Checks if a record has a restricted visibility level (admin/founder/system).
 * Such records must never appear in user-facing spaces.
 */
export function hasRestrictedVisibility(record) {
  if (!record || typeof record !== "object") return false;
  const vis = record.visibility;
  if (!vis) return false; // No visibility set = user-facing by default
  return RESTRICTED_VISIBILITY.includes(vis);
}

/**
 * Unified content gate: filters both system-document leaks AND restricted
 * visibility records from a feed result set. This is the single function
 * every user-facing feed, search, recommendation, and notification pipeline
 * must pass results through before rendering.
 *
 * @param {Array} records - Feed results from entity queries
 * @param {Object} options - { space: 'square'|'campus'|'discovery'|'quad'|'me', allowSystem: false }
 * @returns {Array} Filtered records safe for user-facing display
 */
export function filterUserFacing(records, options = {}) {
  if (!Array.isArray(records)) return [];
  const { space = "unknown", allowSystem = false } = options;

  const filtered = records.filter((record) => {
    // System document leak check
    if (isSystemDocumentLeak(record)) return false;
    // Restricted visibility check (unless Founder/Admin mode explicitly allows it)
    if (!allowSystem && hasRestrictedVisibility(record)) return false;
    return true;
  });

  if (import.meta.env?.DEV && filtered.length < records.length) {
    const removed = records.length - filtered.length;
    console.warn(
      `[ContentArchitecture] Removed ${removed} restricted record(s) from ${space} feed`
    );
  }

  return filtered;
}

/**
 * Wraps an entity feed query to automatically filter system documents
 * and restricted-visibility records.
 *
 * @param {Function} queryFn - Original query function returning records
 * @param {String} space - Which user space this feed serves
 * @param {Object} options - { allowSystem: false }
 * @returns {Function} Wrapped query function that enforces content architecture
 */
export function withContentGate(queryFn, space = "unknown", options = {}) {
  return async (...args) => {
    const records = await queryFn(...args);
    return filterUserFacing(records, { space, ...options });
  };
}

// Backward-compatible alias
export const withSystemDocumentFilter = withContentGate;

/**
 * Runs a comprehensive content architecture validation across all user spaces.
 * Returns a summary with per-space checks and overall pass/fail status.
 *
 * @param {Object} feeds - { square: [...], campus: [...], discovery: [...], quad: [...], me: [...] }
 * @param {Object} options - { allowSystem: false }
 * @returns {Object} { passed: boolean, results: Array, totalViolations: number }
 */
export function runContentArchitectureValidation(feeds = {}, options = {}) {
  const spaces = ["square", "campus", "discovery", "quad", "me"];
  const results = spaces.map((space) => {
    const records = feeds[space] || [];
    const visResult = validateFeedSpace(records, space);

    // Also check for restricted visibility
    const restrictedVis = records.filter((r) => hasRestrictedVisibility(r));
    const systemDocs = records.filter((r) => isSystemDocumentLeak(r));

    return {
      space,
      valid: visResult.valid && restrictedVis.length === 0,
      checked: records.length,
      systemDocumentLeaks: systemDocs.length,
      restrictedVisibilityLeaks: restrictedVis.length,
      violations: [
        ...visResult.violations,
        ...restrictedVis.map((r, i) => ({
          index: i,
          id: r.id || "unknown",
          space,
          reason: `Restricted visibility: ${r.visibility}`,
        })),
      ],
    };
  });

  const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

  return {
    passed: totalViolations === 0,
    results,
    totalViolations,
    spacesChecked: spaces.length,
    rule: CONTENT_ARCH_GLOBAL_RULE.rule,
    allowSystem: options.allowSystem || false,
  };
}