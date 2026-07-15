import test from "node:test";
import assert from "node:assert/strict";
import { HealthManager } from "../components/health-manager.js";

test("health manager aggregates check status", async () => {
  const manager = new HealthManager();
  manager.registerCheck("network", async () => ({ status: "healthy" }));
  manager.registerCheck("storage", async () => ({ status: "degraded", message: "slow response" }));
  const report = await manager.runChecks();

  assert.equal(report.status, "degraded");
  assert.equal(report.checks.network.status, "healthy");
  assert.equal(report.checks.storage.status, "degraded");
});
