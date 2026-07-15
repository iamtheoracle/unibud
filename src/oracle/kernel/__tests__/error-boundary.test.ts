import test from "node:test";
import assert from "node:assert/strict";
import { ErrorBoundary } from "../components/error-boundary.js";
import { Logger } from "../components/logger.js";

test("error boundary logs and rethrows failures", async () => {
  const logger = new Logger();
  const boundary = new ErrorBoundary(logger);
  await assert.rejects(() => boundary.execute(async () => {
    throw new Error("failure");
  }, { operation: "test" }));
  assert.equal(logger.getEntries().at(-1)?.level, "error");
});
