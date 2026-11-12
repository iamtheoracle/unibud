import test from "node:test";
import assert from "node:assert/strict";
import { FlowPinService } from "../src/lib/server/flow/flow-pin-service.ts";
import type { FlowPinRepository } from "../src/lib/server/flow/flow-pin-repository.ts";

class MemoryPinRepository {
  pinHash: string | null = null;
  failures = 0;
  locked = false;

  async enroll(_accountId: string, _sessionId: string, hash: string) {
    if (this.pinHash) return false;
    this.pinHash = hash;
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
  async recover(_accountId: string, _sessionId: string, hash: string) {
    if (!this.pinHash) return false;
    this.pinHash = hash;
    this.failures = 0;
    this.locked = false;
    return true;
  }
}

const ACCOUNT = "f0500000-0000-4000-8000-000000000001";
const SESSION = "f0500000-0000-4000-8000-000000000011";

test("Flow PIN enrollment stores an Argon2id verifier and verifies without returning reusable proof", async () => {
  const repository = new MemoryPinRepository();
  const service = new FlowPinService(repository as unknown as FlowPinRepository);
  assert.equal(await service.enroll({
    accountId: ACCOUNT, sessionId: SESSION, pin: "482917", confirmation: "482917"
  }), true);
  assert.match(repository.pinHash ?? "", /^\$argon2id\$v=19\$m=65536,t=3,p=1\$/);
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
  await assert.rejects(service.enroll({
    accountId: ACCOUNT, sessionId: SESSION, pin: "123456", confirmation: "123456"
  }), /six-digit/);
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
