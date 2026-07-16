# Education Module Architecture

## Overview

The Education Module is a first-class module that registers with the Oracle Kernel. It owns all education business logic. Oracle remains domain-agnostic infrastructure.

## Module Dependency Flow

```
UNIBUD
  │
  ├── Oracle Kernel  (src/oracle/kernel/)
  │     Domain-agnostic infrastructure:
  │     Bootstrap · Config · DI · Logger · Health ·
  │     Lifecycle · Error Boundary · Module Registry ·
  │     Capability Registry · Resource Registry
  │
  └── Education Module  (src/education/)
        Registers with Oracle:
        Programs · Organizations · Students · Educators ·
        Classes · Subjects · Enrollments · Permissions · Invitations
```

## Architectural Principles

| Principle | Implementation |
|---|---|
| **One-way dependency** | Education Module depends on Oracle. Oracle knows nothing about Education. |
| **Module registration** | Education registers itself with `oracle.modules.register(educationModule)` |
| **DI for services** | All 9 services are registered with `oracle.dependencies` and resolved by token |
| **Capability declaration** | Every operation surface is declared as an Oracle Capability |
| **Resource tracking** | All data collections are registered as Oracle Resources |
| **Health reporting** | Module registers a health check with Oracle's Health Manager |

## Module Registration Flow

```typescript
import { oracle } from '@/oracle/kernel';
import { educationModule } from '@/education';

// Register module
await oracle.modules.register(educationModule);

// Bootstrap Oracle (initializes all registered modules)
await oracle.bootstrap();

// Resolve a service via DI
const programs = oracle.dependencies.resolve('ProgramService');
```

## Source Structure

```
src/
  oracle/
    kernel/
      types.ts                  # All Oracle interfaces (IOracle, IModule, etc.)
      logger.ts                 # OracleLogger
      config.ts                 # OracleConfigManager
      di.ts                     # OracleDependencyInjector
      health.ts                 # OracleHealthManager
      error-boundary.ts         # OracleErrorBoundary
      lifecycle.ts              # OracleLifecycleManager
      module-registry.ts        # OracleModuleRegistry
      capability-registry.ts    # OracleCapabilityRegistry
      resource-registry.ts      # OracleResourceRegistry
      oracle-kernel.ts          # OracleKernel (composes all above)
      index.ts                  # Public re-exports

  education/
    types/
      index.ts                  # All Education TypeScript interfaces
    services/
      program.service.ts
      organization.service.ts
      student.service.ts
      educator.service.ts
      class.service.ts
      subject.service.ts
      enrollment.service.ts
      permission.service.ts
      invitation.service.ts
    utils.ts                    # generateId(), generateToken()
    module.ts                   # EducationModule (IEducationModule impl)
    index.ts                    # Public re-exports
    __tests__/
      *.service.test.ts         # Unit tests (one per service)
      integration.test.ts       # Oracle ↔ Education integration
    docs/
      ARCHITECTURE.md           # This file
      SERVICES.md
      API.md
      DATA_MODELS.md
```

## Next Steps

| Task | Scope |
|---|---|
| TASK-003 | Campus Module (Student Dashboard UI) |
| TASK-004 | Command System (command routing through Oracle) |
| TASK-005 | Event System (event coordination through Oracle) |
| TASK-006 | Bud Intelligence integration |
