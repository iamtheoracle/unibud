# UNIBUD Operations access runbook

## Security model

Operations access is a global account-level grant, not a profile membership. Student, tutor, institution representative, creator, page/community administrator, moderator, seller, provider, professional or other profile roles do not confer Operations authority.

The application authenticates the opaque session cookie through the existing first-party session service. The account ID passed to the database permission function is taken only from that validated server-side session. The browser cannot submit an account ID, role or permission to this route.

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

Every request to the verification-delivery status endpoint records an append-only event with a random request UUID, permission name, outcome, timestamp and (when authenticated) account UUID. No session token, email, phone, provider URL, credential or request body is stored.

Review operator grants at least monthly and after role changes, contract termination or suspected compromise. Review audit events through a separately authorised read-only operational process; no audit-read endpoint is exposed by this change.

## Boundaries

- This PR protects the verification-delivery metadata diagnostic only.
- The endpoint does not call the delivery provider and sends no email, SMS or verification code.
- Provider identity and a read-only health contract remain unresolved.
- No operator grant is provisioned by this migration.
- MFA/step-up authentication, a full Operations UI, grant-management workflow, audit search/export, alerting and independent PostgreSQL integration tests remain follow-up requirements.
- Do not run this migration in production until it has passed the PostgreSQL migration suite and received an authorised database change review.
