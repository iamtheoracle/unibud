import test from "node:test";
import assert from "node:assert/strict";
import { EnvironmentManager } from "../components/environment-manager.js";

test("environment manager resolves typed values", () => {
  const manager = new EnvironmentManager({
    STRING_VALUE: "value",
    NUMBER_VALUE: "10",
    BOOLEAN_VALUE: "true",
  });
  assert.equal(manager.getRequired("STRING_VALUE"), "value");
  assert.equal(manager.getNumber("NUMBER_VALUE"), 10);
  assert.equal(manager.getBoolean("BOOLEAN_VALUE"), true);
});
