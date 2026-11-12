import "server-only";

import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "../database/session-context";
import type { SqlClient, SqlPool } from "../database/account-context-core";

export interface FlowPinVerificationRecord {
  allowed: boolean;
  pinHashPhc: string | null;
  lockedUntil: string | null;
}

export interface FlowPinFailureRecord {
  lockedUntil: string | null;
  failedAttempts: number;
}

export class FlowPinRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  private async withSession<T>(
    accountId: string,
    sessionId: string,
    work: (client: SqlClient) => Promise<T>
  ): Promise<T> {
    const context = createSignedSessionContextFromEnvironment(accountId, sessionId);
    return withSignedSessionTransaction(this.pool, context, work);
  }

  async enroll(accountId: string, sessionId: string, pinHashPhc: string, proof: { expiresEpoch: number; nonce: string; signature: string }): Promise<boolean> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{ enrolled: boolean }>(
        "SELECT public.flow_pin_enroll($1::text,$2::bigint,$3::uuid,$4::text) AS enrolled",
        [pinHashPhc, proof.expiresEpoch, proof.nonce, proof.signature]
      );
      return result.rows[0]?.enrolled === true;
    });
  }

  async beginVerification(accountId: string, sessionId: string): Promise<FlowPinVerificationRecord> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        allowed: boolean;
        pin_hash_phc: string | null;
        locked_until: Date | string | null;
      }>("SELECT * FROM public.flow_pin_begin_verification()");
      const row = result.rows[0];
      return {
        allowed: row?.allowed === true,
        pinHashPhc: row?.pin_hash_phc ?? null,
        lockedUntil: row?.locked_until instanceof Date
          ? row.locked_until.toISOString()
          : row?.locked_until ?? null
      };
    });
  }

  async recordFailure(accountId: string, sessionId: string): Promise<FlowPinFailureRecord> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        locked_until: Date | string | null;
        failed_attempts: number;
      }>("SELECT * FROM public.flow_pin_record_failure()");
      const row = result.rows[0];
      return {
        lockedUntil: row?.locked_until instanceof Date
          ? row.locked_until.toISOString()
          : row?.locked_until ?? null,
        failedAttempts: Number(row?.failed_attempts ?? 0)
      };
    });
  }

  async recordSuccess(accountId: string, sessionId: string): Promise<boolean> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{ verified: boolean }>(
        "SELECT public.flow_pin_record_success() AS verified"
      );
      return result.rows[0]?.verified === true;
    });
  }

  async recover(accountId: string, sessionId: string, pinHashPhc: string, proof: { expiresEpoch: number; nonce: string; signature: string }): Promise<boolean> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{ recovered: boolean }>(
        "SELECT public.flow_pin_recover($1::text,$2::bigint,$3::uuid,$4::text) AS recovered",
        [pinHashPhc, proof.expiresEpoch, proof.nonce, proof.signature]
      );
      return result.rows[0]?.recovered === true;
    });
  }
}
