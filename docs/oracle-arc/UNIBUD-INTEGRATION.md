# UNIBUD ↔ Oracle Arc Integration Contract

## Purpose

UNIBUD connects to Oracle Arc through a server-to-server boundary. Browser code must never call Oracle Arc with a privileged API key. UNIBUD's backend owns user authentication, app authorization, rate limits, request validation, audit events, and the decision to call Oracle Arc.

## Deployment settings shown in the connection setup

| Setting | Meaning | Secret? | Owner |
|---|---|---:|---|
| `ORACLE_ARC_API_URL` | HTTPS base URL of the deployed Oracle Arc API, including the API prefix used by the deployment | No | UNIBUD backend deployment |
| `ORACLE_ARC_MODEL` | Model identifier approved for this UNIBUD integration | No | UNIBUD backend deployment |
| `ORACLE_ARC_API_KEY` | Server-to-server credential issued/accepted by Oracle Arc | Yes | UNIBUD backend secret manager |

The screenshot's secret-entry panel is a deployment configuration experience, not a place to paste credentials into a chat or frontend source. Prefer storing URL and model as ordinary server configuration and the key in the platform's encrypted secret store. If the deployment platform presents all three in one protected secret form, it must still avoid returning the key to the browser after save.

## Connection lifecycle

1. An authorised operator configures the API URL and model identifier.
2. The operator provisions a distinct, revocable service credential in Oracle Arc and stores it in UNIBUD's backend secret manager.
3. UNIBUD's backend calls `GET /v1/integration/status` with `Authorization: Bearer <server credential>`.
4. Oracle Arc returns only non-secret diagnostics: authenticated status, whether a model identifier is configured, and whether inference is actually configured.
5. UNIBUD records a timestamped connection result and displays Connected, Needs configuration, or Unreachable. Do not display Connected merely because a URL was saved or DNS resolved.
6. Before enabling AI features, the backend must additionally verify app registration, scopes, quotas, provider readiness, and the relevant feature's authorisation policy.

## Current API contract

- `GET /health`: process liveness only. It is not proof that AI works.
- `GET /ready`: currently reports degraded because provider routing, app registration, and durable dependencies are not implemented.
- `GET /v1/integration/status`: bearer-authenticated integration diagnostic. Returns no credentials or model secret material. Returns 503 if server authentication is not configured and 401 for invalid credentials.

The status endpoint deliberately reports `inference: not-configured` until a real provider adapter and inference test exist. A configured model label is not evidence that a model can answer requests.

## Security requirements

- Keep the API key in backend-only secret storage; never use a `NEXT_PUBLIC_*` variable for it.
- Do not log Authorization headers, credentials, full prompts, or private user data.
- Use HTTPS outside local development. Rotate and revoke credentials; use separate credentials per environment and app.
- Restrict CORS; this service endpoint is server-to-server and should not require browser CORS access.
- Apply request timeouts, bounded retries, rate limits, quotas, audit correlation IDs, and payload limits in the UNIBUD backend.
- Fail closed when configuration or authorization is missing. Never silently fall back to an unapproved remote provider.
- The endpoint is a connectivity/authentication diagnostic, not a general inference endpoint and not proof of full platform security.

## Not implemented yet

No production Oracle Arc URL, API key, model provider, model inference route, app registry, or live deployment is configured in this repository. Do not enter fabricated values. The integration becomes live only after both services are deployed, secrets are provisioned out-of-band, the authenticated check succeeds from the UNIBUD backend, and a real inference smoke test passes.
