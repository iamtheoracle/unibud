import { createHmac, randomInt, randomUUID } from "node:crypto";

export type VerificationChannel = "email" | "phone";
export type VerificationDeliveryMethod = "email" | "sms" | "whatsapp" | "rcs";
export type VerificationPurpose = "email_verification" | "phone_verification" | "password_reset";
export type ChallengeVerificationResult =
  | "verified"
  | "invalid"
  | "expired"
  | "locked"
  | "consumed"
  | "not_found";

export interface NewVerificationChallenge {
  id: string;
  accountId: string;
  identityId: string;
  channel: VerificationChannel;
  deliveryMethod?: VerificationDeliveryMethod;
  purpose: VerificationPurpose;
  targetDigest: Buffer;
  codeDigest: Buffer;
  createdAt: string;
  expiresAt: string;
  maxAttempts: number;
}

export interface VerificationChallengeRepository {
  create(challenge: NewVerificationChallenge): Promise<void>;
  revoke(challengeId: string, revokedAt: string): Promise<void>;
  /**
   * Must lock the challenge row, enforce expiry/attempt limits, compare digest
   * in constant time, increment failed attempts, and consume success atomically.
   */
  verifyAndConsume(input: {
    challengeId: string;
    codeDigest: Buffer;
    now: string;
  }): Promise<ChallengeVerificationResult>;
}

export interface VerificationRateLimiter {
  assertAllowed(input: {
    accountId: string;
    channel: VerificationChannel;
    purpose: VerificationPurpose;
    targetDigest: Buffer;
    now: string;
  }): Promise<void>;
}

export interface VerificationDelivery {
  deliver(input: {
    challengeId: string;
    channel: VerificationChannel;
    deliveryMethod: VerificationDeliveryMethod;
    destination: string;
    code: string;
    purpose: VerificationPurpose;
    expiresAt: string;
  }): Promise<void>;
}

export interface IssueVerificationInput {
  challengeId?: string;
  accountId: string;
  identityId: string;
  channel: VerificationChannel;
  deliveryMethod?: VerificationDeliveryMethod;
  purpose: VerificationPurpose;
  destination: string;
  now?: Date;
  lifetimeSeconds?: number;
}

export interface IssuedVerificationChallenge {
  challengeId: string;
  expiresAt: string;
}

function normalizeDestination(channel: VerificationChannel, destination: string): string {
  const value = destination.trim();
  if (channel === "email") {
    const normalized = value.toLowerCase();
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("A valid email destination is required.");
    }
    return normalized;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(value)) {
    throw new Error("Phone destinations must use E.164 format.");
  }
  return value;
}

function keyedDigest(key: Uint8Array, domain: string, value: string): Buffer {
  return createHmac("sha256", key).update(`${domain}: ${value}`, "utf8").digest();
}

export class VerificationChallengeService {
  private readonly repository: VerificationChallengeRepository;
  private readonly limiter: VerificationRateLimiter;
  private readonly delivery: VerificationDelivery;
  private readonly digestKey: Uint8Array;

  constructor(
    repository: VerificationChallengeRepository,
    limiter: VerificationRateLimiter,
    delivery: VerificationDelivery,
    digestKey: Uint8Array
  ) {
    if (digestKey.byteLength < 32) {
      throw new Error("Verification digest key must contain at least 32 bytes.");
    }
    this.repository = repository;
    this.limiter = limiter;
    this.delivery = delivery;
    this.digestKey = digestKey;
  }

  async issue(input: IssueVerificationInput): Promise<IssuedVerificationChallenge> {
    const now = input.now ?? new Date();
    const lifetime = input.lifetimeSeconds ?? 300;
    if (!Number.isInteger(lifetime) || lifetime < 60 || lifetime > 900) {
      throw new Error("Verification challenge lifetime must be 60–900 seconds.");
    }
    if (
      (input.purpose === "email_verification" && input.channel !== "email") ||
      (input.purpose === "phone_verification" && input.channel !== "phone")
    ) {
      throw new Error("Verification purpose and delivery channel do not match.");
    }

    const destination = normalizeDestination(input.channel, input.destination);
    const deliveryMethod = input.deliveryMethod ?? (input.channel === "email" ? "email" : "sms");
    if ((input.channel === "email" && deliveryMethod !== "email") ||
        (input.channel === "phone" && !["sms", "whatsapp", "rcs"].includes(deliveryMethod))) {
      throw new Error("Verification delivery method is incompatible with the registered identity.");
    }
    const createdAt = now.toISOString();
    const expiresAt = new Date(now.getTime() + lifetime * 1000).toISOString();
    const id = input.challengeId ?? randomUUID();
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const targetDigest = keyedDigest(this.digestKey, "target", destination);
    const codeDigest = keyedDigest(this.digestKey, "challenge", `${id}:${input.purpose}:${code}`);

    await this.limiter.assertAllowed({
      accountId: input.accountId,
      channel: input.channel,
      deliveryMethod,
      purpose: input.purpose,
      targetDigest,
      now: createdAt
    });

    await this.repository.create({
      id,
      accountId: input.accountId,
      identityId: input.identityId,
      channel: input.channel,
      purpose: input.purpose,
      targetDigest,
      codeDigest,
      createdAt,
      expiresAt,
      maxAttempts: 5
    });

    try {
      await this.delivery.deliver({
        challengeId: id,
        channel: input.channel,
        deliveryMethod,
        destination,
        code,
        purpose: input.purpose,
        expiresAt
      });
    } catch (error) {
      await this.repository.revoke(id, new Date().toISOString());
      throw error;
    }

    return { challengeId: id, expiresAt };
  }

  async verify(input: {
    challengeId: string;
    purpose: VerificationPurpose;
    code: string;
    now?: Date;
  }): Promise<ChallengeVerificationResult> {
    // Bound untrusted input before hashing; malformed values still consume an attempt.
    const supplied = input.code.length <= 32 ? input.code : "invalid-code";
    const codeDigest = keyedDigest(
      this.digestKey,
      "challenge",
      `${input.challengeId}:${input.purpose}:${supplied}`
    );
    return this.repository.verifyAndConsume({
      challengeId: input.challengeId,
      codeDigest,
      now: (input.now ?? new Date()).toISOString()
    });
  }
}
