# ADR 0001: Monorepo and Service Boundaries

- Status: Proposed
- Date: 2026-11-09

## Context

UNIBUD contains multiple product spaces with shared platform capabilities. Oracle Arc is intended to serve multiple applications and must not become tightly coupled to UNIBUD.

## Decision

Use one GitHub monorepo for source coordination, shared contracts, documentation, and CI. Keep UNIBUD domain modules explicit. Keep Oracle Arc as an independently deployable and independently secured service with its own API and lifecycle.

## Consequences

- Shared source changes can be reviewed together.
- CI must test affected boundaries and prevent accidental coupling.
- Deployment and secrets remain independently scoped.
- A monorepo does not authorise shared runtime credentials or unrestricted database access.
- Service extraction remains possible if operational needs justify it.

## Revisit when

Team ownership, scale, compliance, release cadence, or operational reliability demonstrate that the current boundaries are insufficient.
