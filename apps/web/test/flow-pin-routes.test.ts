import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("PIN enrollment and verification derive account/session only from validated server session", () => {
  const enroll = source("../src/app/api/flow/transaction-pin/enroll/route.ts");
  const verify = source("../src/app/api/flow/transaction-pin/verify/route.ts");
  for (const route of [enroll, verify]) {
    assert.ok(route.includes("hasSameOrigin(request)"));
    assert.ok(route.includes("readSessionCookie(request)"));
    assert.ok(route.includes("sessions.validate(token)"));
    assert.ok(route.includes("validation.account.id"));
    assert.ok(route.includes("validation.session.id"));
    assert.doesNotMatch(route, /body\.(accountId|sessionId|role|approved|authorized)/);
  }
  assert.ok(enroll.includes("authentication.verifyCredentialsForAccount"));
  assert.ok(enroll.includes("if (!reauthenticated)"));
  assert.ok(verify.includes("not a reusable payment-authorization proof"));
  assert.doesNotMatch(verify, /flow_create_payment_intent|flow_post|settle|transfer/i);
});

test("PIN recovery requires password reauthentication for the exact active account", () => {
  const route = source("../src/app/api/flow/transaction-pin/recover/route.ts");
  assert.ok(route.includes("sessions.validate(token)"));
  assert.ok(route.includes("authentication.verifyCredentialsForAccount"));
  assert.ok(route.includes("accountId: validation.account.id"));
  assert.ok(route.includes("if (!reauthenticated)"));
  assert.ok(route.includes("createPinService().recover"));
  assert.doesNotMatch(route, /body\.(accountId|sessionId|role|approved|authorized)/);
});

test("PIN service uses Argon2id and does not issue a reusable authorization token", () => {
  const wrapper = source("../src/lib/server/flow/flow-pin-service.ts");
  const service = source("../src/lib/server/flow/flow-pin-service-core.ts");
  assert.ok(wrapper.includes('import "server-only"'));
  assert.ok(service.includes("argon2id"));
  assert.ok(service.includes("memoryCost: 65_536"));
  assert.ok(service.includes("timeCost: 3"));
  assert.ok(service.includes("recordSuccess"));
  assert.ok(service.includes("recordFailure"));
  assert.doesNotMatch(service, /authorizationToken|approvalToken|paymentApproved/i);
});
