import { describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentManager } from '../components/environment-manager';

describe('EnvironmentManager', () => {
  let em: EnvironmentManager;

  beforeEach(() => {
    em = new EnvironmentManager({
      STRING_VAR: 'hello',
      BOOL_TRUE: 'true',
      BOOL_ONE: '1',
      BOOL_FALSE: 'false',
      NUM_VAR: '42',
      EMPTY_VAR: '',
    });
  });

  describe('get', () => {
    it('returns value for existing key', () => {
      expect(em.get('STRING_VAR')).toBe('hello');
    });

    it('returns undefined for missing key', () => {
      expect(em.get('MISSING')).toBeUndefined();
    });

    it('returns defaultValue for missing key', () => {
      expect(em.get('MISSING', 'default')).toBe('default');
    });

    it('does not use default when key exists', () => {
      expect(em.get('STRING_VAR', 'nope')).toBe('hello');
    });
  });

  describe('getRequired', () => {
    it('returns value when set', () => {
      expect(em.getRequired('STRING_VAR')).toBe('hello');
    });

    it('throws when key is missing', () => {
      expect(() => em.getRequired('MISSING')).toThrow(
        'Required environment variable not set: MISSING',
      );
    });

    it('throws when value is empty string', () => {
      expect(() => em.getRequired('EMPTY_VAR')).toThrow(
        'Required environment variable not set: EMPTY_VAR',
      );
    });
  });

  describe('getBoolean', () => {
    it('returns true for "true"', () => {
      expect(em.getBoolean('BOOL_TRUE')).toBe(true);
    });

    it('returns true for "1"', () => {
      expect(em.getBoolean('BOOL_ONE')).toBe(true);
    });

    it('returns false for "false"', () => {
      expect(em.getBoolean('BOOL_FALSE')).toBe(false);
    });

    it('returns defaultValue when key missing', () => {
      expect(em.getBoolean('MISSING', true)).toBe(true);
    });

    it('returns false when key missing and no default', () => {
      expect(em.getBoolean('MISSING')).toBe(false);
    });
  });

  describe('getNumber', () => {
    it('returns parsed number', () => {
      expect(em.getNumber('NUM_VAR')).toBe(42);
    });

    it('returns defaultValue when key missing', () => {
      expect(em.getNumber('MISSING', 99)).toBe(99);
    });

    it('returns undefined when key missing and no default', () => {
      expect(em.getNumber('MISSING')).toBeUndefined();
    });

    it('throws for non-numeric string', () => {
      const em2 = new EnvironmentManager({ BAD_NUM: 'not-a-number' });
      expect(() => em2.getNumber('BAD_NUM')).toThrow('is not a valid number');
    });
  });

  describe('has', () => {
    it('returns true for existing key', () => {
      expect(em.has('STRING_VAR')).toBe(true);
    });

    it('returns false for missing key', () => {
      expect(em.has('MISSING')).toBe(false);
    });

    it('returns false for empty-string value', () => {
      expect(em.has('EMPTY_VAR')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('returns snapshot of all vars', () => {
      const all = em.getAll();
      expect(all['STRING_VAR']).toBe('hello');
      expect(all['NUM_VAR']).toBe('42');
    });

    it('returns a copy, not a reference', () => {
      const all = em.getAll();
      all['STRING_VAR'] = 'modified';
      expect(em.get('STRING_VAR')).toBe('hello');
    });
  });

  describe('constructor defaults', () => {
    it('uses process.env when no env provided', () => {
      const em2 = new EnvironmentManager();
      // process.env always exists in Node
      expect(em2.getAll()).toBeDefined();
    });
  });
});
