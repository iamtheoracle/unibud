/**
 * TASK-004: Oracle Service Layer Pattern
 *
 * Defines the contract that every UNIBUD service must fulfil to integrate
 * with Oracle. Services are passive — they only execute when Oracle calls
 * them. They never call Oracle directly, and they never communicate with
 * one another.
 *
 * Pattern:
 *   1. Extend BaseService
 *   2. Implement handle(command, ctx)
 *   3. Register with ServiceRegistry
 *
 * Oracle discovers services through the registry and delegates commands to
 * the appropriate service based on CommandType.
 */

import { CommandType } from "./CommandSystem";

// ─── BaseService ──────────────────────────────────────────────────────────────

/**
 * Abstract base class for all Oracle services.
 *
 * Every service must declare:
 *   - id          Unique service identifier
 *   - name        Human-readable display name
 *   - commandTypes The CommandTypes this service can handle
 *
 * Every service must implement:
 *   - handle(command, ctx) → Promise<ServiceResult>
 */
export class BaseService {
  constructor({ id, name, commandTypes = [] }) {
    if (!id) throw new Error("BaseService: 'id' is required");
    if (!name) throw new Error("BaseService: 'name' is required");

    this.id = id;
    this.name = name;
    this.commandTypes = commandTypes;
    this._enabled = true;
  }

  /**
   * Process an OracleCommand and return a ServiceResult.
   * Subclasses MUST override this method.
   *
   * @param {import('./CommandSystem').OracleCommand} _command
   * @param {Object} _ctx
   * @returns {Promise<ServiceResult>}
   */
  // eslint-disable-next-line no-unused-vars
  async handle(_command, _ctx) {
    throw new Error(`[Oracle:Service:${this.id}] handle() not implemented`);
  }

  /** Whether this service is currently accepting requests. */
  get isEnabled() {
    return this._enabled;
  }

  enable()  { this._enabled = true; }
  disable() { this._enabled = false; }

  /** Serialisable service descriptor (for debug / admin views). */
  toDescriptor() {
    return {
      id:           this.id,
      name:         this.name,
      commandTypes: this.commandTypes,
      enabled:      this._enabled,
    };
  }
}

// ─── ServiceResult ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ServiceResult
 * @property {boolean}     success   - Whether the operation succeeded
 * @property {string}      [content] - Response content (on success)
 * @property {string}      [error]   - Error message (on failure)
 * @property {Object}      [meta]    - Optional structured metadata
 */

/**
 * Construct a successful ServiceResult.
 * @param {string} content
 * @param {Object} [meta]
 * @returns {ServiceResult}
 */
export function serviceSuccess(content, meta) {
  return Object.freeze({ success: true, content, meta: meta || null });
}

/**
 * Construct a failed ServiceResult.
 * @param {string} error
 * @returns {ServiceResult}
 */
export function serviceError(error) {
  return Object.freeze({ success: false, error });
}

// ─── ServiceRegistry ─────────────────────────────────────────────────────────

/**
 * Central registry for all Oracle services.
 *
 * Oracle uses the registry to discover which service should handle a given
 * CommandType. Registration is first-come, first-served per CommandType unless
 * overwrite: true is passed.
 */
export class ServiceRegistry {
  constructor() {
    /** @type {Map<string, BaseService>} serviceId → service */
    this._services = new Map();

    /** @type {Map<string, string>} commandType → serviceId */
    this._routing = new Map();
  }

  /**
   * Register a service with the registry.
   *
   * @param {BaseService} service
   * @param {{ overwrite?: boolean }} [opts]
   */
  register(service, { overwrite = false } = {}) {
    if (!(service instanceof BaseService)) {
      throw new Error("[Oracle:ServiceRegistry] Service must extend BaseService");
    }

    this._services.set(service.id, service);

    for (const commandType of service.commandTypes) {
      if (this._routing.has(commandType) && !overwrite) continue;
      this._routing.set(commandType, service.id);
    }
  }

  /**
   * Look up the service responsible for a CommandType.
   * Returns null when no service handles the type (Oracle falls back to LLM).
   *
   * @param {string} commandType
   * @returns {BaseService|null}
   */
  resolve(commandType) {
    const serviceId = this._routing.get(commandType);
    if (!serviceId) return null;
    const service = this._services.get(serviceId);
    return service?.isEnabled ? service : null;
  }

  /**
   * Retrieve a registered service by its id.
   * @param {string} serviceId
   * @returns {BaseService|undefined}
   */
  get(serviceId) {
    return this._services.get(serviceId);
  }

  /** @returns {BaseService[]} All registered services */
  list() {
    return Array.from(this._services.values());
  }

  /** Human-readable summary of registered services and their routing. */
  describe() {
    return {
      services: this.list().map((s) => s.toDescriptor()),
      routing:  Object.fromEntries(this._routing),
    };
  }
}

// ─── Built-in LLM Service ────────────────────────────────────────────────────

/**
 * The default Oracle service — delegates to the Base44 LLM integration.
 * Registered for all CommandTypes so it acts as the universal fallback.
 *
 * Accepts any command Oracle cannot route to a more specific service.
 */
export class LLMService extends BaseService {
  constructor(llmFn) {
    super({
      id: "llm_service",
      name: "Oracle LLM Service",
      commandTypes: Object.values(CommandType),
    });
    this._llm = llmFn;
  }

  /**
   * @param {import('./CommandSystem').OracleCommand} command
   * @param {{ prompt: string }} ctx
   * @returns {Promise<ServiceResult>}
   */
  async handle(command, ctx) {
    try {
      const content = await this._llm(ctx.prompt, command.fileUrls);
      return serviceSuccess(content);
    } catch (err) {
      return serviceError(err?.message || "LLM call failed");
    }
  }
}
