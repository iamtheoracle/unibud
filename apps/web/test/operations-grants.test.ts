import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const grantsRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/route.ts", import.meta.url), "utf8");
const decisionRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/[requestId]/decision/route.ts", import.meta.url), "utf8");
const cancelRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/[requestId]/cancel/route.ts", import.meta.url), "utf8");
const client = readFileSync(new URL("../src/app/operations/grants/operations-grants-client.tsx", import.meta.url), "utf8");
const page = readFileSync(new URL("../src/app/operations/grants/page.tsx", import.meta.url), "utf8");
const grantNotificationsRoute = readFileSync(new URL("../src/app/api/internal/operations/grants/notifications/route.ts", import.meta.url), "utf8");
const grantNotificationsClient = readFileSync(new URL("../src/app/operations/grants/operations-grant-notifications.tsx", import.meta.url), "utf8");
const grantNotificationsMigration = readFileSync(new URL("../../../database/migrations/0047_operations_grant_notifications.sql", import.meta.url), "utf8");
const grantNotificationsTest = readFileSync(new URL("../../../database/tests/0047_operations_grant_notifications.test.sql", import.meta.url), "utf8");
const migration = readFileSync(new URL("../../../database/migrations/0043_operations_grant_dual_control.sql", import.meta.url), "utf8");
const cancellationMigration = readFileSync(new URL("../../../database/migrations/0044_operations_grant_request_cancellation.sql", import.meta.url), "utf8");
const cancellationTest = readFileSync(new URL("../../../database/tests/0044_operations_grant_request_cancellation.test.sql", import.meta.url), "utf8");
const databaseTest = readFileSync(new URL("../../../database/tests/0043_operations_grant_dual_control.test.sql", import.meta.url), "utf8");
const workflow = readFileSync(new URL("../../../.github/workflows/foundation.yml", import.meta.url), "utf8");
const webWorkflow = readFileSync(new URL("../../../.github/workflows/web.yml", import.meta.url), "utf8");
const grantE2e = readFileSync(new URL("../../../scripts/e2e/operations-grants.mjs", import.meta.url), "utf8");
const grantE2ePage = readFileSync(new URL("../src/app/e2e/operations-grants/page.tsx", import.meta.url), "utf8");
const grantConcurrencyScript = readFileSync(new URL("../../../scripts/test-operations-grant-concurrency.sh", import.meta.url), "utf8");

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
  assert.match(cancelRoute, /hasSameOrigin\(request\)/);
  assert.match(cancelRoute, /sessions\.validate\(token\)/);
  assert.match(cancelRoute, /verifyCredentialsForAccount\(/);
  assert.match(cancelRoute, /purpose: "password_reauth"/);
  assert.match(cancelRoute, /unibud_operator_cancel_grant_change/);
  assert.match(cancelRoute, /withSignedSessionTransaction\(/);
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


test("grant lifecycle notifications are transactional, account-scoped and explicitly in-app", () => {
  assert.match(grantNotificationsMigration, /AFTER INSERT OR UPDATE OF state ON public\.unibud_operator_grant_requests/);
  assert.match(grantNotificationsMigration, /request_submitted/);
  assert.match(grantNotificationsMigration, /request_approved/);
  assert.match(grantNotificationsMigration, /request_rejected/);
  assert.match(grantNotificationsMigration, /request_cancelled/);
  assert.match(grantNotificationsMigration, /request_expired/);
  assert.match(grantNotificationsMigration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(grantNotificationsMigration, /FORCE ROW LEVEL SECURITY/);
  assert.match(grantNotificationsMigration, /UNIQUE\(account_id,request_id,event_type\)/);
  assert.match(grantNotificationsMigration, /does not represent external email\/SMS delivery/i);
  assert.match(grantNotificationsTest, /Submitted request did not notify requester and target exactly once/);
  assert.match(grantNotificationsTest, /Rejected request did not notify requester, target and approver exactly once/);
  assert.match(grantNotificationsRoute, /hasSameOrigin\(request\)/);
  assert.match(grantNotificationsRoute, /sessions\.validate\(token\)/);
  assert.match(grantNotificationsRoute, /createSignedSessionContextFromEnvironment/);
  assert.match(grantNotificationsRoute, /unibud_operator_list_grant_notifications/);
  assert.match(grantNotificationsRoute, /unibud_operator_mark_grant_notification_read/);
  assert.match(grantNotificationsClient, /Grant notifications/);
  assert.match(grantNotificationsClient, /do not indicate external email or SMS delivery/);
  assert.match(client, /OperationsGrantNotifications/);
  assert.match(workflow, /database\/migrations\/0047_operations_grant_notifications\.sql/);
  assert.match(workflow, /database\/tests\/0047_operations_grant_notifications\.test\.sql/);
});


test("grant console browser E2E is isolated from production and runs in web CI", () => {
  assert.match(grantE2ePage, /process\.env\.NODE_ENV === "production"/);
  assert.match(grantE2ePage, /UNIBUD_E2E_TEST_MODE !== "true"/);
  assert.match(grantE2e, /Grant notifications/);
  assert.match(grantE2e, /Mark as read/);
  assert.match(grantE2e, /Approve/);
  assert.match(grantE2e, /Cancel my request/);
  assert.match(grantE2e, /Submit for independent approval/);
  assert.match(webWorkflow, /scripts\/e2e\/operations-grants\.mjs/);
});


test("grant lifecycle concurrency harness exercises independent sessions and all terminal races", () => {
  assert.match(grantConcurrencyScript, /run_decision "\$REQUEST_A" approve/);
  assert.match(grantConcurrencyScript, /run_decision "\$REQUEST_A" reject/);
  assert.match(grantConcurrencyScript, /run_decision "\$REQUEST_B" approve/);
  assert.match(grantConcurrencyScript, /run_cancel "\$REQUEST_B"/);
  assert.match(grantConcurrencyScript, /exact-session MFA step-up expired/);
  assert.match(grantConcurrencyScript, /maintain_operations_mfa_ephemeral_state/);
  assert.match(grantConcurrencyScript, /FOR UPDATE/);
  assert.match(grantConcurrencyScript, /SKIP LOCKED/);
  assert.match(workflow, /test-operations-grant-concurrency\.sh/);
});
