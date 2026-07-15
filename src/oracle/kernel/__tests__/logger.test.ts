import test from 'node:test';
import assert from 'node:assert/strict';

import { Logger } from '../logger.ts';

test('Logger stores structured entries and respects level filtering', () => {
  const sinkCalls: unknown[] = [];
  const logger = new Logger({
    level: 'warn',
    sink: {
      log(entry: unknown) { sinkCalls.push(entry); },
      warn(entry: unknown) { sinkCalls.push(entry); },
      error(entry: unknown) { sinkCalls.push(entry); },
    },
  });

  logger.info('ignored info');
  logger.warn('warn message', { scope: 'kernel' });
  logger.error('error message');

  assert.equal(logger.getEntries().length, 3);
  assert.equal(sinkCalls.length, 2);
  assert.equal((logger.getEntries('warn')[0]).message, 'warn message');
});
