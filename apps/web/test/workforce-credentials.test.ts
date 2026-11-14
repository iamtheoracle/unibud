import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import {
  assertWorkforceKeySeparation,
  createWorkforceActivationCode,
  createWorkforceUsername,
  hashWorkforcePasscode,
  verifyWorkforcePasscode,
  workforceActivationDigest,
  workforceUsernameDigest
} from "../src/lib/server/workforce/workforce-credentials-core.ts";

test("workforce usernames are system-issued and role-bound", () => {
  for (const role of ["staff", "operator", "admin"] as const) {
    const username = createWorkforceUsername(role);
    assert.match(username, new RegExp(`^ub-${role}-[a-f0-9]{16}$`));
  }
  assert.match(createWorkforceActivationCode(), /^\d{6}$/);
});

test("activation digests are keyed, username-bound and code-bound", () => {
  const key = randomBytes(32);
  const username = "ub-staff-0123456789abcdef";
  const digest = workforceActivationDigest(username, "123456", key);
  assert.equal(digest.length, 32);
  assert.deepEqual(digest, workforceActivationDigest(username, "123456", key));
  assert.notDeepEqual(digest, workforceActivationDigest(username, "123457", key));
  assert.notDeepEqual(digest, workforceActivationDigest("ub-staff-1123456789abcdef", "123456", key));
  assert.throws(() => workforceActivationDigest(username, "12345", key));
});

test("workforce passcodes are six digits, username-bound and peppered before scrypt", async () => {
  const username = "ub-staff-0123456789abcdef";
  const pepper = randomBytes(32);
  const verifier = await hashWorkforcePasscode(username, "083194", pepper);
  assert.match(verifier, /^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$/);
  assert.equal(await verifyWorkforcePasscode(username, "083194", verifier, pepper), true);
  assert.equal(await verifyWorkforcePasscode(username, "083195", verifier, pepper), false);
  assert.equal(await verifyWorkforcePasscode("ub-staff-1123456789abcdef", "083194", verifier, pepper), false);
  assert.equal(await verifyWorkforcePasscode(username, "083194", verifier, randomBytes(32)), false);
  await assert.rejects(() => hashWorkforcePasscode(username, "12345", pepper));
});

test("workforce identity, passcode, rate-limit and identity keys must be independent", () => {
  const env = {
    UNIBUD_WORKFORCE_ACTIVATION_HMAC_KEY: randomBytes(32).toString("hex"),
    UNIBUD_WORKFORCE_PASSCODE_PEPPER: randomBytes(32).toString("hex"),
    UNIBUD_RATE_LIMIT_HMAC_KEY: randomBytes(32).toString("hex"),
    UNIBUD_IDENTITY_ENCRYPTION_KEY: randomBytes(32).toString("hex"),
    UNIBUD_IDENTITY_LOOKUP_HMAC_KEY: randomBytes(32).toString("hex")
  } as NodeJS.ProcessEnv;
  assert.doesNotThrow(() => assertWorkforceKeySeparation(env));
  env.UNIBUD_WORKFORCE_PASSCODE_PEPPER = env.UNIBUD_WORKFORCE_ACTIVATION_HMAC_KEY;
  assert.throws(() => assertWorkforceKeySeparation(env));
});

test("username rate-limit digest is stable and does not reveal the username", () => {
  const username = "ub-operator-0123456789abcdef";
  const key = randomBytes(32);
  const digest = workforceUsernameDigest(username, key);
  assert.equal(digest.length, 32);
  assert.deepEqual(digest, workforceUsernameDigest(username, key));
  assert.notDeepEqual(digest, workforceUsernameDigest("ub-operator-1123456789abcdef", key));
  assert.equal(digest.toString("utf8").includes(username), false);
});
