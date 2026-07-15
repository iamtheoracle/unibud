import test from "node:test";
import assert from "node:assert/strict";
import { ConfigManager } from "../components/config-manager.js";

test("config manager loads and reads generic values", () => {
  const manager = new ConfigManager();
  manager.load({ mode: "default", retries: 3 });
  assert.equal(manager.get("mode"), "default");
  assert.equal(manager.get("retries"), 3);
  assert.equal(manager.get("missing", "fallback"), "fallback");
});
