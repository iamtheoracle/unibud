# Identity Persistence Migration 0001

## Purpose

This migration establishes the first provider-neutral PostgreSQL persistence boundary for UNIBUD identity. It is a schema foundation, not a complete authentication service, authorisation engine, or production deployment.

## Tables

- `accounts`: canonical account lifecycle.
- `authentication_identities`: issuer-scoped login subjects mapped to accounts.
- `profiles`: personal, creator, and page/community profile records.
- `profile_memberships`: exact-profile ownership and delegated membership.
- `resource_grants`: explicit application/resource/action permissions.
- `security_audit_events`: security-relevant event records.

## Security decisions

1. Account IDs are independent of email addresses, phone numbers, usernames, and external authentication subjects.
2. Authentication identity uniqueness is scoped to the issuer and subject.
3. Email/phone lookup material is represented as encrypted bytes plus a keyed lookup digest. Never use an unkeyed hash for low-entropy identifiers.
4. Password verifiers, passkey private material, OTPs, recovery codes, bearer tokens, and session secrets are not stored in this table. They need a separately reviewed credential/session design.
5. Membership and grants are scoped to exact accounts, profiles, applications, resources, and actions. A role name alone is not permission.
6. Audit event payloads must be minimised. Never log passwords, verification secrets, session tokens, private message bodies, or full financial payloads.
7. Foreign-key deletion is restricted so account closure/deletion must use an explicit retention and erasure workflow rather than cascading through records.
8. These tables do not yet enforce tenant/domain row-level security. Database roles, application authorisation, and later reviewed RLS policies are still required.

## Domain isolation

Identity owns the canonical account and authentication identity. Profiles own profile metadata. Memberships and resource grants express separately authorised relationships. Bud, Board, Flow, Square, The Quarter, Wayward, SouLync, Concierge, Operations, and Oracle Arc must own their own domain records and apply explicit account/application/resource scope at every read and write.

Sensitive domains need additional controls:
- **Private conversations:** participant and conversation scope, attachment scope, retention, block/report state, and access audit.
- **Education:** institution, student, tutor, enrolment and relationship scope must remain separate; student authority never implies tutor authority.
- **Flow:** strict financial ledger permissions, immutable/compensating entries, reconciliation, step-up approval and segregation of duties.
- **Staff/Operations:** staff identity and assignments do not follow from consumer membership; privileged actions require explicit grants and audit.
- **Oracle Arc/SPARK:** app-scoped, user-scoped consent and memory grants; no cross-app or cross-user memory access by default.

## Synthetic test-data policy

All development, CI, migration, fixture, demo and automated-test environments use generated synthetic records only. Do not copy production databases, exports, support tickets, real conversations, real student records, or real financial information into these environments. Fixtures must use reserved example domains and clearly fictional names/identifiers. Secrets used by tests must also be synthetic and disposable.

Production-to-development refreshes are prohibited by default. Any future exception would require a separate approved, documented, irreversible anonymisation process and privacy/security review; simple masking is not sufficient.

## Migration and deployment status

- This file defines a proposed initial schema migration.
- No database instance has been provisioned or connected.
- No migration has been applied to a live database.
- No RLS policy, database role grants, backup schedule, restore drill, or production secret has been configured.
- SQL execution and PostgreSQL-version compatibility must be verified in an isolated disposable PostgreSQL environment before adoption.
