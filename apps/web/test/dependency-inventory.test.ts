import test from "node:test";
import assert from "node:assert/strict";
import { ACCOUNT_DEPENDENCY_DOMAINS, buildAccountDependencyInventory } from "../src/lib/account/dependency-inventory.ts";

test("inventory only labels schema-backed areas as registered", () => {
  const inventory = buildAccountDependencyInventory();
  assert.equal(inventory.summary.totalDomains, 10);
  assert.equal(inventory.summary.registeredDomains, 5);
  assert.equal(inventory.summary.unimplementedDomains, 5);
  assert.ok(ACCOUNT_DEPENDENCY_DOMAINS.filter((item) => item.status === "registered_unclassified").every((item) => item.sourceTables.length > 0));
  assert.ok(ACCOUNT_DEPENDENCY_DOMAINS.filter((item) => item.status === "not_implemented").every((item) => item.sourceTables.length === 0));
});

test("unknown and unimplemented domains remain explicit closure blockers", () => {
  const inventory = buildAccountDependencyInventory();
  assert.equal(inventory.policy.canClose, false);
  assert.equal(inventory.policy.status, "not_approved");
  assert.ok(inventory.domains.every((domain) => domain.closureEffect !== undefined));
  assert.equal(inventory.summary.unregisteredDomainsBlockClosure, 5);
});

test("registered dependencies remain unclassified until retention policy approval", () => {
  const inventory = buildAccountDependencyInventory();
  for (const domain of inventory.domains.filter((item) => item.status === "registered_unclassified")) {
    assert.equal(domain.closureEffect, "block_until_policy_approved");
    assert.ok(domain.explanation.length > 20);
  }
});
