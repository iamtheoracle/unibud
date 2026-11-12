import "server-only";

import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "../database/session-context";
import type { SqlClient, SqlPool } from "../database/account-context-core";

export interface CreateFlowPaymentIntentInput {
  accountId: string;
  sessionId: string;
  flowAccountId: string;
  idempotencyKeyDigest: Buffer;
  recipientCiphertext: Buffer;
  recipientLookupDigest: Buffer;
  amount: string;
  currency: string;
  feeAmount: string;
  purposeCode: string;
}

export class FlowPaymentIntentRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  async create(input: CreateFlowPaymentIntentInput): Promise<string | null> {
    const context = createSignedSessionContextFromEnvironment(
      input.accountId,
      input.sessionId
    );
    return withSignedSessionTransaction(this.pool, context, async (client: SqlClient) => {
      const result = await client.query<{ payment_intent_id: string | null }>(
        `SELECT public.flow_create_payment_intent(
          $1::uuid,$2::bytea,$3::bytea,$4::bytea,$5::numeric,$6::text,$7::numeric,$8::text
        ) AS payment_intent_id`,
        [
          input.flowAccountId,
          input.idempotencyKeyDigest,
          input.recipientCiphertext,
          input.recipientLookupDigest,
          input.amount,
          input.currency,
          input.feeAmount,
          input.purposeCode
        ]
      );
      return result.rows[0]?.payment_intent_id ?? null;
    });
  }
}
