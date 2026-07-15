import test from 'node:test';
import assert from 'node:assert/strict';

import { EnvironmentLoader } from '../environment-loader.ts';

test('EnvironmentLoader parses env files and coerces typed values', () => {
  const loader = new EnvironmentLoader();
  const config = loader.load({
    envFileContents: '# comment\nPORT=8080\nDEBUG=true\nFEATURES={"kernel":true}',
    schema: {
      PORT: { type: 'number' },
      DEBUG: { type: 'boolean' },
      FEATURES: { type: 'json' },
    },
  });

  assert.equal(config.PORT, 8080);
  assert.equal(config.DEBUG, true);
  assert.deepEqual(config.FEATURES, { kernel: true });
});

test('EnvironmentLoader enforces required values', () => {
  const loader = new EnvironmentLoader();

  assert.throws(() => loader.load({ required: ['ORACLE_KEY'] }), /Missing required configuration: ORACLE_KEY/);
});
