import test from 'node:test';
import assert from 'node:assert/strict';

import { ModuleRegistry } from '../module-registry.ts';

test('ModuleRegistry tracks modules, metadata, and versions', () => {
  const registry = new ModuleRegistry();
  const module = {
    name: 'kernel-plugin',
    version: '1.2.0',
    async initialize() {},
  };

  registry.register(module, { source: 'test' });

  assert.equal(registry.get('kernel-plugin'), module);
  assert.deepEqual(registry.getMetadata('kernel-plugin'), { source: 'test' });
  assert.deepEqual(registry.getVersions(), { 'kernel-plugin': '1.2.0' });
});

test('ModuleRegistry rejects duplicate module names', () => {
  const registry = new ModuleRegistry();
  const module = {
    name: 'duplicate-module',
    version: '1.0.0',
    async initialize() {},
  };

  registry.register(module);
  assert.throws(() => registry.register(module), /Module already registered/);
});
