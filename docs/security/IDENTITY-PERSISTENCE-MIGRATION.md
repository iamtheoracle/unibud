# Identity, Authentication and Profile Persistence Migrations 0001–0010

## Purpose

This migration establishes the first provider-neutral PostgreSQL persistence boundary for UNIBUD identity. It is a schema foundation, not a complete authentication service, authorisation engine, or production deployment.

## Tables

- `accounts`: canonical account lifecycle.
- `authentication_identities`: issuer-scoped login subjects mapped to accounts.
- `account_sessions`: opaque session-credential digests, expiry and revocation metadata.
- `profiles`: personal, creator, and page/community profile records.
- `profile_memberships`: exact-profile ownership and delegated membership.
- `resource_grants`: explicit application/resource/action permissions.
- `security_audit_events`: security-relevant event records.
- Migration 0003 adds `password_credentials` (scrypt verifiers only) and `verification_challenges` (keyed target/code digests, expiry, attempt limits and one-time consumption state).
- Migration 0004 adds narrow SECURITY DEFINER auth procedures and separate `unibud_auth` / `unibud_auth_owner` roles.
- Migration 0005 adds profile-owner membership binding, session-bound active profile context, and narrowly scoped profile procedures.
- Migration 0006 enforces canonical profile-owner/grantor consistency and one non-archived personal profile per account.
- Migration 0007 stores immutable, versioned terms/privacy acceptance.
- Migration 0008 adds hardened session touch, account-wide revocation, challenge-owner lookup, and session lookup/rotation with active-profile context.
- Migration 0009 adds per-session active-profile context and preserves it across credential rotation.
- Migration 0010 adds atomic PostgreSQL-backed authentication rate-limit buckets; only the restricted auth procedure can consume them.

## Security decisions

1. Account IDs are independent of email addresses, phone numbers, usernames, and external authentication subjects.
2. Authentication identity uniqueness is scoped to the issuer and subject.
3. Email/phone lookup material is represented as encrypted bytes plus a keyed lookup digest. Never use an unkeyed hash for low-entropy identifiers.
4. Password verifiers, passkey private material, OTPs, recovery codes, raw bearer tokens, and raw session secrets are not stored in these tables. The session table stores only a SHA-256 digest of a high-entropy random opaque credential; low-entropy identifiers require keyed digests.
5. Membership and grants are scoped to exact accounts, profiles, applications, resources, and actions. A role name alone is not permission.
6. Audit event payloads must be minimised. Never log passwords, verification secrets, session tokens, private message bodies, or full financial payloads.
7. Foreign-key deletion is restricted so account closure/deletion must use an explicit retention and erasure workflow rather than cascading through records.
8. Migrations 0002 and 0005 enforce FORCE RLS with signed transaction-scoped account context and separate non-login procedure-owner roles. Arbitrary user-settable GUC values do not authorise access without a valid HMAC.

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

- GitHub Actions applies migrations 0001–0010 to disposable PostgreSQL 16 and runs synthetic SQL tests for schema constraints, audit immutability, signed-context denial, credential isolation, auth procedure behavior, profile owner/delegate/outsider isolation, onboarding acceptance, and session maintenance.
- The server-only auth RPC, profile RPC, and onboarding RPC adapters are implemented against a narrow query-pool contract. A Node PostgreSQL driver adapter uses distinct auth and app connection pools and distinct LOGIN credentials.
- First-party registration, verification, login, password recovery, secure cookie, logout, session inspection/rotation, onboarding, profile creation/listing/switching, and delegated-access API routes are implemented. The first-party email/phone UI has no Google or Apple sign-up path.
- Verification delivery uses a provider-neutral private HTTP gateway. The gateway endpoint/token are intentionally unconfigured until a real delivery provider and operational owner are selected.
- Browser write routes enforce same-origin requests; session credentials are held only in HTTP-only, same-site cookies. Rate limiting is keyed and database-backed, but IP/device reputation and broader abuse monitoring remain future controls.
- No production database, concrete production pool/LOGIN principal, signing/encryption key, delivery provider, backup schedule, restore drill, or live service connection has been provisioned.
- Production rollout still requires a real UNIBUD-controlled PostgreSQL instance, provisioning the separate LOGIN principals and HMAC signing-key row, secret-manager bindings and rotation, private networking, a live email/SMS delivery gateway, approved legal text and policy versions, IP/device abuse controls, operational monitoring, backup/restore drills, and a reviewed migration/rollback procedure.
