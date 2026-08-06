/**
 * @typedef {{
 *  id: string;
 *  description?: string;
 *  metadata?: Record<string, unknown>;
 * }} Capability
 */

export class CapabilityRegistry {
  constructor() {
    /** @type {Map<string, Capability>} */
    this.capabilities = new Map();
  }

  /** @param {Capability} capability */
  register(capability) {
    if (!capability?.id) {
      throw new Error("Capability id is required");
    }

    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability already registered: ${capability.id}`);
    }

    this.capabilities.set(capability.id, capability);
  }

  /** @param {string} id */
  get(id) {
    return this.capabilities.get(id);
  }

  list() {
    return Array.from(this.capabilities.values());
  }
}
