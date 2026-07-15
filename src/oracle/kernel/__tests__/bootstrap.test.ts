import test from 'node:test';
import assert from 'node:assert/strict';

import { OracleKernel } from '../index.ts';

function createService(name: string, dependencies: string[] = [], status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy') {
  return {
    name,
    version: '1.0.0',
    dependencies,
    initializedWith: undefined as unknown,
    shutdownCalled: false,
    async initialize(config: unknown) {
      this.initializedWith = config;
    },
    async shutdown() {
      this.shutdownCalled = true;
    },
    async health() {
      return { status };
    },
  };
}

function createModule(name: string) {
  return {
    name,
    version: '1.0.0',
    initialized: false,
    shutdownCalled: false,
    async initialize() {
      this.initialized = true;
    },
    async shutdown() {
      this.shutdownCalled = true;
    },
    async health() {
      return { status: 'healthy' as const };
    },
  };
}

test('OracleKernel bootstraps managers and runs services/modules end-to-end', async () => {
  const oracle = OracleKernel.bootstrap({
    env: { ORACLE_MODE: 'test' },
    overrides: {
      commandExecutor: async (command: { id: string }) => ({ handled: command.id }),
    },
  });

  const configService = createService('config-service');
  const workerService = createService('worker-service', ['config-service']);
  const module = createModule('example-module');

  await oracle.registerService(configService);
  await oracle.registerService(workerService);
  await oracle.registerModule(module);
  await oracle.initialize();

  assert.equal(oracle.getConfig('ORACLE_MODE'), 'test');
  assert.equal(oracle.lifecycleManager.getState(), 'ready');
  assert.deepEqual(Object.keys((workerService.initializedWith as { dependencies: Record<string, unknown> }).dependencies), ['config-service']);
  assert.equal(module.initialized, true);

  const health = await oracle.getHealth();
  assert.equal(health.status, 'healthy');

  oracle.emit({
    id: 'evt-1',
    source: 'test-suite',
    type: 'kernel.ready',
    timestamp: new Date(),
  });
  assert.equal(oracle.getEvents().length, 1);

  const execution = await oracle.execute({
    id: 'cmd-1',
    source: 'test-suite',
    action: 'ping',
    timestamp: new Date(),
  });
  assert.deepEqual(execution, { handled: 'cmd-1' });
  assert.equal(oracle.getVersionInfo().services['worker-service'], '1.0.0');

  await oracle.shutdown();
  assert.equal(oracle.lifecycleManager.getState(), 'shutdown');
  assert.equal(workerService.shutdownCalled, true);
  assert.equal(module.shutdownCalled, true);
});
