# Security and Privacy Baseline

## Default-deny access

Every protected operation must authenticate the caller, establish the active application and tenant context, authorise the requested action against the resource, and record relevant audit events. Missing or ambiguous permission means deny.

## Identity and isolation

- Separate account identity, profile identity, staff identity, service identity, and agent identity.
- A user may own several profile types without merging their permissions.
- Page, school, seller, provider, professional, and staff roles are scoped to their resources.
- App-scoped tokens and service credentials must not be interchangeable across applications.
- Cross-space access requires an explicit, documented purpose and permission.

## Sensitive data

Classify data before it is sent to external AI providers or third parties. Secrets stay server-side in a secrets manager or protected runtime configuration. Never commit API keys, passwords, private tokens, production credentials, or real personal records.

## Consequential actions

Payments, transfers, purchases, bookings, cancellations, refunds, dispatch, and other consequential actions require authenticated actor and resource scope, server-side policy checks, clear material terms, explicit confirmation, idempotent execution, provider verification, reconciliation, and an auditable result.

A request accepted by an AI model or provider is not proof that the action succeeded.

## AI safety

- Tools are deny-by-default and require scoped grants.
- Model output is untrusted input.
- Validate tool arguments and results.
- Apply timeouts, quotas, rate limits, cancellation, and audit logging.
- Memory is consented, purpose-limited, user-scoped, and application-scoped.
- Files require type/size validation, malware scanning, access control, and retention rules.
- Do not send restricted data to remote inference without an explicit policy allowing it.

## Operational controls

Use separate development, staging, and production environments. Require reviewed changes, automated checks, dependency and secret scanning, backups, tested restores, and incident procedures.

This document establishes requirements; it is not evidence that controls have already been implemented or independently audited.
