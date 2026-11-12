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

export interface FlowPaymentIntentResult {
  id: string;
  status: string;
}

export class FlowPaymentIntentRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  async create(input: CreateFlowPaymentIntentInput): Promise<FlowPaymentIntentResult | null> {
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
      const paymentIntentId = result.rows[0]?.payment_intent_id ?? null;
      if (!paymentIntentId) return null;
      const current = await client.query<{ status: string }>(
        `SELECT status FROM public.flow_payment_intents WHERE payment_intent_id=$1::uuid`,
        [paymentIntentId]
      );
      const status = current.rows[0]?.status;
      if (!status) throw new Error("Created Flow payment intent could not be read in its owner context.");
      return { id: paymentIntentId, status };
    });
  }
}
