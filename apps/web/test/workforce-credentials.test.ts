import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import {
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

test("workforce passcodes are six digits, account-bound and peppered before scrypt", async () => {
  const accountId = randomUUID();
  const pepper = randomBytes(32);
  const verifier = await hashWorkforcePasscode(accountId, "083194", pepper);
  assert.match(verifier, /^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$/);
  assert.equal(await verifyWorkforcePasscode(accountId, "083194", verifier, pepper), true);
  assert.equal(await verifyWorkforcePasscode(accountId, "083195", verifier, pepper), false);
  assert.equal(await verifyWorkforcePasscode(randomUUID(), "083194", verifier, pepper), false);
  assert.equal(await verifyWorkforcePasscode(accountId, "083194", verifier, randomBytes(32)), false);
  await assert.rejects(() => hashWorkforcePasscode(accountId, "12345", pepper));
});
