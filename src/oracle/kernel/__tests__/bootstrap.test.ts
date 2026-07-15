import test from "node:test";
import assert from "node:assert/strict";
import { bootstrap } from "../components/bootstrap.js";

test("bootstrap creates all kernel managers", () => {
  const kernel = bootstrap({ version: "1.2.3" });
  assert.ok(kernel.configManager);
  assert.ok(kernel.environmentManager);
  assert.ok(kernel.dependencyInjector);
  assert.equal(kernel.versionManager.kernelVersion, "1.2.3");
});
