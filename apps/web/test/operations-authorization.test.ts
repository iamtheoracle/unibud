import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../../../database/migrations/0020_session_derived_operations_rbac.sql", import.meta.url),
  "utf8"
);
const remediation = readFileSync(
  new URL("../../../database/migrations/0021_non_forgeable_operations_actor.sql", import.meta.url),
  "utf8"
);
const route = readFileSync(
  new URL("../src/app/api/internal/integrations/verification-delivery/status/route.ts", import.meta.url),
  "utf8"
);

test("Operations grants are global, narrow, expiring and revocable", () => {
  assert.match(migration, /operator_role IN \([\s\S]*'platform_admin'[\s\S]*'integration_operator'/);
  assert.match(migration, /expires_at TIMESTAMPTZ/);
  assert.match(migration, /revoked_at TIMESTAMPTZ/);
  assert.match(migration, /permissions <@ ARRAY/);
  assert.match(migration, /REVOKE ALL ON public\.unibud_operator_grants[\s\S]*FROM PUBLIC, unibud_app/);
});

test("the remediation removes caller-selected actor parameters", () => {
  assert.match(remediation, /DROP FUNCTION public\.unibud_operator_has_permission\(UUID,TEXT\)/);
  assert.match(remediation, /DROP FUNCTION public\.unibud_operator_record_access\(UUID,TEXT,TEXT,UUID\)/);
  assert.match(remediation, /unibud_private\.current_account_id\(\)/);
  assert.match(remediation, /CREATE FUNCTION public\.unibud_operator_has_permission\(\s*p_permission TEXT/s);
  assert.match(remediation, /CREATE FUNCTION public\.unibud_operator_record_access\(\s*p_permission TEXT,\s*p_outcome TEXT,\s*p_request_id UUID/s);
  assert.doesNotMatch(remediation, /p_actor_account_id UUID|p_account_id UUID/);
});

test("diagnostic route validates session then binds a signed database transaction", () => {
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /createSignedAccountContextFromEnvironment\(validation\.account\.id\)/);
  assert.match(route, /withSignedAccountTransaction\(/);
  assert.match(route, /unibud_operator_has_permission\(\$1\)/);
  assert.match(route, /unibud_operator_record_access\(\$1, \$2, \$3\)/);
  assert.doesNotMatch(route, /unibud_operator_has_permission\(\$1, \$2\)/);
  assert.doesNotMatch(route, /unibud_operator_record_access\(\$1, \$2, \$3, \$4\)/);
  assert.doesNotMatch(route, /headers\.get\(["']authorization["']\)/);
  assert.match(route, /if \(!allowed\) return denied\(403\)/);
});

test("unauthenticated audit records cannot claim an account identity", () => {
  assert.match(remediation, /v_actor := unibud_private\.current_account_id\(\)/);
  assert.match(remediation, /v_actor IS NULL AND p_outcome <> 'unauthenticated'/);
  assert.match(remediation, /v_actor IS NOT NULL AND p_outcome = 'unauthenticated'/);
  assert.match(route, /recordUnauthenticated\(requestId\)/);
  assert.match(route, /recordAuthenticatedError\(authenticatedAccountId, requestId\)/);
  assert.match(route, /\[REQUIRED_PERMISSION, "error", requestId\]/);
});

test("profile-level roles are not used as Operations authorization", () => {
  assert.doesNotMatch(migration, /profile_memberships/);
  assert.doesNotMatch(migration, /role\s*=\s*'operator'/);
});
