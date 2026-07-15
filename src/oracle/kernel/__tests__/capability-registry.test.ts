import test from "node:test";
import assert from "node:assert/strict";
import { CapabilityRegistry } from "../components/capability-registry.js";

test("capability registry stores generic capability metadata", () => {
  const registry = new CapabilityRegistry();
  registry.register({ name: "storage", metadata: { tier: "standard" } });
  assert.equal(registry.has("storage"), true);
  assert.equal(registry.get("storage")?.metadata?.tier, "standard");
});
