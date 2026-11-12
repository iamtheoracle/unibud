import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/mfa/recovery/redeem/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0027_operations_mfa_recovery_and_audit.sql", import.meta.url), "utf8");

test("recovery redemption is same-origin and tied to the validated account/session", () => {
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /validation\.account\.id/);
  assert.match(route, /validation\.session\.id/);
  assert.match(route, /createSignedSessionContextFromEnvironment\(/);
  assert.match(route, /purpose: "recovery"/);
  assert.match(route, /matchedTotpStep: null/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId|totpStep)/);
});

test("recovery code is keyed-digested server-side and redeemed once by PostgreSQL", () => {
  assert.match(route, /digestRecoveryCodeCandidates\\(validation\\.account\\.id, body\\.code\\)/);\n  assert.match(route, /unibud_operator_mfa_redeem_recovery_code_candidates/);
  assert.match(route, /unibud_operator_mfa_redeem_recovery_code_candidates/);
  assert.match(route, /unibud_operator_mfa_record_failed_attempt/);
  assert.match(route, /Cache-Control.*no-store/);
  assert.match(migration, /UPDATE public\.unibud_operator_mfa_recovery_codes/);
  assert.match(migration, /redeemed_at IS NULL/);
  assert.match(migration, /purpose,expires_at/);
  assert.match(migration, /:recovery:/);
});

test("successful recovery removes all step-ups and the old credential without granting access", () => {
  assert.match(migration, /DELETE FROM public\.unibud_operator_mfa_step_up_sessions WHERE account_id=v_account/);
  assert.match(migration, /DELETE FROM public\.unibud_operator_mfa_credentials WHERE account_id=v_account/);
  assert.match(route, /state: "authenticator_reset"/);
  assert.match(route, /next: "password_reauthenticated_enrollment"/);
  assert.doesNotMatch(route, /step_up|expiresInSeconds/);
});

test("MFA audit events are protected from application roles", () => {
  assert.match(migration, /CREATE TABLE public\.unibud_operator_mfa_events/);
  assert.match(migration, /REVOKE ALL ON public\.unibud_operator_mfa_events/);
  assert.match(migration, /CREATE TRIGGER unibud_operator_mfa_credential_audit/);
  assert.match(migration, /recovery_code_redeemed/);
});
