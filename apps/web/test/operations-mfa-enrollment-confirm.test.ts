import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/mfa/enrollment/confirm/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0026_operations_mfa_enrollment_confirmation.sql", import.meta.url), "utf8");

test("enrollment confirmation is same-origin and bound to the validated HTTP-only session", () => {
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /validation\.account\.id/);
  assert.match(route, /validation\.session\.id/);
  assert.match(route, /createSignedSessionContextFromEnvironment\(/);
  assert.match(route, /withSignedSessionTransaction\(/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId|totpStep|expiresAt)/);
});

test("only server-verified TOTP can activate enrollment and reveal recovery codes once", () => {
  assert.match(route, /unibud_operator_mfa_read_encrypted_secret/);
  assert.match(route, /decryptSecret\(validation\.account\.id/);
  assert.match(route, /verifyTotpCode\(secret, body\.code, Date\.now\(\)\)/);
  assert.match(route, /unibud_operator_mfa_record_failed_attempt/);
  assert.match(route, /purpose: "enrollment_confirm"/);
  assert.match(route, /unibud_operator_mfa_confirm_enrollment/);
  assert.match(route, /generateRecoveryCodes\(10\)/);
  assert.match(route, /digestRecoveryCode\(validation\.account\.id, code\)/);
  assert.match(route, /recoveryCodesShownOnce: true/);
  assert.match(route, /Cache-Control.*no-store/);
  assert.match(route, /Pragma: "no-cache"/);
});

test("database activation verifies exact-session assertion and atomically stores unique recovery digests", () => {
  assert.match(migration, /current_account_id\(\)/);
  assert.match(migration, /current_session_id\(\)/);
  assert.match(migration, /:enrollment_confirm:/);
  assert.match(migration, /p_recovery_digests/);
  assert.match(migration, /count\(DISTINCT value\)/);
  assert.match(migration, /last_accepted_totp_step = p_matched_totp_step/);
  assert.match(migration, /INSERT INTO public\.unibud_operator_mfa_assertion_nonces/);
  assert.match(migration, /INSERT INTO public\.unibud_operator_mfa_recovery_codes/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.unibud_operator_mfa_confirm_enrollment/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.unibud_operator_mfa_confirm_enrollment/);
});

test("MFA lockout applies to pending and active credentials and cannot be cleared by re-enrollment", () => {
  assert.match(migration, /failed_attempt_count = LEAST\(failed_attempt_count \+ 1, 10\)/);
  assert.match(migration, /interval '15 minutes'/);
  assert.match(migration, /locked_until IS NULL OR locked_until <= statement_timestamp\(\)/);
  assert.match(migration, /prevent_mfa_lockout_reset/);
  assert.match(migration, /CREATE TRIGGER unibud_operator_mfa_lockout_reset_guard/);
});
