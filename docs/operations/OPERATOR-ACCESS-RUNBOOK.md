# UNIBUD Operations access runbook

## Security model

Operations access is a global account-level grant, not a profile membership. Student, tutor, institution representative, creator, page/community administrator, moderator, seller, provider, professional or other profile roles do not confer Operations authority.

The application authenticates the opaque session cookie through the existing first-party session service. The route establishes a short-lived HMAC-signed account claim and a separately signed, versioned account+session claim from the validated server-side session; PostgreSQL independently verifies both claims and the live persisted session before deriving the actor. The account claim uses `UNIBUD_DB_CONTEXT_HMAC_KEY` / `unibud_private.context_signing_keys`; the session claim uses the separate `UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY` / `unibud_private.session_context_signing_keys`. Never reuse one key for both purposes. The Operations permission and audit functions accept no caller-supplied account UUID. The browser cannot submit an account ID, role or permission to this route.

The app database principal can execute only the narrow permission and audit functions. It has no direct table access to operator grants or audit events. The non-login `unibud_ops_owner` role owns the protected tables and SECURITY DEFINER functions; it is BYPASSRLS but has no LOGIN and is not an application connection role.

## Provisioning an operator

Only an authorised database administrator using a controlled administrative connection may provision a grant. Do not create a public HTTP endpoint for granting or revoking Operations roles.

Before provisioning:
1. Verify the person's identity and employment/contract authority outside the application.
2. Verify the target account is active and belongs to the intended operator.
3. Record the approval/ticket reference in the administrator's controlled change record.
4. Select the narrowest role and permission set required.
5. Use a short expiry for temporary access.

Example for an integration-status reader (replace the UUID and approver UUID with verified values; never paste secrets here):

```sql
INSERT INTO public.unibud_operator_grants (
  account_id, operator_role, permissions, granted_by, expires_at
)
SELECT
  '<VERIFIED_OPERATOR_ACCOUNT_UUID>'::uuid,
  'integration_operator',
  ARRAY['integrations.verification_delivery.read']::text[],
  '<APPROVING_ADMIN_ACCOUNT_UUID>'::uuid,
  clock_timestamp() + interval '30 days'
WHERE EXISTS (
  SELECT 1 FROM public.accounts
  WHERE id = '<VERIFIED_OPERATOR_ACCOUNT_UUID>'::uuid
    AND status = 'active'
);
```

Review the inserted row and ensure exactly one row was created. Do not grant broad permissions to support or integration operators. The migration's permission allow-list rejects unknown permissions.

## Revocation

Revocation is immediate at the next authorization check; no session claim caches the Operations role. Use an administrator-controlled connection:

```sql
UPDATE public.unibud_operator_grants
SET revoked_at = clock_timestamp(),
    revocation_reason = 'access_review_or_role_change'
WHERE account_id = '<VERIFIED_OPERATOR_ACCOUNT_UUID>'::uuid
  AND revoked_at IS NULL;
```

Verify that the permission function returns false for every revoked grant. Session revocation is a separate account-security action and must use the reviewed session-maintenance procedure; do not invent or run a substitute SQL update against session tables.

## Audit and review

Every request to the verification-delivery status endpoint records an append-only event with a random request UUID, permission name, outcome, timestamp and (when authenticated) the database-verified account and exact session UUID. No session token, email, phone, provider URL, credential or request body is stored.

Review operator grants at least monthly and after role changes, contract termination or suspected compromise. Review audit events through a separately authorised read-only operational process; no audit-read endpoint is exposed by this change.

## Boundaries

- This PR protects the verification-delivery metadata diagnostic only.
- The endpoint does not call the delivery provider and sends no email, SMS or verification code.
- Provider identity and a read-only health contract remain unresolved.
- No operator grant is provisioned by this migration.
- Operations MFA enrollment/challenge/recovery routes and UI, password reauthentication, failure counters/lockout, atomic recovery-code redemption, audit lifecycle, grant-management workflow, audit search/export, alerting and independent security review remain outstanding. Migration 0024 now adds a protected assertion nonce ledger and exact-session step-up table; a signed server assertion is consumed by PostgreSQL, which atomically advances the TOTP step and creates a five-minute step-up. The Operations permission function now fails closed without an active, unlocked MFA credential and current exact-session step-up. An enrollment-start route now reauthenticates the current account password, encrypts a new seed, and creates only a ten-minute pending credential through a signed one-time database procedure. It returns a no-store provisioning URI. Pending enrollment does not activate MFA. Enrollment confirmation and the exact-session TOTP challenge routes are now implemented, but browser UI/E2E, recovery, disable/reset, status, MFA-specific audit/notifications, lifecycle invalidation, key provisioning and independent review remain outstanding. Existing Operations endpoints remain denied unless a valid active credential and current exact-session step-up are present. The database audit writer also derives the effective allowed/denied outcome, and Foundation CI runs a two-connection same-assertion concurrency test requiring exactly one success. MFA is NOT operational end-to-end.
- Do not run this migration in production until it has passed the PostgreSQL migration suite and received an authorised database change review.


