import test from "node:test";
import assert from "node:assert/strict";
import { evaluateSession, type SessionRecord } from "../src/session.ts";
import type { AccountId } from "../src/identity.ts";

const accountId = "synthetic-account-001" as AccountId;
const otherAccountId = "synthetic-account-002" as AccountId;

const session: SessionRecord = {
  id: "synthetic-session-001" as SessionRecord["id"],
  accountId,
  status: "active",
  issuedAt: "2026-01-01T00:00:00.000Z",
  idleExpiresAt: "2026-01-01T02:00:00.000Z",
  absoluteExpiresAt: "2026-01-02T00:00:00.000Z",
  credentialReference: "synthetic-credential-reference"
};

const request = {
  accountId,
  accountStatus: "active" as const,
  now: "2026-01-01T01:00:00.000Z"
};

test("allows a valid active session for an active account", () => {
  assert.deepEqual(evaluateSession(session, request), {
    allowed: true,
    sessionId: session.id,
    accountId
  });
});

test("denies a missing session", () => {
  assert.deepEqual(evaluateSession(undefined, request), {
    allowed: false, reason: "session_not_found"
  });
});

test("denies a session belonging to another account", () => {
  assert.deepEqual(evaluateSession(session, { ...request, accountId: otherAccountId }), {
    allowed: false, reason: "account_mismatch"
  });
});

test("denies non-active accounts even when the session is otherwise valid", () => {
  for (const accountStatus of ["pending_verification", "restricted", "suspended", "closed"] as const) {
    assert.deepEqual(evaluateSession(session, { ...request, accountStatus }), {
      allowed: false, reason: "account_inactive"
    });
  }
});

test("denies revoked sessions", () => {
  assert.deepEqual(evaluateSession({
    ...session, status: "revoked", revokedAt: "2026-01-01T00:30:00.000Z"
  }, request), { allowed: false, reason: "session_revoked" });
});

test("denies sessions with a revocation timestamp even if status is stale", () => {
  assert.deepEqual(evaluateSession({
    ...session, revokedAt: "2026-01-01T00:30:00.000Z"
  }, request), { allowed: false, reason: "session_revoked" });
});

test("denies a session before its issue time", () => {
  assert.deepEqual(evaluateSession(session, {
    ...request, now: "2025-12-31T23:59:59.999Z"
  }), { allowed: false, reason: "session_not_yet_valid" });
});

test("treats idle expiry as exclusive", () => {
  assert.deepEqual(evaluateSession(session, {
    ...request, now: session.idleExpiresAt
  }), { allowed: false, reason: "session_expired" });
});

test("treats absolute expiry as exclusive", () => {
  assert.deepEqual(evaluateSession(session, {
    ...request, now: session.absoluteExpiresAt
  }), { allowed: false, reason: "session_expired" });
});

test("denies invalid or inverted timestamps", () => {
  const invalid = [
    { ...session, issuedAt: "invalid" },
    { ...session, idleExpiresAt: "invalid" },
    { ...session, absoluteExpiresAt: "invalid" },
    { ...session, absoluteExpiresAt: session.issuedAt },
    { ...session, idleExpiresAt: session.issuedAt }
  ];
  for (const candidate of invalid) {
    assert.deepEqual(evaluateSession(candidate, request), {
      allowed: false, reason: "invalid_session_timestamps"
    });
  }
});
