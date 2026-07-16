export { OracleKernel } from './oracle-kernel';
export { bootstrap } from './components/bootstrap';

export { ConfigManager } from './components/config-manager';
export { EnvironmentManager } from './components/environment-manager';
export { DependencyInjector } from './components/dependency-injector';
export { ModuleRegistry } from './components/module-registry';
export { CapabilityRegistry } from './components/capability-registry';
export { LifecycleManager } from './components/lifecycle-manager';
export { HealthManager } from './components/health-manager';
export { Logger } from './components/logger';
export { ErrorBoundary } from './components/error-boundary';
export { PluginRegistrar } from './components/plugin-registrar';
export { VersionManager } from './components/version-manager';

export type {
  IOracle,
  IConfigManager,
  IEnvironmentManager,
  IModuleRegistry,
  ICapabilityRegistry,
  IDependencyInjector,
  ILifecycleManager,
  IHealthManager,
  ILogger,
  IErrorBoundary,
  IPluginRegistrar,
  IVersionManager,
  IVersionInfo,
  IModule,
  ICapability,
  IResource,
  ICommand,
  IEvent,
  IUser,
  IOrganization,
  IHealthCheck,
  IHealthCheckResult,
  HealthStatus,
  IPermission,
  IPermissionSet,
  IPlugin,
  LifecycleState,
  LogLevel,
} from './types/index';
