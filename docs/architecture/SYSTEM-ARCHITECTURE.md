# System Architecture Baseline

## Architecture direction

Begin with a modular UNIBUD application and explicit domain boundaries. Extract independently deployable services when isolation, scale, reliability, team ownership, or regulatory requirements justify the operational cost.

Oracle Arc is an exception by design: it is an independent AI core with its own API, deployment configuration, security boundary, and release lifecycle, even while sharing this monorepo.

## Proposed monorepo layout

```text
apps/
  web/                 consumer application
  admin/               authorised platform administration
  operations/          internal workforce and field operations
backend/
  api/                 UNIBUD application API
oracle-arc/
  api/                 independent Oracle Arc API
  gateway/             model/provider routing
  agents/              agent registry and runtime
  spark/               scoped memory
  orbits/              multimodal file pipeline
  tools/               permissioned tool execution
  evaluations/         evaluation harness
packages/
  contracts/           shared API contracts
  permissions/         shared policy definitions
  validation/          shared validation
  ui/                  reusable UI primitives
  config/              shared development configuration
docs/
  product/
  architecture/
  security/
  oracle-arc/
  operations/
  decisions/
infrastructure/
  development/
  staging/
  production/
.github/
  workflows/
```

This is a target structure, not a claim that these applications or services already exist.

## Boundary rules

- UNIBUD domains own their business rules and records.
- Shared packages contain stable contracts and utilities, not hidden cross-domain business logic.
- Oracle Arc does not directly bypass UNIBUD authorisation or call arbitrary internal services.
- Every app integration is registered, authenticated, scoped, and auditable.
- No frontend-only permission check is a security boundary.
- Service-to-service identity is distinct from end-user identity.

## Data and integration

Use PostgreSQL as the initial transactional data store, with explicit ownership and tenant/app scope. Choose ORM, queue, object storage, identity provider, and deployment vendors through documented decisions after requirements and prototypes are evaluated.

## Reliability

Define timeouts, retries, idempotency, cancellation, recovery, health checks, audit trails, backups, and restore tests for every consequential workflow.
