# First-party authentication and onboarding foundation

## Scope and current boundary

This foundation supports first-party email/phone registration and password login. Google and Apple sign-up are not part of the agreed onboarding flow. Account, authentication identity, password verifier, verification challenge, session, and profile remain separate records.

## Database trust boundary

- `unibud_app` is a non-login application group role. Its account-scoped table access is governed by FORCE RLS and signed, short-lived transaction context.
- `unibud_auth` is a non-login role granted EXECUTE on a narrow set of reviewed authentication procedures. It receives no direct table DML.
- `unibud_auth_owner` is NOLOGIN and BYPASSRLS because the SECURITY DEFINER procedures need to perform pre-session identity lookup and bootstrap. It has DML only on the identity/auth tables and owns only the listed procedures. It must never be granted to a runtime login or inherited by an application role.
- A separately provisioned LOGIN principal may be granted `unibud_auth`; the connection pool and secret manager are not yet provisioned.
- Runtime database logins, HMAC/encryption keys, SMTP/SMS delivery, and production network boundaries remain unconfigured.

## Procedure boundary

Migration 0004 provides narrow operations for account creation, identity lookup, challenge creation/revocation/verification, password reset, session issue/lookup/revoke/rotation. Password reset consumes the verified challenge and revokes every active account session in one database transaction. Session rotation locks and revokes the previous session before inserting its replacement.

The application must never pass a client-supplied account ID as authority. It resolves the account from a verified session or a challenge row. Authentication procedures are not general SQL execution and must be called with bound parameters.

## Credential and verification rules

- Passwords are stored only as scrypt verifiers (N=2^17, r=8, p=1, 64-byte output, random 16-byte salt).
- Verification codes are six-digit, short-lived, one-time values. Persistence stores keyed digests, attempt counters, expiry, and consumption/revocation state—not raw codes or destination addresses.
- Email identifiers are normalised case-insensitively; phone identifiers require E.164.
- Public login errors are generic. Recovery request responses do not reveal whether an identity exists.
- Challenge delivery failures revoke the persisted challenge. Rate limiting and abuse controls are injected service dependencies and still need production-backed implementations.
- Session cookies must be Secure, HttpOnly, SameSite, scoped, rotated, and never exposed to client-side JavaScript. Cookie route handlers are not yet wired.

## Profile and onboarding boundaries

Personal, creator, and page/community profiles remain distinct. One account may own multiple creator profiles and manage multiple page/community profiles. Delegated membership is bound to the exact profile and its canonical owner; the owner, delegate, and unrelated-account RLS cases are tested independently. A single non-archived personal profile is enforced per account.

Onboarding derives the account only from a verified session, requires versioned terms and privacy acceptance, and asks the repository to atomically create or return the personal profile, owner membership, and acceptance records. The orchestration service is implemented; its production persistence adapter and user-facing route are pending.

## Verification status

GitHub Actions applies the migrations to a disposable PostgreSQL 16 service and runs synthetic SQL isolation/immutability tests. Web CI runs pure service tests, TypeScript checks, lint and build. Passing CI is not evidence that production secrets, providers, database connections, delivery channels, cookie settings, backups, or operations are deployed.
