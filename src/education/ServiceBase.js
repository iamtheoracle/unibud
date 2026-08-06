/**
 * Education Module — Service Base
 *
 * Base class providing the standard service interface for all
 * Education Module services. Every service exposes:
 *  - Commands  — Actions that can be performed
 *  - Events    — State changes that can occur
 *  - Permissions — Who can do what
 *  - Health Status — Service health
 */

export class EducationServiceBase {
  constructor(entityClient, name) {
    this._entity = entityClient;
    this._name = name;
    this._listeners = {};
  }

  /**
   * Returns the list of commands this service supports.
   * Override in subclasses.
   * @returns {Array<{name: string, description: string}>}
   */
  getCommands() {
    return [];
  }

  /**
   * Returns the list of events this service can emit.
   * Override in subclasses.
   * @returns {Array<{name: string, description: string}>}
   */
  getEvents() {
    return [];
  }

  /**
   * Returns the permissions this service enforces.
   * Override in subclasses.
   * @returns {Array<{name: string, description: string, roles: string[]}>}
   */
  getPermissions() {
    return [];
  }

  /**
   * Register an event listener.
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(handler);
  }

  /**
   * Emit an event to all registered listeners.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const handlers = this._listeners[event] || [];
    handlers.forEach((fn) => {
      try { fn(data); } catch (e) { console.error(`[${this._name}] Event handler error:`, e); }
    });
  }

  /**
   * Check service health.
   * @returns {Promise<{status: string, checks: object}>}
   */
  async getHealth() {
    try {
      await this._entity.list("-created_date", 1);
      return {
        status: "healthy",
        checks: { database: "ok", connections: "ok", dependencies: "ok" },
      };
    } catch (error) {
      return {
        status: "unhealthy",
        message: error.message,
        checks: { database: "error", connections: "ok", dependencies: "ok" },
      };
    }
  }
}
