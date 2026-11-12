import { createHash, randomBytes } from "node:crypto";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from "@simplewebauthn/server";
import { createFlowStepUpProof } from "./flow-step-up-core";
import { FlowDataProtection, createFlowDataProtectionFromEnvironment } from "./flow-crypto";
import { FlowPinService } from "./flow-pin-service-core";
import type { FlowWebAuthnRepository } from "./flow-webauthn-repository";
import type { FlowPaymentIntentRepository, FlowAuthorizationChallenge } from "./flow-payment-intent-repository";
import { getFlowWebAuthnConfiguration } from "./flow-webauthn-service-core";

export interface FlowPaymentConfirmation {
  paymentIntentId: string;
  sourceAccount: { flowAccountId: string; label: string };
  recipient: string;
  amount: string;
  currency: string;
  feeAmount: string;
  totalAmount: string;
  purposeCode: string;
  transactionReference: string;
  status: string;
  createdAt: string;
  expiresAt?: string;
}

export type FlowTransactionAuthorizationResult =
  | { state: "authorized"; paymentIntentId: string }
  | { state: "invalid_pin" }
  | { state: "pin_locked"; lockedUntil: string | null }
  | { state: "pin_not_enrolled" }
  | { state: "authenticator_not_registered" }
  | { state: "invalid_authenticator" }
  | { state: "intent_unavailable" }
  | { state: "challenge_unavailable" }
  | { state: "unavailable" };

function toScaled(value: string): bigint {
  if (!/^\d{1,16}(?:\.\d{1,4})?$/.test(value)) {
    throw new Error("Stored Flow monetary value has an invalid numeric representation.");
  }
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole) * 10_000n + BigInt((fraction + "0000").slice(0, 4));
}

function formatScaled(value: bigint): string {
  if (value < 0n) throw new Error("Flow monetary total cannot be negative.");
  const whole = value / 10_000n;
  const fraction = String(value % 10_000n).padStart(4, "0");
  return whole.toString() + "." + fraction;
}

function authorizationPayloadDigest(
  challenge: FlowAuthorizationChallenge,
  credentialId?: Buffer,
  newSignatureCounter?: number
): Buffer {
  const canonical = [
    challenge.authorizationId,
    challenge.challengeDigest.toString("hex"),
    challenge.detailsDigest.toString("hex"),
    challenge.authMethod,
    String(Math.floor(Date.parse(challenge.expiresAt) / 1000)),
    credentialId?.toString("hex") ?? "",
    newSignatureCounter === undefined ? "" : String(newSignatureCounter)
  ].join(":");
  return createHash("sha256").update(canonical, "utf8").digest();
}

export class FlowTransactionAuthorizationService {
  private readonly payments: FlowPaymentIntentRepository;
  private readonly pins: FlowPinService;
  private readonly webAuthn: FlowWebAuthnRepository;
  private readonly protection: FlowDataProtection;
  private readonly verifyAssertion: typeof verifyAuthenticationResponse;

  constructor(input: {
    payments: FlowPaymentIntentRepository;
    pins: FlowPinService;
    webAuthn: FlowWebAuthnRepository;
    protection?: FlowDataProtection;
    verifyAssertion?: typeof verifyAuthenticationResponse;
  }) {
    this.payments = input.payments;
    this.pins = input.pins;
    this.webAuthn = input.webAuthn;
    this.protection = input.protection ?? createFlowDataProtectionFromEnvironment();
    this.verifyAssertion = input.verifyAssertion ?? verifyAuthenticationResponse;
  }

  async getConfirmation(input: {
    accountId: string;
    sessionId: string;
    paymentIntentId: string;
  }): Promise<FlowPaymentConfirmation | null> {
    const row = await this.payments.getConfirmationDetails(
      input.accountId,
      input.sessionId,
      input.paymentIntentId
    );
    if (!row) return null;
    const recipient = this.protection.unprotectRecipientReference(
      input.accountId,
      row.flowAccountId,
      row.recipientCiphertext,
      row.recipientLookupDigest
    );
    const amount = toScaled(row.amount);
    const fee = toScaled(row.feeAmount);
    return {
      paymentIntentId: row.paymentIntentId,
      sourceAccount: { flowAccountId: row.flowAccountId, label: "Flow account" },
      recipient,
      amount: formatScaled(amount),
      currency: row.currency.trim(),
      feeAmount: formatScaled(fee),
      totalAmount: formatScaled(amount + fee),
      purposeCode: row.purposeCode,
      transactionReference: row.paymentIntentId,
      status: row.status,
      createdAt: row.createdAt
    };
  }

  async authorizeWithPin(input: {
    accountId: string;
    sessionId: string;
    paymentIntentId: string;
    pin: string;
  }): Promise<FlowTransactionAuthorizationResult> {
    const details = await this.payments.getConfirmationDetails(
      input.accountId,
      input.sessionId,
      input.paymentIntentId
    );
    if (!details) return { state: "intent_unavailable" };

    const challenge = await this.createChallenge(
      input.accountId,input.sessionId,input.paymentIntentId,"transaction_pin"
    );
    if (!challenge) return { state: "challenge_unavailable" };

    const verification = await this.pins.verify({
      accountId: input.accountId,
      sessionId: input.sessionId,
      pin: input.pin
    });
    if (verification.state !== "verified") {
      await this.payments.failAuthorizationChallenge(
        input.accountId,input.sessionId,challenge.authorizationId
      );
      if (verification.state === "invalid") return { state: "invalid_pin" };
      if (verification.state === "locked") {
        return { state: "pin_locked", lockedUntil: verification.lockedUntil };
      }
      if (verification.state === "not_enrolled") return { state: "pin_not_enrolled" };
      return { state: "unavailable" };
    }

    const payloadDigest = authorizationPayloadDigest(challenge);
    const proof = createFlowStepUpProof(
      input.accountId,input.sessionId,"transaction_pin_authorize",payloadDigest
    );
    const authorized = await this.payments.authorizePaymentIntent({
      accountId: input.accountId,
      sessionId: input.sessionId,
      authorizationId: challenge.authorizationId,
      payloadDigest,
      proof
    });
    if (!authorized) {
      await this.payments.failAuthorizationChallenge(
        input.accountId,input.sessionId,challenge.authorizationId
      );
      return { state: "unavailable" };
    }
    return { state: "authorized", paymentIntentId: input.paymentIntentId };
  }

