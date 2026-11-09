import {
  createHash,
  createHmac,
  randomBytes,
  randomUUID
} from "node:crypto";
import {
  evaluateSession,
  type SessionRecord
} from "../../../../../../packages/contracts/src/session.ts";
import type { AccountStatus } from "../../../../../../packages/contracts/src/identity.ts";
import {
  hashPassword,
  verifyPassword
} from "./credential-core";
import {
  VerificationChallengeService,
  type VerificationChannel,
  type VerificationPurpose
} from "./verification-core";

const SESSION_IDLE_SECONDS = 30 * 60;
const SESSION_ABSOLUTE_SECONDS = 12 * 60 * 60;
const CHALLENGE_LIFETIME_SECONDS = 5 * 60;
const DUMMY_PASSWORD_HASH =
  "scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export type LoginMethod = "email" | "phone";
export type AuthAction = "register" | "login" | "recovery";

export interface AuthIdentityLookup {
  accountId: string;
  identityId: string;
  accountStatus: AccountStatus;
  identityStatus: "active" | "disabled" | "revoked";
  verifiedAt?: string;
  credentialHash?: string;
}

export interface StoredAuthSession {
  sessionId: string;
  accountId: string;
  status: "active" | "revoked";
  accountStatus: AccountStatus;
  issuedAt: string;
  lastSeenAt?: string;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
  revokedAt?: string;
}

export interface AuthRepository {
  createPendingAccount(input: {
    accountId: string;
    identityId: string;
    subject: string;
    method: LoginMethod;
    encryptedIdentifier: Uint8Array;
    identifierLookupDigest: Uint8Array;
    passwordHash: string;
  }): Promise<void>;
  findIdentity(method: LoginMethod, identifierLookupDigest: Uint8Array): Promise<AuthIdentityLookup | undefined>;
  createSession(input: {
    sessionId: string;
    accountId: string;
    credentialDigest: Uint8Array;
    issuedAt: string;
    idleExpiresAt: string;
    absoluteExpiresAt: string;
  }): Promise<void>;
  findSession(credentialDigest: Uint8Array): Promise<StoredAuthSession | undefined>;
  touchSession(input: {
    credentialDigest: Uint8Array;
    now: string;
    idleExpiresAt: string;
  }): Promise<boolean>;
  revokeSession(input: {
    credentialDigest: Uint8Array;
    now: string;
    reason: string;
  }): Promise<boolean>;
  rotateSession(input: {
    oldCredentialDigest: Uint8Array;
    newSessionId: string;
    newCredentialDigest: Uint8Array;
    now: string;
    idleExpiresAt: string;
    absoluteExpiresAt: string;
  }): Promise<{ sessionId: string; accountId: string } | undefined>;
  resetPassword(challengeId: string, newPasswordHash: string, now: string): Promise<boolean>;
}

export interface AuthRateLimiter {
  assertAllowed(input: {
    action: AuthAction;
    method: LoginMethod;
    identifierDigest: Uint8Array;
    now: string;
  }): Promise<void>;
}

export interface ContactEncryptor {
  encrypt(input: { method: LoginMethod; normalizedIdentifier: string }): Promise<Uint8Array>;
}

export class DuplicateIdentityError extends Error {
  constructor() {
    super("Identity already exists.");
    this.name = "DuplicateIdentityError";
  }
}

export interface AuthServiceDependencies {
  repository: AuthRepository;
  challenges: VerificationChallengeService;
  rateLimiter: AuthRateLimiter;
  contactEncryptor: ContactEncryptor;
  identifierLookupKey: Uint8Array;
}

export interface RegistrationResult {
  message: string;
  challengeId: string;
  expiresAt: string;
}

export interface LoginResult {
  sessionToken: string;
  sessionId: string;
  expiresAt: string;
}

export interface VerifiedSession {
  accountId: string;
  sessionId: string;
  absoluteExpiresAt: string;
}

function normalizeIdentifier(method: LoginMethod, identifier: string): string {
  const value = identifier.trim();
  if (method === "email") {
    const normalized = value.toLowerCase();
    if (normalized.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new Error("A valid email address is required.");
    }
    return normalized;
  }
  if (!/^\+[1-9]\d{7,14}$/.test(value)) {
    throw new Error("Phone numbers must use E.164 format.");
  }
  return value;
}

export function createIdentifierLookupDigest(
  method: LoginMethod,
  normalizedIdentifier: string,
  key: Uint8Array
): Buffer {
  if (key.byteLength < 32) throw new Error("Identifier lookup key must contain at least 32 bytes.");
  return createHmac("sha256", key)
    .update(`identifier:${method}:${normalizedIdentifier}`, "utf8")
    .digest();
}

function readOpaqueSessionToken(raw: string): Buffer | undefined {
  if (!/^[A-Za-z0-9_-]{43}$/.test(raw)) return undefined;
  const bytes = Buffer.from(raw, "base64url");
  return bytes.length === 32 ? bytes : undefined;
}

