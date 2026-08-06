export class VersionManager {
  /** @param {{ kernelVersion: string }} options */
  constructor(options) {
    this.kernelVersion = options.kernelVersion;
    this.moduleVersions = new Map();
  }

  /** @param {string} moduleId @param {string} version */
  registerModuleVersion(moduleId, version) {
    this.moduleVersions.set(moduleId, version);
  }

  getKernelVersion() {
    return this.kernelVersion;
  }

  getModuleVersion(moduleId) {
    return this.moduleVersions.get(moduleId);
  }

  listModuleVersions() {
    return Object.fromEntries(this.moduleVersions.entries());
  }
}
