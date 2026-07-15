import test from 'node:test';
import assert from 'node:assert/strict';
import { createLogger, getLogger, setLogger } from '../components/logger.ts';

test('logger singleton can be swapped', () => {
  const logger = createLogger('debug');
  setLogger(logger);

  assert.equal(getLogger(), logger);
});
