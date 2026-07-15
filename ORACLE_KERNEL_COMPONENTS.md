# Oracle Kernel Components

## Bootstrap
Creates the Oracle object graph and controls initialization/shutdown.

## Configuration Manager
Typed key access (`get`/`set`) with dot-path support and validation hook.

## Environment Manager
Loads environment values from process and optional `.env` file.

## Dependency Injector
Registers dependencies and factories, supports singleton caching, detects cycles.

## Module Registry
Registers/unregisters modules and tracks module metadata.

## Capability Registry
Registers capabilities, supports lookup, provider filtering, and filtered query.

## Lifecycle Manager
State machine for `uninitialized -> initializing -> ready -> shutting_down -> shutdown`.

## Health Manager
Registers checks, runs individual/all checks, stores the latest health report.

## Logger
Structured log output with global logger override support.

## Error Boundary
Normalizes and logs errors, supports subscriber hooks and wrapped async execution.

## Plugin Registrar
Registers runtime plugins with validation and kernel compatibility checks.

## Version Manager
Tracks kernel/component/module versions and performs compatibility checks.
