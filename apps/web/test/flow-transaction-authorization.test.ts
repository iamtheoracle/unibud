import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { FlowTransactionAuthorizationService } from "../src/lib/server/flow/flow-transaction-authorization-service-core.ts";
import { FlowDataProtection } from "../src/lib/server/flow/flow-crypto.ts";
import type { FlowPaymentIntentRepository } from "../src/lib/server/flow/flow-payment-intent-repository.ts";
import type { FlowPinService } from "../src/lib/server/flow/flow-pin-service-core.ts";
import type { FlowWebAuthnRepository } from "../src/lib/server/flow/flow-webauthn-repository.ts";
import type { verifyAuthenticationResponse } from "@simplewebauthn/server";

process.env.UNIBUD_WEBAUTHN_RP_ID = "example.test";
process.env.UNIBUD_WEBAUTHN_ORIGIN = "https://example.test";
process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY = Buffer.alloc(32, 12).toString("hex");

const ACCOUNT = "f0540000-0000-4000-8000-000000000001";
const SESSION = "f0540000-0000-4000-8000-000000000011";
const INTENT = "f0540000-0000-4000-8000-000000000101";
const AUTHORIZATION = "f0540000-0000-4000-8000-000000000111";
const FLOW_ACCOUNT = "f0540000-0000-4000-8000-000000000021";

class MemoryPayments {
  details: any;
  challenge: any = null;
  authorizationInput: any = null;
  failed = false;
  authorizeResult = true;

  async getConfirmationDetails() { return this.details; }
  async createAuthorizationChallenge(_account: string, _session: string, intent: string, method: "transaction_pin" | "webauthn", challenge: Buffer, expiresAt: Date) {
    this.challenge = {
      authorizationId: AUTHORIZATION,
      paymentIntentId: intent,
      challenge,
      challengeDigest: createHash("sha256").update(challenge).digest(),
      detailsDigest: this.details.detailsDigest,
      authMethod: method,
      expiresAt: expiresAt.toISOString()
    };
    return this.challenge;
  }
  async getAuthorizationChallenge() { return this.challenge; }
  async failAuthorizationChallenge() { this.failed = true; return true; }
  async authorizePaymentIntent(input: any) { this.authorizationInput = input; return this.authorizeResult; }
}

class MemoryWebAuthn {
  credentials = [{
    credentialId: Buffer.from("passkey-credential"),
    publicKeyCose: Buffer.from([1, 2, 3, 4]),
    signatureCounter: 1,
    transports: ["internal"]
  }];
  async listCredentials() { return this.credentials; }
}

function createService(pinState: any = { state: "verified" }, verifyAssertion?: typeof verifyAuthenticationResponse) {
  const protection = new FlowDataProtection(Buffer.alloc(32, 1), Buffer.alloc(32, 2));
  const protectedReference = protection.protectRecipientReference(ACCOUNT, FLOW_ACCOUNT, "member:recipient");
  const payments = new MemoryPayments();
  payments.details = {
    paymentIntentId: INTENT,
    flowAccountId: FLOW_ACCOUNT,
    amount: "125.5000",
    currency: "NGN",
    feeAmount: "2.0000",
    purposeCode: "member_transfer",
    recipientCiphertext: protectedReference.ciphertext,
    recipientLookupDigest: protectedReference.lookupDigest,
    detailsDigest: Buffer.alloc(32, 7),
    status: "created",
    createdAt: new Date().toISOString()
  };
  const pins = { verify: async () => pinState } as unknown as FlowPinService;
  const webAuthn = new MemoryWebAuthn();
  const service = new FlowTransactionAuthorizationService({
    payments: payments as unknown as FlowPaymentIntentRepository,
    pins,
    webAuthn: webAuthn as unknown as FlowWebAuthnRepository,
    protection,
    verifyAssertion
  });
  return { service, payments, webAuthn };
}

