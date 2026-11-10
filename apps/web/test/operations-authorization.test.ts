import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../../database/migrations/0020_session_derived_operations_rbac.sql", import.meta.url),
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

test("only narrow SECURITY DEFINER procedures expose operator authorization to app runtime", () => {
  assert.match(migration, /FUNCTION public\.unibud_operator_has_permission/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.unibud_operator_has_permission\(UUID,TEXT\) TO unibud_app/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.unibud_operator_record_access\(UUID,TEXT,TEXT,UUID\) TO unibud_app/);
  assert.match(migration, /BEFORE UPDATE OR DELETE ON public\.unibud_operator_audit_events/);
});

test("diagnostic route derives authority from the verified session and records decisions", () => {
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /unibud_operator_has_permission/);
  assert.match(route, /unibud_operator_record_access/);
  assert.doesNotMatch(route, /headers\.get\(["']authorization["']\)/);
  assert.match(route, /if \(!allowed\) return denied\(403\)/);
});

test("profile-level roles are not used as Operations authorization", () => {
  assert.doesNotMatch(migration, /profile_memberships/);
  assert.doesNotMatch(migration, /role\s*=\s*'operator'/);
});
