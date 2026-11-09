import test from "node:test";
import assert from "node:assert/strict";
import { buildExternalDependencyReadiness, classifyIntegrationState } from "../src/lib/account/external-dependency-readiness.ts";
import type { AccountExternalDependencyDiscovery } from "../src/lib/server/account/account-external-dependency-repository.ts";

test("integration states distinguish verified, unknown, unavailable and unclassified", () => {
  assert.equal(classifyIntegrationState("verified", "2026-11-09T10:00:00.000Z"), "verified");
  assert.equal(classifyIntegrationState("verified", null), "unknown");
  assert.equal(classifyIntegrationState("configured_unverified", null), "unknown");
  assert.equal(classifyIntegrationState("degraded", null), "unavailable");
  assert.equal(classifyIntegrationState("future_state", null), "unclassified");
});

test("readiness preserves stale, unavailable and shared counts and never enables export or deletion", () => {
  const discovery: AccountExternalDependencyDiscovery = {
    version: "external-dependency-registry-1",
    accountId: "account-a",
    generatedAt: "2026-11-09T12:00:00.000Z",
    counts: {
      linkedReferences: 3, unverifiedReferences: 3, unknownDispositionReferences: 3,
      unavailableReferences: 1, staleReferences: 1, sharedReferences: 1
    },
    countsByDomain: { identity_verification: 1, ai_assistance: 2 },
    integrations: [
      {
        integrationKey: "verified_store", domain: "storage", kind: "object_storage",
        provider: "Example Storage", verificationState: "verified", evidenceSource: "provider_confirmation",
        dataCategories: ["files"], capabilities: { lookup: true, export: false, delete: false, deletionReceipt: false, backupExpiry: false },
        lastVerifiedAt: "2026-11-09T10:00:00.000Z"
      },
      {
        integrationKey: "unknown_gateway", domain: "identity", kind: "delivery_gateway",
        provider: null, verificationState: "unknown", evidenceSource: "repository_declaration",
        dataCategories: ["verification"], capabilities: { lookup: false, export: false, delete: false, deletionReceipt: false, backupExpiry: false },
        lastVerifiedAt: null
      },
      {
        integrationKey: "disabled_provider", domain: "events", kind: "event_delivery",
        provider: null, verificationState: "disabled", evidenceSource: "repository_declaration",
        dataCategories: ["events"], capabilities: { lookup: false, export: false, delete: false, deletionReceipt: false, backupExpiry: false },
        lastVerifiedAt: null
      }
    ],
    coverage: { accountReferencesAreOpaqueDigests: true, rawProviderIdentifiersExposed: false, providerVerificationRequired: true, unknownExternalDependenciesBlockClosure: true },
    policy: { status: "not_approved", missingPolicyDomains: ["external_dependencies", "provider_retention"], canClose: false }
  };
  const result = buildExternalDependencyReadiness(discovery);
  assert.deepEqual(result.counts, { verified: 1, unknown: 1, unavailable: 1, unclassified: 0, policyGaps: 2 });
  assert.equal(result.references.stale, 1);
  assert.equal(result.references.unavailable, 1);
  assert.equal(result.references.shared, 1);
  assert.equal(result.canExport, false);
  assert.equal(result.canDelete, false);
  assert.equal(result.canClose, false);
  assert.ok(result.integrations.every(item => item.exportAvailable === false && item.deleteAvailable === false));
});
