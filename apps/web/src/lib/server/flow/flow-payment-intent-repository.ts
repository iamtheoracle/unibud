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

export interface FlowPaymentIntentConfirmationDetails {
  paymentIntentId: string;
  flowAccountId: string;
  amount: string;
  currency: string;
  feeAmount: string;
  purposeCode: string;
  recipientCiphertext: Buffer;
  recipientLookupDigest: Buffer;
  detailsDigest: Buffer;
  status: string;
  createdAt: string;
}

export interface FlowAuthorizationChallenge {
  authorizationId: string;
  paymentIntentId: string;
  challenge: Buffer;
  challengeDigest: Buffer;
  detailsDigest: Buffer;
  authMethod: "transaction_pin" | "webauthn";
  expiresAt: string;
}

export interface FlowStepUpProof {
  expiresEpoch: number;
  nonce: string;
  signature: string;
}

export class FlowPaymentIntentRepository {
  private readonly pool: SqlPool;

  constructor(pool: SqlPool) {
    this.pool = pool;
  }

  async getConfirmationDetails(
    accountId: string,
    sessionId: string,
    paymentIntentId: string
  ): Promise<FlowPaymentIntentConfirmationDetails | null> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        payment_intent_id: string;
        flow_account_id: string;
        amount: string | number;
        currency: string;
        fee_amount: string | number;
        purpose_code: string;
        recipient_ref_ciphertext: Buffer;
        recipient_ref_digest: Buffer;
        details_digest: Buffer;
        status: string;
        created_at: Date | string;
      }>(
        "SELECT * FROM public.flow_get_payment_intent_confirmation_details($1::uuid)",
        [paymentIntentId]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        paymentIntentId: row.payment_intent_id,
        flowAccountId: row.flow_account_id,
        amount: String(row.amount),
        currency: row.currency,
        feeAmount: String(row.fee_amount),
        purposeCode: row.purpose_code,
        recipientCiphertext: row.recipient_ref_ciphertext,
        recipientLookupDigest: row.recipient_ref_digest,
        detailsDigest: row.details_digest,
        status: row.status,
        createdAt: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : row.created_at
      };
    });
  }

  async createAuthorizationChallenge(
    accountId: string,
    sessionId: string,
    paymentIntentId: string,
    authMethod: "transaction_pin" | "webauthn",
    challenge: Buffer,
    expiresAt: Date
  ): Promise<FlowAuthorizationChallenge | null> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        authorization_id: string;
        challenge_digest: Buffer;
        details_digest: Buffer;
        expires_at: Date | string;
      }>(
        "SELECT * FROM public.flow_create_authorization_challenge($1::uuid,$2::text,$3::bytea,$4::timestamptz)",
        [paymentIntentId, authMethod, challenge, expiresAt]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        authorizationId: row.authorization_id,
        paymentIntentId,
        challenge,
        challengeDigest: row.challenge_digest,
        detailsDigest: row.details_digest,
        authMethod,
        expiresAt: row.expires_at instanceof Date
          ? row.expires_at.toISOString()
          : row.expires_at
      };
    });
  }

  async getAuthorizationChallenge(
    accountId: string,
    sessionId: string,
    authorizationId: string
  ): Promise<FlowAuthorizationChallenge | null> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        authorization_id: string;
        payment_intent_id: string;
        challenge: Buffer;
        challenge_digest: Buffer;
        details_digest: Buffer;
        auth_method: "transaction_pin" | "webauthn";
        expires_at: Date | string;
      }>(
        "SELECT * FROM public.flow_get_authorization_challenge($1::uuid)",
        [authorizationId]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        authorizationId: row.authorization_id,
        paymentIntentId: row.payment_intent_id,
        challenge: row.challenge,
        challengeDigest: row.challenge_digest,
        detailsDigest: row.details_digest,
        authMethod: row.auth_method,
        expiresAt: row.expires_at instanceof Date
          ? row.expires_at.toISOString()
          : row.expires_at
      };
    });
  }

  async failAuthorizationChallenge(
    accountId: string,
    sessionId: string,
    authorizationId: string
  ): Promise<boolean> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{ failed: boolean }>(
        "SELECT public.flow_fail_authorization_challenge($1::uuid) AS failed",
        [authorizationId]
      );
      return result.rows[0]?.failed === true;
    });
  }

  async authorizePaymentIntent(input: {
    accountId: string;
    sessionId: string;
    authorizationId: string;
    payloadDigest: Buffer;
    proof: FlowStepUpProof;
    credentialId?: Buffer;
    newSignatureCounter?: number;
  }): Promise<boolean> {
    return this.withSession(input.accountId, input.sessionId, async client => {
      const result = await client.query<{ authorized: boolean }>(
        "SELECT public.flow_authorize_payment_intent($1::uuid,$2::bytea,$3::bigint,$4::uuid,$5::text,$6::bytea,$7::bigint) AS authorized",
        [
          input.authorizationId,
          input.payloadDigest,
          input.proof.expiresEpoch,
          input.proof.nonce,
          input.proof.signature,
          input.credentialId ?? null,
          input.newSignatureCounter ?? null
        ]
      );
      return result.rows[0]?.authorized === true;
    });
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
