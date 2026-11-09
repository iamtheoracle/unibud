import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../src/lib/server/auth/credential-core.ts";
import {
  VerificationChallengeService,
  type NewVerificationChallenge,
  type VerificationChallengeRepository
} from "../src/lib/server/auth/verification-core.ts";

test("password hashing uses salted adaptive scrypt verifiers", async () => {
  const password = "correct horse battery staple 2026";
  const first = await hashPassword(password);
  const second = await hashPassword(password);
  assert.match(first, /^scrypt\$ln=17,r=8,p=1\$/);
  assert.notEqual(first, second);
  assert.equal(await verifyPassword(password, first), true);
  assert.equal(await verifyPassword("a different password 2026", first), false);
  assert.equal(await verifyPassword(password, "malformed"), false);
});

test("password policy rejects short and oversized passwords", async () => {
  await assert.rejects(() => hashPassword("short"));
  await assert.rejects(() => hashPassword("x".repeat(129)));
});

test("verification codes are delivered once and only keyed digests are persisted", async () => {
  let stored: NewVerificationChallenge | undefined;
  let deliveredCode = "";
  let revoked = false;
  const repository: VerificationChallengeRepository = {
    async create(value) { stored = value; },
    async revoke() { revoked = true; },
    async verifyAndConsume(input) {
      if (!stored) return "not_found";
      return input.codeDigest.equals(stored.codeDigest) ? "verified" : "invalid";
    }
  };
  const service = new VerificationChallengeService(
    repository,
    { async assertAllowed() {} },
    { async deliver(value) { deliveredCode = value.code; } },
    Buffer.alloc(32, 0x61)
  );
  const issued = await service.issue({
    accountId: "10000000-0000-4000-8000-000000000001",
    identityId: "20000000-0000-4000-8000-000000000001",
    channel: "email",
    purpose: "email_verification",
    destination: "Person@Example.com",
    now: new Date("2026-11-09T06:00:00.000Z")
  });
  assert.ok(stored);
  assert.equal(stored.targetDigest.length, 32);
  assert.equal(stored.codeDigest.length, 32);
  assert.equal("destination" in stored, false);
  assert.equal("code" in issued, false);
  assert.equal(deliveredCode.length, 6);
  assert.equal(await service.verify({
    challengeId: issued.challengeId,
    purpose: "email_verification",
    code: deliveredCode,
    now: new Date("2026-11-09T06:00:30.000Z")
  }), "verified");
  assert.equal(revoked, false);
});

test("delivery failure revokes the persisted challenge", async () => {
  let revoked = false;
  const repository: VerificationChallengeRepository = {
    async create() {},
    async revoke() { revoked = true; },
    async verifyAndConsume() { return "not_found"; }
  };
  const service = new VerificationChallengeService(
    repository,
    { async assertAllowed() {} },
    { async deliver() { throw new Error("provider unavailable"); } },
    Buffer.alloc(32, 0x62)
  );
  await assert.rejects(() => service.issue({
    accountId: "10000000-0000-4000-8000-000000000001",
    identityId: "20000000-0000-4000-8000-000000000001",
    channel: "phone",
    purpose: "phone_verification",
    destination: "+2348012345678"
  }), /provider unavailable/);
  assert.equal(revoked, true);
});

test("verification rejects mismatched purpose and invalid phone formats", async () => {
  const service = new VerificationChallengeService(
    { async create() {}, async revoke() {}, async verifyAndConsume() { return "not_found"; } },
    { async assertAllowed() {} },
    { async deliver() {} },
    Buffer.alloc(32, 0x63)
  );
  await assert.rejects(() => service.issue({
    accountId: "10000000-0000-4000-8000-000000000001",
    channel: "phone",
    purpose: "email_verification",
    destination: "+2348012345678"
  }));
  await assert.rejects(() => service.issue({
    accountId: "10000000-0000-4000-8000-000000000001",
    channel: "phone",
    purpose: "phone_verification",
    destination: "08012345678"
  }));
});
