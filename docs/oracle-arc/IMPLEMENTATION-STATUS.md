# Oracle Arc implementation status

Updated: 2026-11-14

This is a delivery record, not a production-readiness claim. Oracle Arc remains an independent service for UNIBUD and separately registered My Realm applications.

## Current work — application identity foundation

Branch: `foundation/oracle-arc-app-identity-v1`  
Base: `foundation/search-privacy-filter-v1` at `df991dabd98b9c880270e0665050ecd904167f92`  
Tracking issue: #23

Implemented in code on this review branch; exact-head CI is pending:

- Independent Oracle Arc PostgreSQL schema and migration, separate from UNIBUD's application database.
- Separate non-login schema owner, runtime role and maintenance role. Runtime role receives no direct table privileges; application operations use narrow SECURITY DEFINER procedures.
- Application registry with environment, status, scopes and per-application request quota.
- Multiple Ed25519 public-key credentials per application, allowing controlled overlap during credential rotation and immediate per-key revocation.
- Signed request verification over HTTP method, raw path/query, timestamp, nonce and exact request-body SHA-256 digest.
- Server-side environment binding, 60-second timestamp window, one-time nonce consumption and database-enforced per-app request quotas.
- Append-only audit events for authenticated requests, replay rejection, quota denial and scope denial.
- Bounded maintenance procedure purges expired nonces and rate-limit buckets in batches of at most 1,000 rows per table. No scheduler is included or claimed.
- New `GET /v1/apps/me` endpoint requires `identity.read` and returns only the calling application's public identity.
- Existing `GET /v1/integration/status` legacy compatibility endpoint remains available; it does not grant access to the app-scoped API.
- PostgreSQL 16 CI service and tests for signature validity, replay, expiry, revocation, environment isolation, scope intersection, quota, audit immutability, bounded maintenance and database least privilege.

## Not yet implemented or verified

- Exact-head CI and PostgreSQL test results for the final branch head.
- Two-person application enrollment, scope-change and credential-rotation workflow with durable approval records. No public provisioning endpoint exists.
- Scheduled execution, monitoring and alerting for bounded maintenance.
- Provider gateway, real inference adapter, streaming, model policy, usage/cost metering and evaluation harness.
- Agent registry/runtime, tool grants/dispatch, approvals, revocation and idempotency.
- SPARK consented memory storage, inspect/correct/delete controls, retention and cross-app isolation tests.
- ORBITS secure document/image/audio ingestion, malware scanning, processing isolation, retention and deletion.
- Production database hosting, environment topology, key ceremony, deployment, monitoring, incident response, backup/restore and recovery evidence.
- Real model/provider smoke tests. A configured model label remains insufficient evidence.

## Safety boundary

- No provider or model is represented as configured or operational.
- No inference, memory retrieval, media processing, agent action, or tool execution is exposed by this change.
- No production app credentials are provisioned.
- No production migration, merge, deployment, or public launch is authorized.
- Keep readiness degraded until real dependencies and operational controls are exercised.
