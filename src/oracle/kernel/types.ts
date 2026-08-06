/**
 * Oracle Kernel — Core Type Definitions
 *
 * Domain-agnostic interfaces for the Oracle infrastructure layer.
 * No business domains (education, commerce, etc.) live here.
 */

// ─── Lifecycle ───────────────────────────────────────────────────────────────

export type LifecycleStatus =
  | 'uninitialized'
  | 'initializing'
  | 'running'
  | 'shutting_down'
  | 'stopped'
  | 'error';

// ─── Logger ──────────────────────────────────────────────────────────────────

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ILogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void;
  child(context: string): ILogger;
}

// ─── Config Manager ──────────────────────────────────────────────────────────

export interface IConfigManager {
  get<T = unknown>(key: string, defaultValue?: T): T;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
  getAll(): Record<string, unknown>;
}

// ─── Dependency Injector ─────────────────────────────────────────────────────

export interface IDependencyInjector {
  register<T>(token: string, instance: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
  unregister(token: string): void;
}

// ─── Health Manager ──────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface IHealthCheck {
  name: string;
  status: HealthStatus;
  message?: string;
  checkedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface IHealthManager {
  register(name: string, check: () => Promise<IHealthCheck> | IHealthCheck): void;
  unregister(name: string): void;
  check(name: string): Promise<IHealthCheck>;
  checkAll(): Promise<IHealthCheck[]>;
  getStatus(): Promise<HealthStatus>;
}

// ─── Error Boundary ──────────────────────────────────────────────────────────

export interface IOracleError {
  code: string;
  message: string;
  module?: string;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export interface IErrorBoundary {
  wrap<T>(fn: () => T | Promise<T>, context?: string): Promise<T>;
  createError(code: string, message: string, cause?: unknown): IOracleError;
}

// ─── Capability Registry ─────────────────────────────────────────────────────

export interface ICapability {
  name: string;
  provider: string;
  version: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface ICapabilityRegistry {
  register(capability: ICapability): void;
  unregister(name: string): void;
  has(name: string): boolean;
  get(name: string): ICapability | undefined;
  listByProvider(provider: string): ICapability[];
  listAll(): ICapability[];
}

// ─── Resource Registry ───────────────────────────────────────────────────────

export interface IResource {
  id: string;
  type: string;
  provider: string;
  name: string;
  metadata?: Record<string, unknown>;
  registeredAt: Date;
}

export interface IResourceRegistry {
  register(resource: Omit<IResource, 'registeredAt'>): void;
  unregister(id: string): void;
  has(id: string): boolean;
  get(id: string): IResource | undefined;
  listByType(type: string): IResource[];
  listByProvider(provider: string): IResource[];
  listAll(): IResource[];
}

// ─── Module Registry ─────────────────────────────────────────────────────────

export interface IModule {
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  initialize(oracle: IOracle): Promise<void>;
  shutdown(): Promise<void>;
}

export interface IModuleRegistry {
  register(module: IModule): Promise<void>;
  unregister(name: string): Promise<void>;
  has(name: string): boolean;
  get(name: string): IModule | undefined;
  listAll(): IModule[];
  initializeAll(oracle: IOracle): Promise<void>;
  shutdownAll(): Promise<void>;
}

// ─── Lifecycle Manager ───────────────────────────────────────────────────────

export interface ILifecycleManager {
  getStatus(): LifecycleStatus;
  onStart(handler: () => Promise<void> | void): void;
  onStop(handler: () => Promise<void> | void): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ─── Oracle Kernel ───────────────────────────────────────────────────────────

export interface IOracle {
  readonly version: string;

  // Core services
  readonly logger: ILogger;
  readonly config: IConfigManager;
  readonly dependencies: IDependencyInjector;
  readonly health: IHealthManager;
  readonly errors: IErrorBoundary;
  readonly lifecycle: ILifecycleManager;

  // Registries
  readonly modules: IModuleRegistry;
  readonly capabilities: ICapabilityRegistry;
  readonly resources: IResourceRegistry;

  // Bootstrap
  bootstrap(config?: Record<string, unknown>): Promise<void>;
  shutdown(): Promise<void>;
}