  async createWebAuthnAuthorizationOptions(input: {
    accountId: string;
    sessionId: string;
    paymentIntentId: string;
  }): Promise<{
    state: "options";
    authorizationId: string;
    options: Awaited<ReturnType<typeof generateAuthenticationOptions>>;
    confirmation: FlowPaymentConfirmation;
  } | { state: "intent_unavailable" | "authenticator_not_registered" | "challenge_unavailable" }> {
    const confirmation = await this.getConfirmation(input);
    if (!confirmation) return { state: "intent_unavailable" };
    const credentials = await this.webAuthn.listCredentials(input.accountId,input.sessionId);
    if (credentials.length === 0) return { state: "authenticator_not_registered" };
    const config = getFlowWebAuthnConfiguration();
    const options = await generateAuthenticationOptions({
      rpID: config.rpId,
      allowCredentials: credentials.map(credential => ({
        id: credential.credentialId.toString("base64url"),
        transports: credential.transports as never
      })),
      userVerification: "required",
      timeout: 60_000
    });
    const challenge = await this.createChallenge(
      input.accountId,input.sessionId,input.paymentIntentId,"webauthn",
      Buffer.from(options.challenge,"base64url")
    );
    if (!challenge) return { state: "challenge_unavailable" };
    return {
      state: "options",
      authorizationId: challenge.authorizationId,
      options,
      confirmation: { ...confirmation, expiresAt: challenge.expiresAt }
    };
  }

  async authorizeWithWebAuthn(input: {
    accountId: string;
    sessionId: string;
    authorizationId: string;
    response: unknown;
  }): Promise<FlowTransactionAuthorizationResult> {
    const challenge = await this.payments.getAuthorizationChallenge(
      input.accountId,input.sessionId,input.authorizationId
    );
    if (!challenge || challenge.authMethod !== "webauthn") {
      return { state: "challenge_unavailable" };
    }
    const responseObject = input.response as { id?: unknown; rawId?: unknown };
    const responseCredentialId = typeof responseObject?.id === "string"
      ? responseObject.id
      : typeof responseObject?.rawId === "string" ? responseObject.rawId : "";
    const credentials = await this.webAuthn.listCredentials(input.accountId,input.sessionId);
    const credential = credentials.find(item =>
      item.credentialId.toString("base64url") === responseCredentialId
    );
    if (!credential) {
      await this.payments.failAuthorizationChallenge(input.accountId,input.sessionId,input.authorizationId);
      return { state: "invalid_authenticator" };
    }

    const config = getFlowWebAuthnConfiguration();
    let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
    try {
      verification = await this.verifyAssertion({
        response: input.response as Parameters<typeof verifyAuthenticationResponse>[0]["response"],
        expectedChallenge: challenge.challenge.toString("base64url"),
        expectedOrigin: config.origin,
        expectedRPID: config.rpId,
        credential: {
          id: credential.credentialId.toString("base64url"),
          publicKey: credential.publicKeyCose,
          counter: credential.signatureCounter,
          transports: credential.transports as never
        },
        requireUserVerification: true
      });
    } catch {
      await this.payments.failAuthorizationChallenge(input.accountId,input.sessionId,input.authorizationId);
      return { state: "invalid_authenticator" };
    }

    if (!verification.verified) {
      await this.payments.failAuthorizationChallenge(input.accountId,input.sessionId,input.authorizationId);
      return { state: "invalid_authenticator" };
    }
    const newCounter = verification.authenticationInfo.newCounter;
    const payloadDigest = authorizationPayloadDigest(
      challenge,credential.credentialId,newCounter
    );
    const proof = createFlowStepUpProof(
      input.accountId,input.sessionId,"transaction_webauthn_authorize",payloadDigest
    );
    const authorized = await this.payments.authorizePaymentIntent({
      accountId: input.accountId,
      sessionId: input.sessionId,
      authorizationId: input.authorizationId,
      payloadDigest,
      proof,
      credentialId: credential.credentialId,
      newSignatureCounter: newCounter
    });
    if (!authorized) {
      await this.payments.failAuthorizationChallenge(input.accountId,input.sessionId,input.authorizationId);
      return { state: "invalid_authenticator" };
    }
    return { state: "authorized", paymentIntentId: challenge.paymentIntentId };
  }

  private async createChallenge(
    accountId: string,
    sessionId: string,
    paymentIntentId: string,
    authMethod: "transaction_pin" | "webauthn",
    challengeBytes: Buffer = randomBytes(32)
  ): Promise<FlowAuthorizationChallenge | null> {
    return this.payments.createAuthorizationChallenge(
      accountId,
      sessionId,
      paymentIntentId,
      authMethod,
      challengeBytes,
      new Date(Date.now() + 110_000)
    );
  }
}
