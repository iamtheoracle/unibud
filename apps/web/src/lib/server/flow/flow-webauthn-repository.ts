import "server-only";

import {
  createSignedSessionContextFromEnvironment,
  withSignedSessionTransaction
} from "../database/session-context";
import type { SqlClient, SqlPool } from "../database/account-context-core";

export interface FlowWebAuthnRegistrationChallenge {
  id: string;
  challenge: Buffer;
  challengeDigest: Buffer;
  expiresAt: string;
}

export interface FlowWebAuthnCredential {
  credentialId: Buffer;
  publicKeyCose: Buffer;
  signatureCounter: number;
  transports: string[];
}

export interface FlowWebAuthnStepUpProof {
  expiresEpoch: number;
  nonce: string;
  signature: string;
}

export class FlowWebAuthnRepository {
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

  async listCredentials(accountId: string, sessionId: string): Promise<FlowWebAuthnCredential[]> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        credential_id: Buffer;
        public_key_cose: Buffer;
        signature_counter: number | string;
        transports: string[];
      }>("SELECT * FROM public.flow_webauthn_list_credentials()");
      return result.rows.map(row => ({
        credentialId: row.credential_id,
        publicKeyCose: row.public_key_cose,
        signatureCounter: Number(row.signature_counter),
        transports: row.transports ?? []
      }));
    });
  }

  async createRegistrationChallenge(
    accountId: string,
    sessionId: string,
    challenge: Buffer,
    expiresAt: Date
  ): Promise<string | null> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{ registration_id: string | null }>(
        "SELECT public.flow_webauthn_create_registration_challenge($1::bytea,$2::timestamptz) AS registration_id",
        [challenge, expiresAt]
      );
      return result.rows[0]?.registration_id ?? null;
    });
  }

  async getRegistrationChallenge(
    accountId: string,
    sessionId: string,
    registrationId: string
  ): Promise<FlowWebAuthnRegistrationChallenge | null> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{
        challenge: Buffer;
        challenge_digest: Buffer;
        expires_at: Date | string;
      }>(
        "SELECT * FROM public.flow_webauthn_get_registration_challenge($1::uuid)",
        [registrationId]
      );
      const row = result.rows[0];
      if (!row) return null;
      return {
        id: registrationId,
        challenge: row.challenge,
        challengeDigest: row.challenge_digest,
        expiresAt: row.expires_at instanceof Date
          ? row.expires_at.toISOString()
          : row.expires_at
      };
    });
  }

  async failRegistrationChallenge(
    accountId: string,
    sessionId: string,
    registrationId: string
  ): Promise<boolean> {
    return this.withSession(accountId, sessionId, async client => {
      const result = await client.query<{ failed: boolean }>(
        "SELECT public.flow_webauthn_fail_registration_challenge($1::uuid) AS failed",
        [registrationId]
      );
      return result.rows[0]?.failed === true;
    });
  }

  async registerCredential(input: {
    accountId: string;
    sessionId: string;
    registrationId: string;
    credentialId: Buffer;
    publicKeyCose: Buffer;
    signatureCounter: number;
    transports: string[];
    payloadDigest: Buffer;
    proof: FlowWebAuthnStepUpProof;
  }): Promise<boolean> {
    return this.withSession(input.accountId, input.sessionId, async client => {
      const result = await client.query<{ registered: boolean }>(
        "SELECT public.flow_webauthn_register_credential($1::uuid,$2::bytea,$3::bytea,$4::bigint,$5::text[],$6::bytea,$7::bigint,$8::uuid,$9::text) AS registered",
        [
          input.registrationId,
          input.credentialId,
          input.publicKeyCose,
          input.signatureCounter,
          input.transports,
          input.payloadDigest,
          input.proof.expiresEpoch,
          input.proof.nonce,
          input.proof.signature
        ]
      );
      return result.rows[0]?.registered === true;
    });
  }
}
