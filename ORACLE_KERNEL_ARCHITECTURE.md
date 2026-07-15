# Oracle Kernel Architecture

## Design Principles
- Infrastructure-only kernel with no domain or workflow coupling.
- Components are isolated, interface-driven, and testable.
- Bootstrap composes all managers through explicit dependencies.

## Component Overview
- Bootstrap orchestrates startup/shutdown.
- Managers handle config, environment, lifecycle, health, versions, and errors.
- Registries track modules, capabilities, and plugins.
- Dependency injector resolves factories with cycle detection.

## Interaction Pattern
1. Bootstrap creates all managers.
2. Lifecycle initialize hook runs module initialization.
3. Version manager records component/module versions.
4. Lifecycle shutdown hook runs plugin and module teardown in order.

## Extension Points
- Register modules with `oracle.modules.register`.
- Register capabilities with `oracle.capabilities.register`.
- Register runtime plugins with `oracle.plugins.register`.
- Add health checks via `oracle.health.register`.
