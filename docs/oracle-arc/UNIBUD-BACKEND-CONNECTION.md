# UNIBUD Oracle Arc backend integration

## Implemented server boundary

The web application now has a server-only Oracle Arc client and a protected diagnostics route:

- `GET /api/internal/integrations/oracle-arc/status`
- Runtime: Node.js, dynamic/no-store
- Authentication: `Authorization: Bearer <UNIBUD_INTEGRATION_ADMIN_TOKEN>`
- Oracle Arc credentials are read only from server environment variables.
- The response is an allow-listed diagnostic object; it never includes the API key, raw upstream body, or configured secret values.

## Server environment

Configure these in the backend deployment's encrypted environment/secret manager:

- `ORACLE_ARC_API_URL`: versioned base URL, e.g. `https://arc.example.com/v1`. Local development may use `http://localhost:8100/v1`.
- `ORACLE_ARC_MODEL`: model identifier UNIBUD is configured to request. This is configuration metadata, not proof the model works.
- `ORACLE_ARC_API_KEY`: server-to-server credential accepted by Oracle Arc.
- `UNIBUD_INTEGRATION_ADMIN_TOKEN`: temporary high-entropy bearer token protecting this internal diagnostics route.

Never use `NEXT_PUBLIC_*` for any of these values. Never commit real values or print them in logs.

## Diagnostic states

- `not_configured`: one or more required settings are absent.
- `connected`: Oracle Arc authenticated the service and returned the expected identity. This does not prove inference works.
- `unauthorized`: Oracle Arc rejected the service credential.
- `unreachable`: timeout, network error, or non-success upstream response.
- `misconfigured`: invalid transport URL or unexpected upstream identity/response.

The route uses HTTPS except for loopback development, a five-second timeout, no caching, and constant-time credential comparison. It does not proxy prompts or expose an inference endpoint.

## Admin UI and next security dependency

The consumer-facing page must not expose this route or its bearer token. A proper operator screen must be mounted behind UNIBUD's first-party admin session and role/permission checks. Those identity and RBAC foundations are not implemented yet, so the operator UI must remain unavailable rather than shipping a public secret-entry form. The temporary bearer gate is for controlled backend diagnostics only and should be replaced by session-derived operator authorisation before production.

## Not yet live

No production URL, API key, model provider, or production deployment is configured by this code. A successful diagnostic means only that authenticated service connectivity works. A separate authorised inference smoke test, provider readiness check, audit trail, quotas, and per-app grant enforcement are still required before enabling AI surfaces.


## Authenticated status evidence hardening

The status client now refuses redirects, requires an HTTPS remote URL, accepts only JSON status responses, caps the response body at 8 KiB, validates the expected `service=oracle-arc` identity and `authenticated=true` assertion, and rejects malformed or incomplete payloads. Upstream response bodies and exception text are never returned. A configured model label cannot make inference ready: Oracle Arc must also report `model_configured=true` and `inference=ready`.

The operator-only endpoint remains `GET /api/internal/integrations/oracle-arc/status`, protected by the backend-only `UNIBUD_INTEGRATION_ADMIN_TOKEN`. It is not mounted in the consumer account-closure page and must not be called from browser code. The current token gate is a controlled diagnostics boundary, not a substitute for future session-derived operator RBAC.

Automated tests cover missing configuration, HTTPS enforcement, authenticated identity, authentication rejection, upstream failures, malformed content, oversized responses, redirect/network failure, inference misreporting and operator bearer authentication. These tests use mocked responses; they do not assert that a deployed Oracle Arc endpoint is currently reachable.
