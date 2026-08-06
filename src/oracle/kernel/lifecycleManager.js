/**
 * Oracle Kernel — Lifecycle Manager
 *
 * Orchestrates the ordered initialisation and graceful shutdown of
 * all platform services and modules. It maintains a state machine to
 * prevent invalid transitions and exposes lifecycle hooks for
 * before/after events.
 *
 * State Machine:
 *
 *   CREATED ──► INITIALIZING ──► RUNNING
 *                   │
 *                   ▼
 *                 ERROR
 *
 *   RUNNING ──► STOPPING ──► STOPPED
 *                  │
 *                  ▼
 *                ERROR
 *
 * Lifecycle Hook Phases (in order):
 *  - `before:initialize` – fired before any service is initialised
 *  - `after:initialize`  – fired after all services are initialised
 *  - `before:shutdown`   – fired before any service is shut down
 *  - `after:shutdown`    – fired after all services are shut down
 *
 * A "service" passed to `initialize()` / `shutdown()` must expose:
 *   - `id`                      {string}   – unique identifier
 *   - `initialize(options)`     {Function} – async or sync
 *   - `shutdown(options)`       {Function} – async or sync (optional)
 *
 * Usage:
 *   import { lifecycleManager, LIFECYCLE_STATES } from '@/oracle/kernel/lifecycleManager';
 *
 *   await lifecycleManager.initialize([authService, userService]);
 *   console.log(lifecycleManager.getState()); // 'running'
 *
 *   await lifecycleManager.shutdown([userService, authService]);
 *   console.log(lifecycleManager.getState()); // 'stopped'
 */

import { logger } from './logger.js';

const log = logger.child('lifecycleManager');

/** @enum {string} */
export const LIFECYCLE_STATES = Object.freeze({
  CREATED:      'created',
  INITIALIZING: 'initializing',
  RUNNING:      'running',
  STOPPING:     'stopping',
  STOPPED:      'stopped',
  ERROR:        'error',
});

/** Valid forward transitions for each state. */
const VALID_TRANSITIONS = {
  [LIFECYCLE_STATES.CREATED]:      [LIFECYCLE_STATES.INITIALIZING],
  [LIFECYCLE_STATES.INITIALIZING]: [LIFECYCLE_STATES.RUNNING, LIFECYCLE_STATES.ERROR],
  [LIFECYCLE_STATES.RUNNING]:      [LIFECYCLE_STATES.STOPPING],
  [LIFECYCLE_STATES.STOPPING]:     [LIFECYCLE_STATES.STOPPED, LIFECYCLE_STATES.ERROR],
  [LIFECYCLE_STATES.STOPPED]:      [LIFECYCLE_STATES.INITIALIZING],
  [LIFECYCLE_STATES.ERROR]:        [LIFECYCLE_STATES.INITIALIZING],
};

class LifecycleManager {
  constructor() {
    /** @type {string} */
    this._state = LIFECYCLE_STATES.CREATED;
    /**
     * @type {Record<string, Array<(options: *) => Promise<void>|void>>}
     */
    this._hooks = {
      'before:initialize': [],
      'after:initialize':  [],
      'before:shutdown':   [],
      'after:shutdown':    [],
    };
  }

  /** @returns {string} – current lifecycle state */
  getState() {
    return this._state;
  }

  /** @returns {boolean} */
  isRunning() {
    return this._state === LIFECYCLE_STATES.RUNNING;
  }

  /** @returns {boolean} */
  isReady() {
    return this._state === LIFECYCLE_STATES.RUNNING;
  }

  /**
   * Transitions to a new state, throwing when the transition is invalid.
   *
   * @param {string} newState
   * @private
   */
  _transition(newState) {
    const allowed = VALID_TRANSITIONS[this._state] ?? [];
    if (!allowed.includes(newState)) {
      throw new Error(
        `[OracleKernel:LifecycleManager] Invalid state transition: ` +
        `"${this._state}" → "${newState}".`
      );
    }
    log.debug('State transition', { from: this._state, to: newState });
    this._state = newState;
  }

