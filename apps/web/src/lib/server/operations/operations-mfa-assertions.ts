import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX = /^(?:[0-9a-f]{2}){32,}$/i;
const VERSION = "v1";
const MAX_ASSERTION_TTL_SECONDS = 120;

export type OperationsMfaAssertionPurpose =
  | "enrollment_confirm"
  | "step_up"
  | "recovery";

export interface OperationsMfaAssertion {
  version: typeof VERSION;
  accountId: string;
  sessionId: string;
  purpose: OperationsMfaAssertionPurpose;
  issuedAt: number;
  expiresAt: number;
  nonce: string;
  matchedTotpStep: number;
  signature: string;
}

function canonicalPayload(assertion: Omit<OperationsMfaAssertion, "signature">): string {
  return [
    assertion.version,
    assertion.accountId,
    assertion.sessionId,
    assertion.purpose,
    String(assertion.issuedAt),
    String(assertion.expiresAt),
    assertion.nonce,
    String(assertion.matchedTotpStep)
  ].join(":");
}

function validKey(key: Uint8Array): boolean {
  return key.byteLength >= 32;
}

export function createOperationsMfaAssertion(
  input: {
    accountId: string;
    sessionId: string;
    purpose: OperationsMfaAssertionPurpose;
    matchedTotpStep: number;
    issuedAt?: number;
    ttlSeconds?: number;
    nonce?: string;
  },
  key: Uint8Array
): OperationsMfaAssertion {
  if (!validKey(key)) throw new Error("Operations MFA assertion key must contain at least 32 bytes.");
  if (!UUID.test(input.accountId) || !UUID.test(input.sessionId)) {
    throw new Error("Invalid Operations MFA assertion identity.");
  }
  if (!["enrollment_confirm", "step_up", "recovery"].includes(input.purpose)) {
    throw new Error("Invalid Operations MFA assertion purpose.");
  }
  const issuedAt = input.issuedAt ?? Math.floor(Date.now() / 1000);
  const ttlSeconds = input.ttlSeconds ?? 60;
  const nonce = input.nonce ?? randomUUID();
  if (!Number.isSafeInteger(issuedAt) || issuedAt < 0) throw new Error("Invalid assertion issue time.");
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > MAX_ASSERTION_TTL_SECONDS) {
    throw new Error("Operations MFA assertion lifetime must be between 1 and 120 seconds.");
  }
  if (!UUID.test(nonce)) throw new Error("Invalid Operations MFA assertion nonce.");
  if (!Number.isSafeInteger(input.matchedTotpStep) || input.matchedTotpStep < 0) {
    throw new Error("Invalid matched authenticator time step.");
  }
  const unsigned = {
    version: VERSION,
    accountId: input.accountId.toLowerCase(),
    sessionId: input.sessionId.toLowerCase(),
    purpose: input.purpose,
    issuedAt,
    expiresAt: issuedAt + ttlSeconds,
    nonce,
    matchedTotpStep: input.matchedTotpStep
  } as const;
  const signature = createHmac("sha256", key)
    .update(canonicalPayload(unsigned), "utf8")
    .digest("hex");
  return { ...unsigned, signature };
}

export function createOperationsMfaAssertionFromEnvironment(
  input: Parameters<typeof createOperationsMfaAssertion>[0]
): OperationsMfaAssertion {
  const raw = process.env.UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY?.trim() ?? "";
  if (!HEX.test(raw)) {
    throw new Error("UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY must be at least 32 random bytes encoded as hex.");
  }
  return createOperationsMfaAssertion(input, Buffer.from(raw, "hex"));
}

/** Verify signature, purpose, identity, nonce, TOTP step and a narrow time window. */
export function verifyOperationsMfaAssertion(
  assertion: OperationsMfaAssertion,
  key: Uint8Array,
  nowEpochSeconds = Math.floor(Date.now() / 1000),
  expected?: { accountId?: string; sessionId?: string; purpose?: OperationsMfaAssertionPurpose }
): boolean {
  if (!validKey(key) || !assertion || assertion.version !== VERSION) return false;
  if (!UUID.test(assertion.accountId) || !UUID.test(assertion.sessionId) || !UUID.test(assertion.nonce)) return false;
  if (!["enrollment_confirm", "step_up", "recovery"].includes(assertion.purpose)) return false;
  if (!Number.isSafeInteger(assertion.issuedAt) || !Number.isSafeInteger(assertion.expiresAt)
      || !Number.isSafeInteger(assertion.matchedTotpStep) || assertion.matchedTotpStep < 0) return false;
  if (assertion.expiresAt <= assertion.issuedAt
      || assertion.expiresAt - assertion.issuedAt > MAX_ASSERTION_TTL_SECONDS
      || assertion.issuedAt > nowEpochSeconds + 5
      || assertion.expiresAt < nowEpochSeconds) return false;
  if (expected?.accountId && assertion.accountId !== expected.accountId) return false;
  if (expected?.sessionId && assertion.sessionId !== expected.sessionId) return false;
  if (expected?.purpose && assertion.purpose !== expected.purpose) return false;
  if (!/^[0-9a-f]{64}$/.test(assertion.signature)) return false;
  const unsigned = {
    version: assertion.version,
    accountId: assertion.accountId,
    sessionId: assertion.sessionId,
    purpose: assertion.purpose,
    issuedAt: assertion.issuedAt,
    expiresAt: assertion.expiresAt,
    nonce: assertion.nonce,
    matchedTotpStep: assertion.matchedTotpStep
  };
  const expectedSignature = createHmac("sha256", key)
    .update(canonicalPayload(unsigned), "utf8")
    .digest();
  const supplied = Buffer.from(assertion.signature, "hex");
  return supplied.length === expectedSignature.length && timingSafeEqual(expectedSignature, supplied);
}
