import test from 'node:test';
import assert from 'node:assert/strict';

import { LifecycleManager } from '../lifecycle-manager.ts';
import type { IOracle } from '../types.ts';

const oracle: IOracle = {
  getConfig() { return undefined; },
  setConfig() {},
  async registerModule() {},
  async registerService() {},
  getService() { return undefined; },
  getModule() { return undefined; },
  async resolveDependencies() { return []; },
  async initialize() {},
  async shutdown() {},
  async getHealth() { return { status: 'healthy' as const }; },
  async getServiceHealth() { return { status: 'healthy' as const }; },
  log() {},
  handleError() {},
  async registerPlugin() {},
  emit() {},
  async execute() { return undefined; },
};

test('LifecycleManager initializes in dependency order and shuts down in reverse order', async () => {
  const lifecycle = new LifecycleManager();
  const callOrder: string[] = [];

  const services = [
    {
      name: 'config',
      version: '1.0.0',
      dependencies: [],
      async initialize() { callOrder.push('service:config:init'); },
      async shutdown() { callOrder.push('service:config:shutdown'); },
    },
    {
      name: 'worker',
      version: '1.0.0',
      dependencies: ['config'],
      async initialize() { callOrder.push('service:worker:init'); },
      async shutdown() { callOrder.push('service:worker:shutdown'); },
    },
  ];

  const modules = [
    {
      name: 'dashboard',
      version: '1.0.0',
      async initialize() { callOrder.push('module:dashboard:init'); },
      async shutdown() { callOrder.push('module:dashboard:shutdown'); },
    },
  ];

  await lifecycle.initialize({
    services,
    serviceOrder: ['config', 'worker'],
    modules,
    resolveDependencies: async () => [],
    config: {},
    oracle,
  });

  assert.equal(lifecycle.getState(), 'ready');
  assert.deepEqual(callOrder.slice(0, 3), ['service:config:init', 'service:worker:init', 'module:dashboard:init']);

  await lifecycle.shutdown(services, modules);
  assert.equal(lifecycle.getState(), 'shutdown');
  assert.deepEqual(callOrder.slice(3), ['module:dashboard:shutdown', 'service:worker:shutdown', 'service:config:shutdown']);
});
