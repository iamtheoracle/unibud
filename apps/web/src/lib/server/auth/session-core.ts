import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export interface SessionAccount {
  id: string;
  status: "pending_verification" | "active" | "restricted" | "suspended" | "closed";
}

export interface PersistedSession {
  id: string;
  accountId: string;
  credentialDigest: Buffer;
  status: "active" | "revoked";
  issuedAt: string;
  lastSeenAt: string | null;
  idleExpiresAt: string;
  absoluteExpiresAt: string;
  revokedAt: string | null;
  rotatedFromSessionId: string | null;
  activeProfileId: string | null;
  profileContextVersion: string | null;
}

export interface SessionRepository {
  create(session: PersistedSession): Promise<void>;
  findByCredentialDigest(digest: Buffer): Promise<{ session: PersistedSession; account: SessionAccount } | null>;
  touch(credentialDigest: Buffer, lastSeenAt: string, idleExpiresAt: string): Promise<boolean>;
  revoke(credentialDigest: Buffer, revokedAt: string, reason: string): Promise<void>;
  revokeAll(accountId: string, revokedAt: string, reason: string): Promise<void>;
  /** Must atomically revoke the old session and persist its replacement. */
  rotate(oldCredentialDigest: Buffer, replacement: PersistedSession, revokedAt: string): Promise<boolean>;
}

export interface SessionPolicy {
  idleLifetimeSeconds: number;
  absoluteLifetimeSeconds: number;
  touchIntervalSeconds: number;
}

export type SessionValidation =
  | { valid: true; account: SessionAccount; session: PersistedSession }
  | { valid: false; reason: "not_found" | "revoked" | "expired" | "account_inactive" };

const DEFAULT_POLICY: SessionPolicy = {
  idleLifetimeSeconds: 60 * 60 * 24 * 7,
  absoluteLifetimeSeconds: 60 * 60 * 24 * 30,
  touchIntervalSeconds: 60 * 5
};

function digestCredential(token: string): Buffer {
  return createHash("sha256").update(token, "utf8").digest();
}

function constantTimeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}

function addSeconds(date: Date, seconds: number): string {
  return new Date(date.getTime() + seconds * 1000).toISOString();
}

function isActiveAccount(account: SessionAccount): boolean {
  return account.status === "active";
}

function validateDates(session: PersistedSession, now: Date): "revoked" | "expired" | null {
  if (session.status !== "active" || session.revokedAt !== null) return "revoked";
  const issued = Date.parse(session.issuedAt);
  const idle = Date.parse(session.idleExpiresAt);
  const absolute = Date.parse(session.absoluteExpiresAt);
  const current = now.getTime();
  if (![issued, idle, absolute, current].every(Number.isFinite) ||
      idle <= issued || absolute <= issued || idle > absolute) return "expired";
  if (current < issued || current >= idle || current >= absolute) return "expired";
  return null;
}

export class SessionService {
  private readonly repository: SessionRepository;
  private readonly policy: SessionPolicy;

  constructor(repository: SessionRepository, policy: Partial<SessionPolicy> = {}) {
    this.repository = repository;
    this.policy = { ...DEFAULT_POLICY, ...policy };
    if (
      this.policy.idleLifetimeSeconds < 60 ||
      this.policy.absoluteLifetimeSeconds < this.policy.idleLifetimeSeconds ||
      this.policy.touchIntervalSeconds < 1
    ) throw new Error("Invalid session lifetime policy.");
  }

  async issue(account: SessionAccount, now = new Date()): Promise<{ token: string; session: PersistedSession }> {
    if (!isActiveAccount(account)) throw new Error("Only active accounts may receive sessions.");
    const token = randomBytes(32).toString("base64url");
    const session: PersistedSession = {
      id: randomUUID(),
      accountId: account.id,
      credentialDigest: digestCredential(token),
      status: "active",
      issuedAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      idleExpiresAt: addSeconds(now, this.policy.idleLifetimeSeconds),
      absoluteExpiresAt: addSeconds(now, this.policy.absoluteLifetimeSeconds),
      revokedAt: null,
      rotatedFromSessionId: null,
      activeProfileId: null,
      profileContextVersion: null
    };
    await this.repository.create(session);
    return { token, session };
  }

  async validate(token: string, now = new Date()): Promise<SessionValidation> {
    if (typeof token !== "string" || token.length < 40 || token.length > 128) {
      return { valid: false, reason: "not_found" };
    }
    const digest = digestCredential(token);
    const found = await this.repository.findByCredentialDigest(digest);
    if (!found || !constantTimeEqual(found.session.credentialDigest, digest)) {
      return { valid: false, reason: "not_found" };
    }
    if (!isActiveAccount(found.account)) return { valid: false, reason: "account_inactive" };
    const invalid = validateDates(found.session, now);
    if (invalid) return { valid: false, reason: invalid };
    const lastSeen = found.session.lastSeenAt ? Date.parse(found.session.lastSeenAt) : 0;
    if (!Number.isFinite(lastSeen) || now.getTime() - lastSeen >= this.policy.touchIntervalSeconds * 1000) {
      const absolute = Date.parse(found.session.absoluteExpiresAt);
      const idleExpiry = new Date(Math.min(
        now.getTime() + this.policy.idleLifetimeSeconds * 1000,
        absolute
      )).toISOString();
      const touched = await this.repository.touch(found.session.credentialDigest, now.toISOString(), idleExpiry);
      if (!touched) return { valid: false, reason: "revoked" };
    }
    return { valid: true, account: found.account, session: found.session };
  }

  async rotate(token: string, now = new Date()): Promise<{ token: string; session: PersistedSession } | null> {
    const validation = await this.validate(token, now);
    if (!validation.valid) return null;
    const nextToken = randomBytes(32).toString("base64url");
    const old = validation.session;
    const replacement: PersistedSession = {
      id: randomUUID(),
      accountId: old.accountId,
      credentialDigest: digestCredential(nextToken),
      status: "active",
      issuedAt: now.toISOString(),
      lastSeenAt: now.toISOString(),
      idleExpiresAt: addSeconds(now, this.policy.idleLifetimeSeconds),
      absoluteExpiresAt: old.absoluteExpiresAt,
      revokedAt: null,
      rotatedFromSessionId: old.id,
      activeProfileId: old.activeProfileId,
      profileContextVersion: old.profileContextVersion
    };
    if (Date.parse(replacement.idleExpiresAt) > Date.parse(replacement.absoluteExpiresAt)) {
      replacement.idleExpiresAt = replacement.absoluteExpiresAt;
    }
    const rotated = await this.repository.rotate(old.credentialDigest, replacement, now.toISOString());
    return rotated ? { token: nextToken, session: replacement } : null;
  }

  async revoke(token: string, now = new Date(), reason = "user_logout"): Promise<boolean> {
    if (typeof token !== "string" || token.length < 40 || token.length > 128) return false;
    const found = await this.repository.findByCredentialDigest(digestCredential(token));
    if (!found || !constantTimeEqual(found.session.credentialDigest, digestCredential(token))) return false;
    if (found.session.status !== "active") return false;
    await this.repository.revoke(found.session.credentialDigest, now.toISOString(), reason);
    return true;
  }

  async revokeAll(accountId: string, now = new Date(), reason = "account_security_event"): Promise<void> {
    await this.repository.revokeAll(accountId, now.toISOString(), reason);
  }
}
