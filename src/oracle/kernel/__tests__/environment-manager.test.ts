import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createEnvironmentManager } from '../components/environment-manager.ts';

test('environment manager reads env values and dotenv fallback', () => {
  const dir = mkdtempSync(join(tmpdir(), 'oracle-kernel-env-'));
  const dotenv = join(dir, '.env');
  writeFileSync(dotenv, 'PORT=3000\nDEBUG=true\n', 'utf-8');

  const env = createEnvironmentManager({ env: { MODE: 'test' }, dotenvPath: dotenv });
  assert.equal(env.get('MODE'), 'test');
  assert.equal(env.getAsNumber('PORT'), 3000);
  assert.equal(env.getAsBoolean('DEBUG'), true);
});
