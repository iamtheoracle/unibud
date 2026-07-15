export interface IModule {
  name: string;
  version: string;
  description?: string;
  initialize?(oracle: IOracle): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IOracle {
  moduleRegistry: IModuleRegistry;
  capabilityRegistry: ICapabilityRegistry;
  dependencyInjector: IDependencyInjector;
  configManager: IConfigManager;
  environmentManager: IEnvironmentManager;
  lifecycleManager: ILifecycleManager;
  healthManager: IHealthManager;
  logger: ILogger;
  errorBoundary: IErrorBoundary;
  pluginRegistrar: IPluginRegistrar;
  versionManager: IVersionManager;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IModuleRegistry {
  register(module: IModule): void;
  get(name: string): IModule | undefined;
  list(): IModule[];
  has(name: string): boolean;
}

export interface ICapability {
  name: string;
  version?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface ICapabilityRegistry {
  register(capability: ICapability): void;
  get(name: string): ICapability | undefined;
  list(): ICapability[];
  has(name: string): boolean;
}

export type DependencyToken<T = unknown> = string | symbol;

export interface IDependencyInjector {
  registerValue<T>(token: DependencyToken<T>, value: T): void;
  registerFactory<T>(token: DependencyToken<T>, factory: () => T, singleton?: boolean): void;
  resolve<T>(token: DependencyToken<T>): T;
  has(token: DependencyToken): boolean;
}

export interface IConfigManager {
  load(values: Record<string, unknown>): void;
  get<T = unknown>(key: string, fallback?: T): T | undefined;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
}

export interface IEnvironmentManager {
  get(key: string, fallback?: string): string | undefined;
  getRequired(key: string): string;
  getNumber(key: string, fallback?: number): number | undefined;
  getBoolean(key: string, fallback?: boolean): boolean | undefined;
}

export type LifecycleState = "created" | "initializing" | "running" | "shutting_down" | "stopped";

export interface ILifecycleManager {
  readonly state: LifecycleState;
  registerInitializable(initializer: () => Promise<void>): void;
  registerShutdownable(shutdown: () => Promise<void>): void;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export type HealthStatus = "healthy" | "degraded" | "unhealthy";

export interface IHealthCheckStatus {
  status: HealthStatus;
  message?: string;
  metadata?: Record<string, unknown>;
}

export interface IHealthReport {
  status: HealthStatus;
  checks: Record<string, IHealthCheckStatus>;
  timestamp: Date;
}

export interface IHealthManager {
  registerCheck(name: string, check: () => Promise<IHealthCheckStatus>): void;
  runChecks(): Promise<IHealthReport>;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface ILogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
}

export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  getEntries(): ILogEntry[];
}

export interface IErrorBoundary {
  execute<T>(operation: () => Promise<T>, context?: Record<string, unknown>): Promise<T>;
}

export interface IPlugin {
  name: string;
  version: string;
  compatibleWith?: string;
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IPluginRegistrar {
  register(plugin: IPlugin): void;
  list(): IPlugin[];
  initializeAll(): Promise<void>;
  shutdownAll(): Promise<void>;
}

export interface IVersionManager {
  readonly kernelVersion: string;
  registerModuleVersion(moduleName: string, version: string): void;
  getModuleVersion(moduleName: string): string | undefined;
  isCompatible(version: string, requiredVersion: string): boolean;
}
