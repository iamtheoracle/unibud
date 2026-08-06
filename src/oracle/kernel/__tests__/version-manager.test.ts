import { describe, it, expect, beforeEach } from 'vitest';
import { VersionManager } from '../components/version-manager';

describe('VersionManager', () => {
  let vm: VersionManager;

  beforeEach(() => {
    vm = new VersionManager('1.2.3');
  });

  describe('getKernelVersion', () => {
    it('returns parsed kernel version', () => {
      const v = vm.getKernelVersion();
      expect(v.major).toBe(1);
      expect(v.minor).toBe(2);
      expect(v.patch).toBe(3);
    });

    it('toString returns semver string', () => {
      expect(vm.getKernelVersion().toString()).toBe('1.2.3');
    });

    it('defaults to 1.0.0', () => {
      const defaultVm = new VersionManager();
      expect(defaultVm.getKernelVersion().toString()).toBe('1.0.0');
    });
  });

  describe('parseVersion', () => {
    it('parses major.minor.patch', () => {
      const v = vm.parseVersion('2.3.4');
      expect(v.major).toBe(2);
      expect(v.minor).toBe(3);
      expect(v.patch).toBe(4);
      expect(v.prerelease).toBeUndefined();
    });

    it('parses prerelease versions', () => {
      const v = vm.parseVersion('1.0.0-alpha.1');
      expect(v.major).toBe(1);
      expect(v.prerelease).toBe('alpha.1');
      expect(v.toString()).toBe('1.0.0-alpha.1');
    });

    it('throws for invalid version string', () => {
      expect(() => vm.parseVersion('not-a-version')).toThrow('Invalid version string');
      expect(() => vm.parseVersion('1.2')).toThrow('Invalid version string');
    });
  });

  describe('isCompatible', () => {
    it('returns true for same major version', () => {
      expect(vm.isCompatible('1.0.0')).toBe(true);
      expect(vm.isCompatible('1.99.99')).toBe(true);
    });

    it('returns false for different major version', () => {
      expect(vm.isCompatible('2.0.0')).toBe(false);
      expect(vm.isCompatible('0.1.0')).toBe(false);
    });

    it('returns false for invalid version string', () => {
      expect(vm.isCompatible('invalid')).toBe(false);
    });
  });

  describe('registerComponentVersion / getComponentVersion', () => {
    it('registers and retrieves component version', () => {
      vm.registerComponentVersion('config', '2.1.0');
      const v = vm.getComponentVersion('config');
      expect(v).toBeDefined();
      expect(v!.major).toBe(2);
      expect(v!.minor).toBe(1);
    });

    it('returns undefined for unregistered component', () => {
      expect(vm.getComponentVersion('unknown')).toBeUndefined();
    });

    it('overwrites existing component version', () => {
      vm.registerComponentVersion('comp', '1.0.0');
      vm.registerComponentVersion('comp', '2.0.0');
      expect(vm.getComponentVersion('comp')!.major).toBe(2);
    });
  });
});
