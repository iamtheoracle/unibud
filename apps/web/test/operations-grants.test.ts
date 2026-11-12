import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const grantsRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/route.ts", import.meta.url), "utf8");
const decisionRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/[requestId]/decision/route.ts", import.meta.url), "utf8");
const cancelRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/[requestId]/cancel/route.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/app/operations/grants/operations-grants-client.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/app/operations/grants/page.tsx", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0043_operations_grant_dual_control.sql", import.meta.url), "utf8");
const cancellationMigration = readFileSync(new URL("../../../database/migrations/0044_operations_grant_request_cancellation.sql", import.meta.url), "utf8");
const cancellationTest = readFileSync(new URL("../../../database/tests/0044_operations_grant_request_cancellation.test.sql", import.meta.url), "utf8");
const databaseTest = readFileSync(new URL("../../../database/tests/0043_operations_grant_dual_control.test.sql", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../../../.github/workflows/foundation.yml", import.meta.url), "utf8");

test("grant request API uses a validated same-origin session and fresh password assertion", () => {
  assert.match(grantsRoute, /hasSameOrigin\(request\)/);
  assert.match(grantsRoute, /readSessionCookie\(request\)/);
  assert.match(grantsRoute, /sessions\.validate\(token\)/);
  assert.match(grantsRoute, /verifyCredentialsForAccount\(/);
  assert.match(grantsRoute, /purpose: "password_reauth"/);
  assert.match(grantsRoute, /createSignedSessionContextFromEnvironment\(/);
  assert.match(grantsRoute, /unibud_operator_request_grant_change/);
  assert.match(grantsRoute, /unibud_operator_list_grant_requests/);
  assert.match(grantsRoute, /unibud_operator_list_active_grants/);
  assert.match(grantsRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(grantsRoute, /body\.(accountId|sessionId|requesterAccountId|approverAccountId)/);
});

test("grant decision API delegates approval and rejection to the database", () => {
  assert.match(decisionRoute, /hasSameOrigin\(request\)/);
  assert.match(decisionRoute, /sessions\.validate\(token\)/);
  assert.match(decisionRoute, /verifyCredentialsForAccount\(/);
  assert.match(decisionRoute, /purpose: "password_reauth"/);
  assert.match(decisionRoute, /unibud_operator_decide_grant_change/);
  assert.match(decisionRoute, /withSignedSessionTransaction\(/);
  assert.match(decisionRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(decisionRoute, /UPDATE\s+public\.unibud_operator_grants/i);
});


test("grant cancellation is same-origin, reauthenticated and delegated to the database", () => {
  assert.match(cancelRoute, /hasSameOrigin\\(request\\)/);
  assert.match(cancelRoute, /sessions\\.validate\\(token\\)/);
  assert.match(cancelRoute, /verifyCredentialsForAccount\\(/);
  assert.match(cancelRoute, /purpose: "password_reauth"/);
  assert.match(cancelRoute, /unibud_operator_cancel_grant_change/);
  assert.match(cancelRoute, /withSignedSessionTransaction\\(/);
  assert.match(cancelRoute, /Cache-Control.*no-store/);
  assert.match(cancellationMigration, /requester_session_id<>v_session/);
  assert.match(cancellationMigration, /grant_cancel/);
  assert.match(cancellationTest, /SECURITY DEFINER/);
});

test("grant console is session-gated and exposes request, review, inventory and revocation workflows", () => {
  assert.match(page, /sessions\.validate\(token\)/);
  assert.match(page, /redirect\("\/login"\)/);
  assert.match(client, /Submit for independent approval/);
  assert.match(client, /Approve/);
  assert.match(client, /Reject/);
  assert.match(client, /Active operator grants/);
  assert.match(client, /Request revocation/);
  assert.match(client, /Cancel my request/);
  assert.match(client, /cache: "no-store"/);
});

test("grant database lifecycle keeps rate-limited queue reads volatile and protects rejection identity", () => {
  assert.match(migration, /CREATE FUNCTION public\.unibud_operator_list_grant_requests[\s\S]*?LANGUAGE plpgsql\s+VOLATILE/);
  assert.match(migration, /CREATE FUNCTION public\.unibud_operator_list_active_grants[\s\S]*?LANGUAGE plpgsql\s+VOLATILE/);
  assert.match(migration, /state='rejected' AND approver_account_id IS NOT NULL AND approver_session_id IS NOT NULL/);
  assert.match(migration, /operations\.grants\.request/);
  assert.match(migration, /operations\.grants\.approve/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.unibud_operator_list_active_grants/);
  assert.match(databaseTest, /Independent grant rejection failed/);
  assert.match(databaseTest, /state='rejected'/);
  assert.match(workflow, /database\/migrations\/0043_operations_grant_dual_control\.sql/);
  assert.match(workflow, /database\/tests\/0043_operations_grant_dual_control\.test\.sql/);
});
