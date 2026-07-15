# Oracle Kernel

Oracle Kernel is the domain-agnostic infrastructure layer for UNIBUD.

## Scope

This package provides infrastructure primitives only:

- Bootstrap
- Configuration Manager
- Environment Manager
- Dependency Injection
- Module Registry
- Service Registry
- Capability Registry
- Lifecycle Manager
- Health Manager
- Logging
- Error Boundary
- Plugin Registration
- Version Manager

## Non-Scope

Oracle Kernel does not include business-domain logic, workflows, routes, or UI.
Domain modules register themselves with the kernel through registries and plugins.

## Usage

```js
import { bootstrap } from "@/oracle/kernel";

const kernel = bootstrap({
  kernelVersion: "1.0.0",
  environmentSchema: [{ key: "NODE_ENV", defaultValue: "development" }],
});

await kernel.initialize();
```

## Testing

Kernel tests are isolated and run with Node's built-in test runner.
