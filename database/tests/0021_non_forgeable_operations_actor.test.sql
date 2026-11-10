-- PostgreSQL integration tests for non-forgeable Operations actor provenance.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0210000-0000-4000-8000-000000000001','active'),
 ('f0210000-0000-4000-8000-000000000002','active');

INSERT INTO public.unibud_operator_grants(
  account_id,operator_role,permissions,granted_by,expires_at
) VALUES (
  'f0210000-0000-4000-8000-000000000001',
  'integration_operator',
  ARRAY['integrations.verification_delivery.read']::text[],
  'f0210000-0000-4000-8000-000000000001',
  clock_timestamp() + interval '1 day'
);

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-operations-actor-key',decode(repeat('c1',32),'hex'));

-- Establish a valid signed context for account A.
WITH x AS (
 SELECT
  'f0210000-0000-4000-8000-000000000001'::text AS a,
  floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
  'c1c1c1c1-c1c1-41c1-81c1-c1c1c1c1c1c1'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c1',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $test$
DECLARE v_actor UUID;
BEGIN
  IF NOT public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
    RAISE EXCEPTION 'Valid signed operator context was not authorised';
  END IF;

  -- The unsafe UUID-taking API must no longer exist.
  BEGIN
    EXECUTE 'SELECT public.unibud_operator_has_permission($1,$2)'
      USING 'f0210000-0000-4000-8000-000000000002'::uuid,
            'integrations.verification_delivery.read';
    RAISE EXCEPTION 'Legacy actor-selectable permission API still exists';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;

  BEGIN
    EXECUTE 'SELECT public.unibud_operator_record_access($1,$2,$3,$4)'
      USING 'f0210000-0000-4000-8000-000000000002'::uuid,
            'integrations.verification_delivery.read','allowed',
            'f0210000-0000-4000-8000-000000000099'::uuid;
    RAISE EXCEPTION 'Legacy actor-selectable audit API still exists';
  EXCEPTION WHEN undefined_function THEN
    NULL;
  END;

  PERFORM public.unibud_operator_record_access(
    'integrations.verification_delivery.read','allowed',
    'f0210000-0000-4000-8000-000000000099'
  );

  -- A caller can set GUCs, but cannot forge a valid HMAC for another account.
  PERFORM set_config('unibud.account_id','f0210000-0000-4000-8000-000000000002',true);
  IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
    RAISE EXCEPTION 'Forged account GUC unexpectedly gained Operations permission';
  END IF;

  BEGIN
    PERFORM public.unibud_operator_record_access(
      'integrations.verification_delivery.read','allowed',
      'f0210000-0000-4000-8000-000000000098'
    );
    RAISE EXCEPTION 'Forged account GUC unexpectedly created attributed audit';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END
$test$;
RESET ROLE;

-- Unauthenticated audit records are explicitly unattributed, never caller-named.
SELECT
 set_config('unibud.account_id','',true),
 set_config('unibud.context_expiry','',true),
 set_config('unibud.context_nonce','',true),
 set_config('unibud.context_signature','',true);
SET LOCAL ROLE unibud_app;
SELECT public.unibud_operator_record_access(
 'integrations.verification_delivery.read','unauthenticated',
 'f0210000-0000-4000-8000-000000000097'
);
RESET ROLE;

DO $test$
DECLARE actor UUID; event_outcome TEXT;
BEGIN
 SELECT audit.actor_account_id,audit.outcome INTO actor,event_outcome
 FROM public.unibud_operator_audit_events AS audit
 WHERE audit.request_id='f0210000-0000-4000-8000-000000000099';
 IF actor IS DISTINCT FROM 'f0210000-0000-4000-8000-000000000001'::uuid
    OR event_outcome <> 'allowed' THEN
   RAISE EXCEPTION 'Audit actor was not derived from verified signed context';
 END IF;

 SELECT audit.actor_account_id INTO actor
 FROM public.unibud_operator_audit_events AS audit
 WHERE audit.request_id='f0210000-0000-4000-8000-000000000097';
 IF actor IS NOT NULL THEN
   RAISE EXCEPTION 'Unauthenticated audit event must not claim an actor';
 END IF;
END
$test$;

-- Revoke immediately and prove the next signed-context check denies access.
UPDATE public.unibud_operator_grants
SET revoked_at=clock_timestamp(),revocation_reason='test_revocation'
WHERE account_id='f0210000-0000-4000-8000-000000000001';

WITH x AS (
 SELECT
  'f0210000-0000-4000-8000-000000000001'::text AS a,
  floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
  'c1c1c1c1-c1c1-41c1-81c1-c1c1c1c1c1c2'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c1',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
   RAISE EXCEPTION 'Revoked operator permission remained active';
 END IF;
END
$test$;
RESET ROLE;

ROLLBACK;
