import test from "node:test";
import assert from "node:assert/strict";
import { buildClosureReadiness, type ClosureReadinessSnapshot } from "../src/lib/account/closure-readiness.ts";

const empty: ClosureReadinessSnapshot = {
  preflight: { canClose: true, ownedProfiles: 0, activeOwnedProfiles: 0, archivedOwnedProfiles: 0, delegatedRelationships: 0, requiresOwnershipTransferWorkflow: false, requiresDelegationRelease: false },
  profiles: [], archivedProfiles: [], delegatedAccess: [], incomingTransfers: [], outgoingTransfers: []
};

test("closure readiness never enables permanent closure before policy approval", () => {
  const result = buildClosureReadiness(empty);
  assert.equal(result.canClose, false);
  assert.equal(result.status, "eligible_for_policy_review");
  assert.equal(result.policyGate.status, "not_approved");
});

test("active and archived owned profiles are explicit blockers", () => {
  const result = buildClosureReadiness({
    ...empty,
    preflight: { ...empty.preflight, canClose: false, ownedProfiles: 2, activeOwnedProfiles: 1, archivedOwnedProfiles: 1 },
    profiles: [{ id: "active", kind: "creator", handle: "maker", displayName: "Maker", status: "active" }],
    archivedProfiles: [{ id: "archive", kind: "page_community", handle: "campus", displayName: "Campus", status: "archived" }]
  });
  assert.equal(result.status, "blocked");
  assert.equal(result.items.length, 2);
  assert.equal(result.blockers.ownedProfiles, 2);
});

test("active and suspended delegations and pending transfers appear in review list", () => {
  const result = buildClosureReadiness({
    ...empty,
    preflight: { ...empty.preflight, canClose: false, delegatedRelationships: 2 },
    delegatedAccess: [
      { profileId: "p1", profileName: "Page", profileHandle: "page", role: "admin", status: "active" },
      { profileId: "p1", profileName: "Page", profileHandle: "page", role: "editor", status: "suspended" }
    ],
    incomingTransfers: [{ transferId: "in1", profileName: "Incoming", profileHandle: "incoming", ownerHandle: "owner", expiresAt: "2030-01-01T00:00:00Z" }],
    outgoingTransfers: [{ profileId: "p2", profileName: "Outgoing", profileHandle: "outgoing", transferId: "out1", recipientHandle: "recipient", status: "pending_recipient", expiresAt: "2030-01-01T00:00:00Z" }]
  });
  assert.equal(result.items.length, 4);
  assert.equal(result.blockers.delegatedRelationships, 2);
  assert.equal(result.blockers.incomingTransfers, 1);
  assert.equal(result.blockers.outgoingTransfers, 1);
});
