# Oracle Arc API

Independent service boundary with its own application authentication, PostgreSQL database, deployment configuration, secrets, provider gateway, agent runtime, and audit trail. UNIBUD's application database credentials must never be reused by Oracle Arc.

## Local setup

From this directory:

1. Create a Python 3.12 virtual environment and install `requirements-dev.txt`.
2. Create a dedicated PostgreSQL database for Oracle Arc.
3. Apply migrations with a privileged migration-only connection:

   ```bash
   export ORACLE_ARC_MIGRATION_DATABASE_URL='postgresql://<migration-role>:<secret>@localhost:5432/oracle_arc'
   python migrate.py
   ```

4. Configure `ORACLE_ARC_DATABASE_URL` with the least-privilege `oracle_arc_runtime` role. Do not point the running API at the migration or database-owner role.
5. Set `ORACLE_ARC_ENVIRONMENT` to exactly one of `development`, `staging`, or `production`.
6. Run the API:

   ```bash
   uvicorn app.main:app --reload --port 8100
   ```

The migration creates a separate `oracle_arc` schema, non-login owner, runtime role, app registry, credential registry, replay store, quota buckets, and immutable audit events. Runtime access is through narrow SECURITY DEFINER procedures; the runtime role receives no direct table access.

## Application authentication

New application integrations use Ed25519-signed requests. A registered application has an environment-bound app record and one or more independently revocable public-key credentials. Private signing keys remain with the calling application and are never stored by Oracle Arc.

Each signed request supplies:

- `X-Oracle-Arc-Key-Id`: registered credential UUID.
- `X-Oracle-Arc-Timestamp`: Unix seconds, accepted within 60 seconds of server time.
- `X-Oracle-Arc-Nonce`: a fresh base64url random value of at least 16 bytes.
- `X-Oracle-Arc-Signature`: base64url Ed25519 signature.

The UTF-8 canonical payload is six newline-separated fields, with no trailing newline:

```text
v1
<UPPERCASE HTTP METHOD>
<raw path plus raw query string, if any>
<timestamp header exactly as sent>
<nonce header exactly as sent>
<lowercase hex SHA-256 digest of the exact request body>
```

The endpoint `GET /v1/apps/me` requires the `identity.read` scope. It returns only the authenticated application's public identity, environment, granted scopes, and quota. It does not return internal account identifiers, credential identifiers, or public-key material.

The database rejects nonce reuse and enforces each application's requests-per-minute quota atomically. Credential rotation supports overlapping active key IDs: register the replacement public key, verify it, then revoke the previous credential. Revocation is checked on every request.

## Enrollment and operational controls

There is deliberately no public application-provisioning or credential-management endpoint in this stage. Application enrollment, scope changes, and public-key registration require an independently approved, two-person operator procedure against the Oracle Arc database. Do not create production application records or issue credentials until that procedure and its audit evidence are in place.

The CI workflow uses a disposable PostgreSQL 16 instance and a dedicated runtime login to exercise the database permissions and request lifecycle. CI credentials are test-only and must never be reused.

## Health and readiness

- `GET /health` confirms only that the API process responds.
- `GET /ready` remains degraded while real inference and required durable dependencies are not configured and exercised.
- `GET /v1/integration/status` is retained as a legacy compatibility probe for existing server-to-server integrations. It does not grant access to the new app-scoped API.

A healthy process, a registered app, or a configured model label is not proof of inference, SPARK memory, ORBITS media processing, agent/tool execution, or production readiness. No live model provider is currently claimed.
