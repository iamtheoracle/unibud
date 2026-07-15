import test from "node:test";
import assert from "node:assert/strict";
import { DependencyInjector } from "../components/dependency-injector.js";

test("dependency injector supports singleton and transient registrations", () => {
  const injector = new DependencyInjector();
  const token = "counter";
  let count = 0;
  injector.registerFactory(token, () => ({ count: ++count }));
  const first = injector.resolve<{ count: number }>(token);
  const second = injector.resolve<{ count: number }>(token);
  assert.equal(first.count, second.count);

  injector.registerFactory("transient", () => ({ id: ++count }), false);
  assert.notEqual(injector.resolve<{ id: number }>("transient").id, injector.resolve<{ id: number }>("transient").id);
});
