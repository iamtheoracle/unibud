import test from 'node:test';
import assert from 'node:assert/strict';
import { createCapabilityRegistry } from '../components/capability-registry.ts';

test('capability registry supports provider lookups', async () => {
  const registry = createCapabilityRegistry();
  await registry.register({ name: 'search', version: '1.0.0', provider: 'core' });
  await registry.register({ name: 'reporting', version: '1.0.0', provider: 'core' });

  assert.equal(registry.getByProvider('core').length, 2);
  assert.equal(registry.query({ name: 'search' }).length, 1);
});
