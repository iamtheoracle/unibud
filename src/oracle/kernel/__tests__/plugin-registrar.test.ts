import test from 'node:test';
import assert from 'node:assert/strict';
import { createPluginRegistrar } from '../components/plugin-registrar.ts';
import { createVersionManager } from '../components/version-manager.ts';

test('plugin registrar validates compatibility', async () => {
  const plugins = createPluginRegistrar(createVersionManager('1.2.0'));

  await plugins.register({
    name: 'plugin-a',
    version: '1.0.0',
    validate: () => true,
    compatibility: () => '^1.0.0',
  });

  assert.equal(plugins.getPlugins().length, 1);
  assert.equal(
    plugins.isCompatible({
      name: 'plugin-b',
      version: '1.0.0',
      validate: () => true,
      compatibility: () => '^2.0.0',
    }),
    false,
  );
});
