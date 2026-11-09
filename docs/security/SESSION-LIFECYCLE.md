# Session Lifecycle Contract

## Scope

This contract began as server-side evaluation of trusted session metadata. The current implementation now adds first-party credential verification, opaque session issuance, database lookup, rotation, idle renewal, revocation, and secure browser-cookie routes. It is still not a production deployment.

## Required lifecycle

1. Authenticate the presented credential using the selected authentication implementation.
2. Resolve the credential to a server-side session record; never trust a client-supplied account ID or session status.
3. Confirm the account remains active and the session is not revoked or expired.
4. Rotate the session identifier after authentication and privilege changes.
5. Enforce idle and absolute expiration; refresh idle expiry only through a trusted server action.
6. Revoke the current session on logout and support revocation of all sessions after recovery, compromise, account restriction, or user request.
7. Record security-relevant session creation, rotation, revocation and suspicious failures without logging raw cookies, bearer tokens or secrets.
8. Use secure, HTTP-only, same-site cookies for browser sessions; apply CSRF protection to state-changing cookie-authenticated requests.

## Contract implementation

- `packages/contracts/src/session.ts` evaluates account status, subject match, revocation, issue time, idle expiry and absolute expiry.
- `credentialReference` is an opaque server-side reference, not a raw token or cookie.
- All missing, mismatched, revoked, malformed or expired sessions deny access.
- Tests use synthetic identifiers and deterministic timestamps.

## Implemented service boundary

- `SessionService` issues 256-bit opaque credentials and persists only SHA-256 digests through restricted auth procedures.
- Validation checks account status, revocation, issue time, idle expiry and absolute expiry; renewal is an atomic procedure.
- Rotation preserves the absolute expiry and the persisted active-profile context; the old credential is revoked atomically.
- Browser routes issue HTTP-only, same-site cookies, expose logout and rotation, and validate session state server-side.
- Cookie-authenticated state-changing routes check the request Origin against the request origin.
- Password recovery revokes all active sessions for the account.

## Remaining work

No production session keys, database LOGIN credentials, secret-manager rotation, deployment verification, user-facing device/session management, IP/device abuse detection, or incident alerting is configured. The service has CI evidence against disposable PostgreSQL 16 only; this is not production verification.
