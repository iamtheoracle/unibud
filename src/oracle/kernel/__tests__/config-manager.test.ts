import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from '../components/config-manager';

describe('ConfigManager', () => {
  let cm: ConfigManager;

  beforeEach(() => {
    cm = new ConfigManager();
  });

  describe('set / get', () => {
    it('stores and retrieves a string value', () => {
      cm.set('app.name', 'Oracle');
      expect(cm.get<string>('app.name')).toBe('Oracle');
    });

    it('stores and retrieves a number', () => {
      cm.set('port', 3000);
      expect(cm.get<number>('port')).toBe(3000);
    });

    it('stores and retrieves an object', () => {
      cm.set('db', { host: 'localhost', port: 5432 });
      expect(cm.get<{ host: string; port: number }>('db')).toEqual({
        host: 'localhost',
        port: 5432,
      });
    });

    it('returns defaultValue when key not found', () => {
      expect(cm.get<string>('missing', 'fallback')).toBe('fallback');
    });

    it('throws when key not found and no default', () => {
      expect(() => cm.get('nonexistent')).toThrow('Configuration key not found: nonexistent');
    });

    it('overwrites an existing key', () => {
      cm.set('x', 1);
      cm.set('x', 2);
      expect(cm.get<number>('x')).toBe(2);
    });
  });

  describe('has', () => {
    it('returns true for existing key', () => {
      cm.set('exists', true);
      expect(cm.has('exists')).toBe(true);
    });

    it('returns false for missing key', () => {
      expect(cm.has('nope')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('returns empty object initially', () => {
      expect(cm.getAll()).toEqual({});
    });

    it('returns all stored key-value pairs', () => {
      cm.set('a', 1);
      cm.set('b', 'two');
      expect(cm.getAll()).toEqual({ a: 1, b: 'two' });
    });
  });

  describe('load', () => {
    it('bulk-loads config', () => {
      cm.load({ host: 'localhost', port: 8080, debug: true });
      expect(cm.get<string>('host')).toBe('localhost');
      expect(cm.get<number>('port')).toBe(8080);
      expect(cm.get<boolean>('debug')).toBe(true);
    });

    it('merges with existing keys', () => {
      cm.set('existing', 'value');
      cm.load({ new: 'entry' });
      expect(cm.has('existing')).toBe(true);
      expect(cm.has('new')).toBe(true);
    });

    it('overwrites on conflict', () => {
      cm.set('key', 'old');
      cm.load({ key: 'new' });
      expect(cm.get<string>('key')).toBe('new');
    });
  });
});
