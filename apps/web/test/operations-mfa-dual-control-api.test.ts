import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const base = new URL("../src/app/api/internal/operations/mfa/requests/", import.meta.url);
const requestRoute = readFileSync(new URL("route.ts", base), "utf8");
const decisionRoute = readFileSync(new URL("[requestId]/decision/route.ts", base), "utf8");
const cancelRoute = readFileSync(new URL("[requestId]/cancel/route.ts", base), "utf8");

test("dual-control request creation validates same-origin, HTTP-only session and fresh password", () => {
  assert.match(requestRoute, /hasSameOrigin\(request\)/);
  assert.match(requestRoute, /readSessionCookie\(request\)/);
  assert.match(requestRoute, /sessions\.validate\(token\)/);
  assert.match(requestRoute, /verifyCredentialsForAccount\(/);
  assert.match(requestRoute, /purpose: "password_reauth"/);
  assert.match(requestRoute, /createSignedSessionContextFromEnvironment\(/);
  assert.match(requestRoute, /withSignedSessionTransaction\(/);
  assert.match(requestRoute, /unibud_operator_mfa_request_security_change/);
  assert.match(requestRoute, /consumeOperationsMfaApiRateLimit\(validation\.account\.id, validation\.session\.id, "request_create"\)/);
  assert.match(requestRoute, /consumeOperationsMfaApiRateLimit\(validation\.account\.id, validation\.session\.id, "request_read"\)/);
  assert.match(requestRoute, /Too many security requests/);
  assert.match(requestRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(requestRoute, /body\.(accountId|sessionId|role|permissions)/);
});

test("dual-control decisions require fresh password reauthentication and delegate authorization to the database", () => {
  assert.match(decisionRoute, /hasSameOrigin\(request\)/);
  assert.match(decisionRoute, /sessions\.validate\(token\)/);
  assert.match(decisionRoute, /verifyCredentialsForAccount\(/);
  assert.match(decisionRoute, /purpose: "password_reauth"/);
  assert.match(decisionRoute, /unibud_operator_mfa_decide_security_change/);
  assert.match(decisionRoute, /consumeOperationsMfaApiRateLimit\(validation\.account\.id, validation\.session\.id, "request_decide"\)/);
  assert.match(decisionRoute, /withSignedSessionTransaction\(/);
  assert.match(decisionRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(decisionRoute, /body\.(accountId|sessionId|role|permissions)/);
});

test("request cancellation uses the validated exact session and protected database procedure", () => {
  assert.match(cancelRoute, /hasSameOrigin\(request\)/);
  assert.match(cancelRoute, /readSessionCookie\(request\)/);
  assert.match(cancelRoute, /sessions\.validate\(token\)/);
  assert.match(cancelRoute, /createSignedSessionContextFromEnvironment\(/);
  assert.match(cancelRoute, /unibud_operator_mfa_cancel_security_change/);
  assert.match(cancelRoute, /consumeOperationsMfaApiRateLimit\(validation\.account\.id, validation\.session\.id, "request_cancel"\)/);
  assert.match(cancelRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(cancelRoute, /body\.(accountId|sessionId|role|permissions)/);
});


test("pending request list and detail reads are session-authenticated, bounded and database-permission-gated", () => {
  assert.match(requestRoute, /export async function GET\(request: NextRequest\)/);
  assert.match(requestRoute, /hasSameOrigin\(request\)/);
  assert.match(requestRoute, /readSessionCookie\(request\)/);
  assert.match(requestRoute, /sessions\.validate\(token\)/);
  assert.match(requestRoute, /createSignedSessionContextFromEnvironment\(/);
  assert.match(requestRoute, /withSignedSessionTransaction\(/);
  assert.match(requestRoute, /unibud_operator_mfa_list_security_requests/);
  assert.match(requestRoute, /limit > 100/);
  assert.match(requestRoute, /beforeCreatedAt/);
  assert.match(requestRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(requestRoute, /body\.(accountId|sessionId|role|permissions)/);
});


test("Operations review UI distinguishes requester cancellation from independent approval", () => {
  const client = readFileSync(new URL("../src/app/operations/security/mfa/operations-mfa-client.tsx", import.meta.url), "utf8");
  assert.match(client, /OperationsMfaRequestsPanel/);
  assert.match(client, /item\.requester_account_id !== viewerAccountId/);
  assert.match(client, /item\.requester_account_id === viewerAccountId/);
  assert.match(client, /Cancel my request/);
  assert.match(client, /Approve and complete/);
  assert.match(client, /Reject request/);
  assert.match(client, /cache: "no-store"/);
});
