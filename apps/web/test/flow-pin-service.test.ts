import test from "node:test";
import assert from "node:assert/strict";
import { createHash, createHmac } from "node:crypto";
import { FlowPinService } from "../src/lib/server/flow/flow-pin-service-core.ts";
import type { FlowPinRepository } from "../src/lib/server/flow/flow-pin-repository.ts";

class MemoryPinRepository {
  pinHash: string | null = null;
  failures = 0;
  locked = false;
  lastProof: { expiresEpoch: number; nonce: string; signature: string } | null = null;

  async enroll(_accountId: string, _sessionId: string, hash: string, proof: { expiresEpoch: number; nonce: string; signature: string }) {
    if (this.pinHash) return false;
    this.pinHash = hash;
    this.lastProof = proof;
    return true;
  }
  async beginVerification() {
    return {
      allowed: !this.locked,
      pinHashPhc: this.pinHash,
      lockedUntil: this.locked ? "2099-01-01T00:00:00.000Z" : null
    };
  }
  async recordFailure() {
    this.failures += 1;
    if (this.failures >= 5) this.locked = true;
    return { lockedUntil: this.locked ? "2099-01-01T00:00:00.000Z" : null, failedAttempts: this.failures };
  }
  async recordSuccess() {
    if (this.locked) return false;
    this.failures = 0;
    return true;
  }
  async recover(_accountId: string, _sessionId: string, hash: string, proof: { expiresEpoch: number; nonce: string; signature: string }) {
    if (!this.pinHash) return false;
    this.pinHash = hash;
    this.lastProof = proof;
    this.failures = 0;
    this.locked = false;
    return true;
  }
}

process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY = Buffer.alloc(32, 9).toString("hex");

const ACCOUNT = "f0500000-0000-4000-8000-000000000001";
const SESSION = "f0500000-0000-4000-8000-000000000011";

test("Flow PIN enrollment stores an Argon2id verifier and verifies without returning reusable proof", async () => {
  const repository = new MemoryPinRepository();
  const service = new FlowPinService(repository as unknown as FlowPinRepository);
  assert.equal(await service.enroll({
    accountId: ACCOUNT, sessionId: SESSION, pin: "482917", confirmation: "482917"
  }), true);
  assert.match(repository.pinHash ?? "", /^\$argon2id\$v=19\$m=65536,t=3,p=1\$/);
  assert.ok(repository.lastProof);
  assert.match(repository.lastProof?.nonce ?? "", /^[0-9a-f-]{36}$/i);
  assert.equal(repository.lastProof?.signature.length, 64);
  assert.ok((repository.lastProof?.expiresEpoch ?? 0) > Math.floor(Date.now() / 1000));
  const proof = repository.lastProof!;
  const payloadDigest = createHash("sha256").update(repository.pinHash!, "utf8").digest("hex");
  const message = ["flow-step-up:v1", ACCOUNT, SESSION, "pin_enroll",
    payloadDigest, String(proof.expiresEpoch), proof.nonce].join(":");
  const expectedSignature = createHmac("sha256", Buffer.from(process.env.UNIBUD_FLOW_STEP_UP_HMAC_KEY!, "hex"))
    .update(message, "utf8").digest("hex");
  assert.equal(proof.signature, expectedSignature);
  assert.deepEqual(await service.verify({ accountId: ACCOUNT, sessionId: SESSION, pin: "482917" }), {
    state: "verified"
  });
  assert.deepEqual(await service.verify({ accountId: ACCOUNT, sessionId: SESSION, pin: "482918" }), {
    state: "invalid"
  });
});

test("Flow PIN enrollment rejects weak PINs and mismatched confirmation", async () => {
  const repository = new MemoryPinRepository();
  const service = new FlowPinService(repository as unknown as FlowPinRepository);
  for (const weakPin of ["123456", "654321", "234567", "987654", "111111"]) {
    await assert.rejects(service.enroll({
      accountId: ACCOUNT, sessionId: SESSION, pin: weakPin, confirmation: weakPin
    }), /six-digit/);
  }
  await assert.rejects(service.enroll({
    accountId: ACCOUNT, sessionId: SESSION, pin: "482917", confirmation: "482918"
  }), /does not match/);
  assert.equal(repository.pinHash, null);
});

test("Flow PIN recovery replaces the verifier and clears failed-attempt state", async () => {
  const repository = new MemoryPinRepository();
  const service = new FlowPinService(repository as unknown as FlowPinRepository);
  assert.equal(await service.enroll({
    accountId: ACCOUNT, sessionId: SESSION, pin: "482917", confirmation: "482917"
  }), true);
  await service.verify({ accountId: ACCOUNT, sessionId: SESSION, pin: "482918" });
  const oldHash = repository.pinHash;
  assert.equal(await service.recover({
    accountId: ACCOUNT, sessionId: SESSION, newPin: "731904", confirmation: "731904"
  }), true);
  assert.notEqual(repository.pinHash, oldHash);
  assert.deepEqual(await service.verify({ accountId: ACCOUNT, sessionId: SESSION, pin: "731904" }), {
    state: "verified"
  });
});
