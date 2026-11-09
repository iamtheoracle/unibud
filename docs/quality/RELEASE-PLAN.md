# Release Plan

The full UNIBUD ecosystem remains the target. Staging is used to manage dependencies and risk, not to remove product scope.

## Foundation
Repository governance, monorepo layout, architecture decisions, CI, local development, observability baseline, and security conventions.

## Platform foundations
Identity, sessions, profile families, authorisation, ownership, consent, audit, notifications, messaging, media, search, and shared design system.

## Independent Oracle Arc
App registration, service authentication, provider gateway, agent registry, tool grants, quotas, lifecycle, SPARK isolation, ORBITS ingestion, evaluation, and safe failure behaviour.

## Product domains
Connect; Bud and Board; Square and Riff; Wayward; The Quarter; Flow; SouLync; The Fixer; Concierge; Lync; and Operations. Dependencies and risk determine sequencing within this stage.

## Readiness gates

- Security and privacy requirements reviewed.
- Data ownership and access isolation tested.
- Critical user journeys pass in staging.
- External providers and regulated services are verified.
- Failure and recovery behaviour tested.
- Operational ownership, monitoring, support, and rollback are ready.
- Known limitations are visible and approved.

No feature is described as production-ready until the required evidence exists.
