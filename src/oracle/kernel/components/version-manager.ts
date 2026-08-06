import type { IVersionManager, IVersionInfo } from '../types/index';

const KERNEL_VERSION = '1.0.0';

class VersionInfo implements IVersionInfo {
  constructor(
    public readonly major: number,
    public readonly minor: number,
    public readonly patch: number,
    public readonly prerelease?: string,
  ) {}

  toString(): string {
    const base = `${this.major}.${this.minor}.${this.patch}`;
    return this.prerelease ? `${base}-${this.prerelease}` : base;
  }
}

export class VersionManager implements IVersionManager {
  private components = new Map<string, IVersionInfo>();
  private kernelVersion: IVersionInfo;

  constructor(kernelVersion = KERNEL_VERSION) {
    this.kernelVersion = this.parseVersion(kernelVersion);
  }

  getKernelVersion(): IVersionInfo {
    return this.kernelVersion;
  }

  getComponentVersion(component: string): IVersionInfo | undefined {
    return this.components.get(component);
  }

  registerComponentVersion(component: string, version: string): void {
    this.components.set(component, this.parseVersion(version));
  }

  isCompatible(version: string): boolean {
    try {
      const v = this.parseVersion(version);
      return v.major === this.kernelVersion.major;
    } catch {
      return false;
    }
  }

  parseVersion(version: string): IVersionInfo {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) {
      throw new Error(`Invalid version string: ${version}`);
    }
    return new VersionInfo(
      parseInt(match[1], 10),
      parseInt(match[2], 10),
      parseInt(match[3], 10),
      match[4],
    );
  }
}
