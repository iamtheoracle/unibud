/**
 * UNIBUD OS — External Content & API Transition Policy
 *
 * Governs how externally sourced content is labeled, prioritized,
 * and transitioned to official API integrations.
 *
 * Priority order (highest to lowest):
 *   1. Real UNIBUD user content
 *   2. Verified university content
 *   3. Official authenticated platform integrations
 *   4. Verified public external updates (temporary only)
 *
 * External content must NEVER appear as if created by a UNIBUD student.
 * Bud must summarize external information, never copy verbatim.
 * Community discussions are separate from external updates.
 */

// ── Provenance Types ──
export const PROVENANCE_TYPES = {
  UNIBUD_USER: "unibud_user",
  UNIVERSITY_OFFICIAL: "university_official",
  OFFICIAL_CONNECTED: "official_connected",
  VERIFIED_EXTERNAL: "verified_external",
};

// ── Priority ranking (1 = highest) ──
export const PROVENANCE_PRIORITY = {
  unibud_user: 1,
  university_official: 2,
  official_connected: 3,
  verified_external: 4,
};

// ── Source Labels (the four student-visible labels) ──
export const SOURCE_LABELS = {
  EXTERNAL_UPDATE: "External Update",
  OFFICIAL_SOURCE: "Official Source",
  PUBLIC_ANNOUNCEMENT: "Public Announcement",
  VERIFIED_NEWS: "Verified News",
};

// ── Integration transition lifecycle ──
export const INTEGRATION_STATUSES = {
  TEMPORARY_EXTERNAL: "temporary_external",
  OFFICIAL_API: "official_api",
  PENDING_TRANSITION: "pending_transition",
  MIGRATED: "migrated",
};

/**
 * Returns the numeric priority of a provenance type (lower = higher priority).
 */
export function getProvenancePriority(type) {
  return PROVENANCE_PRIORITY[type] ?? 99;
}

/**
 * Determines whether a content item is externally sourced.
 */
export function isExternalContent(content) {
  if (!content) return false;
  return (
    content.provenance_type === PROVENANCE_TYPES.VERIFIED_EXTERNAL ||
    content.provenance_type === PROVENANCE_TYPES.OFFICIAL_CONNECTED ||
    Boolean(content.source_label)
  );
}

/**
 * Returns the display label for a content item's provenance.
 * Returns null for UNIBUD user content (no external badge needed).
 */
export function formatProvenanceLabel(content) {
  if (!content) return null;
  if (content.source_label) return content.source_label;
  if (content.provenance_type === PROVENANCE_TYPES.UNIBUD_USER) return null;
  if (content.provenance_type === PROVENANCE_TYPES.UNIVERSITY_OFFICIAL)
    return SOURCE_LABELS.OFFICIAL_SOURCE;
  if (content.provenance_type === PROVENANCE_TYPES.OFFICIAL_CONNECTED)
    return SOURCE_LABELS.OFFICIAL_SOURCE;
  return SOURCE_LABELS.EXTERNAL_UPDATE;
}

/**
 * Checks whether a piece of external content should transition to an
 * official integration now that the integration is connected.
 */
export function shouldTransitionToIntegration(content, connectedIntegrationTypes) {
  if (!content?.replaces_integration) return false;
  if (content.integration_status === INTEGRATION_STATUSES.MIGRATED) return false;
  if (content.integration_status === INTEGRATION_STATUSES.OFFICIAL_API) return false;
  return (
    Array.isArray(connectedIntegrationTypes) &&
    connectedIntegrationTypes.includes(content.replaces_integration)
  );
}

/**
 * Sorts an array of content items by provenance priority (highest priority first).
 */
export function rankByProvenance(contents) {
  if (!Array.isArray(contents)) return [];
  return [...contents].sort(
    (a, b) => getProvenancePriority(a?.provenance_type) - getProvenancePriority(b?.provenance_type)
  );
}

/**
 * Returns a human-readable origin string for a content item.
 * Students should always know where content comes from.
 */
export function getContentOrigin(content) {
  if (!content) return "UNIBUD";
  if (content.provenance_type === PROVENANCE_TYPES.UNIBUD_USER) return "UNIBUD";
  if (content.provenance_type === PROVENANCE_TYPES.UNIVERSITY_OFFICIAL) return "University";
  if (content.provenance_type === PROVENANCE_TYPES.OFFICIAL_CONNECTED)
    return "Official Connected Account";
  if (content.provenance_type === PROVENANCE_TYPES.VERIFIED_EXTERNAL)
    return "Verified External Source";
  return "UNIBUD";
}