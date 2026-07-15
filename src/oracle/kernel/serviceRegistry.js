/**
 * @typedef {{
 *  id: string;
 *  implementation: unknown;
 *  metadata?: Record<string, unknown>;
 * }} RegisteredService
 */

export class ServiceRegistry {
  constructor() {
    /** @type {Map<string, RegisteredService>} */
    this.services = new Map();
  }

  /** @param {RegisteredService} service */
  register(service) {
    if (!service?.id) {
      throw new Error("Service id is required");
    }

    if (this.services.has(service.id)) {
      throw new Error(`Service already registered: ${service.id}`);
    }

    this.services.set(service.id, service);
  }

  /** @param {string} id */
  get(id) {
    return this.services.get(id);
  }

  list() {
    return Array.from(this.services.values());
  }
}
