import type { IPlugin, IPluginRegistrar, IVersionManager } from '../types/index.ts';

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

function satisfies(range: string, version: string): boolean {
  const normalized = range.trim();
  if (!normalized || normalized === '*' || normalized.toLowerCase() === 'latest') {
    return true;
  }

  if (normalized.includes('||')) {
    return normalized.split('||').some((entry) => satisfies(entry.trim(), version));
  }

  if (normalized.startsWith('^')) {
    const base = normalized.slice(1);
    const [baseMajor] = parseVersion(base);
    const [versionMajor] = parseVersion(version);
    return baseMajor === versionMajor && compareVersions(version, base) >= 0;
  }

  if (normalized.startsWith('~')) {
    const base = normalized.slice(1);
    const [baseMajor, baseMinor] = parseVersion(base);
    const [versionMajor, versionMinor] = parseVersion(version);
    return baseMajor === versionMajor && baseMinor === versionMinor && compareVersions(version, base) >= 0;
  }

  if (normalized.startsWith('>=')) {
    return compareVersions(version, normalized.slice(2)) >= 0;
  }

  if (normalized.startsWith('<=')) {
    return compareVersions(version, normalized.slice(2)) <= 0;
  }

  return compareVersions(version, normalized) === 0;
}

export function createPluginRegistrar(versionManager: IVersionManager): IPluginRegistrar {
  const plugins = new Map<string, IPlugin>();

  return {
    async register(plugin: IPlugin): Promise<void> {
      if (!plugin.validate()) {
        throw new Error(`Plugin validation failed: ${plugin.name}`);
      }

      if (!this.isCompatible(plugin)) {
        throw new Error(`Plugin not compatible with kernel: ${plugin.name}`);
      }

      plugins.set(plugin.name, plugin);
    },

    async unregister(name: string): Promise<void> {
      const plugin = plugins.get(name);
      if (plugin?.shutdown) {
        await plugin.shutdown();
      }
      plugins.delete(name);
    },

    isCompatible(plugin: IPlugin): boolean {
      const kernelVersion = versionManager.getKernelVersion();
      return satisfies(plugin.compatibility(), kernelVersion);
    },

    getPlugins(): IPlugin[] {
      return [...plugins.values()];
    },
  };
}
