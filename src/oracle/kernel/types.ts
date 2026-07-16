/**
 * Oracle Kernel — Core Type Definitions
 *
 * Infrastructure-only types. Zero business knowledge.
 * All domain-specific logic lives in registered modules.
 */

// ─── Generic Infrastructure Types ────────────────────────────────────────────

export interface IMetadata {
  [key: string]: unknown;
}

export interface ITimestamped {
  createdAt: Date;
  updatedAt: Date;
}

export interface IEntity extends ITimestamped {
  id: string;
}

// ─── Module Lifecycle ─────────────────────────────────────────────────────────

export type ModuleStatus = 'registered' | 'initializing' | 'active' | 'stopping' | 'stopped' | 'error';

export interface IModuleConfig {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  metadata?: IMetadata;
}

export interface IModule {
  readonly name: string;
  readonly version: string;
  initialize(oracle: IOracle): Promise<void>;
  shutdown(): Promise<void>;
}

// ─── Capability Registry ──────────────────────────────────────────────────────

export interface ICapability {
  name: string;
  description?: string;
  scope: 'global' | 'module';
  moduleOwner: string;
}

// ─── Oracle Kernel Interface ──────────────────────────────────────────────────

export interface IOracle {
  /** Register a module with the kernel */
  registerModule(module: IModule): Promise<void>;

  /** Retrieve a registered module by name */
  getModule<T extends IModule>(name: string): T | undefined;

  /** List all registered module names */
  listModules(): string[];

  /** Register a capability provided by a module */
  registerCapability(capability: ICapability): void;

  /** Check if a capability is available */
  hasCapability(name: string): boolean;

  /** Emit a lifecycle event */
  emit(event: string, payload?: unknown): void;

  /** Subscribe to lifecycle events */
  on(event: string, handler: (payload?: unknown) => void): void;
}

// ─── Bootstrap Options ────────────────────────────────────────────────────────

export interface IBootstrapOptions {
  modules?: IModule[];
  config?: IMetadata;
}
