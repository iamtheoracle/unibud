import "server-only";

import type { SqlClient, SqlPool } from "../database/account-context-core";
import { DuplicateIdentityError } from "./auth-service-core";
import type {
  AuthIdentityLookup,
  AuthRepository,
  LoginMethod,
  StoredAuthSession
} from "./auth-service-core";
import type {
  NewVerificationChallenge,
  VerificationChallengeRepository,
  ChallengeVerificationResult
} from "./verification-core";

interface Row {
  account_id: string;
  identity_id: string;
  account_status: AuthIdentityLookup["accountStatus"];
  identity_status: AuthIdentityLookup["identityStatus"];
  verified_at: string | null;
  credential_hash: string | null;
  session_id?: string;
  session_status?: StoredAuthSession["status"];
  issued_at?: string;
  last_seen_at?: string | null;
  idle_expires_at?: string;
  absolute_expires_at?: string;
  revoked_at?: string | null;
  result?: ChallengeVerificationResult;
  rotated_session_id?: string;
}

export class AuthProcedureRepository implements AuthRepository, VerificationChallengeRepository {
  constructor(private readonly pool: SqlPool) {}

  private async query<RowType = Row>(sql: string, values: readonly unknown[] = []) {
    const client: SqlClient = await this.pool.connect();
    try {
      return await client.query<RowType>(sql, values);
    } finally {
      client.release();
    }
  }

  async createPendingAccount(input: {
    accountId: string;
    identityId: string;
    subject: string;
    method: LoginMethod;
    encryptedIdentifier: Uint8Array;
    identifierLookupDigest: Uint8Array;
    passwordHash: string;
  }): Promise<void> {
    try {
      await this.query(
        "SELECT * FROM public.auth_create_pending_account($1,$2,$3,$4,$5,$6,$7)",
        [input.accountId,input.identityId,input.subject,input.method,input.encryptedIdentifier,input.identifierLookupDigest,input.passwordHash]
      );
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code?: string }).code === "23505"
      ) {
        throw new DuplicateIdentityError();
      }
      throw error;
    }
  }

  async findIdentity(method: LoginMethod, identifierLookupDigest: Uint8Array) {
    const result = await this.query<Row>(
      "SELECT * FROM public.auth_lookup_identity($1,$2)",
      [method,identifierLookupDigest]
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      accountId: row.account_id,
      identityId: row.identity_id,
      accountStatus: row.account_status,
      identityStatus: row.identity_status,
      verifiedAt: row.verified_at ?? undefined,
      credentialHash: row.credential_hash ?? undefined
    } satisfies AuthIdentityLookup;
  }

  async create(challenge: NewVerificationChallenge): Promise<void> {
    await this.query(
      "SELECT public.auth_create_verification_challenge($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
      [
        challenge.id,challenge.accountId,challenge.identityId,challenge.channel,
        challenge.purpose,challenge.targetDigest,challenge.codeDigest,
        challenge.createdAt,challenge.expiresAt,challenge.maxAttempts
      ]
    );
  }

  async revoke(challengeId: string, revokedAt: string): Promise<void> {
    await this.query("SELECT public.auth_revoke_verification_challenge($1,$2)",[challengeId,revokedAt]);
  }

  async verifyAndConsume(input: {
    challengeId: string;
    codeDigest: Buffer;
    now: string;
  }): Promise<ChallengeVerificationResult> {
    const result = await this.query<{ result: ChallengeVerificationResult }>(
      "SELECT public.auth_verify_challenge($1,$2,$3) AS result",
      [input.challengeId,input.codeDigest,input.now]
    );
    return result.rows[0]?.result ?? "not_found";
  }

  async createSession(input: {
    sessionId: string;
    accountId: string;
    credentialDigest: Uint8Array;
    issuedAt: string;
    idleExpiresAt: string;
    absoluteExpiresAt: string;
  }): Promise<void> {
    await this.query(
      "SELECT public.auth_create_session($1,$2,$3,$4,$5,$6)",
      [input.sessionId,input.accountId,input.credentialDigest,input.issuedAt,input.idleExpiresAt,input.absoluteExpiresAt]
    );
  }

  async findSession(credentialDigest: Uint8Array): Promise<StoredAuthSession | undefined> {
    const result = await this.query<Row>(
      "SELECT * FROM public.auth_lookup_session($1)",
      [credentialDigest]
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      sessionId: row.session_id!,
      accountId: row.account_id,
      status: row.session_status!,
      accountStatus: row.account_status,
      issuedAt: row.issued_at!,
      lastSeenAt: row.last_seen_at ?? undefined,
      idleExpiresAt: row.idle_expires_at!,
      absoluteExpiresAt: row.absolute_expires_at!,
      revokedAt: row.revoked_at ?? undefined
    };
  }

  async touchSession(input: {
    credentialDigest: Uint8Array;
    now: string;
    idleExpiresAt: string;
  }): Promise<boolean> {
    const result = await this.query<{ touched: boolean }>(
      "SELECT public.auth_touch_session($1,$2,$3) AS touched",
      [input.credentialDigest,input.now,input.idleExpiresAt]
    );
    return result.rows[0]?.touched === true;
  }

  async revokeSession(input: {
    credentialDigest: Uint8Array;
    now: string;
    reason: string;
  }): Promise<boolean> {
    const result = await this.query<{ revoked: boolean }>(
      "SELECT public.auth_revoke_session($1,$2,$3) AS revoked",
      [input.credentialDigest,input.now,input.reason]
    );
    return result.rows[0]?.revoked === true;
  }

  async rotateSession(input: {
    oldCredentialDigest: Uint8Array;
    newSessionId: string;
    newCredentialDigest: Uint8Array;
    now: string;
    idleExpiresAt: string;
    absoluteExpiresAt: string;
  }): Promise<{ sessionId: string; accountId: string } | undefined> {
    const result = await this.query<{ session_id: string; account_id: string }>(
      "SELECT * FROM public.auth_rotate_session($1,$2,$3,$4,$5,$6)",
      [
        input.oldCredentialDigest,input.newSessionId,input.newCredentialDigest,
        input.now,input.idleExpiresAt,input.absoluteExpiresAt
      ]
    );
    const row = result.rows[0];
    return row ? { sessionId: row.session_id, accountId: row.account_id } : undefined;
  }

  async resetPassword(challengeId: string, newPasswordHash: string, now: string): Promise<boolean> {
    const result = await this.query<{ reset: boolean }>(
      "SELECT public.auth_reset_password($1,$2,$3) AS reset",
      [challengeId,newPasswordHash,now]
    );
    return result.rows[0]?.reset === true;
  }
}
