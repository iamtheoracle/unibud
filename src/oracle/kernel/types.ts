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

// ─── Health ───────────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface IHealthStatus {
  status: HealthStatus;
  details?: string;
  timestamp: Date;
}

// ─── Commands ─────────────────────────────────────────────────────────────────

export interface ICommand {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

export type CommandHandler = (payload: unknown) => Promise<unknown>;

// ─── Events ───────────────────────────────────────────────────────────────────

export interface IEvent {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

export interface IPublishedEvent {
  id: string;
  name: string;
  payload: unknown;
  timestamp: Date;
  source: string;
}

export type EventHandler = (event: IPublishedEvent) => void | Promise<void>;

// ─── Service ──────────────────────────────────────────────────────────────────

export interface IService {
  getCommands(): ICommand[];
  getEvents(): IEvent[];
  getHealth(): IHealthStatus;
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

export interface IModuleMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
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

// ─── Identity ─────────────────────────────────────────────────────────────────

export interface IOracleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

// ─── Permission ───────────────────────────────────────────────────────────────

export interface IPermission {
  id: string;
  name: string;
  description?: string;
  scope: 'platform' | 'module' | 'resource';
  createdAt: Date;
}

export interface IPermissionGrant {
  id: string;
  userId: string;
  permissionId: string;
  resourceId?: string;
  grantedAt: Date;
  expiresAt?: Date;
}

// ─── Oracle Services Interfaces ───────────────────────────────────────────────

export interface IIdentityService {
  createUser(email: string, firstName: string, lastName: string, role?: string): Promise<IOracleUser>;
  getUser(id: string): Promise<IOracleUser | undefined>;
  updateUser(id: string, data: Partial<IOracleUser>): Promise<IOracleUser>;
  listUsers(): Promise<IOracleUser[]>;
  activateUser(id: string): Promise<void>;
  deactivateUser(id: string): Promise<void>;
}

export interface IAuthSession {
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface IAuthenticationService {
  login(email: string, password: string): Promise<IAuthSession>;
  logout(token: string): Promise<void>;
  validateToken(token: string): Promise<IOracleUser | undefined>;
}

export interface IAuthorizationService {
  checkPermission(userId: string, permission: string, resourceId?: string): Promise<boolean>;
  assignRole(userId: string, role: string): Promise<void>;
  revokeRole(userId: string, role: string): Promise<void>;
}

export interface IPermissionService {
  definePermission(name: string, description: string, scope: IPermission['scope']): IPermission;
  getPermission(name: string): IPermission | undefined;
  listPermissions(): IPermission[];
  grantPermission(userId: string, permissionName: string, resourceId?: string): IPermissionGrant;
  revokePermission(userId: string, permissionName: string, resourceId?: string): void;
  checkPermission(userId: string, permissionName: string, resourceId?: string): boolean;
  getHealth(): IHealthStatus;
}

export interface IEventBus {
  publish(event: IPublishedEvent): void;
  subscribe(eventName: string, handler: EventHandler): () => void;
  unsubscribe(eventName: string, handler: EventHandler): void;
}

// ─── DI Container ─────────────────────────────────────────────────────────────

export interface IDIContainer {
  register<T>(token: string, instance: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
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
