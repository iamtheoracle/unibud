import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../components/logger';
import type { LogLevel } from '../types/index';

describe('Logger', () => {
  let consoleSpy: Record<string, ReturnType<typeof vi.spyOn>>;

  beforeEach(() => {
    consoleSpy = {
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('defaults to info level', () => {
      const logger = new Logger();
      expect(logger.getLevel()).toBe('info');
    });

    it('accepts custom level', () => {
      const logger = new Logger({}, 'debug');
      expect(logger.getLevel()).toBe('debug');
    });
  });

  describe('setLevel / getLevel', () => {
    it('changes level', () => {
      const logger = new Logger();
      logger.setLevel('warn');
      expect(logger.getLevel()).toBe('warn');
    });
  });

  describe('debug', () => {
    it('logs when level is debug', () => {
      const logger = new Logger({}, 'debug');
      logger.debug('test debug');
      expect(consoleSpy.debug).toHaveBeenCalledWith('[Oracle/DEBUG]', 'test debug');
    });

    it('does not log when level is info', () => {
      const logger = new Logger({}, 'info');
      logger.debug('suppressed');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    it('includes context in output', () => {
      const logger = new Logger({}, 'debug');
      logger.debug('msg', { key: 'val' });
      expect(consoleSpy.debug).toHaveBeenCalledWith('[Oracle/DEBUG]', 'msg', { key: 'val' });
    });
  });

  describe('info', () => {
    it('logs at info level', () => {
      const logger = new Logger();
      logger.info('hello');
      expect(consoleSpy.info).toHaveBeenCalledWith('[Oracle/INFO]', 'hello');
    });

    it('suppressed at warn level', () => {
      const logger = new Logger({}, 'warn');
      logger.info('suppressed');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('logs warn messages', () => {
      const logger = new Logger();
      logger.warn('caution');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[Oracle/WARN]', 'caution');
    });
  });

  describe('error', () => {
    it('logs error without error object', () => {
      const logger = new Logger();
      logger.error('bad thing');
      expect(consoleSpy.error).toHaveBeenCalledWith('[Oracle/ERROR]', 'bad thing');
    });

    it('logs error with Error object', () => {
      const logger = new Logger();
      const err = new Error('boom');
      logger.error('failed', err);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[Oracle/ERROR]',
        'failed',
        expect.objectContaining({ error: expect.objectContaining({ message: 'boom' }) }),
      );
    });

    it('merges context with error', () => {
      const logger = new Logger();
      const err = new Error('oops');
      logger.error('ctx error', err, { requestId: '123' });
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[Oracle/ERROR]',
        'ctx error',
        expect.objectContaining({ requestId: '123', error: expect.any(Object) }),
      );
    });
  });

  describe('child', () => {
    it('creates a child logger inheriting context', () => {
      const parent = new Logger({ service: 'oracle' }, 'debug');
      const child = parent.child({ component: 'kernel' });
      child.debug('child log');
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        '[Oracle/DEBUG]',
        'child log',
        expect.objectContaining({ service: 'oracle', component: 'kernel' }),
      );
    });

    it('child inherits parent level', () => {
      const parent = new Logger({}, 'warn');
      const child = parent.child({ x: 1 });
      expect(child.getLevel()).toBe('warn');
    });
  });

  describe('context merging', () => {
    it('merges root context with per-call context', () => {
      const logger = new Logger({ app: 'unibud' });
      logger.info('event', { action: 'login' });
      expect(consoleSpy.info).toHaveBeenCalledWith(
        '[Oracle/INFO]',
        'event',
        expect.objectContaining({ app: 'unibud', action: 'login' }),
      );
    });
  });

  describe('level ordering', () => {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    it.each(levels)('level %s logs itself and above', level => {
      const logger = new Logger({}, level);
      const order = ['debug', 'info', 'warn', 'error'];
      const idx = order.indexOf(level);
      const shouldLog = order.slice(idx);
      const shouldNot = order.slice(0, idx);

      shouldLog.forEach(l => {
        if (l === 'debug') logger.debug('x');
        if (l === 'info') logger.info('x');
        if (l === 'warn') logger.warn('x');
        if (l === 'error') logger.error('x');
      });

      shouldNot.forEach(l => {
        if (l === 'debug') expect(consoleSpy.debug).not.toHaveBeenCalled();
        if (l === 'info') expect(consoleSpy.info).not.toHaveBeenCalled();
      });
    });
  });
});
