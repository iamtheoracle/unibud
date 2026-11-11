# Operations MFA ephemeral-state maintenance runbook

## Status and deployment boundary

Migration 0036 provides the bounded cleanup procedure. Migration 0038 adds a dedicated NOLOGIN execution role and grants it only the ability to invoke that procedure. The worker entrypoint is scripts/run-operations-mfa-maintenance.sh.

**Recurring execution is not configured.** The repository currently has no selected production API runtime, database hosting provider, scheduler service, production connection, or secret-manager binding. The local Docker Compose file is development-only and the GitHub Actions Foundation workflow is CI-only. Do not treat either as a production scheduler.

This runbook is an implementation contract. A named hosting/runtime decision and an authorised deployment change are required before recurring execution is activated.

## What the worker does

Each invocation runs one transaction and calls only:

    unibud_private.maintain_operations_mfa_ephemeral_state(batch_size)

The database procedure:
- expires due pending MFA security requests and writes system-attributed audit events;
- removes expired exact-session MFA step-up records;
- retains consumed assertion nonces for 24 hours beyond their expiry before deleting them;
- removes rate-limit buckets that have been untouched for 24 hours.

The procedure is idempotent, uses bounded batches and FOR UPDATE SKIP LOCKED. The hard batch ceiling is 1,000; the worker defaults to 200. The worker sets a 30-second statement timeout, a 3-second lock timeout, a 10-second idle-in-transaction timeout and a stable application name. A non-zero process exit means the invocation failed and must be surfaced to monitoring.

## Database identity and least privilege

The migration creates only unibud_ops_scheduler, a NOLOGIN, non-superuser, non-owner, non-BYPASSRLS role. It has schema usage and EXECUTE on the one bounded maintenance function. It has no direct read/write access to the protected MFA tables and cannot call the lower-level expiry function directly.

An authorised DBA must separately provision a dedicated login principal in the selected database environment. Do not make unibud_ops_owner a login role, do not use the application login, and do not give the scheduler login superuser, database-owner, table-owner, or broad table privileges.

The deployment-specific procedure must:
1. Create a unique, dedicated login principal for this worker using the selected provider's secret manager or short-lived database identity mechanism. Never place a password in source control, CI logs, this runbook, or an image.
2. Grant that login only the required database CONNECT privilege and membership in unibud_ops_scheduler, with INHERIT FALSE, SET TRUE (PostgreSQL 16+). The login must explicitly SET ROLE unibud_ops_scheduler, as the checked-in worker does.
3. Ensure the login has no other role memberships and no direct privileges on protected tables, schemas, or functions.
4. Require encrypted database transport with certificate and hostname verification. The worker defaults PGSSLMODE to verify-full; provision the provider CA through PGSSLROOTCERT where required. A weaker mode is rejected unless the explicit UNIBUD_ALLOW_INSECURE_LOCAL_TEST=true test-only override is set. Never set that override in a hosted scheduler. Use private networking or provider-native secure connectivity, and rotate/revoke the credential.
5. Store the connection binding only in the trusted scheduler's secret manager as DATABASE_URL. The script transfers it to libpq through the process environment and removes DATABASE_URL before starting psql so the URI is not placed in psql's command-line arguments. Never expose it to the web client, general application runtime, build logs, or user-controlled job parameters.

The login principal and its credential are environment-specific and are intentionally not created by a migration.

## Scheduler contract

After the hosting provider and scheduler are approved, configure a single recurring invocation:
- Recommended initial cadence: every 5 minutes.
- Batch size: 200; adjust only from measured backlog/runtime evidence and never above 1,000.
- Maximum execution time: 45 seconds at the scheduler layer; the SQL statement timeout is 30 seconds.
- Prevent uncontrolled overlapping invocations. The database's row locks and SKIP LOCKED make concurrent work safe, but do not replace scheduler-level concurrency limits.
- Retry transient failures with bounded exponential backoff; do not retry indefinitely.
- Emit structured success/failure logs with the four returned counts, duration, environment and invocation ID. Do not log the connection string, credentials, user data, assertion material or session identifiers.
- Alert on two consecutive failed invocations, missing successful execution for 15 minutes, or sustained non-zero backlog. Route alerts to the authorised Operations on-call path.
- Maintain an auditable record of schedule changes, secret rotation, access review and incident response.

## Verification before activation

1. Apply migrations 0036, 0037 and 0038 through the reviewed migration process.
2. Run the PostgreSQL migration and RLS suite, including tests 0036 and 0038.
3. Run bash scripts/run-operations-mfa-maintenance.sh against an isolated PostgreSQL environment using the dedicated scheduler login. Confirm it can set the scheduler role and invoke the function.
4. As the scheduler login, verify direct SELECT/INSERT/UPDATE/DELETE on the protected MFA tables is denied and direct invocation of the lower-level expiry function is denied.
5. As unibud_app, verify the maintenance function remains denied.
6. Test timeout, connection loss, scheduler retry, duplicate invocation, overlapping invocation, failure alert and recovery.
7. Confirm the audit rows for expiry are system-attributed and contain no user/session secrets.
8. Obtain independent security review and an authorised production change approval before enabling the schedule.

## Current evidence

- The worker script, scheduler role migration and role-isolation test are repository implementation artifacts.
- CI can verify the migration and exercise the worker using its disposable PostgreSQL service account.
- No hosting provider, production scheduler, production login principal, production secret, production database grant, live recurring invocation, alert route or production deployment is claimed.
