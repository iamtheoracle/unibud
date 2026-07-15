import type { ICapabilityRegistry } from './capability.ts';
import type { IHealthManager } from './health.ts';
import type { ILogger } from './logger.ts';
import type { IModuleRegistry, IPluginRegistrar } from './module.ts';
import type { IVersionManager } from './version.ts';

export interface IConfigManager {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: unknown): void;
  getAll(): Record<string, unknown>;
  validate(schema: (value: Record<string, unknown>) => boolean): boolean;
}

export interface IEnvironmentManager {
  get(key: string, defaultValue?: string): string | undefined;
  getAsNumber(key: string, defaultValue?: number): number | undefined;
  getAsBoolean(key: string, defaultValue?: boolean): boolean | undefined;
  require(key: string): string;
  getAll(): Record<string, string | undefined>;
}

export interface RegistrationOptions {
  singleton?: boolean;
  factory?: (...dependencies: unknown[]) => unknown;
  dependencies?: string[];
}

export interface IDependencyInjector {
  register(name: string, dependency: unknown, options?: RegistrationOptions): void;
  resolve<T = unknown>(name: string): T;
  resolveAll<T = unknown>(names: string[]): T[];
  has(name: string): boolean;
  clear(): void;
}

export type LifecycleState = 'uninitialized' | 'initializing' | 'ready' | 'shutting_down' | 'shutdown';

export interface ILifecycleManager {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getState(): LifecycleState;
  isReady(): boolean;
  onInitialize(callback: () => Promise<void>): void;
  onShutdown(callback: () => Promise<void>): void;
}

export interface IErrorContext {
  component?: string;
  operation?: string;
  context?: unknown;
  timestamp?: Date;
}

export interface IErrorBoundary {
  catch(error: Error, context?: IErrorContext): void;
  handle<T>(fn: () => Promise<T>, context?: IErrorContext): Promise<T>;
  onError(callback: (error: Error, context?: IErrorContext) => void): void;
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

export interface IBootstrapped {
  oracle: IOracle;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
}

export type { ICapability, ICapabilityRegistry } from './capability.ts';
export type { IHealthCheck, IHealthManager, IHealthReport, HealthStatus } from './health.ts';
export type { ILogger, LogLevel } from './logger.ts';
export type { IModule, IModuleRegistry, IPlugin, IPluginRegistrar } from './module.ts';
export type { IVersionInfo, IVersionManager } from './version.ts';
