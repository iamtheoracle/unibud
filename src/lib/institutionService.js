/**
 * Institution Service — ensures institution profiles exist and can be claimed.
 *
 * Two critical flows:
 * 1. When a student selects an institution during onboarding, a Community Supported
 *    profile is auto-created if one doesn't exist yet. Students get the full UNIBUD
 *    experience immediately.
 * 2. When an institution accepts an outreach invitation, the existing Community Supported
 *    profile is "claimed" and upgraded to verified — all existing students, communities,
 *    study groups, and history remain intact.
 */

import { base44 } from "@/api/base44Client";
import { UNIVERSITIES, getInstitutionTypeFromName } from "@/data/universities";

/**
 * Find an existing Institution entity by name (case-insensitive).
 */
export async function findInstitutionByName(name) {
  if (!name) return null;
  try {
    const results = await base44.entities.Institution.filter({ name });
    return results && results.length > 0 ? results[0] : null;
  } catch {
    return null;
  }
}

/**
 * Ensure a Community Supported institution profile exists for the given institution.
 * Called when a student selects an institution during onboarding.
 *
 * - If an Institution record already exists for this name, returns it as-is.
 * - If no record exists, creates one with verification_status = "community_supported".
 *
 * This ensures the Home page can display "Community Supported" instead of "Not Onboarded",
 * and gives platform admins a real profile to upgrade when the institution officially joins.
 *
 * @param {string} name - Institution name
 * @param {string} country - Country the student selected
 * @returns {Promise<object|null>} The institution record
 */
export async function ensureCommunityInstitution(name, country) {
  if (!name) return null;

  // Check if an Institution record already exists
  const existing = await findInstitutionByName(name);
  if (existing) return existing;

  // Get metadata from the universities data file (accent color, type, campuses, etc.)
  const uniData = UNIVERSITIES.find(
    (u) => u.name.toLowerCase() === name.toLowerCase()
  );

  const institutionType = uniData?.type || getInstitutionTypeFromName(name) || "university";

  try {
    const record = await base44.entities.Institution.create({
      name,
      short_name: uniData?.short || "",
      type: institutionType,
      country: country || uniData?.country || "",
      accent_color: uniData?.accent || "",
      is_verified: false,
      verification_status: "community_supported",
      data_sources: ["student_contributions", "public_info"],
      status: "active",
      estimated_student_count: 1,
    });
    return record;
  } catch {
    // Creation might fail if another student is creating the same institution concurrently.
    // Try one more fetch in case it was created in the race window.
    return await findInstitutionByName(name);
  }
}

/**
 * Claim an existing Community Supported institution profile (or create a new verified one)
 * when an institution accepts an outreach invitation.
 *
 * - If a Community Supported / Not Onboarded profile exists, it is upgraded to "verified".
 * - If no profile exists, a new verified profile is created.
 * - All existing students, communities, study groups, and conversations are scoped by
 *   institution name, so they automatically become part of the verified institution.
 *
 * @param {object} outreach - The InstitutionOutreach record that was accepted
 * @param {string} adminUserId - User ID of the platform admin completing the claim
 * @returns {Promise<object|null>} The claimed/created Institution record
 */
export async function claimInstitutionProfile(outreach, adminUserId) {
  if (!outreach?.institution_name) return null;

  const existing = await findInstitutionByName(outreach.institution_name);

  const claimData = {
    is_verified: true,
    verification_status: "verified",
    verified_at: new Date().toISOString(),
    verified_by_id: adminUserId || "",
    admin_contact_email: outreach.contact_email || "",
    admin_contact_name: outreach.contact_name || "",
    status: "active",
  };

  // Ensure type and country are set from outreach data
  if (outreach.institution_type) claimData.type = outreach.institution_type;
  if (outreach.country && !existing?.country) claimData.country = outreach.country;
  if (outreach.city && !existing?.city) claimData.city = outreach.city;

  try {
    if (existing) {
      // Upgrade the existing profile — preserve all student data, communities, etc.
      return await base44.entities.Institution.update(existing.id, claimData);
    } else {
      // No existing profile — create a new verified one
      return await base44.entities.Institution.create({
        name: outreach.institution_name,
        type: outreach.institution_type || "university",
        country: outreach.country || "",
        city: outreach.city || "",
        ...claimData,
        data_sources: ["verified_institution"],
        status: "active",
      });
    }
  } catch {
    return null;
  }
}