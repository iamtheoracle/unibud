/**
 * EPIC-01: Oracle-First Architecture
 *
 * Public API surface for the Oracle kernel and all sub-systems.
 *
 * Import from "@/lib/oracle" to access any Oracle capability:
 *
 *   import { oracle, OracleEvent, oracleEvents, CommandType, BaseService } from "@/lib/oracle";
 *
 * Subsystem modules:
 *   - OracleKernel  (TASK-001) — src/lib/oracle/OracleKernel.js
 *   - CommandSystem (TASK-002) — src/lib/oracle/CommandSystem.js
 *   - EventSystem   (TASK-003) — src/lib/oracle/EventSystem.js
 *   - ServiceLayer  (TASK-004) — src/lib/oracle/ServiceLayer.js
 *
 * The singleton `oracle` instance is created lazily the first time
 * `initOracle(base44Integration)` is called. Bud (TASK-005) calls this
 * during provider initialisation.
 */

export { OracleKernel, createOracleKernel }         from "./OracleKernel";
export { CommandParser, CommandRouter, CommandType } from "./CommandSystem";
export { EventBus, OracleEvent, oracleEvents }       from "./EventSystem";
export {
  BaseService, ServiceRegistry, LLMService,
  serviceSuccess, serviceError,
}                                                    from "./ServiceLayer";

// ─── Singleton management ─────────────────────────────────────────────────────

import { createOracleKernel } from "./OracleKernel";

/** @type {import('./OracleKernel').OracleKernel | null} */
let _oracle = null;

/**
 * Initialise the Oracle singleton. Must be called once during app bootstrap
 * before any Bud interaction can take place.
 *
 * @param {Object} base44Integration - base44.integrations.Core
 * @returns {import('./OracleKernel').OracleKernel}
 */
export function initOracle(base44Integration) {
  if (_oracle) return _oracle;
  _oracle = createOracleKernel(base44Integration);
  return _oracle;
}

/**
 * Retrieve the Oracle singleton. Throws if Oracle has not been initialised.
 *
 * @returns {import('./OracleKernel').OracleKernel}
 */
export function getOracle() {
  if (!_oracle) {
    throw new Error(
      "[Oracle] Oracle has not been initialised. Call initOracle(base44Integration) first."
    );
  }
  return _oracle;
}

/** Reset the singleton (test/demo use only). */
export function _resetOracle() {
  _oracle = null;
}
