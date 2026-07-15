import test from "node:test";
import assert from "node:assert/strict";
import { ModuleRegistry } from "../components/module-registry.js";

test("module registry stores and lists generic modules", () => {
  const registry = new ModuleRegistry();
  registry.register({ name: "alpha", version: "1.0.0" });
  assert.equal(registry.has("alpha"), true);
  assert.equal(registry.get("alpha")?.version, "1.0.0");
  assert.equal(registry.list().length, 1);
});
