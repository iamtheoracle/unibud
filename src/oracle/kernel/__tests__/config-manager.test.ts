import test from 'node:test';
import assert from 'node:assert/strict';
import { createConfigManager } from '../components/config-manager.ts';

test('config manager gets and sets values by path', () => {
  const config = createConfigManager({ app: { name: 'oracle' } });
  assert.equal(config.get('app.name'), 'oracle');

  config.set('app.mode', 'prod');
  assert.equal(config.get('app.mode'), 'prod');
  assert.equal(config.get('app.missing', 'fallback'), 'fallback');
});
