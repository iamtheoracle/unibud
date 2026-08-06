# Oracle Kernel Architecture

## Purpose

Oracle Kernel provides reusable infrastructure primitives only. It does not model business entities or workflows.

## One-Way Dependency Rule

- Oracle Kernel has no imports from business modules.
- Business modules can register themselves with Oracle Kernel.

## Component Reference

1. **Bootstrap**: creates a kernel instance and wires infrastructure managers.
2. **Configuration Manager**: runtime key/value configuration access.
3. **Environment Manager**: typed environment variable access.
4. **Dependency Injector**: generic dependency registration and resolution.
5. **Module Registry**: generic module registration and discovery.
6. **Capability Registry**: generic capability registration and discovery.
7. **Lifecycle Manager**: ordered initialize/shutdown execution.
8. **Health Manager**: check registration and aggregated health snapshots.
9. **Logger**: in-memory structured logging interface.
10. **Error Boundary**: consistent operation wrapping and error logging.
11. **Plugin Registrar**: plugin registration and lifecycle orchestration.
12. **Version Manager**: kernel/module version tracking and compatibility checks.

## Integration Guide

```ts
import { bootstrap } from "@/oracle/kernel";

const oracle = bootstrap({ version: "1.0.0" });
oracle.registerModule({ name: "module-a", version: "1.0.0" });
await oracle.initialize();
await oracle.shutdown();
```

## Guardrail Compliance

- No business-domain imports in `/src/oracle/kernel`.
- Generic metadata extension points exist for modules to define domain meaning.
- Tests use only generic names and generic payload data.
