import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/mfa/status/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0028_operations_mfa_status.sql", import.meta.url), "utf8");

test("MFA status endpoint validates the current HTTP-only session and uses signed database context", () => {
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /validation\.account\.id/);
  assert.match(route, /validation\.session\.id/);
  assert.match(route, /createSignedSessionContextFromEnvironment\(/);
  assert.match(route, /withSignedSessionTransaction\(/);
  assert.match(route, /unibud_operator_mfa_get_status/);
  assert.match(route, /Cache-Control.*no-store/);
});

test("database status reports only own account and exact-session assurance", () => {
  assert.match(migration, /current_account_id\(\)/);
  assert.match(migration, /current_session_id\(\)/);
  assert.match(migration, /g\.account_id=v_account/);
  assert.match(migration, /step_up\.session_id=v_session/);
  assert.match(migration, /'credentialState'/);
  assert.match(migration, /'stepUpExpiresAt'/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.unibud_operator_mfa_get_status/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.unibud_operator_mfa_get_status\(\) TO unibud_app/);
});
