import test from 'node:test';
import assert from 'node:assert/strict';

import { Logger } from '../logger.ts';
import { ModuleRegistry } from '../module-registry.ts';
import { PluginRegistrar } from '../plugin-registrar.ts';

test('PluginRegistrar registers compatible plugins', () => {
  const registrar = new PluginRegistrar(new ModuleRegistry(), new Logger({ sink: {} as Record<string, never> }));
  const plugin = {
    name: 'compatible-plugin',
    version: '1.0.0',
    compatibility: { kernel: '^1.0.0' },
    async initialize() {},
  };

  registrar.register(plugin);
  assert.equal(registrar.get('compatible-plugin'), plugin);
  assert.equal(registrar.list().length, 1);
});

test('PluginRegistrar rejects incompatible plugins', () => {
  const registrar = new PluginRegistrar(new ModuleRegistry(), new Logger({ sink: {} as Record<string, never> }));
  const plugin = {
    name: 'legacy-plugin',
    version: '1.0.0',
    compatibility: { kernel: '2.x' },
    async initialize() {},
  };

  assert.throws(() => registrar.register(plugin), /not compatible/);
});
