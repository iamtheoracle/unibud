# Trusted PostgreSQL Access and Account Isolation

**Status:** Implemented as a PostgreSQL migration and synthetic CI test; production key provisioning and service wiring remain pending.

## Threat model and trust boundary

A PostgreSQL custom setting such as `app.account_id` is user-forgeable. RLS policies must never treat an account ID GUC as proof of identity. Migration 0002 instead requires a short-lived HMAC over the exact tuple `account_id:expiry_epoch:nonce`. The trusted server computes that HMAC only after validating the opaque session against server-side session storage. The database verifier checks the signature before returning an account UUID to row policies.

The runtime may set arbitrary custom settings, but changing the account, expiry or nonce without a matching HMAC yields a NULL account context and therefore no account-scoped rows. The signature is limited to a 120-second validity window. Use a fresh nonce for each request/transaction.

## Roles

- `unibud_migrator`: NOLOGIN migration group; grant to a separately provisioned migration credential only during controlled deployment.
- `unibud_app`: NOLOGIN runtime group; receives scoped DML grants and RLS policies, never ownership, superuser, BYPASSRLS, DELETE or TRUNCATE.
- `unibud_readonly`: NOLOGIN reporting group; SELECT only on a restricted table set and subject to the same signed context policies.
- Provision separate LOGIN principals per service and environment out-of-band. Never use the database owner, migration credential, or superuser in web/runtime code.

## HMAC key handling

Generate a cryptographically random key of at least 32 bytes independently for each environment. Deliver it to the trusted backend signer through the secret manager and provision the verifier copy into `unibud_private.context_signing_keys` through a privileged deployment process. Do not commit a key, expose it to clients, grant runtime SELECT on the key table, or log signatures. Rotate by introducing a new active key, switching signer and verifier in a coordinated release, then retiring the old key. The current migration supports one active key; key-rotation overlap needs a follow-up migration before zero-downtime rotation.

The backend must:
1. Authenticate the opaque cookie/token and resolve its digest to a non-revoked session.
2. Check account lifecycle, session idle/absolute expiry, verification and risk controls.
3. Derive account ID from that trusted session record, never from request JSON, URL, headers or a client-selected profile.
4. Generate a new nonce and short expiry; HMAC the exact UTF-8 tuple.
5. Begin a database transaction, set all four `unibud.*` settings with transaction-local `set_config(..., true)`, then perform authorised queries.
6. Commit/rollback promptly. Never use session-persistent `SET` values with pooled connections.

RLS is defence in depth, not a replacement for domain authorisation. A valid account context does not grant access to every profile, school record, conversation, order, Flow ledger entry, staff tool or Oracle Arc resource. Each domain still checks its own grants and lifecycle.

## Important residual risks and deployment gates

- The HMAC key is shared between the trusted signer and database verifier. Keep it in independent secret-manager bindings, restrict both paths, rotate it, and assess compromise of either side.
- A compromised trusted backend can sign another account; this architecture assumes backend session validation and signer isolation are correct.
- A SQL injection can replay a context signature visible in its transaction until expiry; short TTL, transaction-local settings, nonce uniqueness and parameterised queries reduce this risk. The signer must not offer a signing endpoint to arbitrary callers.
- Superusers and roles with BYPASSRLS can bypass policies. They must never be used by app services.
- The RLS policies cover the current identity tables only. New tenant-owned tables must ship with explicit RLS and cross-account tests before application use.
- This does not implement the TypeScript signer, database pool transaction wrapper, credential/verification service, login, registration, recovery, or profile APIs.
- CI runs against disposable PostgreSQL 16 with synthetic fixtures. No production database, key, or real-user data is provisioned.

