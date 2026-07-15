export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type HealthLevel = 'healthy' | 'degraded' | 'unhealthy';
export type LifecycleState = 'uninitialized' | 'initializing' | 'ready' | 'shutting-down' | 'shutdown';
export type ConfigValue = string | number | boolean | null | undefined | Record<string, unknown> | unknown[];

export interface HealthStatus {
  status: HealthLevel;
  message?: string;
  details?: Record<string, unknown>;
  timestamp?: Date;
}

export interface IModule {
  name: string;
  version: string;
  description?: string;
  initialize(oracle: IOracle): Promise<void>;
  shutdown?(): Promise<void>;
  health?(): Promise<HealthStatus>;
}

export interface IService {
  name: string;
  version: string;
  dependencies?: string[];
  initialize(config: unknown): Promise<void>;
  shutdown?(): Promise<void>;
  health?(): Promise<HealthStatus>;
}

export interface ICommand {
  id: string;
  source: string;
  action: string;
  payload?: unknown;
  timestamp: Date;
}

export interface IEvent {
  id: string;
  source: string;
  type: string;
  payload?: unknown;
  timestamp: Date;
}

export interface ConfigSchemaEntry {
  type?: 'string' | 'number' | 'boolean' | 'json';
  required?: boolean;
  defaultValue?: ConfigValue;
  validate?: (value: unknown) => boolean;
}

export interface EnvironmentLoadOptions {
  env?: Record<string, string | undefined>;
  envFileContents?: string;
  defaults?: Record<string, ConfigValue>;
  required?: string[];
  schema?: Record<string, ConfigSchemaEntry>;
}

export interface ConfigManagerOptions extends EnvironmentLoadOptions {
  fileConfig?: Record<string, unknown>;
  overrides?: Record<string, unknown>;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: unknown;
}

export interface ErrorRecord {
  timestamp: Date;
  error: Error;
  context?: unknown;
  recovered: boolean;
  recoveryKey?: string;
}

export interface DependencyDefinition {
  dependencies?: string[];
  singleton?: boolean;
  lazy?: boolean;
  metadata?: Record<string, unknown>;
}

export interface PluginCompatibility {
  kernel?: string;
}

export interface PluginModule extends IModule {
  compatibility?: PluginCompatibility;
}

export interface VersionInfo {
  kernel: string;
  modules: Record<string, string>;
  services: Record<string, string>;
  compatibility: {
    major: number;
  };
}

export interface BootstrapOptions extends ConfigManagerOptions {
  logLevel?: LogLevel;
}

export interface IOracle {
  getConfig(key: string): unknown;
  setConfig(key: string, value: unknown): void;
  registerModule(module: IModule): Promise<void>;
  registerService(service: IService): Promise<void>;
  getService(name: string): IService | undefined;
  getModule(name: string): IModule | undefined;
  resolveDependencies(dependencies: string[]): Promise<unknown[]>;
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getHealth(): Promise<HealthStatus>;
  getServiceHealth(serviceName: string): Promise<HealthStatus>;
  log(level: LogLevel, message: string, context?: unknown): void;
  handleError(error: Error, context?: unknown): void;
  registerPlugin(plugin: PluginModule): Promise<void>;
  emit(event: IEvent): void;
  execute(command: ICommand): Promise<unknown>;
}
