import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/mfa/challenge/route.ts", import.meta.url), "utf8");
const stepUpMigration = readFileSync(new URL("../../../database/migrations/0024_operations_mfa_session_step_up.sql", import.meta.url), "utf8");

test("MFA challenge is same-origin and uses the validated persisted session", () => {
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /validation\.account\.id/);
  assert.match(route, /validation\.session\.id/);
  assert.match(route, /createSignedSessionContextFromEnvironment\(/);
  assert.match(route, /withSignedSessionTransaction\(/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId|totpStep|expiresAt)/);
});

test("challenge verifies TOTP server-side and consumes a signed single-use step-up assertion", () => {
  assert.match(route, /unibud_operator_mfa_read_encrypted_secret/);
  assert.match(route, /decryptSecret\(validation\.account\.id/);
  assert.match(route, /verifyTotpCode\(secret, body\.code, Date\.now\(\)\)/);
  assert.match(route, /unibud_operator_mfa_record_failed_attempt/);
  assert.match(route, /purpose: "step_up"/);
  assert.match(route, /unibud_operator_mfa_consume_step_up/);
  assert.match(route, /expiresInSeconds: 300/);
  assert.match(route, /Cache-Control.*no-store/);
});

test("database step-up requires active unlocked credential and exact live session", () => {
  assert.match(stepUpMigration, /current_session_id\(\)/);
  assert.match(stepUpMigration, /state = 'active'/);
  assert.match(stepUpMigration, /last_accepted_totp_step < p_matched_totp_step/);
  assert.match(stepUpMigration, /INSERT INTO public\.unibud_operator_mfa_assertion_nonces/);
  assert.match(stepUpMigration, /INSERT INTO public\.unibud_operator_mfa_step_up_sessions/);
  assert.match(stepUpMigration, /interval '5 minutes'/);
  assert.match(stepUpMigration, /REVOKE ALL ON FUNCTION public\.unibud_operator_mfa_consume_step_up/);
});
