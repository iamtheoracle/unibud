import test from "node:test";
import assert from "node:assert/strict";
import { evaluateProfileSwitch, type ProfileAccessRecord } from "../src/profile.ts";
import type { AccountId, ProfileId } from "../src/identity.ts";

const ownerId = "account-owner" as AccountId;
const delegateId = "account-delegate" as AccountId;
const profileId = "profile-page" as ProfileId;

function access(overrides: Partial<ProfileAccessRecord> = {}): ProfileAccessRecord {
  return {
    accountId: ownerId,
    relationship: "owner",
    role: "owner",
    membershipStatus: "active",
    canSwitchToProfile: true,
    profile: {
      id: profileId,
      ownerAccountId: ownerId,
      kind: "page_community",
      handle: "campus",
      displayName: "Campus Page",
      visibility: "public",
      status: "active"
    },
    ...overrides
  };
}

test("allows the verified owner to switch to an active profile", () => {
  const result = evaluateProfileSwitch(access(), ownerId, profileId);
  assert.equal(result.allowed, true);
  if (result.allowed) {
    assert.equal(result.context.accountId, ownerId);
    assert.equal(result.context.activeProfileId, profileId);
  }
});

test("allows a separately verified delegated account without making it the owner", () => {
  const result = evaluateProfileSwitch(
    access({ accountId: delegateId, relationship: "delegated" }),
    delegateId,
    profileId
  );
  assert.equal(result.allowed, true);
  if (result.allowed) assert.equal(result.context.accountId, delegateId);
});

test("denies a record loaded for a different account", () => {
  assert.deepEqual(
    evaluateProfileSwitch(access(), delegateId, profileId),
    { allowed: false, reason: "wrong_account" }
  );
});

test("denies delegated access when the account is actually the owner", () => {
  assert.deepEqual(
    evaluateProfileSwitch(access({ relationship: "delegated" }), ownerId, profileId),
    { allowed: false, reason: "wrong_account" }
  );
});

test("denies an owner relationship when the account does not own the profile", () => {
  assert.deepEqual(
    evaluateProfileSwitch(
      access({ accountId: delegateId, relationship: "owner" }),
      delegateId,
      profileId
    ),
    { allowed: false, reason: "wrong_account" }
  );
});

test("denies inactive memberships", () => {
  assert.deepEqual(
    evaluateProfileSwitch(access({ membershipStatus: "suspended" }), ownerId, profileId),
    { allowed: false, reason: "membership_inactive" }
  );
});

test("denies inactive profiles", () => {
  assert.deepEqual(
    evaluateProfileSwitch(
      access({ profile: { ...access().profile, status: "archived" } }),
      ownerId,
      profileId
    ),
    { allowed: false, reason: "profile_inactive" }
  );
});

test("denies switching without an explicit switch grant", () => {
  assert.deepEqual(
    evaluateProfileSwitch(access({ canSwitchToProfile: false }), ownerId, profileId),
    { allowed: false, reason: "switch_not_granted" }
  );
});

test("does not switch to a different profile ID", () => {
  assert.deepEqual(
    evaluateProfileSwitch(access(), ownerId, "another-profile" as ProfileId),
    { allowed: false, reason: "profile_not_found" }
  );
});

test("denies missing trusted access records", () => {
  assert.deepEqual(
    evaluateProfileSwitch(undefined, ownerId, profileId),
    { allowed: false, reason: "profile_not_found" }
  );
});
