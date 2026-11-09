import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HEX_PATTERN = /^(?:[0-9a-f]{2}){32,}$/i;
const MAX_CONTEXT_TTL_SECONDS = 120;

export interface SignedAccountContext {
  accountId: string;
  expiryEpoch: string;
  nonce: string;
  signature: string;
}

export interface SqlResult<Row = unknown> {
  rows: Row[];
}

export interface SqlClient {
  query<Row = unknown>(sql: string, values?: readonly unknown[]): Promise<SqlResult<Row>>;
  release(): void;
}

export interface SqlPool {
  connect(): Promise<SqlClient>;
}

function readSigningKey(): Buffer {
  const value = process.env.UNIBUD_DB_CONTEXT_HMAC_KEY?.trim() ?? "";
  if (!HEX_PATTERN.test(value)) {
    throw new Error("UNIBUD_DB_CONTEXT_HMAC_KEY must be at least 32 random bytes encoded as hex.");
  }
  return Buffer.from(value, "hex");
}

/**
 * Call only after the server has resolved an active account from a verified,
 * non-revoked session record. Never pass an account ID from request input.
 */
export function createSignedAccountContext(
  accountId: string,
  key: Uint8Array,
  nowEpochSeconds = Math.floor(Date.now() / 1000),
  ttlSeconds = 60,
  nonce = randomUUID()
): SignedAccountContext {
  if (!UUID_PATTERN.test(accountId)) throw new Error("Invalid trusted account identifier.");
  if (key.byteLength < 32) throw new Error("Context signing key must contain at least 32 bytes.");
  if (!Number.isInteger(nowEpochSeconds) || nowEpochSeconds < 0) throw new Error("Invalid clock value.");
  if (!Number.isInteger(ttlSeconds) || ttlSeconds < 1 || ttlSeconds > MAX_CONTEXT_TTL_SECONDS) {
    throw new Error("Account context TTL must be between 1 and 120 seconds.");
  }
  if (!UUID_PATTERN.test(nonce)) throw new Error("Invalid context nonce.");

  const expiryEpoch = String(nowEpochSeconds + ttlSeconds);
  const payload = `${accountId}:${expiryEpoch}:${nonce}`;
  const signature = createHmac("sha256", key).update(payload, "utf8").digest("hex");
  return { accountId, expiryEpoch, nonce, signature };
}

export function createSignedAccountContextFromEnvironment(
  accountId: string,
  nowEpochSeconds?: number,
  ttlSeconds = 60
): SignedAccountContext {
  return createSignedAccountContext(accountId, readSigningKey(), nowEpochSeconds, ttlSeconds);
}

/**
 * Binds verified identity to one transaction only. Caller must supply an
 * account ID obtained from the trusted session-validation path, not client data.
 * The transaction must not be reused after commit/rollback.
 */
export async function withSignedAccountTransaction<T>(
  pool: SqlPool,
  context: SignedAccountContext,
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
        set_config('unibud.context_signature', $4, true)`,
      [context.accountId, context.expiryEpoch, context.nonce, context.signature]
    );
    const result = await work(client);
    await client.query("COMMIT");
    transactionOpen = false;
    return result;
  } catch (error) {
    if (transactionOpen) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original operation error; the pool must discard broken clients.
      }
    }
    throw error;
  } finally {
    client.release();
  }
}

/** Constant-time comparison helper for diagnostics/tests; never logs either value. */
export function signaturesMatch(left: string, right: string): boolean {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === 32 && b.length === 32 && timingSafeEqual(a, b);
}
