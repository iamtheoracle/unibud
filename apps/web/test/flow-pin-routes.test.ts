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
    assert.match(route, /hasSameOrigin\(request\)/);
    assert.match(route, /readSessionCookie\(request\)/);
    assert.match(route, /sessions\.validate\(token\)/);
    assert.match(route, /validation\.account\.id/);
    assert.match(route, /validation\.session\.id/);
    assert.doesNotMatch(route, /body\.(accountId|sessionId|role|approved|authorized)/);
  }
  assert.match(verify, /not a reusable payment-authorization proof/);
  assert.doesNotMatch(verify, /flow_create_payment_intent|flow_post|settle|transfer/i);
});

test("PIN recovery requires password reauthentication for the exact active account", () => {
  const route = source("../src/app/api/flow/transaction-pin/recover/route.ts");
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /authentication\.verifyCredentialsForAccount/);
  assert.match(route, /accountId: validation\.account\.id/);
  assert.match(route, /if \(!reauthenticated\)/);
  assert.match(route, /createPinService\(\)\.recover/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId|role|approved|authorized)/);
});

test("PIN service uses Argon2id and does not issue a reusable authorization token", () => {
  const service = source("../src/lib/server/flow/flow-pin-service.ts");
  assert.match(service, /argon2id/);
  assert.match(service, /memoryCost: 65_536/);
  assert.match(service, /timeCost: 3/);
  assert.match(service, /recordSuccess/);
  assert.match(service, /recordFailure/);
  assert.doesNotMatch(service, /authorizationToken|approvalToken|paymentApproved/i);
});
