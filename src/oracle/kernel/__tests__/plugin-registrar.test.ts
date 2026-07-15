import test from "node:test";
import assert from "node:assert/strict";
import { PluginRegistrar } from "../components/plugin-registrar.js";

test("plugin registrar manages plugin lifecycle", async () => {
  const registrar = new PluginRegistrar();
  const events: string[] = [];
  registrar.register({
    name: "plugin-a",
    version: "1.0.0",
    async initialize() {
      events.push("init");
    },
    async shutdown() {
      events.push("stop");
    },
  });
  await registrar.initializeAll();
  await registrar.shutdownAll();
  assert.deepEqual(events, ["init", "stop"]);
});
