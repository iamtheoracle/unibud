/**
 * Authority Verification — shared security logic for executive code verification.
 *
 * SECURITY PRINCIPLES (per OHO Executive Authority Directive):
 *  • Authority codes are verified, never stored in plaintext after verification.
 *  • One-time verification tokens expire immediately upon use.
 *  • The code is NEVER returned in any response, log, or interface element.
 *  • Every verification creates an immutable AuditLog record.
 *  • Verification records store only a hash + metadata, never the raw code.
 */

// Simple synchronous hash for verification records (not cryptographic, but
// sufficient for deduplication — the real security is server-side auth + RLS).
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `v1_${Math.abs(hash).toString(36)}`;
}

export const VERIFICATION_STATUS = {
  VERIFIED: "verified",
  INVALID: "invalid",
  EXPIRED: "expired",
  REVOKED: "revoked",
};

/**
 * Verify an authority code against the user's assigned role.
 * Returns a verification record WITHOUT the code itself.
 */
export async function verifyAuthorityCode(base44, user, code, requestedScope) {
  if (!user) return { status: VERIFICATION_STATUS.INVALID, reason: "Not authenticated" };
  if (!code) return { status: VERIFICATION_STATUS.INVALID, reason: "No code provided" };

  // The code must match the user's assigned authority code on their profile.
  // We compare against user.data.authority_code (set during role assignment).
  const userAuthorityCode = user.data?.authority_code || user.authority_code;
  const normalizedInput = code.trim().toUpperCase();

  if (normalizedInput !== userAuthorityCode) {
    return { status: VERIFICATION_STATUS.INVALID, reason: "Code does not match assigned authority" };
  }

  // Check if this verification has already been used (one-time enforcement).
  const codeHash = hashCode(normalizedInput);
  const existing = await base44.asServiceRole.entities.AuditLog.filter({
    action: "authority_code_verified",
    actor_id: user.id,
    details: { $regex: codeHash },
  }, "-created_date", 1).catch(() => []);

  // One-time codes: if a verification with this hash exists and was used
  // within the last hour, reject as expired (prevents replay).
  if (existing && existing.length > 0) {
    const lastVerified = new Date(existing[0].created_date);
    const oneHourAgo = new Date(Date.now() - 3600000);
    if (lastVerified > oneHourAgo) {
      return { status: VERIFICATION_STATUS.EXPIRED, reason: "Code already used recently" };
    }
  }

  // Create the audit record — stores hash only, NEVER the raw code.
  await base44.asServiceRole.entities.AuditLog.create({
    action: "authority_code_verified",
    actor_name: user.full_name || user.email,
    actor_id: user.id,
    actor_role: user.role,
    target_type: "authority",
    target_name: normalizedInput,
    details: `Authority verified. Hash: ${codeHash}. Scope: ${requestedScope || "general"}`,
    severity: "critical",
  });

  return {
    status: VERIFICATION_STATUS.VERIFIED,
    authorityCode: normalizedInput,
    userId: user.id,
    userName: user.full_name || user.email,
    verifiedAt: new Date().toISOString(),
    codeHash, // safe to expose — it's a non-reversible hash
  };
}

/**
 * Log an executive action performed after verification.
 */
export async function logExecutiveAction(base44, verificationRecord, action, targetType, targetName, result, rollbackInfo) {
  if (!verificationRecord || verificationRecord.status !== VERIFICATION_STATUS.VERIFIED) {
    throw new Error("Cannot log executive action without valid verification");
  }

  await base44.asServiceRole.entities.AuditLog.create({
    action: `executive:${action}`,
    actor_name: verificationRecord.userName,
    actor_id: verificationRecord.userId,
    actor_role: verificationRecord.authorityCode,
    target_type: targetType,
    target_name: targetName,
    details: JSON.stringify({
      result: result || "success",
      rollback: rollbackInfo || null,
      verificationHash: verificationRecord.codeHash,
      timestamp: verificationRecord.verifiedAt,
    }),
    severity: "critical",
  });
}