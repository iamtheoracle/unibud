import test from "node:test";
import assert from "node:assert/strict";
import { bootstrap } from "../components/bootstrap.js";

test("oracle kernel initializes and shuts down generic modules", async () => {
  const oracle = bootstrap({ version: "1.0.0" });
  const events: string[] = [];

  oracle.registerModule({
    name: "generic-module",
    version: "0.0.1",
    async initialize() {
      events.push("module-init");
    },
    async shutdown() {
      events.push("module-stop");
    },
  });

  oracle.capabilityRegistry.register({
    name: "generic-capability",
    metadata: { mode: "agnostic" },
  });

  await oracle.initialize();
  const report = await oracle.healthManager.runChecks();
  await oracle.shutdown();

  assert.equal(oracle.moduleRegistry.has("generic-module"), true);
  assert.equal(oracle.capabilityRegistry.has("generic-capability"), true);
  assert.equal(oracle.versionManager.getModuleVersion("generic-module"), "0.0.1");
  assert.equal(report.status, "healthy");
  assert.deepEqual(events, ["module-init", "module-stop"]);
});
