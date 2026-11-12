import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function source(path: string): string {
  return readFileSync(new URL(path, import.meta.url), "utf8");
}

test("confirmation details are read from the authenticated server-side intent", () => {
  const route = source("../src/app/api/flow/payment-intents/[paymentIntentId]/confirmation/route.ts");
  assert.ok(route.includes("hasSameOrigin(request)"));
  assert.ok(route.includes("sessions.validate(token)"));
  assert.ok(route.includes("validation.account.id"));
  assert.ok(route.includes("validation.session.id"));
  assert.ok(route.includes("getConfirmation"));
  assert.doesNotMatch(route, /body\.(recipient|amount|currency|feeAmount|accountId|sessionId)/);
});

test("PIN authorization requires the reviewed immutable digest and PIN, not client payment fields", () => {
  const route = source("../src/app/api/flow/payment-intents/[paymentIntentId]/authorize-pin/route.ts");
  assert.ok(route.includes("hasSameOrigin(request)"));
  assert.ok(route.includes("sessions.validate(token)"));
  assert.ok(route.includes("confirmationDigest: body.confirmationDigest"));
  assert.ok(route.includes("pin: body.pin"));
  assert.ok(route.includes("authorizeWithPin"));
  assert.doesNotMatch(route, /body\.(recipient|amount|currency|feeAmount|accountId|sessionId|approved|authorized)/);
});

test("WebAuthn transaction authorization uses one-time challenge and exact confirmation digest", () => {
  const options = source("../src/app/api/flow/payment-intents/[paymentIntentId]/authorize-webauthn/options/route.ts");
  const verify = source("../src/app/api/flow/payment-intents/authorize-webauthn/verify/route.ts");
  assert.ok(options.includes("confirmationDigest: body.confirmationDigest"));
  assert.ok(options.includes("createWebAuthnAuthorizationOptions"));
  assert.ok(options.includes("sessions.validate(token)"));
  assert.ok(verify.includes("authorizationId: body.authorizationId"));
  assert.ok(verify.includes("response: body.response"));
  assert.ok(verify.includes("authorizeWithWebAuthn"));
  assert.ok(verify.includes("sessions.validate(token)"));
  assert.doesNotMatch(verify, /body\.(recipient|amount|currency|feeAmount|accountId|sessionId|approved|authorized)/);
});

test("authorization service binds payload digest to challenge, intent digest, method, expiry and credential counter", () => {
  const service = source("../src/lib/server/flow/flow-transaction-authorization-service-core.ts");
  assert.ok(service.includes("confirmationDigest"));
  assert.ok(service.includes("transaction_pin_authorize"));
  assert.ok(service.includes("transaction_webauthn_authorize"));
  assert.ok(service.includes("expectedChallenge"));
  assert.ok(service.includes("requireUserVerification: true"));
  assert.ok(service.includes("newSignatureCounter"));
  assert.doesNotMatch(service, /postLedger|settleFunds|debitAccount|paymentCompleted/i);
});

test("payment cancellation is account/session scoped and only a server lifecycle procedure can apply it", () => {
  const route = source("../src/app/api/flow/payment-intents/[paymentIntentId]/cancel/route.ts");
  assert.ok(route.includes("hasSameOrigin(request)"));
  assert.ok(route.includes("sessions.validate(token)"));
  assert.ok(route.includes("validation.account.id"));
  assert.ok(route.includes("validation.session.id"));
  assert.ok(route.includes("cancelPaymentIntent"));
  assert.doesNotMatch(route, /body\.(recipient|amount|currency|feeAmount|accountId|sessionId|approved|authorized)/);
});
