# Oracle Kernel Architecture

> **Version:** 1.0.0  
> **Location:** `src/oracle/kernel/`  
> **Task:** UNIBUD EPIC-01 / TASK-001

---

## Table of Contents

1. [Overview](#1-overview)
2. [Design Principles](#2-design-principles)
3. [Component Map](#3-component-map)
4. [Initialisation Flow](#4-initialisation-flow)
5. [Component Reference](#5-component-reference)
   - 5.1 [Version](#51-version)
   - 5.2 [Environment Loader](#52-environment-loader)
   - 5.3 [Configuration Manager](#53-configuration-manager)
   - 5.4 [Logger](#54-logger)
   - 5.5 [Module Registry](#55-module-registry)
   - 5.6 [Service Registry](#56-service-registry)
   - 5.7 [Dependency Registry](#57-dependency-registry)
   - 5.8 [Health Manager](#58-health-manager)
   - 5.9 [Error Boundary](#59-error-boundary)
   - 5.10 [Plugin Registry](#510-plugin-registry)
   - 5.11 [Lifecycle Manager](#511-lifecycle-manager)
   - 5.12 [Bootstrap](#512-bootstrap)
6. [Integration Guide](#6-integration-guide)
7. [Public API Reference](#7-public-api-reference)
8. [Architectural Decisions](#8-architectural-decisions)
9. [File Inventory](#9-file-inventory)
10. [Risk Assessment](#10-risk-assessment)

---

## 1. Overview

The **Oracle Kernel** is the operating system of the UNIBUD platform. Every service, module, and plugin integrates with it. It provides:

- A **unified bootstrap** that initialises the entire platform in the correct order.
- **Registries** for modules, services, dependencies, and plugins.
- **Cross-cutting concerns** — logging, health monitoring, error handling, and configuration — all in one place.
- A **lifecycle state machine** that prevents invalid startup/shutdown sequences.

The Kernel is deliberately **UI-free and framework-agnostic**. It is pure JavaScript and can be consumed by any part of the application — React components, hooks, utility functions, or future server-side code.

---

## 2. Design Principles

| Principle | How the Kernel applies it |
|-----------|--------------------------|
| **Single Responsibility** | Each component owns exactly one concern. |
| **Singleton by default** | Every component is exported as a module-level singleton so callers share state without prop drilling. |
| **Fluent interface** | Mutating methods return `this`, enabling method chaining. |
| **Fail early** | Missing required fields and invalid state transitions throw immediately with descriptive messages. |
| **Fail safe** | The Error Boundary and HealthManager absorb errors so one failing service cannot crash the whole platform. |
| **Zero runtime dependencies** | The Kernel imports nothing outside its own directory except the Vite `import.meta.env` global. |
| **Testable** | Every singleton exposes a `reset()` / `clear()` method for isolation in tests. |
| **Well documented** | Every public method has JSDoc. Every file has a usage example at the top. |

---

## 3. Component Map

```
src/oracle/kernel/
├── index.js              ← Public API (re-exports everything)
├── bootstrap.js          ← System initialisation entry point
├── version.js            ← Version constants and inspection
├── environmentLoader.js  ← Safe Vite env-var access
├── configManager.js      ← Multi-layer configuration
├── logger.js             ← Namespace-aware logging
├── moduleRegistry.js     ← Platform module catalogue
├── serviceRegistry.js    ← Runtime service catalogue
├── dependencyRegistry.js ← Dependency graph & topo-sort
├── healthManager.js      ← Per-component health monitoring
├── errorBoundary.js      ← Error routing & cascades prevention
├── pluginRegistry.js     ← Dynamic plugin & hook system
└── lifecycleManager.js   ← Init / shutdown state machine
```

**Dependency graph between kernel components:**

```
environmentLoader
      │
      ▼
configManager ──► logger
      │              │
      ▼              ▼
moduleRegistry   (used by all)
serviceRegistry
dependencyRegistry
healthManager
errorBoundary
pluginRegistry
lifecycleManager
      │
      ▼
   bootstrap  (wires everything together)
```

---

## 4. Initialisation Flow

`bootstrap.initialize(options)` runs the following steps in order:

```
1  environmentLoader.load()           // read import.meta.env
2  configManager.initialize(config)   // merge defaults + env + overrides
   configManager.validate()           // run registered validators
   configManager.freeze()             // prevent further mutation
3  logger.setLevel(logLevel)          // apply configured level
4  moduleRegistry.register(...)       // seed built-in modules
5  serviceRegistry.register(...)      // seed built-in services
6  dependencyRegistry.register(...)   // declare dependency pairs
7  healthManager.report('oracle:kernel', 'healthy')
8  errorBoundary.setFallback(...)     // global error sink
9  pluginRegistry.register(...)       // install plugins
10 dependencyRegistry.resolve()       // topological sort
   lifecycleManager.initialize(...)   // call service.initialize() in order
```

On success, `bootstrap.initialize()` returns a **kernel object** containing references to all components.

---

## 5. Component Reference

### 5.1 Version

**File:** `version.js`

Exports static version constants and a `getVersionInfo()` helper.

```js
import { ORACLE_KERNEL_VERSION, COMPONENT_VERSIONS, getVersionInfo } from '@/oracle/kernel';

console.log(ORACLE_KERNEL_VERSION);     // '1.0.0'
console.log(getVersionInfo());
// { kernel: '1.0.0', build: '2026.07.15', components: { ... } }
```

---

### 5.2 Environment Loader

**File:** `environmentLoader.js`

Wraps `import.meta.env` so the rest of the platform never accesses it directly.

```js
import { environmentLoader } from '@/oracle/kernel';

environmentLoader.load();
const appId = environmentLoader.require('VITE_BASE44_APP_ID');
const debug  = environmentLoader.get('VITE_DEBUG', 'false');
```

| Method | Description |
|--------|-------------|
| `load()` | Reads all env vars. Idempotent. |
| `get(key, default?)` | Safe read — never throws. |
| `require(key)` | Throws when the variable is absent. |
| `getAll()` | Returns immutable snapshot. |
| `isDevelopment()` | Checks `MODE === 'development'`. |
| `isProduction()` | Checks `MODE === 'production'`. |
| `reset()` | Clears cached values (tests). |

---

### 5.3 Configuration Manager

**File:** `configManager.js`

Merges defaults → environment → runtime overrides into a single tree.

```js
import { configManager } from '@/oracle/kernel';

configManager.initialize({ app: { debug: true } });
configManager.registerValidator('app.id', (v) => v ? true : 'app.id is required');
configManager.validate();
configManager.freeze();

const logLevel = configManager.get('oracle.kernel.logLevel', 'info');
```

| Method | Description |
|--------|-------------|
| `initialize(overrides?)` | Merges config layers. |
| `get(key, default?)` | Dot-path read. |
| `set(key, value)` | Dot-path write (throws when frozen). |
| `registerValidator(key, fn)` | Registers a validator for a key. |
| `validate()` | Runs all validators; throws on failure. |
| `freeze()` | Prevents further writes. |
| `getAll()` | Returns immutable config snapshot. |
| `reset()` | Resets to defaults (tests). |

---

### 5.4 Logger

**File:** `logger.js`

Namespace-aware, level-filtered logging with pluggable handlers.

```js
import { logger } from '@/oracle/kernel';

const log = logger.child('auth-service');
log.info('User authenticated', { userId: '123' });

// Send logs to a remote sink
log.addHandler(({ level, namespace, message, data, timestamp }) => {
  remoteLogger.send({ level, namespace, message, data, timestamp });
});
```

Levels (ascending): `DEBUG → INFO → WARN → ERROR → SILENT`

| Method | Description |
|--------|-------------|
| `setLevel(level)` | Set minimum level (string or number). |
| `debug/info/warn/error(msg, data?)` | Emit at that level. |
| `child(namespace)` | Create a child logger. |
| `addHandler(fn)` / `removeHandler(fn)` | Custom log sinks. |
| `reset()` | Reset level and handlers (tests). |

---

### 5.5 Module Registry

**File:** `moduleRegistry.js`

Catalogue of platform modules (feature areas).

```js
import { moduleRegistry } from '@/oracle/kernel';

moduleRegistry.register({ id: 'academics', name: 'Academics', category: 'academic' });
moduleRegistry.setEnabled('academics', false);

const active = moduleRegistry.listEnabled();
```

| Method | Description |
|--------|-------------|
| `register(descriptor)` | Register or overwrite a module. |
| `unregister(id)` | Remove a module. |
| `get(id)` / `has(id)` | Lookup. |
| `list()` | All modules. |
| `listEnabled()` | Only `enabled !== false`. |
| `listByCategory(cat)` | Filter by category. |
| `setEnabled(id, bool)` | Toggle module. |
| `clear()` | Remove all (tests). |

---

### 5.6 Service Registry

**File:** `serviceRegistry.js`

Catalogue of runtime services with status tracking.

```js
import { serviceRegistry } from '@/oracle/kernel';

serviceRegistry.register({
  id: 'auth-service',
  name: 'Authentication Service',
  type: 'security',
  module: 'trust',
  instance: authServiceObject,
});
serviceRegistry.setStatus('auth-service', 'running');
```

| Method | Description |
|--------|-------------|
| `register(descriptor)` | Register or overwrite a service. |
| `unregister(id)` | Remove a service. |
| `get(id)` / `has(id)` | Lookup. |
| `list()` | All services. |
| `listByType(type)` | Filter by type. |
| `listByModule(moduleId)` | Filter by owning module. |
| `setStatus(id, status)` | Update status field. |
| `clear()` | Remove all (tests). |

---

### 5.7 Dependency Registry

**File:** `dependencyRegistry.js`

Tracks dependency relationships and resolves a safe initialisation order.

```js
import { dependencyRegistry } from '@/oracle/kernel';

dependencyRegistry.register('auth-service',    []);
dependencyRegistry.register('user-service',    ['auth-service']);
dependencyRegistry.register('profile-service', ['user-service']);

const order = dependencyRegistry.resolve();
// → ['auth-service', 'user-service', 'profile-service']

const hasCycle = dependencyRegistry.hasCycle(); // false
```

Uses **Kahn's algorithm** (topological sort). Throws with a descriptive message on circular dependency.

| Method | Description |
|--------|-------------|
| `register(id, deps[])` | Declare a node and its dependencies. |
| `unregister(id)` | Remove a node. |
| `getDirectDependencies(id)` | Direct dep list. |
| `getDependents(id)` | Nodes that depend on `id`. |
| `resolve()` | Topological order (throws on cycle). |
| `hasCycle()` | Safe cycle check. |
| `clear()` | Remove all (tests). |

---

### 5.8 Health Manager

**File:** `healthManager.js`

Per-component health reporting and aggregation.

```js
import { healthManager, HEALTH_STATUS } from '@/oracle/kernel';

healthManager.registerCheck('auth-service', async () => {
  const ok = await authService.ping();
  return ok ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY;
});

await healthManager.runChecks();
console.log(healthManager.getOverallStatus()); // 'healthy' | 'degraded' | 'unhealthy'

const unsub = healthManager.subscribe((overall, all) => {
  if (overall === HEALTH_STATUS.UNHEALTHY) alertOps(all);
});
```

| Method | Description |
|--------|-------------|
| `registerCheck(id, fn)` | Register an async health-check. |
| `report(id, status, detail?)` | Manually report a status. |
| `getStatus(id)` | Status record for one component. |
| `getOverallStatus()` | Aggregated platform health. |
| `getAll()` | Snapshot of all statuses. |
| `runChecks()` | Invoke all check functions. |
| `subscribe(fn)` | React to health changes. Returns unsubscribe fn. |
| `clear()` | Remove all state (tests). |

---

### 5.9 Error Boundary

**File:** `errorBoundary.js`

Routes errors to typed handlers, preventing cascading failures.

```js
import { errorBoundary } from '@/oracle/kernel';

errorBoundary.register('NetworkError', (err, ctx) => {
  log.error('Network failure', { err, ctx });
  return null;
});

// Wrap an async operation
const data = await errorBoundary.wrap(
  () => fetchData(url),
  { service: 'user-service', operation: 'getProfile' }
);
```

| Method | Description |
|--------|-------------|
| `register(type, handler)` | Handler for a specific error type. |
| `unregister(type)` | Remove a handler. |
| `setFallback(fn\|null)` | Catch-all handler. |
| `handle(error, context?)` | Route an error manually. |
| `wrap(fn, context?)` | Async error-boundary decorator. |
| `wrapSync(fn, context?)` | Sync error-boundary decorator. |
| `getErrors()` | In-memory error log. |
| `subscribe(fn)` | React to errors. Returns unsubscribe fn. |
| `clear()` | Clear all state (tests). |

---

### 5.10 Plugin Registry

**File:** `pluginRegistry.js`

Dynamic plugin installation and hook-based extension.

```js
import { pluginRegistry } from '@/oracle/kernel';

pluginRegistry.register({
  id: 'analytics-plugin',
  name: 'Analytics Plugin',
  hooks: {
    'service:registered': (id) => track('service_registered', { id }),
  },
  onInstall:   () => console.log('Analytics plugin installed'),
  onUninstall: () => console.log('Analytics plugin removed'),
});

await pluginRegistry.runHook('service:registered', 'auth-service');
```

| Method | Description |
|--------|-------------|
| `register(descriptor)` | Install a plugin (and its hooks). |
| `unregister(id)` | Remove a plugin and its hooks. |
| `get(id)` / `has(id)` | Lookup. |
| `list()` | All plugins. |
| `addHook(name, fn)` | Register an ad-hoc hook. |
| `removeHook(name, fn)` | Remove a hook. |
| `runHook(name, ...args)` | Run all handlers concurrently. |
| `clear()` | Remove all plugins and hooks (tests). |

---

### 5.11 Lifecycle Manager

**File:** `lifecycleManager.js`

State machine for platform initialisation and shutdown.

```
States: CREATED → INITIALIZING → RUNNING → STOPPING → STOPPED
                                    ↕ (on error)
                                  ERROR
```

```js
import { lifecycleManager, LIFECYCLE_STATES } from '@/oracle/kernel';

lifecycleManager.addHook('before:initialize', async () => {
  console.log('About to start services…');
});

await lifecycleManager.initialize([authService, userService]);
console.log(lifecycleManager.isRunning()); // true

await lifecycleManager.shutdown([userService, authService]);
console.log(lifecycleManager.getState()); // 'stopped'
```

| Method | Description |
|--------|-------------|
| `getState()` | Current state string. |
| `isRunning()` / `isReady()` | Boolean state checks. |
| `initialize(services[], opts?)` | Run `service.initialize()` in order. |
| `shutdown(services[], opts?)` | Run `service.shutdown()` in order. |
| `addHook(phase, fn)` | Register a lifecycle hook. |
| `removeHook(phase, fn)` | Remove a hook. |
| `reset()` | Back to CREATED (tests). |

---

### 5.12 Bootstrap

**File:** `bootstrap.js`

The single entry point for the Oracle Kernel.

```js
import { bootstrap } from '@/oracle/kernel';

const kernel = await bootstrap.initialize({
  config: {
    oracle: { kernel: { logLevel: 'debug' } },
  },
  modules: [
    { id: 'academics', name: 'Academics', category: 'academic' },
    { id: 'campus',    name: 'Campus',    category: 'campus'   },
  ],
  services: [],
  plugins:  [],
  dependencies: [],
});

// Access kernel components
kernel.logger.info('App started');
kernel.health.getOverallStatus();

// On teardown (e.g. React strict-mode cleanup)
await bootstrap.shutdown();
```

| Method | Description |
|--------|-------------|
| `initialize(options?)` | Start the kernel. Idempotent (returns existing kernel on repeat calls). |
| `shutdown()` | Graceful shutdown. |
| `isInitialized()` | Boolean. |
| `getKernel()` | Returns kernel object or `null`. |
| `reset()` | Clear state (tests). |

---

## 6. Integration Guide

### 6.1 Bootstrapping the kernel at app startup

The recommended place to call `bootstrap.initialize()` is **before** any services
or modules run. In a Vite + React application this typically happens before
`ReactDOM.createRoot()`:

```js
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { bootstrap } from '@/oracle/kernel';

bootstrap.initialize({
  modules: [/* your module descriptors */],
}).then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
});
```

### 6.2 Creating a new service

A service must expose `id`, `initialize()`, and optionally `shutdown()`:

```js
// src/services/notificationService.js
export const notificationService = {
  id: 'notification-service',

  async initialize(options) {
    // Set up WebSocket, subscribe to channels, etc.
  },

  async shutdown(options) {
    // Close connections, flush queues, etc.
  },
};
```

Register it before `bootstrap.initialize()`:

```js
import { serviceRegistry, dependencyRegistry } from '@/oracle/kernel';
import { notificationService } from './notificationService';

serviceRegistry.register({
  id: 'notification-service',
  name: 'Notification Service',
  type: 'infrastructure',
  instance: notificationService,
});

dependencyRegistry.register('notification-service', ['auth-service']);
```

### 6.3 Adding a plugin

```js
import { pluginRegistry } from '@/oracle/kernel';

pluginRegistry.register({
  id: 'my-analytics-plugin',
  name: 'My Analytics Plugin',
  version: '1.0.0',
  hooks: {
    'user:login': (userId) => analytics.track('login', { userId }),
  },
});
```

### 6.4 Health monitoring in a React component

```js
import { useEffect, useState } from 'react';
import { healthManager } from '@/oracle/kernel';

export function SystemHealthBadge() {
  const [status, setStatus] = useState(healthManager.getOverallStatus());

  useEffect(() => {
    const unsub = healthManager.subscribe((overall) => setStatus(overall));
    return unsub;
  }, []);

  return <span className={`health-badge health-badge--${status}`}>{status}</span>;
}
```

### 6.5 Safe async operations with Error Boundary

```js
import { errorBoundary } from '@/oracle/kernel';

const user = await errorBoundary.wrap(
  () => userService.getProfile(userId),
  { service: 'user-service', operation: 'getProfile', userId }
);
```

---

## 7. Public API Reference

All exports from `src/oracle/kernel/index.js`:

| Export | Type | Description |
|--------|------|-------------|
| `bootstrap` | Singleton | System bootstrap entry point |
| `configManager` | Singleton | Configuration access |
| `dependencyRegistry` | Singleton | Dependency graph |
| `environmentLoader` | Singleton | Env var access |
| `errorBoundary` | Singleton | Error routing |
| `healthManager` | Singleton | Health monitoring |
| `lifecycleManager` | Singleton | Lifecycle state machine |
| `logger` | Singleton | Root logger |
| `moduleRegistry` | Singleton | Module catalogue |
| `pluginRegistry` | Singleton | Plugin & hook system |
| `serviceRegistry` | Singleton | Service catalogue |
| `HEALTH_STATUS` | Enum | Health status constants |
| `LIFECYCLE_STATES` | Enum | Lifecycle state constants |
| `LOG_LEVELS` | Enum | Log level constants |
| `ORACLE_KERNEL_VERSION` | String | Kernel version |
| `ORACLE_KERNEL_BUILD` | String | Build label |
| `COMPONENT_VERSIONS` | Object | Per-component versions |
| `getVersionInfo()` | Function | Full version snapshot |

---

## 8. Architectural Decisions

### ADR-001: Singleton Pattern

**Decision:** Each component is a module-level singleton (a single class
instance exported from the file).

**Reason:** The Kernel components are infrastructure — they need to be
shared across the entire application without prop drilling or context
providers. Singletons are the standard JavaScript pattern for this.
Every singleton exposes `reset()` / `clear()` so tests can isolate state.

### ADR-002: Zero Runtime Dependencies

**Decision:** The Kernel imports nothing outside its own directory, except
the Vite `import.meta.env` global (wrapped inside `environmentLoader`).

**Reason:** Keeps the bundle small, avoids version conflicts, and makes the
Kernel portable to future server-side environments.

### ADR-003: Topological Sort for Init Order

**Decision:** `DependencyRegistry.resolve()` uses Kahn's algorithm to
derive a safe initialisation order.

**Reason:** Explicit dependency declarations prevent "works on my machine"
ordering bugs and make circular dependencies immediately visible at startup.

### ADR-004: Layered Configuration

**Decision:** `ConfigManager` merges three layers: hardcoded defaults,
environment variables, and runtime overrides.

**Reason:** Keeps secrets out of the codebase (env layer), allows defaults
to ship with the app, and allows callers to override anything at runtime
without needing environment variables.

### ADR-005: Health Status Aggregation

**Decision:** `getOverallStatus()` returns the worst individual status.

**Reason:** A platform is only as healthy as its weakest link. One
`unhealthy` service should surface immediately so operations can respond.

### ADR-006: Error Boundary as Type Router

**Decision:** `ErrorBoundary` routes errors by `error.constructor.name`
then to a fallback, rather than a single catch-all.

**Reason:** Different error types need different recovery strategies.
A `NetworkError` should trigger a retry; a `ValidationError` should
surface a user message; an `AuthError` should redirect to login.

---

## 9. File Inventory

### Files Created

| File | Purpose |
|------|---------|
| `src/oracle/kernel/version.js` | Version constants and inspection |
| `src/oracle/kernel/environmentLoader.js` | Safe env var access |
| `src/oracle/kernel/configManager.js` | Multi-layer configuration |
| `src/oracle/kernel/logger.js` | Namespace-aware logging |
| `src/oracle/kernel/moduleRegistry.js` | Platform module catalogue |
| `src/oracle/kernel/serviceRegistry.js` | Runtime service catalogue |
| `src/oracle/kernel/dependencyRegistry.js` | Dependency graph & topo-sort |
| `src/oracle/kernel/healthManager.js` | Health monitoring |
| `src/oracle/kernel/errorBoundary.js` | Error routing |
| `src/oracle/kernel/pluginRegistry.js` | Plugin & hook system |
| `src/oracle/kernel/lifecycleManager.js` | Lifecycle state machine |
| `src/oracle/kernel/bootstrap.js` | System bootstrap entry point |
| `src/oracle/kernel/index.js` | Public API re-exports |
| `src/oracle/ORACLE_KERNEL_ARCHITECTURE.md` | This document |

### Files Modified

None. The Oracle Kernel is a pure addition. Zero existing files were changed.

---

## 10. Risk Assessment

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| Singleton state leaking between tests | Medium | High | Every component exposes `reset()` / `clear()` |
| `import.meta.env` not available in SSR | Low | Low | `environmentLoader` wraps access in a try/catch |
| Circular imports between kernel files | Medium | Low | Each file's imports flow strictly downward: `logger` has no kernel imports; `bootstrap` imports everything |
| Config frozen too early, blocking late configuration | Medium | Low | `freeze()` is called explicitly by `bootstrap` — callers can skip it |
| Lifecycle manager stuck in `ERROR` state | Medium | Medium | `reset()` method allows recovery in tests; production code should shutdown and restart |
| Plugin hook handler throwing exceptions | Low | Medium | `runHook` uses `Promise.allSettled` — one bad handler cannot kill others |

### Follow-up items for TASK-002

1. Connect `moduleRegistry` to the existing `PLATFORM_MODULES` from `src/lib/portalConfig.js` so the Kernel and the UI share one source of truth.
2. Connect `serviceRegistry` to `src/lib/oracleEcosystem.js` service definitions.
3. Implement `bootstrap.initialize()` call at app startup (`src/main.jsx`).
4. Add per-service `initialize()` / `shutdown()` implementations as services are built out.
5. Consider adding a React context (`OracleKernelContext`) so components can access kernel state reactively.
