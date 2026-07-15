import test from 'node:test';
import assert from 'node:assert/strict';

import { ServiceRegistry } from '../service-registry.ts';

test('ServiceRegistry tracks services, metadata, and versions', () => {
  const registry = new ServiceRegistry();
  const service = {
    name: 'service-a',
    version: '2.0.0',
    dependencies: ['service-b'],
    async initialize() {},
  };

  registry.register(service, { managed: true });

  assert.equal(registry.get('service-a'), service);
  assert.deepEqual(registry.getMetadata('service-a'), { managed: true });
  assert.deepEqual(registry.getVersions(), { 'service-a': '2.0.0' });
});

test('ServiceRegistry rejects duplicate service names', () => {
  const registry = new ServiceRegistry();
  const service = {
    name: 'duplicate-service',
    version: '1.0.0',
    async initialize() {},
  };

  registry.register(service);
  assert.throws(() => registry.register(service), /Service already registered/);
});
