# Oracle Arc implementation status

Updated: 2026-11-14

This is a delivery record, not a production-readiness claim. Oracle Arc remains an independent service for UNIBUD and separately registered My Realm applications.

## Current work — application identity foundation

Branch: `foundation/oracle-arc-app-identity-v1`  
Review: draft PR #31, stacked on PR #29  
Verified implementation head: `89456c2e22cb45a2a10032f61097a0039144639a`  
Tracking issue: #23

### Implemented and verified

- Independent Oracle Arc PostgreSQL schema and migration, separate from UNIBUD's application database.
- Separate non-login schema-owner, runtime and maintenance roles. Runtime role receives no direct table privileges; application operations use narrow SECURITY DEFINER procedures.
- Application registry with environment, status, scopes and per-application request quota.
- Multiple Ed25519 public-key credentials per application, allowing controlled overlap during credential rotation and immediate per-key revocation.
- Signed request verification over HTTP method, raw path/query, timestamp, nonce and exact request-body SHA-256 digest.
- Server-side environment binding, 60-second timestamp window, one-time nonce consumption and database-enforced per-app request quotas.
- Append-only audit events for authenticated requests, replay rejection, quota denial and scope denial.
- Bounded maintenance procedure purges expired nonces and rate-limit buckets in batches of at most 1,000 rows per table. No scheduler is included or claimed.
- New `GET /v1/apps/me` endpoint requires `identity.read` and returns only the calling application's public identity.
- Existing `GET /v1/integration/status` legacy compatibility endpoint remains available; it does not grant access to the app-scoped API.
- PostgreSQL 16 CI and tests for signature validity, replay, expiry, revocation, environment isolation, scope intersection, quota, audit immutability, bounded maintenance and runtime DB least privilege.

### Exact-head CI evidence

All three workflows passed on `89456c2e22cb45a2a10032f61097a0039144639a`:

- Oracle Arc API: run [43545499999](https://github.com/iamtheoracle/unibud/actions/runs/43545499999) — migration applied; 17 tests passed.
- Foundation checks: run [43545499921](https://github.com/iamtheoracle/unibud/actions/runs/43545499921) — PostgreSQL 16 migration/RLS isolation and concurrency checks passed.
- UNIBUD Web and Database: run [43545499947](https://github.com/iamtheoracle/unibud/actions/runs/43545499947) — migration validation, type checks, contracts, server security, lint, browser E2E and production build passed.

PR #31 remains draft/open/unmerged. No production migration, credential provisioning, merge or deployment occurred.

## Not yet implemented or verified

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
