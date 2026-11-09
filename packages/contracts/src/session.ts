import type { AccountId } from "./identity.ts";

export type SessionId = string & { readonly __brand: "SessionId" };

export interface SessionRecord {
  id: SessionId;
  accountId: AccountId;
  status: "active" | "revoked";
  issuedAt: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
  revokedAt?: string;
  /** Opaque server-side reference only; never a raw cookie or bearer token. */
  credentialReference: string;
}

export interface SessionValidationRequest {
  accountId: AccountId;
  now: string;
  accountStatus: "pending_verification" | "active" | "restricted" | "suspended" | "closed";
}

export type SessionValidationDecision =
  | { allowed: true; sessionId: SessionId; accountId: AccountId }
  | {
      allowed: false;
      reason:
        | "session_not_found"
        | "account_mismatch"
        | "account_inactive"
        | "session_revoked"
        | "session_not_yet_valid"
        | "session_expired"
        | "invalid_session_timestamps";
    };

/**
 * Validate trusted session metadata after the server has authenticated the
 * presented cookie/token and loaded this record from trusted storage.
 * This helper never authenticates a client-supplied session ID or token.
 */
export function evaluateSession(
  session: SessionRecord | undefined,
  request: SessionValidationRequest
): SessionValidationDecision {
  if (!session) return { allowed: false, reason: "session_not_found" };
  if (session.accountId !== request.accountId) {
    return { allowed: false, reason: "account_mismatch" };
  }
  if (request.accountStatus !== "active") {
    return { allowed: false, reason: "account_inactive" };
  }
  if (session.status === "revoked" || session.revokedAt) {
    return { allowed: false, reason: "session_revoked" };
  }

  const now = Date.parse(request.now);
  const issuedAt = Date.parse(session.issuedAt);
  const idleExpiresAt = Date.parse(session.idleExpiresAt);
  const absoluteExpiresAt = Date.parse(session.absoluteExpiresAt);
  if (
    !Number.isFinite(now) ||
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(idleExpiresAt) ||
    !Number.isFinite(absoluteExpiresAt) ||
    absoluteExpiresAt <= issuedAt ||
    idleExpiresAt <= issuedAt
  ) {
    return { allowed: false, reason: "invalid_session_timestamps" };
  }
  if (now < issuedAt) {
    return { allowed: false, reason: "session_not_yet_valid" };
  }
  if (now >= idleExpiresAt || now >= absoluteExpiresAt) {
    return { allowed: false, reason: "session_expired" };
  }

  return { allowed: true, sessionId: session.id, accountId: session.accountId };
}
