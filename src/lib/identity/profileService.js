import { base44 } from "@/api/base44Client";

/**
 * profileService — frontend bridge to the `updateProfile` backend function.
 * Keeps username uniqueness validation and profile persistence in one place.
 */

/** Extract a human message from a functions.invoke failure. */
export function getFunctionError(e) {
  return (
    e?.data?.error ||
    e?.data?.reason ||
    e?.response?.data?.error ||
    e?.response?.data?.reason ||
    e?.message ||
    "Something went wrong."
  );
}

/**
 * Live username availability check (dry-run — does not persist).
 * Returns { available: boolean, reason?: string }.
 */
export async function checkUsername(username) {
  const u = String(username || "").trim().toLowerCase();
  if (!u) return { available: true };
  try {
    await base44.functions.invoke("updateProfile", { username: u, dry_run: true });
    return { available: true };
  } catch (e) {
    return { available: false, reason: e?.data?.reason || e?.response?.data?.reason || "That username is unavailable." };
  }
}

/**
 * Persist profile fields. Returns { ok, user }.
 * Throws on validation/uniqueness/server errors (caller should surface the message).
 */
export async function updateProfile(payload) {
  const res = await base44.functions.invoke("updateProfile", payload);
  return res.data;
}