# Session Lifecycle Contract

## Scope

This contract defines server-side evaluation of trusted session metadata. It does not authenticate a presented cookie, validate a bearer token, store a session, or issue credentials.

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

## Not implemented yet

No session database table, credential hashing/lookup, cookie issuance, rotation endpoint, CSRF middleware, logout endpoint, device/session management UI, global revocation workflow, or production key management is implemented by this contract.
