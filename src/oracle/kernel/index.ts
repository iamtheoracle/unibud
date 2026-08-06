/**
 * Oracle Kernel — Public API
 *
 * Re-exports all public interfaces and implementations.
 */

export type {
  IOracle,
  IModule,
  ILogger,
  LogLevel,
  IConfigManager,
  IDependencyInjector,
  IHealthManager,
  IHealthCheck,
  HealthStatus,
  IErrorBoundary,
  IOracleError,
  ILifecycleManager,
  LifecycleStatus,
  ICapabilityRegistry,
  ICapability,
  IResourceRegistry,
  IResource,
  IModuleRegistry,
} from './types.js';

export { OracleLogger } from './logger.js';
export { OracleConfigManager } from './config.js';
export { OracleDependencyInjector } from './di.js';
export { OracleHealthManager } from './health.js';
export { OracleErrorBoundary } from './error-boundary.js';
export { OracleLifecycleManager } from './lifecycle.js';
export { OracleModuleRegistry } from './module-registry.js';
export { OracleCapabilityRegistry } from './capability-registry.js';
export { OracleResourceRegistry } from './resource-registry.js';
export { OracleKernel, oracle, ORACLE_VERSION } from './oracle-kernel.js';
