import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac, randomBytes } from "node:crypto";
import { FlowWebAuthnService } from "../src/lib/server/flow/flow-webauthn-service-core.ts";
import type { FlowWebAuthnRepository } from "../src/lib/server/flow/flow-webauthn-repository.ts";
import type { verifyRegistrationResponse } from "@simplewebauthn/server";

process.env.UNIBUD_WEBAUTHN_RP_ID = "example.test";
process.env.UNIBUD_WEBAUTHN_ORIGIN = "https://example.test";
process.env.UNIBUD_WEBAUTHN_RP_NAME = "UNIBUD Flow";
process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY = Buffer.alloc(32, 10).toString("hex");

const ACCOUNT = "f0530000-0000-4000-8000-000000000001";
const SESSION = "f0530000-0000-4000-8000-000000000011";
const REGISTRATION = "f0530000-0000-4000-8000-000000000099";

class MemoryWebAuthnRepository {
  credentials: Array<{ credentialId: Buffer; publicKeyCose: Buffer; signatureCounter: number; transports: string[] }> = [];
  challenge: { id: string; challenge: Buffer; challengeDigest: Buffer; expiresAt: string } | null = null;
  registered: Record<string, unknown> | null = null;
  failed = false;

  async listCredentials() { return this.credentials; }
  async createRegistrationChallenge(_accountId: string, _sessionId: string, challenge: Buffer, expiresAt: Date) {
    this.challenge = {
      id: REGISTRATION,
      challenge,
      challengeDigest: createHash("sha256").update(challenge).digest(),
      expiresAt: expiresAt.toISOString()
    };
    return REGISTRATION;
  }
  async getRegistrationChallenge() { return this.challenge; }
  async failRegistrationChallenge() { this.failed = true; return true; }
  async registerCredential(input: Record<string, unknown>) {
    this.registered = input;
    return true;
  }
}

test("WebAuthn registration options are RP-bound and require user verification", async () => {
  const repository = new MemoryWebAuthnRepository();
  repository.credentials.push({
    credentialId: Buffer.from("existing-credential"),
    publicKeyCose: Buffer.from([1, 2, 3]),
    signatureCounter: 0,
    transports: ["internal"]
  });
  const service = new FlowWebAuthnService(repository as unknown as FlowWebAuthnRepository);
  const result = await service.createRegistrationOptions({ accountId: ACCOUNT, sessionId: SESSION });
  assert.equal(result.registrationId, REGISTRATION);
  assert.equal(result.options.rp.id, "example.test");
  assert.equal(result.options.authenticatorSelection?.userVerification, "required");
  assert.equal(result.options.authenticatorSelection?.authenticatorAttachment, "platform");
  assert.equal(result.options.attestation, "none");
  assert.equal(result.options.excludeCredentials?.[0]?.id, Buffer.from("existing-credential").toString("base64url"));
  assert.equal(repository.challenge?.challenge.length, 32);
  assert.ok(new Date(repository.challenge!.expiresAt).getTime() > Date.now());
});

test("WebAuthn verification checks challenge, origin, RP ID and signs exact credential payload", async () => {
  const repository = new MemoryWebAuthnRepository();
  const challenge = randomBytes(32);
  repository.challenge = {
    id: REGISTRATION,
    challenge,
    challengeDigest: createHash("sha256").update(challenge).digest(),
    expiresAt: new Date(Date.now() + 60_000).toISOString()
  };
  const verificationInputs: Record<string, unknown>[] = [];
  const fakeVerify = async (input: Record<string, unknown>) => {
    verificationInputs.push(input);
    return {
      verified: true,
      registrationInfo: {
        credential: {
          id: Buffer.from("new-credential").toString("base64url"),
          publicKey: new Uint8Array([9, 8, 7, 6]),
          counter: 2,
          transports: ["internal"]
        }
      }
    };
  };
  const service = new FlowWebAuthnService(
    repository as unknown as FlowWebAuthnRepository,
    fakeVerify as unknown as typeof verifyRegistrationResponse
  );
  assert.equal(await service.verifyRegistration({
    accountId: ACCOUNT,
    sessionId: SESSION,
    registrationId: REGISTRATION,
    response: { id: "credential-response" }
  }), true);

  assert.equal(verificationInputs[0]?.expectedChallenge, challenge.toString("base64url"));
  assert.equal(verificationInputs[0]?.expectedOrigin, "https://example.test");
  assert.equal(verificationInputs[0]?.expectedRPID, "example.test");
  assert.equal(verificationInputs[0]?.requireUserVerification, true);

  const registered = repository.registered!;
  assert.equal((registered.credentialId as Buffer).toString(), Buffer.from("new-credential").toString());
  assert.deepEqual(registered.transports, ["internal"]);
  const payloadCanonical = [
    repository.challenge!.challengeDigest.toString("hex"),
    (registered.credentialId as Buffer).toString("hex"),
    (registered.publicKeyCose as Buffer).toString("hex"),
    "2",
    "internal"
  ].join(":");
  const expectedDigest = createHash("sha256").update(payloadCanonical, "utf8").digest();
  assert.deepEqual(registered.payloadDigest, expectedDigest);

  const proof = registered.proof as { expiresEpoch: number; nonce: string; signature: string };
  const message = [
    "flow-step-up:v1", ACCOUNT, SESSION, "webauthn_register",
    expectedDigest.toString("hex"), String(proof.expiresEpoch), proof.nonce
  ].join(":");
  const expectedSignature = createHmac("sha256", Buffer.from(process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY!, "hex"))
    .update(message, "utf8").digest("hex");
  assert.equal(proof.signature, expectedSignature);
});

test("invalid WebAuthn registration response consumes the challenge", async () => {
  const repository = new MemoryWebAuthnRepository();
  const challenge = randomBytes(32);
  repository.challenge = {
    id: REGISTRATION,
    challenge,
    challengeDigest: createHash("sha256").update(challenge).digest(),
    expiresAt: new Date(Date.now() + 60_000).toISOString()
  };
  const fakeVerify = async () => ({ verified: false, registrationInfo: undefined });
  const service = new FlowWebAuthnService(
    repository as unknown as FlowWebAuthnRepository,
    fakeVerify as unknown as typeof verifyRegistrationResponse
  );
  assert.equal(await service.verifyRegistration({
    accountId: ACCOUNT,
    sessionId: SESSION,
    registrationId: REGISTRATION,
    response: {}
  }), false);
  assert.equal(repository.failed, true);
  assert.equal(repository.registered, null);
});
