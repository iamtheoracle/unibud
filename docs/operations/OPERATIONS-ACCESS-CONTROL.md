# UNIBUD Operations access control

## Authority model

Operations authority is a global platform assignment in `operations_role_assignments`. It is not derived from profile membership. Personal, Creator, Page/Community, Tutor, Student, Institution, seller, provider, staff, moderator, admin or operator profile roles do not grant platform Operations access.

The web runtime validates the HttpOnly session cookie through the first-party session service. Only the resulting server-validated account and session IDs are passed to `operations_authorize_session`. Browser-provided account IDs, role names, profile IDs, request bodies and authorization headers are not authority.

## Permission catalogue

- `operations.integrations.read`: read integration readiness and diagnostic metadata.
- `operations.integrations.manage`: reserved for future controlled integration configuration workflows.
- `operations.audit.read`: reserved for a future audited audit-history reader.
- `operations.accounts.support`: reserved for future least-privilege support workflows.

The current integration status routes require `operations.integrations.read`.

## Provisioning

There is deliberately no self-service or public HTTP role-grant endpoint. Initial grants must be performed by an authorised database administrator using the approved migration/administration connection after verifying the person's identity, employment/contractual authority, approval and reason. Do not grant access based on a profile role or a browser-supplied account ID.

Example for a reviewed, approved operator (replace every placeholder only after independent verification):

```sql
INSERT INTO public.operations_role_assignments (
  id, account_id, role_key, permissions, granted_by_service,
  granted_at, expires_at, reason_code
) VALUES (
  gen_random_uuid(),
  '<VERIFIED_ACCOUNT_UUID>',
  'integration_operator',
  ARRAY['operations.integrations.read']::text[],
  'controlled_database_administration',
  clock_timestamp(),
  clock_timestamp() + interval '30 days',
  'approved_operator_access'
);
```

Use time-bounded assignments and the minimum permission set. The example is documentation only and has not been executed. Record the approval in the organisation's separate change-control record without putting personal secrets into this database.

## Revocation and session invalidation

The restricted `operations_revoke_account_roles(account_id, reason_code)` database procedure revokes all active Operations assignments for the account and all its active sessions. It is intentionally not executable by `unibud_app`. Invoke it only through the controlled database security process after independently verifying the account identifier and revocation reason.

## Audit and monitoring

Every authorization attempt that reaches the database function writes an allowed/denied event to the append-only `security_audit_events` stream. Do not log session credentials, verification codes, raw provider references or personal payloads. Failed or absent session validation is denied before a database authorization event can be attributed to an account; edge/runtime security telemetry should record aggregate unauthenticated denials without recording cookies.

## Release gates

- Apply migration 0020 only through the reviewed migration process.
- Require PostgreSQL 16 migration and authorization tests, web tests, typecheck, lint and production build.
- Review exact PR head and all checks before merge.
- No production role grants, migrations or deployments are authorised by this feature branch.
- Provider identity and a documented side-effect-free verification-delivery health operation remain unresolved.
- Account export, deletion and closure remain disabled.
