import assert from "node:assert/strict";
import test from "node:test";

import {
  bootstrap,
  ConfigurationManager,
  DependencyInjector,
  EnvironmentManager,
  ErrorBoundary,
  HealthManager,
  LifecycleManager,
  ModuleRegistry,
  PluginRegistrar,
  ServiceRegistry,
  VersionManager,
} from "../index.js";

test("EnvironmentManager loads and coerces values", () => {
  const env = new EnvironmentManager({
    source: {
      PORT: "3000",
      ENABLED: "true",
      NAME: "oracle",
    },
    schema: [
      { key: "PORT", type: "number", required: true },
      { key: "ENABLED", type: "boolean", defaultValue: false },
      { key: "NAME", type: "string" },
    ],
  });

  const values = env.load();
  assert.equal(values.PORT, 3000);
  assert.equal(values.ENABLED, true);
  assert.equal(values.NAME, "oracle");

  const invalidNumericEnv = new EnvironmentManager({
    source: { RETRIES: "NaN-value" },
    schema: [{ key: "RETRIES", type: "number" }],
  });

  assert.throws(() => invalidNumericEnv.load(), /Invalid numeric environment value/);
});

test("ConfigurationManager supports merge/get/set", () => {
  const manager = new ConfigurationManager({ server: { host: "localhost" } });
  manager.merge({ server: { port: 8080 } });
  manager.set("features.plugins", true);

  assert.equal(manager.get("server.host"), "localhost");
  assert.equal(manager.get("server.port"), 8080);
  assert.equal(manager.get("features.plugins"), true);
  assert.throws(() => manager.set("__proto__.polluted", true), /Unsafe configuration key/);
  const malicious = Object.create(null);
  Object.defineProperty(malicious, "__proto__", { value: { polluted: true }, enumerable: true });
  assert.throws(() => manager.merge(malicious), /Unsafe configuration key/);
});

test("DependencyInjector resolves singleton and detects missing token", () => {
  const di = new DependencyInjector();
  di.register("clock", { useFactory: () => ({ now: 1 }), singleton: true });

  const one = di.resolve("clock");
  const two = di.resolve("clock");

  assert.equal(one, two);
  assert.throws(() => di.resolve("missing"), /not registered/);
  assert.throws(
    () => di.register("invalid", { useFactory: () => ({}), useValue: {} }),
    /either useFactory or useValue/
  );
});

test("ModuleRegistry and ServiceRegistry enforce unique IDs", () => {
  const modules = new ModuleRegistry();
  modules.register({ id: "education", version: "1.0.0" });
  assert.equal(modules.list().length, 1);
  assert.throws(() => modules.register({ id: "education", version: "1.0.1" }), /already registered/);

  const services = new ServiceRegistry();
  services.register({ id: "identity", implementation: {} });
  assert.equal(services.get("identity")?.id, "identity");
  assert.throws(() => services.register({ id: "identity", implementation: {} }), /already registered/);
});

test("LifecycleManager runs initializers and shutdown handlers in order", async () => {
  const lifecycle = new LifecycleManager();
  const calls = [];

  lifecycle.onInitialize(() => calls.push("initA"));
  lifecycle.onInitialize(() => calls.push("initB"));
  lifecycle.onShutdown(() => calls.push("stopA"));
  lifecycle.onShutdown(() => calls.push("stopB"));

  await lifecycle.initialize();
  await lifecycle.shutdown();

  assert.deepEqual(calls, ["initA", "initB", "stopB", "stopA"]);
});

test("HealthManager aggregates statuses", async () => {
  const health = new HealthManager();
  health.registerCheck("dependencies", () => ({ status: "healthy" }));
  health.registerCheck("storage", () => ({ status: "degraded", details: { latencyMs: 120 } }));

  const report = await health.evaluate();
  assert.equal(report.status, "degraded");
  assert.equal(report.checks.storage.status, "degraded");
});

test("ErrorBoundary wraps thrown errors", async () => {
  const errors = [];
  const boundary = new ErrorBoundary((error) => errors.push(error));

  assert.throws(
    () => boundary.execute(() => {
      throw new Error("boom");
    }),
    /Kernel operation failed/
  );

  await assert.rejects(
    () => boundary.executeAsync(async () => {
      throw new Error("async-boom");
    }),
    /Kernel operation failed/
  );

  assert.equal(errors.length, 2);
});

test("PluginRegistrar registers and initializes plugins", async () => {
  const calls = [];
  const registrar = new PluginRegistrar({ calls });

  registrar.register({
    id: "metrics-plugin",
    setup: (ctx) => {
      ctx.calls.push("setup");
    },
  });

  await registrar.initializeAll();
  assert.deepEqual(calls, ["setup"]);
});

test("VersionManager stores kernel and module versions", () => {
  const versions = new VersionManager({ kernelVersion: "1.2.3" });
  versions.registerModuleVersion("education", "0.1.0");

  assert.equal(versions.getKernelVersion(), "1.2.3");
  assert.equal(versions.getModuleVersion("education"), "0.1.0");
});

test("bootstrap assembles managers and runs module/plugin lifecycle", async () => {
  const records = [];

  const kernel = bootstrap({
    kernelVersion: "2.0.0",
    logLevel: "debug",
    environmentSource: { ENABLED: "1" },
    environmentSchema: [{ key: "ENABLED", type: "boolean", defaultValue: false }],
  });

  kernel.registerPlugin({
    id: "capture",
    setup: () => records.push("plugin"),
  });

  kernel.registerModule({
    id: "module-x",
    version: "0.0.1",
    initialize: () => records.push("module-init"),
    shutdown: () => records.push("module-stop"),
  });

  kernel.registerService({ id: "identity", implementation: {} });
  kernel.registerCapability({ id: "auth" });
  kernel.registerDependency("config", { useValue: { retries: 3 } });

  await kernel.initialize();
  await kernel.shutdown();

  assert.equal(kernel.environment.get("ENABLED"), true);
  assert.equal(kernel.services.get("identity")?.id, "identity");
  assert.equal(kernel.capabilities.get("auth")?.id, "auth");
  assert.deepEqual(kernel.resolveDependency("config"), { retries: 3 });
  assert.equal(kernel.versions.getModuleVersion("module-x"), "0.0.1");
  assert.deepEqual(records, ["plugin", "module-init", "module-stop"]);
});
