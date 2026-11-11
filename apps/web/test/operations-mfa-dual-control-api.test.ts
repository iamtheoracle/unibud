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
  assert.match(requestRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(requestRoute, /body\.(accountId|sessionId|role|permissions)/);
});

test("dual-control decisions require fresh password reauthentication and delegate authorization to the database", () => {
  assert.match(decisionRoute, /hasSameOrigin\(request\)/);
  assert.match(decisionRoute, /sessions\.validate\(token\)/);
  assert.match(decisionRoute, /verifyCredentialsForAccount\(/);
  assert.match(decisionRoute, /purpose: "password_reauth"/);
  assert.match(decisionRoute, /unibud_operator_mfa_decide_security_change/);
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
  assert.match(cancelRoute, /Cache-Control.*no-store/);
  assert.doesNotMatch(cancelRoute, /body\.(accountId|sessionId|role|permissions)/);
});
