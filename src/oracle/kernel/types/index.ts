// Re-export leaf types (no oracle dependency)
export * from './resource';
export * from './command';
export * from './event';
export * from './user';
export * from './organization';
export * from './permission';

// Import + re-export types that are also used locally in this file
export type { ICapability, ICapabilityRegistry } from './capability';
export type { HealthStatus, IHealthCheckResult, IHealthCheck, IHealthManager } from './health';

// Local imports for use in interface definitions below
import type { ICapabilityRegistry } from './capability';
import type { IHealthManager } from './health';

// --- Manager interfaces (no oracle dependency) ---

export interface IConfigManager {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
  getAll(): Record<string, unknown>;
  load(config: Record<string, unknown>): void;
}

export interface IEnvironmentManager {
  get(key: string, defaultValue?: string): string | undefined;
  getRequired(key: string): string;
  getBoolean(key: string, defaultValue?: boolean): boolean;
  getNumber(key: string, defaultValue?: number): number | undefined;
  has(key: string): boolean;
  getAll(): Record<string, string | undefined>;
}

export interface IDependencyInjector {
  register<T>(token: string, factory: () => T): void;
  registerSingleton<T>(token: string, factory: () => T): void;
  registerValue<T>(token: string, value: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
  unregister(token: string): boolean;
}

export type LifecycleState =
  | 'uninitialized'
  | 'initializing'
  | 'ready'
  | 'shutting-down'
  | 'shutdown'
  | 'error';

export interface ILifecycleManager {
  getState(): LifecycleState;
  onStateChange(handler: (state: LifecycleState) => void): () => void;
  transitionTo(state: LifecycleState): void;
  isReady(): boolean;
  addInitializer(name: string, fn: () => Promise<void>, priority?: number): void;
  addShutdownHandler(name: string, fn: () => Promise<void>, priority?: number): void;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>): void;
  child(context: Record<string, unknown>): ILogger;
  setLevel(level: LogLevel): void;
  getLevel(): LogLevel;
}

export interface IErrorBoundary {
  wrap<T>(fn: () => T | Promise<T>, context?: Record<string, unknown>): Promise<T>;
  handle(error: unknown, context?: Record<string, unknown>): void;
  onError(handler: (error: Error, context?: Record<string, unknown>) => void): () => void;
  clearHandlers(): void;
}

export interface IVersionInfo {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  toString(): string;
}

export interface IVersionManager {
  getKernelVersion(): IVersionInfo;
  getComponentVersion(component: string): IVersionInfo | undefined;
  registerComponentVersion(component: string, version: string): void;
  isCompatible(version: string): boolean;
  parseVersion(version: string): IVersionInfo;
}

// --- Types that reference IOracle (forward references work within one file) ---

export interface IModule {
  name: string;
  version: string;
  description?: string;
  initialize?(oracle: IOracle): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IModuleRegistry {
  register(module: IModule): void;
  get(name: string): IModule | undefined;
  getAll(): IModule[];
  has(name: string): boolean;
  unregister(name: string): boolean;
}

export interface IPlugin {
  id: string;
  name: string;
  version: string;
  minOracleVersion?: string;
  initialize?(oracle: IOracle): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IPluginRegistrar {
  register(plugin: IPlugin): Promise<void>;
  unregister(id: string): Promise<boolean>;
  get(id: string): IPlugin | undefined;
  getAll(): IPlugin[];
  has(id: string): boolean;
  isCompatible(plugin: IPlugin): boolean;
}

export interface IOracle {
  config: IConfigManager;
  environment: IEnvironmentManager;
  modules: IModuleRegistry;
  capabilities: ICapabilityRegistry;
  dependencies: IDependencyInjector;
  lifecycle: ILifecycleManager;
  health: IHealthManager;
  logger: ILogger;
  errors: IErrorBoundary;
  plugins: IPluginRegistrar;
  version: IVersionManager;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  isReady(): boolean;
}
