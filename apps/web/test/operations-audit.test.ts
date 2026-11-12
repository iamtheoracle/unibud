import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync(new URL("../src/app/api/internal/operations/audit/route.ts", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0042_operations_audit_search_export.sql", import.meta.url), "utf8");
const rateLimit = readFileSync(new URL("../src/lib/server/operations/operations-mfa-rate-limit.ts", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../../../.github/workflows/foundation.yml", import.meta.url), "utf8");

test("audit search requires a validated first-party session and a database-enforced MFA permission", () => {
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /createSignedSessionContextFromEnvironment\(accountId, sessionId\)/);
  assert.match(route, /consumeOperationsMfaApiRateLimit\(accountId, sessionId, "audit_read"\)/);
  assert.match(route, /unibud_operator_search_audit_events/);
  assert.match(route, /unibud_operator_record_access/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId|permissions|role)/);
});

test("audit query and export have strict server-side bounds and no-store CSV output", () => {
  assert.match(route, /90 \* 86400000/);
  assert.match(route, /format === "csv" \? 1000 : 100/);
  assert.match(route, /text\/csv; charset=utf-8/);
  assert.match(route, /Content-Disposition/);
  assert.match(route, /X-Content-Type-Options.*nosniff/);
  assert.match(route, /replace\(\/"/);
  assert.match(migration, /p_limit>1000/);
  assert.match(migration, /p_from<p_to-interval '90 days'/);
});

test("database audit read model is SECURITY DEFINER, permission-gated and app-table-isolated", () => {
  assert.match(migration, /CREATE FUNCTION public\.unibud_operator_search_audit_events/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /current_session_id\(\)/);
  assert.match(migration, /operations\.audit\.read/);
  assert.match(migration, /ORDER BY e\.occurred_at DESC,e\.id DESC/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.unibud_operator_search_audit_events[\s\S]*TO unibud_app/);
  assert.match(migration, /WHEN 'audit_read' THEN v_limit:=30; v_window:=60/);
  assert.ok(migration.includes("WHEN 'notification_read' THEN") && migration.includes("v_limit:=60; v_window:=60;"));
  assert.match(rateLimit, /"audit_read"/);
});

test("Foundation CI applies and tests migration 0042", () => {
  assert.match(workflow, /database\/migrations\/0042_operations_audit_search_export\.sql/);
  assert.match(workflow, /database\/tests\/0042_operations_audit_search_export\.test\.sql/);
});
