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
- The duty board uses `unibud_workforce_duty_assignments`: an authorised manager assigns work; the employee must accept, start and submit a completion note; a different workforce account with approval permission reviews the submission before it can become completed.
- Employee transitions are constrained to `assigned → accepted → in_progress → submitted`. Employees cannot mark their own work completed or review their own submissions. Managers approve or reject submitted work through a separate MFA-gated endpoint.
- Assignment, acceptance, start, submission, approval and rejection are written to the immutable workforce audit ledger with the actor account and exact session.
- `unibud_workforce_record_activity` remains available for additional server-side operational events after the corresponding action has actually happened.
- Employee workspace: `/workforce/home`. Manager directory, invitation queue, duty assignment and audit review: `/operations/workforce`.
- Manager views expose a limited roster and activity fields, not encrypted email or passcode material.
- Database metrics report workforce counts by status and designation, duties assigned/submitted/completed/rejected/overdue, 24-hour access/login events and seven-day duty activity. These are database aggregates, not synthetic progress indicators.

The employee browser can submit a completion note and optional evidence reference, but the status remains `submitted` until an authorised manager reviews it. An evidence reference is not itself verified proof; the reviewer must validate it through the relevant approved workflow.

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

SELECT status, count(*)
FROM public.unibud_workforce_duty_assignments
GROUP BY status
ORDER BY status;

SELECT duty_code, status, due_at, assigned_at, submitted_at, completed_at
FROM public.unibud_workforce_duty_assignments
WHERE status NOT IN ('completed','rejected','cancelled')
ORDER BY due_at NULLS LAST, assigned_at;
```

These queries are for controlled operator review only. Application code must use the granted procedures, not direct table access.

## Remaining work / explicit deferrals

- Workforce suspension, revocation, termination and immediate session-revocation workflow with dual approval.
- Evidence upload, malware scanning, immutable attachment retention and automated evidence verification. The current duty board stores a user-supplied evidence reference and requires manager review; it does not claim to verify attachments.
- Safe versioned rotation for activation/passcode peppers and employee passcode recovery/reset.
- Manager notifications and scheduled expiry/cleanup of pending invitation requests and activation records.
- Production secret provisioning, delivery-provider verification, database migration rehearsal, backup/restore evidence, monitoring and incident-response exercises.
- Browser end-to-end coverage of the complete invite → approve → activate → verify email → username login → MFA enrollment → dashboard journey.

Until those gates pass in the target environment, this feature is built on a review branch and must not be represented as live or production-ready.
