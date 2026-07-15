# Oracle Kernel

Oracle Kernel is a generic, domain-agnostic infrastructure layer for module bootstrap, configuration, dependency resolution, lifecycle coordination, health monitoring, logging, error handling, plugin registration, and version reporting.

## Components

- `bootstrap.ts` — wires the infrastructure managers together.
- `config-manager.ts` — merges environment, file config, and runtime overrides.
- `dependency-registry.ts` — registers dependencies, resolves graphs, detects cycles, and supports eager/lazy resolution.
- `module-registry.ts` — stores registered modules and metadata.
- `service-registry.ts` — stores registered services and metadata.
- `lifecycle-manager.ts` — initializes services in dependency order, then modules, and shuts down in reverse order.
- `health-manager.ts` — runs health checks and aggregates platform health.
- `logger.ts` — structured logging with level filtering.
- `environment-loader.ts` — parses environment values and validates required settings.
- `error-boundary.ts` — captures failures and applies optional recovery strategies.
- `plugin-registrar.ts` — registers runtime plugins with kernel-version compatibility checks.
- `version.ts` — exposes kernel version and aggregate module/service versions.
- `index.ts` — public `OracleKernel` entry point.

## Configuration

`ConfigManager` loads values in this order:

1. defaults
2. `.env`-style file contents
3. runtime environment values
4. file config object
5. explicit overrides

## Integration

```ts
import { OracleKernel } from './index.ts';
import { ExampleModule } from './examples/example-module.ts';
import { ExampleService } from './examples/example-service.ts';

const oracle = OracleKernel.bootstrap({
  env: { LOG_LEVEL: 'debug' },
  overrides: {
    commandExecutor: async (command) => ({ ok: true, command }),
  },
});

await oracle.registerService(new ExampleService());
await oracle.registerModule(new ExampleModule());
await oracle.initialize();
```

## Tests

Run the kernel test suite with:

```bash
npm run test
npm run test:coverage
```