## Operations MFA design and current status

The intended operator second factor is an authenticator-app TOTP credential (RFC 6238, SHA-1, six digits, 30-second period) with one time-step of clock tolerance. TOTP seeds are encrypted using AES-256-GCM and account-bound associated data. Recovery codes are random, shown once, and stored only as account-bound keyed digests. Accepted TOTP steps must be persisted atomically to prevent replay; recovery-code redemption must be atomic and single-use.

Cryptographic primitives and protected persistence now exist. Migration 0022 creates pending/active credential and recovery-code storage; migration 0024 adds assertion nonce consumption and exact-session step-up records. The server assertion helper binds account, session, purpose, issue/expiry, nonce and matched TOTP step with a distinct HMAC key. PostgreSQL verifies and consumes the assertion and updates the monotonic TOTP counter in one transaction. The Foundation workflow includes the migrations and PostgreSQL tests; exact-head CI must pass before this checkpoint is accepted.

Before enabling MFA:
1. Provision separate 32-byte account-context (`UNIBUD_DB_CONTEXT_HMAC_KEY`), session-context (`UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY`), MFA assertion (`UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY`), TOTP seed encryption (`UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY`) and recovery-code HMAC (`UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY`) keys from the approved secret manager. Provision matching database verifier copies into the respective private key tables through a controlled database-administration procedure. The account and session verifier keys are provisioned into their respective private database key tables through a controlled database-administration procedure; the application receives only the matching server-side secret-manager bindings. Never store keys in source control, browser code, logs or deployment artifacts.
2. Add narrow account-bound database procedures using only the HMAC-verified transaction identity; no caller-supplied account UUID or caller-settable GUC is trusted.
3. Add a server-authenticated proof for TOTP acceptance and exact-session step-up; do not accept a caller-supplied time-step as proof.
4. Implement atomic monotonic TOTP replay prevention and atomic single-use recovery-code redemption.
5. Implement enrollment confirmation, login challenge, recovery, disable and regeneration routes with password reauthentication, attempt limits, throttling and lockout.
6. Bind recent MFA assurance to the exact authenticated session and require it on every privileged Operations endpoint.
7. Audit enrollment, successful/failed step-up, recovery redemption, disable, key rotation and operator lockout.
8. Test cross-account isolation, replay, concurrent redemption, expired challenges, throttling, lockout and session revocation.
9. Complete independent security review before activation.

MFA is currently **not enabled**. No current operator is to be treated as protected by this feature.


### Enrollment confirmation checkpoint — 2026-11-11

Migration 0026 adds `unibud_operator_mfa_confirm_enrollment`. It verifies the signed assertion using the current database-verified account and session, atomically activates only a live pending credential, stores the first accepted TOTP step, consumes the assertion nonce and inserts distinct keyed recovery-code digests. The application receives plaintext recovery codes only in the successful no-store response; they cannot be read back from the database. Ten failed verification attempts set a 15-minute lockout. The protected secret accessor refuses locked pending and active credentials, and a trigger prevents expired-pending re-enrollment from clearing an unexpired lockout.

The new `POST /api/internal/operations/mfa/enrollment/confirm` route verifies TOTP on the server and returns recovery codes once after the database transaction commits. **Do not treat activation as privileged access:** this route does not create a step-up session. The follow-on TOTP challenge route must consume a separate signed `step_up` assertion before Operations permissions can succeed.

The migration and PostgreSQL test are wired into Foundation CI. Verify all workflows on the latest PR head before accepting this checkpoint. MFA remains not operational end-to-end and must not be enabled for production operators.


### Exact-session TOTP challenge checkpoint — 2026-11-11

The new `POST /api/internal/operations/mfa/challenge` route validates the current HTTP-only session and same-origin request, verifies the TOTP code server-side and submits a signed assertion bound to the exact account/session. Migration 0024 consumes the assertion once, enforces monotonic TOTP-step replay prevention and creates a five-minute step-up record for that exact session. The route returns no-store responses. A code already consumed during enrollment or an earlier challenge cannot be reused. Invalid codes increment the database failure counter and can trigger the 15-minute lockout.

