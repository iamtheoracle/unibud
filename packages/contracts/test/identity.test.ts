import test from "node:test";
import assert from "node:assert/strict";
import {
  evaluateResourceGrant,
  type ResourceGrant,
  type AuthorisationRequest,
  type AccountId,
  type ApplicationId,
  type ResourceId,
  type GrantId
} from "../src/identity.ts";

const grant: ResourceGrant = {
  id: "grant-1" as GrantId,
  subjectAccountId: "account-1" as AccountId,
  applicationId: "app-unibud" as ApplicationId,
  resourceType: "page",
  resourceId: "page-1" as ResourceId,
  role: "editor",
  actions: ["read", "update"],
  issuedAt: "2026-01-01T00:00:00.000Z",
  expiresAt: "2027-01-01T00:00:00.000Z",
  issuer: "account-owner"
};

const request: AuthorisationRequest = {
  subjectAccountId: "account-1" as AccountId,
  applicationId: "app-unibud" as ApplicationId,
  resourceType: "page",
  resourceId: "page-1" as ResourceId,
  action: "update",
  now: "2026-06-01T00:00:00.000Z"
};

test("allows only the exact subject, application, resource and granted action", () => {
  assert.deepEqual(evaluateResourceGrant(grant, request), {
    allowed: true, grantId: grant.id, role: "editor"
  });
});

test("denies a missing grant", () => {
  assert.deepEqual(evaluateResourceGrant(undefined, request), {
    allowed: false, reason: "no_matching_grant"
  });
});

test("denies a different account, application, resource type or resource ID", () => {
  const mismatches: AuthorisationRequest[] = [
    { ...request, subjectAccountId: "other" as AccountId },
    { ...request, applicationId: "other" as ApplicationId },
    { ...request, resourceType: "private-message" },
    { ...request, resourceId: "other" as ResourceId }
  ];
  for (const mismatch of mismatches) {
    assert.deepEqual(evaluateResourceGrant(grant, mismatch), {
      allowed: false, reason: "no_matching_grant"
    });
  }
});

test("denies actions not explicitly listed", () => {
  assert.deepEqual(evaluateResourceGrant(grant, { ...request, action: "delete" }), {
    allowed: false, reason: "action_not_granted"
  });
});

test("denies revoked grants", () => {
  assert.deepEqual(evaluateResourceGrant({
    ...grant, revokedAt: "2026-05-01T00:00:00.000Z"
  }, request), { allowed: false, reason: "grant_revoked" });
});

test("denies grants that have not started", () => {
  assert.deepEqual(evaluateResourceGrant({
    ...grant, issuedAt: "2026-07-01T00:00:00.000Z"
  }, request), { allowed: false, reason: "grant_not_yet_valid" });
});

test("treats expiry as exclusive at the exact expiry instant", () => {
  assert.deepEqual(evaluateResourceGrant(grant, {
    ...request, now: grant.expiresAt!
  }), { allowed: false, reason: "grant_expired" });
});

test("denies invalid timestamps", () => {
  assert.deepEqual(evaluateResourceGrant(grant, {
    ...request, now: "not-a-date"
  }), { allowed: false, reason: "no_matching_grant" });
});
