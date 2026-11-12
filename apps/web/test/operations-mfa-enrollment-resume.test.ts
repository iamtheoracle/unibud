import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/mfa/enrollment/resume/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0029_operations_mfa_pending_enrollment_resume.sql", import.meta.url), "utf8");

test("pending enrollment resume requires same-origin, validated session and current password", () => {
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /verifyCredentialsForAccount\(/);
  assert.match(route, /accountId: validation\.account\.id/);
  assert.match(route, /sessionId: validation\.session\.id/);
  assert.match(route, /purpose: "password_reauth"/);
  assert.match(route, /matchedTotpStep: null/);
  assert.match(route, /unibud_operator_mfa_read_pending_secret/);
  assert.match(route, /decryptSecret\(validation\.account\.id/);
  assert.match(route, /Cache-Control.*no-store/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId)/);
});

test("database resume consumes a signed one-time password assertion and returns pending secrets only", () => {
  assert.match(migration, /current_account_id\(\)/);
  assert.match(migration, /current_session_id\(\)/);
  assert.match(migration, /:password_reauth:/);
  assert.match(migration, /state='pending'/);
  assert.match(migration, /enrollment_expires_at>statement_timestamp\(\)/);
  assert.match(migration, /INSERT INTO public\.unibud_operator_mfa_assertion_nonces/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.unibud_operator_mfa_read_pending_secret/);
});