function sessionDigest(rawTokenBytes: Uint8Array): Buffer {
  return createHash("sha256").update(rawTokenBytes).digest();
}

function expiry(now: Date, seconds: number): string {
  return new Date(now.getTime() + seconds * 1000).toISOString();
}

export class AuthService {
  private readonly repository: AuthRepository;
  private readonly challenges: VerificationChallengeService;
  private readonly rateLimiter: AuthRateLimiter;
  private readonly contactEncryptor: ContactEncryptor;
  private readonly identifierLookupKey: Uint8Array;

  constructor(dependencies: AuthServiceDependencies) {
    if (dependencies.identifierLookupKey.byteLength < 32) {
      throw new Error("Identifier lookup key must contain at least 32 bytes.");
    }
    this.repository = dependencies.repository;
    this.challenges = dependencies.challenges;
    this.rateLimiter = dependencies.rateLimiter;
    this.contactEncryptor = dependencies.contactEncryptor;
    this.identifierLookupKey = dependencies.identifierLookupKey;
  }

  private async lookup(method: LoginMethod, identifier: string, action: AuthAction, now: Date) {
    const normalizedIdentifier = normalizeIdentifier(method, identifier);
    const identifierDigest = createIdentifierLookupDigest(method, normalizedIdentifier, this.identifierLookupKey);
    await this.rateLimiter.assertAllowed({
      action, method, identifierDigest, now: now.toISOString()
    });
    return {
      normalizedIdentifier,
      identifierDigest,
      identity: await this.repository.findIdentity(method, identifierDigest)
    };
  }

  async register(input: {
    method: LoginMethod;
    identifier: string;
    password: string;
    now?: Date;
  }): Promise<RegistrationResult> {
    const now = input.now ?? new Date();
    const found = await this.lookup(input.method, input.identifier, "register", now);
    const expiresAt = expiry(now, CHALLENGE_LIFETIME_SECONDS);

    if (found.identity) {
      // Same response shape/message prevents direct account-existence disclosure.
      return { message: "If the address can be registered, verification instructions will be sent.", challengeId: randomUUID(), expiresAt };
    }

    const accountId = randomUUID();
    const identityId = randomUUID();
    const subject = randomUUID();
    const passwordHash = await hashPassword(input.password);
    const encryptedIdentifier = await this.contactEncryptor.encrypt({
      method: input.method,
      normalizedIdentifier: found.normalizedIdentifier
    });

    try {
      await this.repository.createPendingAccount({
        accountId, identityId, subject, method: input.method,
        encryptedIdentifier, identifierLookupDigest: found.identifierDigest, passwordHash
      });
    } catch (error) {
      if (error instanceof DuplicateIdentityError) {
        return { message: "If the address can be registered, verification instructions will be sent.", challengeId: randomUUID(), expiresAt };
      }
      throw error;
    }

    const challenge = await this.challenges.issue({
      accountId,
      identityId,
      channel: input.method as VerificationChannel,
      purpose: input.method === "email" ? "email_verification" : "phone_verification",
      destination: found.normalizedIdentifier,
      now,
      lifetimeSeconds: CHALLENGE_LIFETIME_SECONDS
    });
    return {
      message: "Verification instructions have been sent. Complete verification to activate your account.",
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt
    };
  }

  async verifyRegistration(input: { challengeId: string; code: string; now?: Date }) {
    return this.challenges.verify({
      challengeId: input.challengeId,
      purpose: "email_verification",
      code: input.code,
      now: input.now
    });
  }

  async login(input: {
    method: LoginMethod;
    identifier: string;
    password: string;
    now?: Date;
  }): Promise<LoginResult | undefined> {
    const now = input.now ?? new Date();
    const found = await this.lookup(input.method, input.identifier, "login", now);
    const identity = found.identity;
    const candidateHash = identity?.credentialHash ?? DUMMY_PASSWORD_HASH;
    const passwordMatches = await verifyPassword(input.password, candidateHash);

    if (
      !identity ||
      identity.identityStatus !== "active" ||
      identity.accountStatus !== "active" ||
      !identity.verifiedAt ||
      !identity.credentialHash ||
      !passwordMatches
    ) {
      return undefined;
    }

    const tokenBytes = randomBytes(32);
    const sessionToken = tokenBytes.toString("base64url");
    const sessionId = randomUUID();
    const absoluteExpiresAt = expiry(now, SESSION_ABSOLUTE_SECONDS);
    const idleExpiresAt = expiry(now, SESSION_IDLE_SECONDS);
    await this.repository.createSession({
      sessionId,
      accountId: identity.accountId,
      credentialDigest: sessionDigest(tokenBytes),
      issuedAt: now.toISOString(),
      idleExpiresAt,
      absoluteExpiresAt
    });
    return { sessionToken, sessionId, expiresAt: absoluteExpiresAt };
  }

