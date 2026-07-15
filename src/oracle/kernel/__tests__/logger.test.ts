import test from "node:test";
import assert from "node:assert/strict";
import { Logger } from "../components/logger.js";

test("logger stores structured log entries", () => {
  const logger = new Logger();
  logger.info("ready", { source: "unit-test" });
  const entries = logger.getEntries();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].level, "info");
  assert.equal(entries[0].context?.source, "unit-test");
});
