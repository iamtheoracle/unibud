/**
 * Oracle Kernel — Bootstrap
 *
 * The Bootstrap is the entry point for the entire Oracle Kernel. It
 * initialises every kernel component in the correct order, wires them
 * together, validates the resulting configuration, and transitions the
 * lifecycle into the RUNNING state.
 *
 * Initialisation Order:
 *   1. EnvironmentLoader  – make env vars available
 *   2. ConfigManager      – build and freeze configuration
 *   3. Logger             – apply configured log level
 *   4. ModuleRegistry     – seed built-in modules (if provided)
 *   5. ServiceRegistry    – seed built-in services (if provided)
 *   6. DependencyRegistry – register dependency relationships
 *   7. HealthManager      – register health checks
 *   8. ErrorBoundary      – register global error handlers
 *   9. PluginRegistry     – install plugins
 *  10. LifecycleManager   – run before/after hooks and initialize services
 *
 * Usage:
 *   import { bootstrap } from '@/oracle/kernel/bootstrap';
 *
 *   const kernel = await bootstrap.initialize({
 *     config: { app: { debug: true } },
 *     modules: [{ id: 'academics', name: 'Academics' }],
 *     services: [],
 *     plugins: [],
 *   });
 *
 *   console.log(kernel.version.getVersionInfo());
 *   console.log(kernel.health.getOverallStatus());
 *
 *   // On application teardown:
 *   await bootstrap.shutdown();
 */

import { environmentLoader }  from './environmentLoader.js';
import { configManager }      from './configManager.js';
import { logger }             from './logger.js';
import { moduleRegistry }     from './moduleRegistry.js';
import { serviceRegistry }    from './serviceRegistry.js';
import { dependencyRegistry } from './dependencyRegistry.js';
import { healthManager }      from './healthManager.js';
import { errorBoundary }      from './errorBoundary.js';
import { pluginRegistry }     from './pluginRegistry.js';
import { lifecycleManager }   from './lifecycleManager.js';
import { getVersionInfo }     from './version.js';

const log = logger.child('bootstrap');

class Bootstrap {
  constructor() {
    /** @type {boolean} */
    this._initialized = false;
    /** @type {object|null} */
    this._kernel = null;
  }

