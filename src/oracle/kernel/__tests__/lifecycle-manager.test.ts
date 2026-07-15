import test from "node:test";
import assert from "node:assert/strict";
import { LifecycleManager } from "../components/lifecycle-manager.js";

test("lifecycle manager runs initialize and shutdown hooks in order", async () => {
  const lifecycle = new LifecycleManager();
  const events: string[] = [];

  lifecycle.registerInitializable(async () => {
    events.push("init-a");
  });
  lifecycle.registerInitializable(async () => {
    events.push("init-b");
  });
  lifecycle.registerShutdownable(async () => {
    events.push("stop-a");
  });
  lifecycle.registerShutdownable(async () => {
    events.push("stop-b");
  });

  await lifecycle.initialize();
  await lifecycle.shutdown();

  assert.deepEqual(events, ["init-a", "init-b", "stop-b", "stop-a"]);
  assert.equal(lifecycle.state, "stopped");
});
