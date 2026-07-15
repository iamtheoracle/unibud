import type { IVersionInfo, IVersionManager } from '../types/index.ts';

interface MutableVersionManager extends IVersionManager {
  registerModuleVersion(name: string, version: string): void;
  registerComponentVersion(name: string, version: string): void;
}

function parseVersion(version: string): [number, number, number] {
  const [major = '0', minor = '0', patch = '0'] = version.replace(/^v/u, '').split('.');
  return [Number(major), Number(minor), Number(patch)];
}

function compareVersions(version1: string, version2: string): number {
  const a = parseVersion(version1);
  const b = parseVersion(version2);

  for (let index = 0; index < 3; index += 1) {
    if (a[index] > b[index]) {
      return 1;
    }
    if (a[index] < b[index]) {
      return -1;
    }
  }

  return 0;
}

export function createVersionManager(
  kernelVersion = '1.0.0',
  modules: Record<string, string> = {},
  components: Record<string, string> = {},
): IVersionManager {
  const moduleVersions = { ...modules };
  const componentVersions = { ...components };

  const manager: MutableVersionManager = {
    getKernelVersion(): string {
      return kernelVersion;
    },

    getModuleVersion(name: string): string | undefined {
      return moduleVersions[name];
    },

    getComponentVersion(name: string): string | undefined {
      return componentVersions[name];
    },

    getAll(): IVersionInfo {
      return {
        kernel: kernelVersion,
        modules: { ...moduleVersions },
        components: { ...componentVersions },
      };
    },

    isCompatible(version1: string, version2: string): boolean {
      const [majorA] = parseVersion(version1);
      const [majorB] = parseVersion(version2);
      return majorA === majorB && compareVersions(version1, version2) >= -1;
    },

    registerModuleVersion(name: string, version: string): void {
      moduleVersions[name] = version;
    },

    registerComponentVersion(name: string, version: string): void {
      componentVersions[name] = version;
    },
  };

  return manager;
}

export function asMutableVersionManager(versionManager: IVersionManager): MutableVersionManager | undefined {
  if (
    typeof (versionManager as Partial<MutableVersionManager>).registerModuleVersion === 'function' &&
    typeof (versionManager as Partial<MutableVersionManager>).registerComponentVersion === 'function'
  ) {
    return versionManager as MutableVersionManager;
  }

  return undefined;
}
