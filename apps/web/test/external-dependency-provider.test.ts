import test from "node:test";
import assert from "node:assert/strict";
import {
  ExternalDependencyProviderRegistry,
  type ExternalDependencyProviderAdapter
} from "../src/lib/server/account/external-dependency-provider.ts";

const now = Date.parse("2026-11-09T12:00:00.000Z");
const baseAdapter: ExternalDependencyProviderAdapter = {
  integrationKey: "storage_provider",
  async lookup() {
    return {
      observedAt: new Date(now).toISOString(),
      references: [{ referenceDigest: "a".repeat(64), relationshipKind: "owner", exists: true }]
    };
  },
  async verify() {
    return {
      providerIdentity: "Verified storage provider",
      verifiedAt: new Date(now).toISOString(),
      evidenceSource: "provider_confirmation",
      lookupSupported: true
    };
  }
};

test("missing provider adapter fails closed without claiming zero dependencies", async () => {
  const registry = new ExternalDependencyProviderRegistry([], { now: () => now });
  const result = await registry.lookup({ accountId: "account-a", integrationKey: "storage_provider", referenceDigests: ["a".repeat(64)] });
  assert.deepEqual(result, { state: "unavailable", reason: "provider_not_registered", references: [], sharedReferenceCount: 0 });
  const verification = await registry.verify({ accountId: "account-a", integrationKey: "storage_provider" });
  assert.deepEqual(verification, { state: "unknown", reason: "provider_not_registered" });
});

test("stale provider evidence is surfaced as stale rather than verified current", async () => {
  const adapter: ExternalDependencyProviderAdapter = {
    ...baseAdapter,
    async lookup() {
      return { observedAt: "2026-11-07T12:00:00.000Z", references: [] };
    }
  };
  const registry = new ExternalDependencyProviderRegistry([adapter], { now: () => now, maxEvidenceAgeMs: 60_000 });
  const result = await registry.lookup({ accountId: "account-a", integrationKey: "storage_provider", referenceDigests: [] });
  assert.equal(result.state, "stale");
});

test("provider lookup failures become unavailable and do not leak provider exceptions", async () => {
  const adapter: ExternalDependencyProviderAdapter = {
    ...baseAdapter,
    async lookup() { throw new Error("provider token=secret-value"); }
  };
  const registry = new ExternalDependencyProviderRegistry([adapter], { now: () => now });
  const result = await registry.lookup({ accountId: "account-a", integrationKey: "storage_provider", referenceDigests: ["a".repeat(64)] });
  assert.deepEqual(result, { state: "unavailable", reason: "lookup_failed", references: [], sharedReferenceCount: 0 });
  assert.equal(JSON.stringify(result).includes("secret-value"), false);
});

test("shared participant relationships are counted without exposing raw provider identifiers", async () => {
  const adapter: ExternalDependencyProviderAdapter = {
    ...baseAdapter,
    async lookup() {
      return {
        observedAt: new Date(now).toISOString(),
        references: [
          { referenceDigest: "a".repeat(64), relationshipKind: "shared_participant", exists: true },
          { referenceDigest: "b".repeat(64), relationshipKind: "participant", exists: true },
          { referenceDigest: "c".repeat(64), relationshipKind: "owner", exists: true }
        ]
      };
    }
  };
  const registry = new ExternalDependencyProviderRegistry([adapter], { now: () => now });
  const result = await registry.lookup({
    accountId: "account-a",
    integrationKey: "storage_provider",
    referenceDigests: ["a".repeat(64), "b".repeat(64), "c".repeat(64)]
  });
  assert.equal(result.state, "available");
  if (result.state !== "available") return;
  assert.equal(result.sharedReferenceCount, 2);
  assert.equal(result.references.length, 3);
});

test("provider cannot return a digest outside the requested account-scoped reference set", async () => {
  const adapter: ExternalDependencyProviderAdapter = {
    ...baseAdapter,
    async lookup() {
      return {
        observedAt: new Date(now).toISOString(),
        references: [{ referenceDigest: "z".repeat(64), relationshipKind: "owner", exists: true }]
      };
    }
  };
  const registry = new ExternalDependencyProviderRegistry([adapter], { now: () => now });
  const result = await registry.lookup({ accountId: "account-a", integrationKey: "storage_provider", referenceDigests: ["a".repeat(64)] });
  assert.deepEqual(result, { state: "unavailable", reason: "invalid_provider_response", references: [], sharedReferenceCount: 0 });
});
