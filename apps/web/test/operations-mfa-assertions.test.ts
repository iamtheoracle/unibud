import test from "node:test";
import assert from "node:assert/strict";
import {
  createOperationsMfaAssertion,
  createOperationsMfaAssertionFromEnvironment,
  verifyOperationsMfaAssertion
} from "../src/lib/server/operations/operations-mfa-assertions.ts";

const key = Buffer.alloc(32, 0x5a);
const accountId = "10000000-0000-4000-8000-000000000001";
const sessionId = "20000000-0000-4000-8000-000000000001";
const nonce = "30000000-0000-4000-8000-000000000001";

test("assertion binds account, exact session, purpose, time, nonce and matched TOTP step", () => {
  const assertion = createOperationsMfaAssertion({
    accountId, sessionId, purpose: "step_up", matchedTotpStep: 60_000,
    issuedAt: 1_800_000_000, ttlSeconds: 60, nonce
  }, key);
  assert.equal(assertion.version, "v1");
  assert.equal(assertion.expiresAt, 1_800_000_060);
  assert.equal(assertion.signature.length, 64);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_030, {
    accountId, sessionId, purpose: "step_up"
  }), true);
});

test("assertion canonicalizes UUID text before signing", () => {
  const upperAccount = accountId.toUpperCase();
  const upperSession = sessionId.toUpperCase();
  const upperNonce = nonce.toUpperCase();
  const assertion = createOperationsMfaAssertion({
    accountId: upperAccount, sessionId: upperSession, purpose: "step_up",
    matchedTotpStep: 60_000, issuedAt: 1_800_000_000, nonce: upperNonce
  }, key);
  assert.equal(assertion.accountId, accountId);
  assert.equal(assertion.sessionId, sessionId);
  assert.equal(assertion.nonce, nonce);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_030), true);
});

test("password reauthentication assertion has a distinct purpose and no TOTP counter", () => {
  const assertion = createOperationsMfaAssertion({
    accountId, sessionId, purpose: "password_reauth", matchedTotpStep: null,
    issuedAt: 1_800_000_000, ttlSeconds: 45, nonce
  }, key);
  assert.equal(assertion.matchedTotpStep, null);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_020, {
    accountId, sessionId, purpose: "password_reauth"
  }), true);
  assert.throws(() => createOperationsMfaAssertion({
    accountId, sessionId, purpose: "password_reauth", matchedTotpStep: 1
  }, key));
});

test("assertion rejects cross-account, cross-session and wrong-purpose use", () => {
  const assertion = createOperationsMfaAssertion({
    accountId, sessionId, purpose: "step_up", matchedTotpStep: 60_000,
    issuedAt: 1_800_000_000, ttlSeconds: 60, nonce
  }, key);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_030, {
    accountId: "10000000-0000-4000-8000-000000000002"
  }), false);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_030, {
    sessionId: "20000000-0000-4000-8000-000000000002"
  }), false);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_030, {
    purpose: "enrollment_confirm"
  }), false);
});

test("assertion rejects expiry, future issue time, tampering and another key", () => {
  const assertion = createOperationsMfaAssertion({
    accountId, sessionId, purpose: "enrollment_confirm", matchedTotpStep: 60_000,
    issuedAt: 1_800_000_000, ttlSeconds: 60, nonce
  }, key);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_061), false);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_799_999_994), false);
  assert.equal(verifyOperationsMfaAssertion({ ...assertion, matchedTotpStep: 60_001 }, key, 1_800_000_030), false);
  assert.equal(verifyOperationsMfaAssertion(assertion, Buffer.alloc(32, 0x6b), 1_800_000_030), false);
});

test("assertion constructor rejects weak keys, invalid identities, steps and lifetimes", () => {
  assert.throws(() => createOperationsMfaAssertion({
    accountId, sessionId, purpose: "step_up", matchedTotpStep: 1
  }, Buffer.alloc(31)));
  assert.throws(() => createOperationsMfaAssertion({
    accountId: "bad", sessionId, purpose: "step_up", matchedTotpStep: 1
  }, key));
  assert.throws(() => createOperationsMfaAssertion({
    accountId, sessionId, purpose: "step_up", matchedTotpStep: -1
  }, key));
  assert.throws(() => createOperationsMfaAssertion({
    accountId, sessionId, purpose: "step_up", matchedTotpStep: 1, ttlSeconds: 121
  }, key));
});

test("environment signer requires its own configured secret", () => {
  const previous = process.env.UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY;
  try {
    process.env.UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY = key.toString("hex");
    const assertion = createOperationsMfaAssertionFromEnvironment({
      accountId, sessionId, purpose: "step_up", matchedTotpStep: 1,
      issuedAt: 1_800_000_000, nonce
    });
    assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_030), true);
    delete process.env.UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY;
    assert.throws(() => createOperationsMfaAssertionFromEnvironment({
      accountId, sessionId, purpose: "step_up", matchedTotpStep: 1
    }));
  } finally {
    if (previous === undefined) delete process.env.UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY;
    else process.env.UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY = previous;
  }
});


test("recovery assertion is purpose-bound and carries no TOTP step", () => {
  const assertion = createOperationsMfaAssertion({
    accountId, sessionId, purpose: "recovery", matchedTotpStep: null,
    issuedAt: 1_800_000_000, ttlSeconds: 45, nonce
  }, key);
  assert.equal(assertion.matchedTotpStep, null);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_020, {
    accountId, sessionId, purpose: "recovery"
  }), true);
  assert.equal(verifyOperationsMfaAssertion(assertion, key, 1_800_000_020, {
    purpose: "step_up"
  }), false);
  assert.throws(() => createOperationsMfaAssertion({
    accountId, sessionId, purpose: "recovery", matchedTotpStep: 1
  }, key));
});
