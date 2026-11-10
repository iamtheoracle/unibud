-- PostgreSQL integration tests for migration 0020.
\set ON_ERROR_STOP on

INSERT INTO public.accounts(id, status)
VALUES ('f0200000-0000-4000-8000-000000000001', 'active');

INSERT INTO public.unibud_operator_grants(
  account_id, operator_role, permissions, granted_by, expires_at
) VALUES (
  'f0200000-0000-4000-8000-000000000001',
  'integration_operator',
  ARRAY['integrations.verification_delivery.read']::text[],
  'f0200000-0000-4000-8000-000000000001',
  clock_timestamp() + interval '1 day'
);

-- Runtime role has only EXECUTE, not direct access to grant or audit records.
SET ROLE unibud_app;
DO $test$
BEGIN
  IF NOT public.unibud_operator_has_permission(
    'f0200000-0000-4000-8000-000000000001',
    'integrations.verification_delivery.read'
  ) THEN
    RAISE EXCEPTION 'Expected active operator permission to be true';
  END IF;

  IF public.unibud_operator_has_permission(
    'f0200000-0000-4000-8000-000000000001',
    'integrations.oracle_arc.read'
  ) THEN
    RAISE EXCEPTION 'Unexpected permission was granted';
  END IF;

  BEGIN
    PERFORM 1 FROM public.unibud_operator_grants;
    RAISE EXCEPTION 'Application role unexpectedly read operator grant table';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  PERFORM public.unibud_operator_record_access(
    'f0200000-0000-4000-8000-000000000001',
    'integrations.verification_delivery.read',
    'allowed',
    'f0200000-0000-4000-8000-000000000099'
  );
END
$test$;
RESET ROLE;

-- Audit events cannot be edited or deleted, even by the migration/test owner.
DO $test$
BEGIN
  BEGIN
    UPDATE public.unibud_operator_audit_events
    SET outcome = 'denied'
    WHERE request_id = 'f0200000-0000-4000-8000-000000000099';
    RAISE EXCEPTION 'Audit update unexpectedly succeeded';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  BEGIN
    DELETE FROM public.unibud_operator_audit_events
    WHERE request_id = 'f0200000-0000-4000-8000-000000000099';
    RAISE EXCEPTION 'Audit delete unexpectedly succeeded';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
END
$test$;

-- Revocation takes effect on the next permission check; no cached session role.
UPDATE public.unibud_operator_grants
SET revoked_at = clock_timestamp(), revocation_reason = 'test_revocation'
WHERE account_id = 'f0200000-0000-4000-8000-000000000001';

SET ROLE unibud_app;
DO $test$
BEGIN
  IF public.unibud_operator_has_permission(
    'f0200000-0000-4000-8000-000000000001',
    'integrations.verification_delivery.read'
  ) THEN
    RAISE EXCEPTION 'Revoked operator permission remained active';
  END IF;
END
$test$;
RESET ROLE;

DO $test$
DECLARE event_count BIGINT;
BEGIN
  SELECT count(*) INTO event_count
  FROM public.unibud_operator_audit_events
  WHERE request_id = 'f0200000-0000-4000-8000-000000000099';
  IF event_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one append-only audit event, found %', event_count;
  END IF;
END
$test$;
