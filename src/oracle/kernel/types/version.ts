export interface IVersionInfo {
  kernel: string;
  modules: Record<string, string>;
  components: Record<string, string>;
}

export interface IVersionManager {
  getKernelVersion(): string;
  getModuleVersion(name: string): string | undefined;
  getComponentVersion(name: string): string | undefined;
  getAll(): IVersionInfo;
  isCompatible(version1: string, version2: string): boolean;
}
