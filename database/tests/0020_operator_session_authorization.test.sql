-- Session-derived workforce/operator authorization tests. Synthetic accounts only.
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('20000000-0000-4000-8000-000000000001','active'),
 ('20000000-0000-4000-8000-000000000002','active');

SELECT public.auth_create_session(
 '21000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000001',
 decode(repeat('a1',32),'hex'),
 clock_timestamp()-interval '1 minute',
 clock_timestamp()+interval '30 minutes',
 clock_timestamp()+interval '12 hours'
);
SELECT public.auth_create_session(
 '21000000-0000-4000-8000-000000000002',
 '20000000-0000-4000-8000-000000000002',
 decode(repeat('b2',32),'hex'),
 clock_timestamp()-interval '1 minute',
 clock_timestamp()+interval '30 minutes',
 clock_timestamp()+interval '12 hours'
);

INSERT INTO public.operator_worker_identities(
 id,account_id,worker_status,worker_reference,activated_at
) VALUES (
 '22000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000001',
 'active','synthetic-worker-001',clock_timestamp()
);

INSERT INTO public.operator_role_grants(
 id,worker_identity_id,role_key,permission_key,scope_key
) VALUES (
 '23000000-0000-4000-8000-000000000001',
 '22000000-0000-4000-8000-000000000001',
 'integration_operator','integration.diagnostics.read','global'
);

INSERT INTO public.operator_role_grants(
 id,worker_identity_id,role_key,permission_key,scope_key,granted_at,expires_at
) VALUES (
 '23000000-0000-4000-8000-000000000002',
 '22000000-0000-4000-8000-000000000001',
 'security_auditor','security.audit.read','global',
 clock_timestamp()-interval '2 hours',clock_timestamp()-interval '1 hour'
);
INSERT INTO public.operator_role_grants(
 id,worker_identity_id,role_key,permission_key,scope_key,granted_at,revoked_at
) VALUES (
 '23000000-0000-4000-8000-000000000003',
 '22000000-0000-4000-8000-000000000001',
 'support_readonly','account.support.read','global',
 clock_timestamp()-interval '2 hours',clock_timestamp()
);

SET LOCAL ROLE unibud_auth;
DO $test$
DECLARE v_count INTEGER;
BEGIN
  IF NOT public.operator_authorize_session(
    decode(repeat('a1',32),'hex'),'integration.diagnostics.read','ci-allow-001'
  ) THEN RAISE EXCEPTION 'Active worker with exact grant should be authorized'; END IF;

  IF public.operator_authorize_session(
    decode(repeat('b2',32),'hex'),'integration.diagnostics.read','ci-deny-consumer'
  ) THEN RAISE EXCEPTION 'Ordinary consumer account unexpectedly received operator authority'; END IF;

  IF public.operator_authorize_session(
    decode(repeat('a1',32),'hex'),'operations.queue.resolve','ci-deny-permission'
  ) THEN RAISE EXCEPTION 'Unassigned permission unexpectedly authorized'; END IF;

  IF public.operator_authorize_session(
    decode(repeat('a1',31),'hex'),'integration.diagnostics.read','ci-deny-digest'
  ) THEN RAISE EXCEPTION 'Malformed session digest unexpectedly authorized'; END IF;

  IF public.operator_authorize_session(
    decode(repeat('a1',32),'hex'),'security.audit.read','ci-deny-expired'
  ) THEN RAISE EXCEPTION 'Expired permission grant unexpectedly authorized'; END IF;

  IF public.operator_authorize_session(
    decode(repeat('a1',32),'hex'),'account.support.read','ci-deny-revoked'
  ) THEN RAISE EXCEPTION 'Revoked permission grant unexpectedly authorized'; END IF;

  IF has_table_privilege('unibud_auth','public.operator_role_grants','INSERT')
     OR has_table_privilege('unibud_auth','public.operator_access_audit_events','SELECT')
     OR has_table_privilege('unibud_app','public.operator_worker_identities','SELECT') THEN
    RAISE EXCEPTION 'Runtime roles unexpectedly have workforce identity/grant/audit table access';
  END IF;
END
$test$;

RESET ROLE;
UPDATE public.operator_worker_identities
SET worker_status='suspended',suspended_at=clock_timestamp()
WHERE id='22000000-0000-4000-8000-000000000001';
SET LOCAL ROLE unibud_auth;
DO $suspended$
BEGIN
  IF public.operator_authorize_session(
    decode(repeat('a1',32),'hex'),'integration.diagnostics.read','ci-deny-suspended'
  ) THEN RAISE EXCEPTION 'Suspended workforce identity unexpectedly authorized'; END IF;
END
$suspended$;

RESET ROLE;
SET LOCAL ROLE unibud_operator_owner;
DO $audit$
DECLARE v_count INTEGER;
BEGIN
  SELECT count(*) INTO v_count
  FROM public.operator_access_audit_events
  WHERE request_reference IN (
    'ci-allow-001','ci-deny-consumer','ci-deny-permission','ci-deny-digest',
    'ci-deny-expired','ci-deny-revoked','ci-deny-suspended'
  );
  IF v_count<>7 THEN RAISE EXCEPTION 'Authorization decisions were not fully audited'; END IF;
END
$audit$;

ROLLBACK;
