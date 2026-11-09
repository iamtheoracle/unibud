# First-party authentication and onboarding foundation

## Scope and current boundary

This foundation supports first-party email/phone registration and password login. Google and Apple sign-up are not part of the agreed onboarding flow. Account, authentication identity, password verifier, verification challenge, session, and profile remain separate records.

## Database trust boundary

- `unibud_app` is a non-login application group role. Account-scoped reads use FORCE RLS and a short-lived HMAC-signed, transaction-local account context. User-settable PostgreSQL GUC values alone are never trusted.
- `unibud_auth` is a non-login role granted EXECUTE on narrow authentication procedures. It has no direct table DML.
- `unibud_auth_owner` is NOLOGIN and BYPASSRLS because SECURITY DEFINER procedures perform pre-session identity lookup and session bootstrap. It has DML only on identity/auth tables and owns only the reviewed auth procedures. Never grant it to a runtime login or application role.
- `unibud_profile_owner` is a separate NOLOGIN/BYPASSRLS owner for reviewed profile procedures. It is not a runtime login. Its functions verify the signed account context before creating profiles, granting/revoking delegation, or changing active profile context.
- Application runtime and authentication pools must use separate LOGIN principals granted only the corresponding group role. Neither pool may connect as a superuser, table owner, or BYPASSRLS role.
- Production database LOGIN principals, connection URLs, signing/encryption keys, verification gateway credentials, and network boundaries are not yet provisioned. No email/SMS delivery provider is silently selected.

## Procedure boundary

- Migration 0004 provides narrow account creation, identity lookup, verification challenge, password reset, and session issue/lookup/revoke/rotation procedures.
- Migration 0005 adds profile creation, exact-profile delegated grant/revocation, and session-bound active-profile switching.
- Migration 0008 adds challenge-owner lookup, session idle touch, and account-scoped session revocation. Migration 0009 makes session lookup return the active profile context and preserves that context across session rotation. Migration 0010 adds atomic database-backed rate limits with action-separated buckets and bounded retention.
- The application calls these procedures with bound parameters. It must never pass a client-supplied account ID as authority; account identity comes from a verified session or challenge record.

## Credential and verification rules

- Passwords are stored only as scrypt verifiers (N=2^17, r=8, p=1, 64-byte output, random 16-byte salt).
- Verification codes are six-digit, short-lived values. Persistence stores keyed digests, attempt counters, expiry, and consumption/revocation state—not raw codes or destination addresses.
- Email identifiers are normalised case-insensitively; phone identifiers require E.164. The RPC adapter encrypts identifiers with AES-256-GCM and uses a separate HMAC lookup key.
- Public login errors are generic. Recovery request responses do not reveal whether an identity exists.
- Challenge delivery failures revoke the persisted challenge. Rate limiting is database-backed for account/identity/challenge buckets. Additional IP/device-level abuse controls and operational alerting still need implementation.
- Session credentials are random opaque tokens; only SHA-256 digests are persisted. Rotation revokes the previous session atomically, idle and absolute expiry are enforced, password recovery revokes all active sessions, and the selected profile/context version is retained across session rotation.
- Session cookies must be Secure, HttpOnly, SameSite, scoped, rotated, and never exposed to client-side JavaScript. Cookie routes are wired with HttpOnly, SameSite=Lax, production Secure and __Host- cookie attributes; deployment must use HTTPS.

## Profile and onboarding boundaries

Personal, creator, and page/community profiles remain distinct. One account may own multiple creator profiles and manage multiple page/community profiles. Delegated membership is bound to the exact profile and its canonical owner; owner, delegate, and unrelated-account visibility are tested independently. One non-archived personal profile is enforced per account.

Onboarding derives the account only from a verified session, requires explicit terms and privacy acceptance, and asks the repository to atomically create or return the personal profile, owner membership, and acceptance records. The profile and onboarding PostgreSQL repository adapters, dual role-specific PostgreSQL pools, and authenticated registration/login/verification/recovery/logout/session/profile/onboarding routes are implemented. The verification gateway uses an explicitly configured HTTPS endpoint with idempotency keys and no-store requests.

## Verification status

GitHub Actions applies migrations 0001–0010 to disposable PostgreSQL 16 and runs synthetic SQL isolation/immutability tests. Web CI runs pure service tests, TypeScript checks, lint, and build. Passing CI is not evidence that production secrets, pools, providers, delivery channels, cookie settings, backups, or operations are deployed.
