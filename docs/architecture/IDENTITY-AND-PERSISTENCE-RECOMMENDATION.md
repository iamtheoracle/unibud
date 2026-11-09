# Identity and Persistence Architecture Recommendation

**Status:** Proposed recommendation — not an adopted provider decision  
**Date:** 2026-11-09

## Recommendation

Use PostgreSQL as UNIBUD's authoritative application persistence layer and place a provider-independent OIDC authentication boundary between the application and the identity provider.

Auth0 is the initial managed identity-provider candidate to evaluate. It is not selected or integrated by this document. Before adoption, compare total cost at expected user volume, supported email and phone verification/recovery flows in launch regions, session controls, data residency, exportability, operational support, and contractual terms.

The initial user experience must use UNIBUD first-party email and/or phone registration and sign-in. Google and Apple sign-up are not part of the product requirement and must not be enabled as default or fallback paths.

## Responsibility boundaries

### Identity provider

The provider is responsible only for authentication primitives delegated to it, such as credential verification, verification challenges, secure recovery, and issuing verifiable identity assertions or tokens.

The provider must not become the authority for UNIBUD profile ownership, memberships, institution authority, app roles, resource permissions, financial balances, or domain lifecycle.

### UNIBUD identity service

UNIBUD owns:
- stable internal account IDs;
- links between internal accounts and external authentication subjects;
- account lifecycle and contact verification state;
- personal, creator, and page/community profile ownership;
- memberships and delegated grants;
- active-profile context and revocation;
- audit events and application-level authorisation decisions.

External identity subjects must be namespaced by issuer. Do not assume an email address or phone number is a stable account identifier.

### PostgreSQL persistence

PostgreSQL is the recommended system of record for relational product data and transactional domain state. Use migrations, foreign keys, unique constraints, explicit transaction boundaries, least-privilege database roles, encrypted backups, tested restore procedures, and audited schema changes.

Keep domain ownership explicit. Use schemas or equivalent access boundaries for identity, profiles, education, Connect, Bud/Board, Flow, marketplace/experience, operations, and audit. The exact schema layout is a later implementation decision and must not imply that every domain is being released at once.

Flow must have a separately reviewed financial-ledger design, immutable or append-only posting history where appropriate, idempotent transaction processing, reconciliation, and strict service/database permissions. Ordinary application records must never be treated as authoritative financial settlement.

## Security requirements

- Authentication is not authorisation; deny by default.
- A valid login does not imply access to every app, profile, institution, or resource.
- Delegated access must be a separately stored, scoped, revocable grant.
- Student, tutor, and institution records remain private and independently authorised.
- Page/community administrators cannot access an owner's personal account or unrelated profiles.
- Use short-lived access tokens, secure HTTP-only same-site cookies for browser sessions, session rotation/revocation, rate limits, abuse controls, and step-up verification for sensitive actions.
- Keep provider secrets and database credentials server-side.
- Do not put secrets in browser bundles, source control, logs, or error messages.
- Record security-relevant events without logging passwords, verification codes, raw tokens, or unnecessary personal data.

## Provider evaluation gate

Before selecting Auth0 or another OIDC provider, produce a short comparison covering:
1. Email/password and email/phone verification flows without social sign-in.
2. Nigeria launch support and SMS/email delivery options, including cost and deliverability.
3. Recovery, MFA/passkeys, session revocation, and suspicious-login controls.
4. OIDC standards support, issuer/subject stability, key rotation, and logout semantics.
5. Data processing, residency, privacy terms, export, and exit strategy.
6. Pricing at realistic monthly active user and message volumes.
7. Operational support, availability, incident history, and integration complexity.

Do not silently substitute Clerk, Supabase Auth, Firebase Auth, Cognito, or a self-hosted identity server. Any final provider selection requires an explicit architecture decision.

## Delivery sequence

1. Keep shared account, authentication-identity, profile, membership, and grant contracts provider-neutral.
2. Add contract tests for ownership, delegated access, revocation, inactive membership, and cross-account denial.
3. Define persistence migrations and repository interfaces around the contracts.
4. Complete the provider comparison and record the selected provider in a superseding ADR.
5. Implement server-side registration, verification, login, recovery, sessions, and audit.
6. Add browser onboarding and profile switching only against the real service.
7. Verify security boundaries and recovery/restore procedures before production release.

## Current implementation status

The initial provider-independent first-party authentication path is now implemented in code: email/phone registration and verification, password login/recovery, scrypt verifiers, keyed/encrypted identifier protection, database-backed rate limits, opaque session lifecycle, HTTP-only same-site cookies, and session-bound onboarding/profile context. Auth0 remains unselected and is not required by this first-party flow; any later OIDC provider must remain behind the same UNIBUD account boundary.

Disposable PostgreSQL 16 migrations and synthetic security tests cover the auth procedures, signed account context, RLS, owner/delegate isolation, profile switching, onboarding acceptance, session maintenance and rate limits. This does not mean a production database or production auth system is live. No production PostgreSQL instance, role credentials, secrets-manager bindings, delivery provider, operational monitoring, backup/restore drill, or approved final legal text has been provisioned. CI evidence is not production verification.
