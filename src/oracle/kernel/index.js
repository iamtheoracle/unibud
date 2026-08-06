/**
 * Oracle Kernel — Public API
 *
 * This is the single entry point for all Oracle Kernel components.
 * Consumers should import exclusively from here rather than from
 * individual component files.
 *
 * Quick-start:
 *
 *   import { bootstrap, moduleRegistry, serviceRegistry } from '@/oracle/kernel';
 *
 *   const kernel = await bootstrap.initialize({
 *     config:   { app: { debug: true } },
 *     modules:  [{ id: 'academics', name: 'Academics' }],
 *     services: [],
 *   });
 *
 * See ORACLE_KERNEL_ARCHITECTURE.md for full documentation.
 */

// ── Bootstrap ────────────────────────────────────────────────────────────────
export { bootstrap } from './bootstrap.js';

// ── Configuration ─────────────────────────────────────────────────────────────
export { configManager } from './configManager.js';

// ── Dependency Registry ───────────────────────────────────────────────────────
export { dependencyRegistry } from './dependencyRegistry.js';

// ── Environment Loader ────────────────────────────────────────────────────────
export { environmentLoader } from './environmentLoader.js';

// ── Error Boundary ────────────────────────────────────────────────────────────
export { errorBoundary } from './errorBoundary.js';

// ── Health Manager ────────────────────────────────────────────────────────────
export { healthManager, HEALTH_STATUS } from './healthManager.js';

// ── Lifecycle Manager ─────────────────────────────────────────────────────────
export { lifecycleManager, LIFECYCLE_STATES } from './lifecycleManager.js';

// ── Logger ────────────────────────────────────────────────────────────────────
export { logger, LOG_LEVELS } from './logger.js';

// ── Module Registry ───────────────────────────────────────────────────────────
export { moduleRegistry } from './moduleRegistry.js';

// ── Plugin Registry ───────────────────────────────────────────────────────────
export { pluginRegistry } from './pluginRegistry.js';

// ── Service Registry ──────────────────────────────────────────────────────────
export { serviceRegistry } from './serviceRegistry.js';

// ── Version ───────────────────────────────────────────────────────────────────
export {
  ORACLE_KERNEL_VERSION,
  ORACLE_KERNEL_BUILD,
  COMPONENT_VERSIONS,
  getVersionInfo,
} from './version.js';