  /**
   * Initialises all Oracle Kernel components.
   *
   * @param {object} [options={}]
   * @param {object}   [options.config={}]      – Config overrides passed to ConfigManager.
   * @param {object[]} [options.modules=[]]     – Module descriptors to pre-register.
   * @param {object[]} [options.services=[]]    – Service descriptors to pre-register.
   * @param {object[]} [options.plugins=[]]     – Plugin descriptors to pre-register.
   * @param {object[]} [options.dependencies=[]] – Dependency declarations
   *                                               `{ id, deps }` pairs for DependencyRegistry.
   * @returns {Promise<object>} – The kernel object (all components accessible).
   */
  async initialize(options = {}) {
    if (this._initialized) {
      log.warn('Bootstrap.initialize() called more than once — returning existing kernel.');
      return this._kernel;
    }

    const {
      config       = {},
      modules      = [],
      services     = [],
      plugins      = [],
      dependencies = [],
    } = options;

    log.info('Oracle Kernel bootstrap starting …');

    // ── Step 1: Environment ───────────────────────────────────────────────
    environmentLoader.load();
    log.debug('EnvironmentLoader ready');

    // ── Step 2: Configuration ─────────────────────────────────────────────
    configManager.initialize(config);
    configManager.validate();
    configManager.freeze();
    log.debug('ConfigManager ready');

    // ── Step 3: Logger ────────────────────────────────────────────────────
    const logLevel = configManager.get('oracle.kernel.logLevel', 'info');
    logger.setLevel(logLevel);
    log.debug('Logger level set', { logLevel });

    // ── Step 4: Module Registry ───────────────────────────────────────────
    for (const mod of modules) {
      moduleRegistry.register(mod);
    }
    log.debug('ModuleRegistry seeded', { count: modules.length });

    // ── Step 5: Service Registry ──────────────────────────────────────────
    for (const svc of services) {
      serviceRegistry.register(svc);
    }
    log.debug('ServiceRegistry seeded', { count: services.length });

    // ── Step 6: Dependency Registry ───────────────────────────────────────
    for (const { id, deps = [] } of dependencies) {
      dependencyRegistry.register(id, deps);
    }
    log.debug('DependencyRegistry seeded', { count: dependencies.length });

    // ── Step 7: Health Manager ────────────────────────────────────────────
    // Kernel itself reports healthy after init
    healthManager.report('oracle:kernel', 'healthy');
    log.debug('HealthManager ready');

    // ── Step 8: Error Boundary ────────────────────────────────────────────
    // Install a default fallback that logs but does not re-throw
    errorBoundary.setFallback((err, ctx) => {
      log.error('Unhandled error caught by Error Boundary', { message: err?.message, context: ctx });
    });
    log.debug('ErrorBoundary ready');

    // ── Step 9: Plugin Registry ───────────────────────────────────────────
    for (const plugin of plugins) {
      pluginRegistry.register(plugin);
    }
    log.debug('PluginRegistry seeded', { count: plugins.length });

    // ── Step 10: Lifecycle Manager ────────────────────────────────────────
    // Resolve initialisation order from declared dependencies
    const initOrder = dependencyRegistry.size > 0
      ? dependencyRegistry.resolve()
      : [];

    const orderedServices = initOrder
      .map((id) => {
        const descriptor = serviceRegistry.get(id);
        return descriptor?.instance ?? null;
      })
      .filter(Boolean);

    await lifecycleManager.initialize(orderedServices);

    // ── Assemble the kernel object ────────────────────────────────────────
    this._kernel = {
      environment:  environmentLoader,
      config:       configManager,
      logger,
      modules:      moduleRegistry,
      services:     serviceRegistry,
      dependencies: dependencyRegistry,
      health:       healthManager,
      errors:       errorBoundary,
      plugins:      pluginRegistry,
      lifecycle:    lifecycleManager,
      version:      { getVersionInfo },
    };

    this._initialized = true;

    log.info('Oracle Kernel bootstrap complete', {
      version: getVersionInfo().kernel,
      modules: moduleRegistry.size,
      services: serviceRegistry.size,
    });

    return this._kernel;
  }

  /**
   * Gracefully shuts down the Oracle Kernel.
   *
   * @returns {Promise<void>}
   */
  async shutdown() {
    if (!this._initialized) {
      log.warn('Bootstrap.shutdown() called before initialize().');
      return;
    }

    log.info('Oracle Kernel shutdown starting …');

    // Shutdown services in reverse dependency order
    const initOrder = dependencyRegistry.size > 0
      ? dependencyRegistry.resolve()
      : [];
    const reverseOrder = [...initOrder].reverse();

    const orderedServices = reverseOrder
      .map((id) => {
        const descriptor = serviceRegistry.get(id);
        return descriptor?.instance ?? null;
      })
      .filter(Boolean);

    await lifecycleManager.shutdown(orderedServices);

    healthManager.report('oracle:kernel', 'unhealthy');
    this._initialized = false;
    this._kernel = null;

    log.info('Oracle Kernel shutdown complete');
  }

  /** @returns {boolean} */
  isInitialized() {
    return this._initialized;
  }

  /**
   * Returns the assembled kernel object, or `null` when the kernel
   * has not yet been initialised.
   *
   * @returns {object|null}
   */
  getKernel() {
    return this._kernel;
  }

  /**
   * Resets the bootstrap instance to its initial state.
   * Primarily useful in tests — prefer `shutdown()` in production.
   */
  reset() {
    this._initialized = false;
    this._kernel = null;
  }
}

/** Singleton instance — shared across the entire application. */
export const bootstrap = new Bootstrap();
