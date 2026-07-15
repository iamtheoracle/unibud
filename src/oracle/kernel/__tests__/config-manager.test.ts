import test from 'node:test';
import assert from 'node:assert/strict';

import { ConfigManager } from '../config-manager.ts';

test('ConfigManager merges environment, file config, and overrides with validation', () => {
  const manager = new ConfigManager();
  const config = manager.initialize({
    defaults: { LOG_LEVEL: 'info' },
    envFileContents: 'PORT=3000\nFEATURE_ENABLED=true',
    fileConfig: {
      platform: {
        region: 'eu-west',
      },
    },
    overrides: {
      platform: {
        region: 'us-east',
      },
    },
    schema: {
      PORT: { type: 'number', required: true },
      FEATURE_ENABLED: { type: 'boolean' },
    },
  });

  assert.equal(config.PORT, 3000);
  assert.equal(config.FEATURE_ENABLED, true);
  assert.equal(manager.get('platform.region'), 'us-east');

  manager.set('platform.stage', 'test');
  assert.equal(manager.get('platform.stage'), 'test');
});

test('ConfigManager fails validation for missing required values', () => {
  const manager = new ConfigManager();

  assert.throws(() => {
    manager.initialize({
      schema: {
        API_KEY: { required: true },
      },
    });
  }, /Missing required environment variable: API_KEY/);
});
