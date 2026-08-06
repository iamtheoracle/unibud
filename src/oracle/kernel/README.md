# Oracle Kernel

Oracle Kernel is generic infrastructure. It provides bootstrap, configuration, environment access, dependency injection, registries, lifecycle controls, health checks, logging, error boundaries, plugin registration, and version tracking.

## Architecture

Dependency direction is one-way:

`Modules -> Oracle Kernel`

Oracle Kernel does not import business modules or interpret module metadata.

## Components

- Bootstrap
- Configuration Manager
- Environment Manager
- Dependency Injector
- Module Registry
- Capability Registry (Service Registry alias available for compatibility)
- Lifecycle Manager
- Health Manager
- Logger
- Error Boundary
- Plugin Registrar
- Version Manager

## Integration Guide

1. Create an Oracle instance via `bootstrap`.
2. Register modules and capabilities.
3. Optionally register dependencies and plugins.
4. Call `initialize`.
5. Call `shutdown` during teardown.

## Generic Extension Pattern

Oracle types include `type`, `roles`, and `metadata` fields so modules can attach domain meaning without changing kernel internals.
