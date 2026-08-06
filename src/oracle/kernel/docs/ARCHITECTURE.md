# Oracle Kernel — Architecture

## Overview

The Oracle Kernel is a domain-agnostic TypeScript infrastructure layer providing a unified composition root for applications. It assembles 12 focused components into a single coherent runtime accessed through the `IOracle` interface.

## Design Principles

### 1. Separation of Concerns
Each component owns exactly one responsibility. The `ConfigManager` manages configuration; the `LifecycleManager` manages lifecycle states. No component reaches into another's domain.

### 2. One-Way Dependency Model
All components depend on their own types and the `IOracle` interface—never on concrete implementations. This enables substitution, testing, and extensibility without coupling.

```
IOracle (interface)
  ↑
OracleKernel (implementation)
  ↓ constructs
ConfigManager, EnvironmentManager, DependencyInjector,
ModuleRegistry, CapabilityRegistry, LifecycleManager,
HealthManager, Logger, ErrorBoundary, PluginRegistrar,
VersionManager
```

### 3. Interface-First
All public APIs are defined as TypeScript interfaces in `types/index.ts` before any implementation. Consumers program to `IOracle`, not `OracleKernel`.

### 4. Lifecycle Discipline
The kernel enforces an explicit lifecycle state machine:

```
uninitialized → initializing → ready → shutting-down → shutdown
                     ↓                       ↓
                   error                   error
```

No component should perform side effects before `initialize()` is called or after `shutdown()` completes.

### 5. Zero Domain Coupling
The kernel contains no business concepts. It is a pure infrastructure layer suitable for any application domain.

## Component Relationships

```
bootstrap()
    └── OracleKernel
            ├── config          (IConfigManager)
            ├── environment     (IEnvironmentManager)
            ├── modules         (IModuleRegistry)
            ├── capabilities    (ICapabilityRegistry)
            ├── dependencies    (IDependencyInjector)
            ├── lifecycle       (ILifecycleManager)
            ├── health          (IHealthManager)
            ├── logger          (ILogger)
            ├── errors          (IErrorBoundary)
            ├── plugins         (IPluginRegistrar)
            └── version         (IVersionManager)
```

## Directory Layout

```
src/oracle/kernel/
  components/          12 component implementations
  types/               TypeScript interface definitions
  __tests__/           Unit + integration tests
  docs/                This documentation
  oracle-kernel.ts     OracleKernel class
  index.ts             Public exports
  tsconfig.json        TypeScript configuration
  vitest.config.ts     Test configuration
```
