-- PostgreSQL integration tests for the Operations grant and audit schema.
-- The API contract is supplied by migration 0021 and requires signed context.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status)
VALUES ('f0200000-0000-4000-8000-000000000001','active');

INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 'f0200000-0000-4000-8000-000000000011',
 'f0200000-0000-4000-8000-000000000001',decode(repeat('20',32),'hex'),
 clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);

INSERT INTO public.unibud_operator_grants(
  account_id,operator_role,permissions,granted_by,expires_at
) VALUES (
  'f0200000-0000-4000-8000-000000000001',
  'integration_operator',
  ARRAY['integrations.verification_delivery.read']::text[],
  'f0200000-0000-4000-8000-000000000001',
  clock_timestamp() + interval '1 day'
);

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-operations-grant-key',decode(repeat('c0',32),'hex'));

INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-operations-grant-session-key',decode(repeat('c2',32),'hex'));

-- Bind the database transaction to the authenticated test account.
WITH x AS (
 SELECT
  'f0200000-0000-4000-8000-000000000001'::text AS a,
  floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
  'c0c0c0c0-c0c0-40c0-80c0-c0c0c0c0c0c1'::text AS n,
  'f0200000-0000-4000-8000-000000000011'::text AS s
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c0',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('c2',32),'hex'),'sha256'),'hex'),true)
FROM x;

-- Runtime role has only EXECUTE, not direct access to grant or audit records.
SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
  IF NOT public.unibud_operator_has_permission(
    'integrations.verification_delivery.read'
  ) THEN
    RAISE EXCEPTION 'Expected active operator permission to be true';
  END IF;

  IF public.unibud_operator_has_permission('integrations.oracle_arc.read') THEN
    RAISE EXCEPTION 'Unexpected permission was granted';
  END IF;

  BEGIN
    PERFORM 1 FROM public.unibud_operator_grants;
    RAISE EXCEPTION 'Application role unexpectedly read operator grant table';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  PERFORM public.unibud_operator_record_access(
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
    SET outcome='denied'
    WHERE request_id='f0200000-0000-4000-8000-000000000099';
    RAISE EXCEPTION 'Audit update unexpectedly succeeded';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;

  BEGIN
    DELETE FROM public.unibud_operator_audit_events
    WHERE request_id='f0200000-0000-4000-8000-000000000099';
    RAISE EXCEPTION 'Audit delete unexpectedly succeeded';
  EXCEPTION WHEN SQLSTATE '55000' THEN
    NULL;
  END;
END
$test$;

UPDATE public.unibud_operator_grants
SET revoked_at=clock_timestamp(),revocation_reason='test_revocation'
WHERE account_id='f0200000-0000-4000-8000-000000000001';

-- Use a fresh signed context to prove revocation is effective on the next call.
WITH x AS (
 SELECT
  'f0200000-0000-4000-8000-000000000001'::text AS a,
  floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
  'c0c0c0c0-c0c0-40c0-80c0-c0c0c0c0c0c2'::text AS n,
  'f0200000-0000-4000-8000-000000000011'::text AS s
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c0',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('c2',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
  IF public.unibud_operator_has_permission(
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
  WHERE request_id='f0200000-0000-4000-8000-000000000099';
  IF event_count <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one append-only audit event, found %',event_count;
  END IF;
END
$test$;

ROLLBACK;
