import { createHmac, randomUUID } from "node:crypto";
import type { SignedAccountContext, SqlClient, SqlPool } from "./account-context-core.ts";
import { createSignedAccountContext } from "./account-context-core.ts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_PATTERN = /^(?:[0-9a-f]{2}){32,}$/i;
const SESSION_CONTEXT_VERSION = "v1";

export interface SignedSessionContext extends SignedAccountContext {
  sessionId: string;
  sessionSignature: string;
}

/**
 * Creates two independently verifiable claims for one transaction:
 * the existing account claim and a versioned claim binding that account to
 * one persisted session. Call only with IDs returned by SessionService.validate.
 */
export function createSignedSessionContext(
  accountId: string,
  sessionId: string,
  key: Uint8Array,
  nowEpochSeconds = Math.floor(Date.now() / 1000),
  ttlSeconds = 60,
  nonce = randomUUID()
): SignedSessionContext {
  if (!UUID_PATTERN.test(accountId) || !UUID_PATTERN.test(sessionId)) {
    throw new Error("Invalid trusted session identity.");
  }
  const accountContext = createSignedAccountContext(accountId, key, nowEpochSeconds, ttlSeconds, nonce);
  const payload = [
    SESSION_CONTEXT_VERSION,
    accountId,
    sessionId,
    accountContext.expiryEpoch,
    nonce
  ].join(":");
  const sessionSignature = createHmac("sha256", key).update(payload, "utf8").digest("hex");
  return { ...accountContext, sessionId, sessionSignature };
}

export function createSignedSessionContextFromEnvironment(
  accountId: string,
  sessionId: string,
  nowEpochSeconds?: number,
  ttlSeconds = 60
): SignedSessionContext {
  const raw = process.env.UNIBUD_DB_CONTEXT_HMAC_KEY?.trim() ?? "";
  if (!HEX_PATTERN.test(raw)) {
    throw new Error("UNIBUD_DB_CONTEXT_HMAC_KEY must be at least 32 random bytes encoded as hex.");
  }
  return createSignedSessionContext(accountId, sessionId, Buffer.from(raw, "hex"), nowEpochSeconds, ttlSeconds);
}

/**
 * Establishes account and exact-session claims in one transaction. The session
 * GUC is untrusted transport until PostgreSQL verifies session_context_signature.
 * This helper is not an authorization check by itself.
 */
export async function withSignedSessionTransaction<T>(
  pool: SqlPool,
  context: SignedSessionContext,
  work: (client: SqlClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  let transactionOpen = false;
  try {
    await client.query("BEGIN");
    transactionOpen = true;
    await client.query(
      `SELECT
        set_config('unibud.account_id', $1, true),
        set_config('unibud.context_expiry', $2, true),
        set_config('unibud.context_nonce', $3, true),
        set_config('unibud.context_signature', $4, true),
        set_config('unibud.session_id', $5, true),
        set_config('unibud.session_context_signature', $6, true)`,
      [
        context.accountId,
        context.expiryEpoch,
        context.nonce,
        context.signature,
        context.sessionId,
        context.sessionSignature
      ]
    );
    const result = await work(client);
    await client.query("COMMIT");
    transactionOpen = false;
    return result;
  } catch (error) {
    if (transactionOpen) {
      try { await client.query("ROLLBACK"); } catch { /* preserve original failure */ }
    }
    throw error;
  } finally {
    client.release();
  }
}