  /**
   * Runs all hooks registered for `phase`.
   *
   * @param {string} phase
   * @param {*}      [options]
   * @private
   */
  async _runHooks(phase, options) {
    const handlers = this._hooks[phase] ?? [];
    for (const fn of handlers) {
      await fn(options);
    }
  }

  /**
   * Initialises each service in `services` in order.
   * Each service's `initialize(options)` method is called sequentially.
   *
   * @param {Array<{ id: string, initialize: Function }>} [services=[]]
   * @param {*} [options={}]
   * @returns {Promise<void>}
   * @throws {Error} on state transition failure or service init failure.
   */
  async initialize(services = [], options = {}) {
    this._transition(LIFECYCLE_STATES.INITIALIZING);
    log.info('Lifecycle: initializing', { serviceCount: services.length });

    try {
      await this._runHooks('before:initialize', options);

      for (const service of services) {
        if (typeof service?.initialize === 'function') {
          log.debug('Initializing service', { id: service.id ?? '(unknown)' });
          await service.initialize(options);
        }
      }

      await this._runHooks('after:initialize', options);
      this._transition(LIFECYCLE_STATES.RUNNING);
      log.info('Lifecycle: running');
    } catch (err) {
      this._state = LIFECYCLE_STATES.ERROR;
      log.error('Lifecycle initialization failed', err);
      throw err;
    }
  }

  /**
   * Shuts down each service in `services` in order.
   * Each service's `shutdown(options)` method is called sequentially.
   *
   * @param {Array<{ id: string, shutdown?: Function }>} [services=[]]
   * @param {*} [options={}]
   * @returns {Promise<void>}
   */
  async shutdown(services = [], options = {}) {
    this._transition(LIFECYCLE_STATES.STOPPING);
    log.info('Lifecycle: stopping', { serviceCount: services.length });

    try {
      await this._runHooks('before:shutdown', options);

      for (const service of services) {
        if (typeof service?.shutdown === 'function') {
          log.debug('Shutting down service', { id: service.id ?? '(unknown)' });
          await service.shutdown(options);
        }
      }

      await this._runHooks('after:shutdown', options);
      this._transition(LIFECYCLE_STATES.STOPPED);
      log.info('Lifecycle: stopped');
    } catch (err) {
      this._state = LIFECYCLE_STATES.ERROR;
      log.error('Lifecycle shutdown failed', err);
      throw err;
    }
  }

  /**
   * Registers a lifecycle hook handler.
   *
   * @param {'before:initialize'|'after:initialize'|'before:shutdown'|'after:shutdown'} phase
   * @param {(options: *) => Promise<void>|void} fn
   * @returns {LifecycleManager} – fluent interface.
   */
  addHook(phase, fn) {
    if (!this._hooks[phase]) {
      throw new Error(`[OracleKernel:LifecycleManager] Unknown lifecycle phase "${phase}".`);
    }
    if (typeof fn !== 'function') {
      throw new Error('[OracleKernel:LifecycleManager] Hook handler must be a function.');
    }
    this._hooks[phase].push(fn);
    return this;
  }

  /**
   * Removes a lifecycle hook handler.
   *
   * @param {string}   phase
   * @param {Function} fn
   * @returns {boolean}
   */
  removeHook(phase, fn) {
    const handlers = this._hooks[phase];
    if (!handlers) return false;
    const before = handlers.length;
    this._hooks[phase] = handlers.filter((h) => h !== fn);
    return this._hooks[phase].length < before;
  }

  /**
   * Resets the lifecycle manager back to CREATED state with no hooks.
   * Primarily useful in tests.
   */
  reset() {
    this._state = LIFECYCLE_STATES.CREATED;
    for (const phase of Object.keys(this._hooks)) {
      this._hooks[phase] = [];
    }
    log.debug('Lifecycle manager reset');
  }
}

/** Singleton instance — shared across the entire kernel. */
export const lifecycleManager = new LifecycleManager();