  async requestPasswordRecovery(input: {
    method: LoginMethod;
    identifier: string;
    now?: Date;
  }): Promise<{ message: string; challengeId: string }> {
    const now = input.now ?? new Date();
    const found = await this.lookup(input.method, input.identifier, "recovery", now);
    if (
      !found.identity ||
      found.identity.identityStatus !== "active" ||
      found.identity.accountStatus !== "active" ||
      !found.identity.verifiedAt
    ) {
      return {
        message: "If an eligible account exists, recovery instructions will be sent.",
        challengeId: randomUUID()
      };
    }

    const challenge = await this.challenges.issue({
      accountId: found.identity.accountId,
      identityId: found.identity.identityId,
      channel: input.method as VerificationChannel,
      purpose: "password_reset",
      destination: found.normalizedIdentifier,
      now,
      lifetimeSeconds: CHALLENGE_LIFETIME_SECONDS
    });
    return {
      message: "If an eligible account exists, recovery instructions will be sent.",
      challengeId: challenge.challengeId
    };
  }

  async completePasswordRecovery(input: {
    challengeId: string;
    code: string;
    newPassword: string;
    now?: Date;
  }): Promise<boolean> {
    const now = input.now ?? new Date();
    const result = await this.challenges.verify({
      challengeId: input.challengeId,
      purpose: "password_reset",
      code: input.code,
      now
    });
    if (result !== "verified") return false;
    const passwordHash = await hashPassword(input.newPassword);
    return this.repository.resetPassword(input.challengeId, passwordHash, now.toISOString());
  }

  async validateSession(rawToken: string, now = new Date()): Promise<VerifiedSession | undefined> {
    const tokenBytes = readOpaqueSessionToken(rawToken);
    if (!tokenBytes) return undefined;
    const digest = sessionDigest(tokenBytes);
    const stored = await this.repository.findSession(digest);
    if (!stored) return undefined;

    const session: SessionRecord = {
      id: stored.sessionId as SessionRecord["id"],
      accountId: stored.accountId as SessionRecord["accountId"],
      status: stored.status,
      issuedAt: stored.issuedAt,
      idleExpiresAt: stored.idleExpiresAt,
      absoluteExpiresAt: stored.absoluteExpiresAt,
      revokedAt: stored.revokedAt,
      credentialReference: stored.sessionId
    };
    const decision = evaluateSession(session, {
      accountId: stored.accountId as SessionRecord["accountId"],
      now: now.toISOString(),
      accountStatus: stored.accountStatus
    });
    if (!decision.allowed) return undefined;

    const nextIdleExpiry = new Date(Math.min(
      now.getTime() + SESSION_IDLE_SECONDS * 1000,
      Date.parse(stored.absoluteExpiresAt)
    )).toISOString();
    const touched = await this.repository.touchSession({
      credentialDigest: digest,
      now: now.toISOString(),
      idleExpiresAt: nextIdleExpiry
    });
    if (!touched) return undefined;

    return {
      accountId: stored.accountId,
      sessionId: stored.sessionId,
      absoluteExpiresAt: stored.absoluteExpiresAt
    };
  }

  async logout(rawToken: string, now = new Date()): Promise<boolean> {
    const tokenBytes = readOpaqueSessionToken(rawToken);
    if (!tokenBytes) return false;
    return this.repository.revokeSession({
      credentialDigest: sessionDigest(tokenBytes),
      now: now.toISOString(),
      reason: "user_logout"
    });
  }

  async rotateSession(rawToken: string, now = new Date()): Promise<LoginResult | undefined> {
    const tokenBytes = readOpaqueSessionToken(rawToken);
    if (!tokenBytes) return undefined;
    const oldDigest = sessionDigest(tokenBytes);
    const stored = await this.repository.findSession(oldDigest);
    if (!stored) return undefined;

    const session: SessionRecord = {
      id: stored.sessionId as SessionRecord["id"],
      accountId: stored.accountId as SessionRecord["accountId"],
      status: stored.status,
      issuedAt: stored.issuedAt,
      idleExpiresAt: stored.idleExpiresAt,
      absoluteExpiresAt: stored.absoluteExpiresAt,
      revokedAt: stored.revokedAt,
      credentialReference: stored.sessionId
    };
    const decision = evaluateSession(session, {
      accountId: stored.accountId as SessionRecord["accountId"],
      now: now.toISOString(),
      accountStatus: stored.accountStatus
    });
    if (!decision.allowed) return undefined;

    const nextBytes = randomBytes(32);
    const nextToken = nextBytes.toString("base64url");
    const nextId = randomUUID();
    const nextIdle = new Date(Math.min(
      now.getTime() + SESSION_IDLE_SECONDS * 1000,
      Date.parse(stored.absoluteExpiresAt)
    )).toISOString();
    const rotated = await this.repository.rotateSession({
      oldCredentialDigest: oldDigest,
      newSessionId: nextId,
      newCredentialDigest: sessionDigest(nextBytes),
      now: now.toISOString(),
      idleExpiresAt: nextIdle,
      absoluteExpiresAt: stored.absoluteExpiresAt
    });
    if (!rotated) return undefined;
    return { sessionToken: nextToken, sessionId: rotated.sessionId, expiresAt: stored.absoluteExpiresAt };
  }
}
