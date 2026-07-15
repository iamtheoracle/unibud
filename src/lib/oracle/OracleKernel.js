/**
 * TASK-001: Oracle Kernel — Core Orchestration Engine
 *
 * Oracle is the operating system of UNIBUD. Every request flows through
 * Oracle. Every decision is made by Oracle.
 *
 * Architectural contract:
 *   User → Bud → Oracle → Services → Data → Oracle → Bud → User
 *
 * Responsibilities:
 *   1. Receive and validate requests
 *   2. Build and propagate request context
 *   3. Route requests through the Command System
 *   4. Delegate to the Service Layer
 *   5. Manage per-session state
 *   6. Emit lifecycle events
 *   7. Enforce governance rules
 *   8. Return structured responses to the caller (Bud)
 *
 * Oracle is a singleton. One instance per application session.
 */

import { CommandParser, CommandRouter, CommandType } from "./CommandSystem";
import { oracleEvents, OracleEvent }                 from "./EventSystem";
import {
  ServiceRegistry, LLMService, serviceError,
}                                                      from "./ServiceLayer";

// ─── Request / Response shapes ────────────────────────────────────────────────

/**
 * @typedef {Object} OracleRequest
 * @property {string}   text        - Raw user input
 * @property {Object}   [user]      - Authenticated user from base44.auth.me()
 * @property {Object}   [screen]    - Screen context from budScreenContext
 * @property {string[]} [fileUrls]  - Attached file URLs
 * @property {string}   [sessionId] - Caller-supplied session identifier
 */

/**
 * @typedef {Object} OracleResponse
 * @property {boolean}  success    - Whether Oracle produced a usable response
 * @property {string}   content    - Response text (always present; fallback on error)
 * @property {string[]} agentIds   - Agent IDs that participated in this response
 * @property {string}   requestId  - Unique ID for this request (for audit / correlation)
 * @property {number}   latencyMs  - Total processing time in milliseconds
 * @property {string}   [error]    - Error description (when success === false)
 */

// ─── Governance rules ─────────────────────────────────────────────────────────

