import test from 'node:test';
import assert from 'node:assert/strict';

import { HealthManager } from '../health-manager.ts';

test('HealthManager aggregates service and module health', async () => {
  const manager = new HealthManager();
  const services = [
    {
      name: 'healthy-service',
      version: '1.0.0',
      async initialize() {},
      async health() { return { status: 'healthy' as const }; },
    },
    {
      name: 'degraded-service',
      version: '1.0.0',
      async initialize() {},
      async health() { return { status: 'degraded' as const, message: 'slow responses' }; },
    },
  ];
  const modules = [
    {
      name: 'healthy-module',
      version: '1.0.0',
      async initialize() {},
      async health() { return { status: 'healthy' as const }; },
    },
  ];

  const platformHealth = await manager.getPlatformHealth(services, modules);

  assert.equal(platformHealth.status, 'degraded');
  assert.equal(manager.getHistory('platform').length, 1);
});

test('HealthManager provides a default healthy response when no check exists', async () => {
  const manager = new HealthManager();
  const service = {
    name: 'simple-service',
    version: '1.0.0',
    async initialize() {},
  };

  const status = await manager.checkService(service.name, service);
  assert.equal(status.status, 'healthy');
});
