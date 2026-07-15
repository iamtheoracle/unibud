import test from 'node:test';
import assert from 'node:assert/strict';
import { createModuleRegistry } from '../components/module-registry.ts';

test('module registry registers and retrieves modules', async () => {
  const registry = createModuleRegistry();
  await registry.register({ name: 'alpha', version: '1.0.0' });

  assert.equal(registry.has('alpha'), true);
  assert.equal(registry.get('alpha')?.version, '1.0.0');

  await registry.unregister('alpha');
  assert.equal(registry.has('alpha'), false);
});
