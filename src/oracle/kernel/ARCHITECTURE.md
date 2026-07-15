# Oracle Kernel Architecture (TASK-001)

## Goal

Provide a lightweight, domain-agnostic infrastructure kernel that other modules can register with.

## Components

1. Bootstrap (`bootstrap.js`)
2. Configuration Manager (`configurationManager.js`)
3. Environment Manager (`environmentManager.js`)
4. Dependency Injection (`dependencyInjector.js`)
5. Module Registry (`moduleRegistry.js`)
6. Service Registry (`serviceRegistry.js`)
7. Capability Registry (`capabilityRegistry.js`)
8. Lifecycle Manager (`lifecycleManager.js`)
9. Health Manager (`healthManager.js`)
10. Logging (`logging.js`)
11. Error Boundary (`errorBoundary.js`)
12. Plugin Registration (`pluginRegistrar.js`)
13. Version Manager (`versionManager.js`)

## Design Notes

- Kernel is independent from education, university, marketplace, community, and AI domain logic.
- Registries are generic and metadata-friendly.
- Lifecycle order is deterministic (init in registration order, shutdown in reverse order).
- Plugins and modules compose through bootstrap context instead of hardcoded cross-links.

## Assumptions

- Higher-level domain modules will register services/capabilities/modules at runtime.
- Routes/UI/API concerns remain outside kernel.

## Risks

- Current logger defaults to console JSON sink; production systems may require pluggable sinks.
- Service and capability registries are separate; naming/merge conventions should be finalized before large module growth.

## TASK-002 Recommendations

- Build command routing as a separate module that depends on `DependencyInjector`, `ServiceRegistry`, and `ErrorBoundary`.
- Emit command lifecycle events through a dedicated event bus module instead of embedding it in the kernel core.
