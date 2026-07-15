import type { IVersionManager } from "../types/index.js";

const normalize = (value: string): [number, number, number] => {
  const [major = "0", minor = "0", patch = "0"] = value.split(".");
  return [Number(major), Number(minor), Number(patch)];
};

export class VersionManager implements IVersionManager {
  private readonly moduleVersions = new Map<string, string>();

  public constructor(public readonly kernelVersion: string) {}

  public registerModuleVersion(moduleName: string, version: string): void {
    this.moduleVersions.set(moduleName, version);
  }

  public getModuleVersion(moduleName: string): string | undefined {
    return this.moduleVersions.get(moduleName);
  }

  public isCompatible(version: string, requiredVersion: string): boolean {
    const [major, minor, patch] = normalize(version);
    const [requiredMajor, requiredMinor, requiredPatch] = normalize(requiredVersion);
    if (major !== requiredMajor) {
      return false;
    }
    if (minor > requiredMinor) {
      return true;
    }
    if (minor < requiredMinor) {
      return false;
    }
    return patch >= requiredPatch;
  }
}