test("confirmation details decrypt recipient and calculate exact decimal total", async () => {
  const { service } = createService();
  const confirmation = await service.getConfirmation({ accountId: ACCOUNT, sessionId: SESSION, paymentIntentId: INTENT });
  assert.equal(confirmation?.recipient, "member:recipient");
  assert.equal(confirmation?.amount, "125.5000");
  assert.equal(confirmation?.feeAmount, "2.0000");
  assert.equal(confirmation?.totalAmount, "127.5000");
  assert.equal(confirmation?.sourceAccount.flowAccountId, FLOW_ACCOUNT);
  assert.equal(confirmation?.transactionReference, INTENT);
  assert.equal(confirmation?.confirmationDigest, Buffer.alloc(32, 7).toString("hex"));
});

test("PIN authorization rejects a stale confirmation digest before challenge creation", async () => {
  const { service, payments } = createService();
  const result = await service.authorizeWithPin({
    accountId: ACCOUNT, sessionId: SESSION, paymentIntentId: INTENT,
    confirmationDigest: "00".repeat(32), pin: "246810"
  });
  assert.deepEqual(result, { state: "details_changed" });
  assert.equal(payments.challenge, null);
  assert.equal(payments.authorizationInput, null);
});

test("PIN authorization consumes a one-time proof bound to the exact intent challenge", async () => {
  const { service, payments } = createService();
  const digest = Buffer.alloc(32, 7).toString("hex");
  const result = await service.authorizeWithPin({
    accountId: ACCOUNT, sessionId: SESSION, paymentIntentId: INTENT,
    confirmationDigest: digest, pin: "246810"
  });
  assert.deepEqual(result, { state: "authorized", paymentIntentId: INTENT });
  assert.ok(payments.challenge);
  assert.ok(payments.authorizationInput);
  const challenge = payments.challenge;
  const payloadCanonical = [
    AUTHORIZATION, challenge.challengeDigest.toString("hex"), challenge.detailsDigest.toString("hex"),
    "transaction_pin", String(Math.floor(Date.parse(challenge.expiresAt) / 1000)), "", ""
  ].join(":");
  const payloadDigest = createHash("sha256").update(payloadCanonical, "utf8").digest();
  assert.deepEqual(payments.authorizationInput.payloadDigest, payloadDigest);
  const proof = payments.authorizationInput.proof;
  const message = [
    "flow-step-up:v1", ACCOUNT, SESSION, "transaction_pin_authorize",
    payloadDigest.toString("hex"), String(proof.expiresEpoch), proof.nonce
  ].join(":");
  const signature = createHmac("sha256", Buffer.from(process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY!, "hex"))
    .update(message, "utf8").digest("hex");
  assert.equal(proof.signature, signature);
});

test("WebAuthn transaction authorization verifies RP, challenge, user verification and credential counter", async () => {
  const verificationInputs: Record<string, unknown>[] = [];
  const fakeVerify = async (input: Record<string, unknown>) => {
    verificationInputs.push(input);
    return { verified: true, authenticationInfo: { newCounter: 2 } };
  };
  const { service, payments } = createService(
    { state: "verified" },
    fakeVerify as unknown as typeof verifyAuthenticationResponse
  );
  const digest = Buffer.alloc(32, 7).toString("hex");
  const options = await service.createWebAuthnAuthorizationOptions({
    accountId: ACCOUNT, sessionId: SESSION, paymentIntentId: INTENT, confirmationDigest: digest
  });
  assert.equal(options.state, "options");
  if (options.state !== "options") return;
  assert.equal(options.confirmation.recipient, "member:recipient");
  assert.equal(options.confirmation.expiresAt, payments.challenge.expiresAt);

  const result = await service.authorizeWithWebAuthn({
    accountId: ACCOUNT, sessionId: SESSION, authorizationId: options.authorizationId,
    response: { id: payments.challenge ? Buffer.from("passkey-credential").toString("base64url") : "" }
  });
  assert.deepEqual(result, { state: "authorized", paymentIntentId: INTENT });
  assert.equal(verificationInputs[0]?.expectedChallenge, payments.challenge.challenge.toString("base64url"));
  assert.equal(verificationInputs[0]?.expectedOrigin, "https://example.test");
  assert.equal(verificationInputs[0]?.expectedRPID, "example.test");
  assert.equal(verificationInputs[0]?.requireUserVerification, true);
  assert.equal((verificationInputs[0]?.credential as { counter: number }).counter, 1);
  assert.equal(payments.authorizationInput.newSignatureCounter, 2);
});