const GOVERNANCE = Object.freeze({
  /** Maximum text length Oracle will process (chars). Longer inputs are truncated. */
  MAX_INPUT_LENGTH: 4000,
  /** Fallback message returned when Oracle cannot produce a response. */
  FALLBACK_MESSAGE:
    "I'm having trouble connecting right now. Let's try again in a moment!",
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _requestCounter = 0;
function newRequestId() {
  _requestCounter += 1;
  return `oracle-req-${Date.now()}-${_requestCounter}`;
}

// ─── OracleKernel ─────────────────────────────────────────────────────────────

export class OracleKernel {
  /**
   * @param {{ llmFn: (prompt: string, fileUrls?: string[]) => Promise<string> }} opts
   */
  constructor({ llmFn }) {
    if (typeof llmFn !== "function") {
      throw new Error("[OracleKernel] llmFn must be a function");
    }

    this._router   = new CommandRouter();
    this._registry = new ServiceRegistry();
    this._state    = new Map();  // sessionId → Map<key, value>
    this._llmFn    = llmFn;

    this._initialise();
  }

  // ─── Initialisation ────────────────────────────────────────────────────────

  _initialise() {
    // Register the LLM service as the universal handler
    const llmService = new LLMService(this._llmFn);
    this._registry.register(llmService);

    // Wire every CommandType to the LLM service via the router
    for (const type of Object.values(CommandType)) {
      this._router.registerHandler(type, (command, ctx) => {
        const service = this._registry.resolve(command.type) || llmService;
        return service.handle(command, ctx).then((result) => {
          oracleEvents.emit(OracleEvent.SERVICE_RESPONDED, {
            requestId: command.requestId,
            serviceId: service.id,
            success:   result.success,
          });
          return result.success
            ? result.content
            : Promise.reject(new Error(result.error));
        });
      });
    }
  }

  // ─── Core: process ─────────────────────────────────────────────────────────

  /**
   * The single entry point for all UNIBUD requests.
   *
   * @param {OracleRequest}               request
   * @param {(prompt: string) => string}  promptBuilder  - Injects Bud's prompt construction
   * @returns {Promise<OracleResponse>}
   */
  async process(request, promptBuilder) {
    const start     = Date.now();
    const requestId = newRequestId();
    const text      = this._sanitise(request.text);

    // ── 1. Emit: REQUEST_RECEIVED ─────────────────────────────────────────
    oracleEvents.emit(OracleEvent.REQUEST_RECEIVED, {
      requestId,
      text,
      sessionId: request.sessionId,
      ts:        start,
    });

    try {
      // ── 2. Parse text → Command ─────────────────────────────────────────
      const command = CommandParser.parse(
        text,
        requestId,
        request.screen,
        request.fileUrls || []
      );

      oracleEvents.emit(OracleEvent.COMMAND_PARSED, {
        requestId,
        commandType: command.type,
        agentIds:    command.agentIds,
      });

      // ── 3. Activate agents (event only — no side-effect here) ───────────
      oracleEvents.emit(OracleEvent.AGENT_ACTIVATED, {
        requestId,
        agentIds: command.agentIds,
      });

      oracleEvents.emit(OracleEvent.REQUEST_ROUTED, {
        requestId,
        commandType: command.type,
      });

      // ── 4. Build the LLM prompt via the injected prompt builder ─────────
      let prompt;
      try {
        prompt = promptBuilder(command, request.user);
      } catch (promptErr) {
        throw new Error(`Prompt construction failed: ${promptErr?.message}`);
      }

      // ── 5. Execute via Command Router → Service Layer ───────────────────
      const serviceCtx = {
        prompt,
        user:    request.user,
        state:   this._getSessionState(request.sessionId),
      };

      const content = await this._router.route(command, serviceCtx);

      // ── 6. Update session state ─────────────────────────────────────────
      this._setSessionState(request.sessionId, "lastRequestId", requestId);
      this._setSessionState(request.sessionId, "lastAgentIds",  command.agentIds);

      const latencyMs = Date.now() - start;

      // ── 7. Emit: REQUEST_COMPLETED ──────────────────────────────────────
      oracleEvents.emit(OracleEvent.REQUEST_COMPLETED, {
        requestId,
        latencyMs,
        agentIds: command.agentIds,
      });

      oracleEvents.emit(OracleEvent.AGENT_COMPLETED, {
        requestId,
        agentIds: command.agentIds,
      });

      return this._buildResponse({
        success: true,
        content,
        agentIds: command.agentIds,
        requestId,
        latencyMs,
      });

    } catch (err) {
      const latencyMs = Date.now() - start;

      oracleEvents.emit(OracleEvent.REQUEST_FAILED, {
        requestId,
        error: err?.message,
        latencyMs,
      });

      oracleEvents.emit(OracleEvent.ERROR, {
        requestId,
        error: err?.message,
      });

      return this._buildResponse({
        success:  false,
        content:  GOVERNANCE.FALLBACK_MESSAGE,
        agentIds: [],
        requestId,
        latencyMs,
        error:    err?.message,
      });
    }
  }

  // ─── State management ──────────────────────────────────────────────────────

  /**
   * Read a value from session-scoped state.
   * @param {string} [sessionId]
   * @param {string} key
   * @returns {unknown}
   */
  getState(sessionId, key) {
    return this._getSessionState(sessionId)?.get(key);
  }

  /**
   * Write a value into session-scoped state.
   * @param {string} [sessionId]
   * @param {string} key
   * @param {unknown} value
   */
  setState(sessionId, key, value) {
    this._setSessionState(sessionId, key, value);
    oracleEvents.emit(OracleEvent.STATE_UPDATED, { sessionId, key });
  }

  /** Clear all state for a session (e.g. on conversation reset). */
  clearSession(sessionId) {
    this._state.delete(sessionId);
  }

  // ─── Service registration (public) ────────────────────────────────────────

  /**
   * Allow external services to register with Oracle at runtime.
   * @param {import('./ServiceLayer').BaseService} service
   * @param {{ overwrite?: boolean }} [opts]
   */
  registerService(service, opts) {
    this._registry.register(service, opts);
    // Re-wire the router so new registrations take effect immediately
    const llmService = this._registry.get("llm_service");
    for (const type of service.commandTypes) {
      this._router.registerHandler(type, (command, ctx) => {
        const resolved = this._registry.resolve(command.type) || llmService;
        return resolved.handle(command, ctx).then((result) => {
          return result.success
            ? result.content
            : Promise.reject(new Error(result.error));
        });
      });
    }
  }

  /** @returns {Object} Snapshot of registered services (for diagnostics). */
  describeServices() {
    return this._registry.describe();
  }

  // ─── Private helpers ───────────────────────────────────────────────────────

  _sanitise(text) {
    const t = (text || "").trim();
    return t.length > GOVERNANCE.MAX_INPUT_LENGTH
      ? t.slice(0, GOVERNANCE.MAX_INPUT_LENGTH)
      : t;
  }

  _getSessionState(sessionId) {
    const key = sessionId || "__default__";
    if (!this._state.has(key)) {
      this._state.set(key, new Map());
    }
    return this._state.get(key);
  }

  _setSessionState(sessionId, key, value) {
    this._getSessionState(sessionId).set(key, value);
  }

  _buildResponse({ success, content, agentIds, requestId, latencyMs, error }) {
    return Object.freeze({
      success,
      content,
      agentIds: agentIds || [],
      requestId,
      latencyMs,
      ...(error ? { error } : {}),
    });
  }
}

// ─── Factory — create a kernel backed by the Base44 LLM ───────────────────────

/**
 * Create and return an OracleKernel wired to the Base44 InvokeLLM integration.
 *
 * @param {Object} base44Integration - base44.integrations.Core
 * @returns {OracleKernel}
 */
export function createOracleKernel(base44Integration) {
  const llmFn = async (prompt, fileUrls = []) => {
    const opts = fileUrls.length > 0 ? { prompt, file_urls: fileUrls } : { prompt };
    return base44Integration.InvokeLLM(opts);
  };
  return new OracleKernel({ llmFn });
}

// ─── Oracle error result helpers ─────────────────────────────────────────────
// Re-exported for callers that need to construct error results manually.
export { serviceError };
