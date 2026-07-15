import test from 'node:test';
import assert from 'node:assert/strict';
import { createBootstrap } from '../index.ts';

test('integration: modules, capabilities and plugins collaborate through oracle', async () => {
  const bootstrap = createBootstrap();
  const { oracle } = bootstrap;
  const events: string[] = [];

  await oracle.modules.register({
    name: 'core-module',
    version: '1.0.0',
    initialize: async () => {
      events.push('module-initialized');
    },
    shutdown: async () => {
      events.push('module-shutdown');
    },
  });

  await oracle.capabilities.register({
    name: 'health-view',
    version: '1.0.0',
    provider: 'core-module',
  });

  await oracle.plugins.register({
    name: 'sample-plugin',
    version: '1.0.0',
    validate: () => true,
    compatibility: () => '^1.0.0',
    shutdown: async () => {
      events.push('plugin-shutdown');
    },
  });

  await bootstrap.initialize();
  assert.equal(oracle.capabilities.has('health-view'), true);
  assert.equal(oracle.version.getModuleVersion('core-module'), '1.0.0');

  await bootstrap.shutdown();
  assert.deepEqual(events, ['module-initialized', 'plugin-shutdown', 'module-shutdown']);
});
