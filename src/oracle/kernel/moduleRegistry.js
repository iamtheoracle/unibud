/**
 * @typedef {{
 *  id: string;
 *  version: string;
 *  metadata?: Record<string, unknown>;
 *  initialize?: () => Promise<void>|void;
 *  shutdown?: () => Promise<void>|void;
 * }} KernelModule
 */

export class ModuleRegistry {
  constructor() {
    /** @type {Map<string, KernelModule>} */
    this.modules = new Map();
  }

  /** @param {KernelModule} module */
  register(module) {
    if (!module?.id) {
      throw new Error("Module id is required");
    }

    if (this.modules.has(module.id)) {
      throw new Error(`Module already registered: ${module.id}`);
    }

    this.modules.set(module.id, module);
  }

  /** @param {string} id */
  get(id) {
    return this.modules.get(id);
  }

  list() {
    return Array.from(this.modules.values());
  }
}
