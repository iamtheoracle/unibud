# UNIBUD workforce access and onboarding runbook

Status: implementation in review on `foundation/workforce-identity-onboarding-v1`. This runbook describes the implemented branch contract; it is not evidence of production deployment.

## Access model

Workforce access is invite-only. There is no public staff/operator/administrator registration endpoint.

- The system generates a stable username in the form `ub-staff-<16 hex>`, `ub-operator-<16 hex>`, or `ub-admin-<16 hex>`.
- An authorised requester submits an invitation request. A different authorised approver must decide it.
- Admin invitations require a `platform_admin` approver. Operator invitations require a `platform_admin` or `operations_admin` approver.
- Approval creates a pending account and a 15-minute, six-digit activation code. The code is returned once to the approver; only its keyed digest is stored.
- The approver must deliver the activation code and generated username to the intended person through a verified, separate company-controlled channel. Never send the code through an unverified destination.
- Activation requires the username, code, first name, last name, email address, a new six-digit passcode and confirmation. The activation code is single-use and is revoked after five failed attempts.
- Email verification is mandatory. Successful verification moves the workforce identity to `mfa_enrollment_required`; it does not unlock the dashboard.
- The first authenticated workforce session must enrol an authenticator and complete a fresh TOTP challenge. Only then does the database mark workforce onboarding active and expose the workforce self-workspace.
- Subsequent workforce sign-ins use username plus passcode, followed by a fresh TOTP challenge for the current session.

## Six-digit passcode security boundary

A six-digit numeric passcode has only one million possible values and must never be treated as a strong password by itself. UNIBUD therefore:

- derives a username-bound HMAC prehash with a separate server-side pepper before scrypt;
- stores only the scrypt verifier, never the raw passcode;
- rate-limits username login attempts through the auth database;
- requires email verification and mandatory authenticator MFA before workforce dashboard access;
- binds Operations step-up to the exact account and session; and
- keeps the general personal-account password policy unchanged.

Do not disable MFA or reuse the workforce pepper as an activation, session-signing, or email-lookup key.

## Required server secrets

Configure unique random key material in each environment. Values below are hex-encoded bytes:

- `UNIBUD_WORKFORCE_ACTIVATION_HMAC_KEY`: at least 32 random bytes.
- `UNIBUD_WORKFORCE_PASSCODE_PEPPER`: at least 32 random bytes, distinct from the activation key.
- `UNIBUD_RATE_LIMIT_HMAC_KEY`: existing auth rate-limit key, at least 32 random bytes.
- `UNIBUD_IDENTITY_ENCRYPTION_KEY`: exactly 32 random bytes.
- `UNIBUD_IDENTITY_LOOKUP_HMAC_KEY`: at least 32 random bytes.

Keep these in the server secret manager, never in client bundles, browser storage, repository files, or logs. Rotation procedures for the two new workforce secrets must be completed before production use; do not rotate them ad hoc because existing activation and passcode verifiers depend on their key versions.

## Permission separation

The `workforce_role` value is an organisational designation, not an authorization grant.

Every newly approved workforce identity receives only the `workforce_self` Operations grant with `operations.workforce.self_access`. That grant enables the person's own MFA-protected workspace and duty activity trace. It does not grant access to member data, money, platform administration, staff records, or another person's activity.

Additional operator or administrator capabilities must be issued through the existing two-person Operations grant workflow. The role, username, email address, client request, or UI state cannot create permissions.

## Duty and access trace

The append-only `unibud_workforce_audit_events` ledger records invitation requests and decisions, activation failures and completion, email/MFA lifecycle changes, login success/failure, and duty events.

- Authenticated events derive actor account and session from the signed database session context.
- Pre-session login/activation events are explicitly recorded without a fabricated authenticated actor.
- Duty activity writes use `unibud_workforce_record_activity`, which requires the active workforce identity, the exact signed session and a current MFA step-up.
- Manager views expose a limited roster and activity fields, not encrypted email or passcode material.
- Dashboard metrics are database aggregates with explicit windows: 24-hour access/login events and seven-day duty events. They are not synthetic progress indicators.

Only call the duty-event procedure from a server-side workflow after that workflow has actually performed or verified the action. Never let a browser submit a claimed completed duty directly as proof.

## Important commands and operator checks

Before changing workforce access:

1. Inspect the current branch head, open PRs, issue acceptance criteria and exact-head CI.
2. Verify the requester has `operations.workforce.request` and a current MFA step-up.
3. Verify the approver is a different active account with `operations.workforce.approve` and a current MFA step-up.
4. For admin issuance, verify the approver holds the `platform_admin` role; for operator issuance, verify `platform_admin` or `operations_admin`.
5. Issue the code once, transfer it through the approved separate channel, and do not copy it into tickets, audit metadata, chat, email logs, or screenshots.
6. Confirm the employee verified email, enrolled MFA, and completed a fresh session challenge before treating the account as active.
7. Review the workforce audit trail and current database metrics; investigate repeated failed logins, denied duty events, unexpected role counts, and onboarding records stuck in a pending state.
8. Never edit workforce or grant tables directly in production. Use the approved server/database procedures and the dual-control lifecycle.

Useful database checks for an authorised migration/operations session:

```sql
SELECT status, workforce_role, count(*)
FROM public.unibud_workforce_accounts
GROUP BY status, workforce_role
ORDER BY workforce_role, status;

SELECT event_type, outcome, count(*)
FROM public.unibud_workforce_audit_events
WHERE occurred_at >= statement_timestamp() - interval '24 hours'
GROUP BY event_type, outcome
ORDER BY event_type, outcome;
```

These queries are for controlled operator review only. Application code must use the granted procedures, not direct table access.

## Remaining work / explicit deferrals

- Manager-side duty assignment, acceptance, submission and evidence-review lifecycle. Current audit hooks record actual server-side duty events, but no assignment board is claimed.
- Workforce suspension, revocation, termination and session-revocation workflow with dual approval.
- Safe versioned rotation for activation/passcode peppers and employee passcode recovery/reset.
- Manager notifications and scheduled expiry/cleanup of pending invitation requests and activation records.
- Production secret provisioning, delivery-provider verification, database migration rehearsal, backup/restore evidence, monitoring and incident-response exercises.
- Browser end-to-end coverage of the complete invite → approve → activate → verify email → username login → MFA enrollment → dashboard journey.

Until those gates pass in the target environment, this feature is built on a review branch and must not be represented as live or production-ready.
