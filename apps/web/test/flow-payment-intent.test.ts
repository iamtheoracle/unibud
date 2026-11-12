import test from "node:test";
import assert from "node:assert/strict";
import { FlowDataProtection } from "../src/lib/server/flow/flow-crypto.ts";

const ACCOUNT = "f0500000-0000-4000-8000-000000000001";
const FLOW_ACCOUNT = "f0500000-0000-4000-8000-000000000021";

test("recipient references are encrypted with account and Flow-account binding", () => {
  const protection = new FlowDataProtection(Buffer.alloc(32, 1), Buffer.alloc(32, 2));
  const first = protection.protectRecipientReference(ACCOUNT, FLOW_ACCOUNT, "member:oracle");
  const second = protection.protectRecipientReference(ACCOUNT, FLOW_ACCOUNT, "member:oracle");
  assert.equal(first.ciphertext[0], 1);
  assert.ok(first.ciphertext.length >= 29);
  assert.notDeepEqual(first.ciphertext, second.ciphertext, "AES-GCM uses a fresh nonce");
  assert.deepEqual(first.lookupDigest, second.lookupDigest);
});

test("recipient lookup digests are scoped to account and Flow account", () => {
  const protection = new FlowDataProtection(Buffer.alloc(32, 1), Buffer.alloc(32, 2));
  const first = protection.protectRecipientReference(ACCOUNT, FLOW_ACCOUNT, "member:oracle");
  const otherAccount = protection.protectRecipientReference(
    "f0500000-0000-4000-8000-000000000002",
    FLOW_ACCOUNT,
    "member:oracle"
  );
  assert.notDeepEqual(first.lookupDigest, otherAccount.lookupDigest);
});

test("idempotency keys require exactly 32 canonical base64url bytes", () => {
  const protection = new FlowDataProtection(Buffer.alloc(32, 1), Buffer.alloc(32, 2));
  const key = Buffer.alloc(32, 7).toString("base64url");
  assert.equal(protection.digestIdempotencyKey(key).length, 32);
  assert.throws(() => protection.digestIdempotencyKey("too-short"));
  assert.throws(() => protection.digestIdempotencyKey(key + "="));
});

test("payment-intent HTTP route derives identity from a validated session and calls the database procedure", async () => {
  const { readFileSync } = await import("node:fs");
  const route = readFileSync(
    new URL("../src/app/api/flow/payment-intents/route.ts", import.meta.url),
    "utf8"
  );
  assert.match(route, /hasSameOrigin\(request\)/);
  assert.match(route, /readSessionCookie\(request\)/);
  assert.match(route, /sessions\.validate\(token\)/);
  assert.match(route, /validation\.account\.id/);
  assert.match(route, /validation\.session\.id/);
  assert.match(route, /FlowPaymentIntentRepository/);
  assert.match(route, /authorizationRequiredBeforeProcessing: true/);
  assert.doesNotMatch(route, /body\.(accountId|sessionId|status|balance|approved)/);
});
