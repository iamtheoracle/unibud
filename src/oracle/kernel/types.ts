/**
 * Oracle Kernel — Core Type Definitions
 *
 * These are the foundational interfaces for the Oracle Kernel infrastructure.
 * All modules, services, commands, events, and health checks implement these contracts.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────────────────────

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface IHealthStatus {
  status: HealthStatus;
  details?: string;
  timestamp: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Commands
// ─────────────────────────────────────────────────────────────────────────────

export interface ICommand {
  name: string;
  description: string;
  schema?: Record<string, unknown>;
}

export type CommandHandler = (payload: unknown) => Promise<unknown>;

// ─────────────────────────────────────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export interface IService {
  getCommands(): ICommand[];
  getEvents(): IEvent[];
  getHealth(): IHealthStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Module
// ─────────────────────────────────────────────────────────────────────────────

export interface IModuleMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
}

export interface IModule {
  metadata: IModuleMetadata;
  register(oracle: IOracle): void | Promise<void>;
  getHealth(): IHealthStatus;
}

// ─────────────────────────────────────────────────────────────────────────────
// Capability
// ─────────────────────────────────────────────────────────────────────────────

export interface ICapability {
  name: string;
  provider: string;
  description?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Permission
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// Identity
// ─────────────────────────────────────────────────────────────────────────────

export interface IOracleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────────────────────────────────────
// Oracle Services Interfaces
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// DI Container
// ─────────────────────────────────────────────────────────────────────────────

export interface IDIContainer {
  register<T>(token: string, instance: T): void;
  resolve<T>(token: string): T;
  has(token: string): boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Oracle (top-level kernel)
// ─────────────────────────────────────────────────────────────────────────────

export interface IOracle {
  modules: {
    register(module: IModule): Promise<void>;
    list(): IModule[];
  };
  dependencies: IDIContainer;
  events: IEventBus;
  capabilities: {
    register(capability: ICapability): void;
    list(): ICapability[];
  };
  identity: IIdentityService;
  authentication: IAuthenticationService;
  authorization: IAuthorizationService;
  permissions: IPermissionService;
  bootstrap(): Promise<void>;
  getHealth(): IHealthStatus;
}