This is a server route only; accessible setup/challenge screens and browser E2E are not yet proven. Recovery redemption/regeneration, disable/reset, MFA status, dedicated MFA audit/notifications, lifecycle invalidation, key provisioning/rotation and independent review remain required. Keep Operations access denied until the complete flow is verified.


### Recovery and MFA audit checkpoint — 2026-11-11

Migration 0027 adds one-time recovery redemption. A valid recovery code is keyed-digested by the server and accompanied by a signed assertion bound to the current account and exact session. PostgreSQL consumes one unused digest, invalidates all step-up records, deletes the old authenticator and its entire recovery set, and records the recovery event. The recovery route does not create an Operations step-up. The operator must use password reauthentication and enroll a new authenticator; Operations access remains denied until a new challenge succeeds.

The protected append-only MFA event log records enrollment start/confirmation, challenge failures/success, lockout and credential removal. It contains no secrets or submitted codes and is inaccessible to application roles. Migration 0027 and its PostgreSQL test are in Foundation CI; verify exact-head results before accepting the checkpoint. Recovery-code regeneration, controlled disable/reset, MFA status/UI, notification delivery, lifecycle invalidation, concurrency/E2E tests, key management and independent review remain outstanding.


### MFA status and operator security page — 2026-11-11

Migration 0028 adds a current-session-only status function and the status endpoint. It reports the operator's own credential state, lockout and current exact-session step-up only; it never accepts caller-supplied account/session IDs and does not reveal status to non-operators. Migration 0029 adds a pending-only secret accessor that requires a fresh, one-time password_reauth assertion. The new resume route revalidates the session and password before reissuing provisioning details for a live pending credential; active secrets cannot be read through this accessor.

The authenticated /operations/security/mfa interface now covers enrollment start/resume, confirmation, recovery-code acknowledgement, challenge and recovery redemption. It does not persist provisioning material or recovery codes in browser storage. QR generation is not included yet; manual setup is a temporary fallback. The status/resume migrations and PostgreSQL tests are included in Foundation CI; exact-head CI and browser E2E for this interface must still pass before accepting the checkpoint.


### Recovery-code regeneration checkpoint — 2026-11-11

Migration 0030 and the regeneration route require a current-session password reauthentication assertion plus an unexpired MFA step-up for the exact same persisted session. PostgreSQL consumes the assertion nonce, replaces every recovery digest atomically and writes a recovery_codes_regenerated audit event. The route returns plaintext codes once after commit. The MFA page only offers regeneration when its status shows an active step-up; the database rechecks expiry at execution time.

A previous recovery-code set is invalid as soon as regeneration commits. Operators must save the new set securely. Exact-head CI and browser E2E for this latest addition remain pending. Disable/reset is intentionally not a self-service bypass and requires a separately reviewed dual-control process.


### Verified CI checkpoint — 2026-11-11

Exact head bee8603a832fe09307384e4a8faa2820ed9ec394 passed all three workflows. Foundation PostgreSQL 16 migration/RLS tests passed through migration 0030, including the concurrent recovery-code redemption test. Oracle Arc API passed. Web typecheck, contract/security tests, lint, existing profile E2E and production build passed. The browser E2E does not cover MFA UI flows. Do not infer MFA end-to-end readiness from this CI result; the MFA interface still lacks browser E2E and local QR display. PR #15 remains draft and undeployed pending review.

Session step-up is invalidated by the database's verified session binding: revoked/expired sessions, account suspension and rotated-out sessions cannot use a previous step-up, and a new session does not inherit it. Expired assertion and step-up row cleanup remains to be scheduled and monitored.


### Local authenticator QR checkpoint — 2026-11-11

The MFA setup UI now generates a QR image locally from the short-lived provisioning URI using the `qrcode` package. The QR is a browser data URL held only in component state; it is not uploaded to an external QR provider and is not stored in browser persistence. A manual setup key remains visible for fallback. The Playwright MFA flow now checks for the accessible QR image before continuing enrollment.

This UI improvement does not change the backend trust model or activate MFA by itself. Exact-head CI is pending. Outstanding release controls include dual-approved disable/reset, configured notifications, lifecycle invalidation/cleanup, secret-manager provisioning and key rotation/recovery, production-like migration review and independent security review.
