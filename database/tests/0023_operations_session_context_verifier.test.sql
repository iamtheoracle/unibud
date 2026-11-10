-- PostgreSQL integration tests for independently verified Operations session context.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0230000-0000-4000-8000-000000000001','active'),
 ('f0230000-0000-4000-8000-000000000002','active');

INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0230000-0000-4000-8000-000000000011',
  'f0230000-0000-4000-8000-000000000001',decode(repeat('11',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0230000-0000-4000-8000-000000000012',
  'f0230000-0000-4000-8000-000000000002',decode(repeat('12',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0230000-0000-4000-8000-000000000001','integration_operator',
 ARRAY['integrations.verification_delivery.read']::text[],
 'f0230000-0000-4000-8000-000000000001');

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-operations-session-key',decode(repeat('23',32),'hex'));

-- Set both independently signed account and exact-session claims.
WITH x AS (
 SELECT 'f0230000-0000-4000-8000-000000000001'::text AS a,
        'f0230000-0000-4000-8000-000000000011'::text AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
        '23232323-2323-4323-8323-232323232323'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
   decode(repeat('23',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('23',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF NOT public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
   RAISE EXCEPTION 'Valid account+session proof did not authorize active operator';
 END IF;
 PERFORM public.unibud_operator_record_access(
  'integrations.verification_delivery.read','allowed',
  'f0230000-0000-4000-8000-000000000091'
 );
 -- The app cannot call the internal verifier or read signing material.
 BEGIN
  EXECUTE 'SELECT unibud_private.current_session_id()';
  RAISE EXCEPTION 'Application role directly executed private session verifier';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  EXECUTE 'SELECT secret FROM unibud_private.context_signing_keys';
  RAISE EXCEPTION 'Application role read context signing key';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;

DO $test$
DECLARE actor UUID; session UUID;
BEGIN
 SELECT actor_account_id,session_id INTO actor,session
 FROM public.unibud_operator_audit_events
 WHERE request_id='f0230000-0000-4000-8000-000000000091';
 IF actor IS DISTINCT FROM 'f0230000-0000-4000-8000-000000000001'::uuid
    OR session IS DISTINCT FROM 'f0230000-0000-4000-8000-000000000011'::uuid THEN
  RAISE EXCEPTION 'Audit actor/session provenance is not the verified pair';
 END IF;
END
$test$;

-- Caller changes only the session GUC: signature mismatch must deny.
SELECT set_config('unibud.session_id','f0230000-0000-4000-8000-000000000012',true);
SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
  RAISE EXCEPTION 'Forged session GUC retained Operations access';
 END IF;
 BEGIN
  PERFORM public.unibud_operator_record_access(
   'integrations.verification_delivery.read','allowed',
   'f0230000-0000-4000-8000-000000000092'
  );
  RAISE EXCEPTION 'Forged session context was attributed in audit';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;

-- A validly signed claim cannot revive a revoked persisted session.
SELECT set_config('unibud.session_id','f0230000-0000-4000-8000-000000000011',true);
UPDATE public.account_sessions SET status='revoked',revoked_at=clock_timestamp(),
 revocation_reason='test_revocation'
WHERE id='f0230000-0000-4000-8000-000000000011';
SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
  RAISE EXCEPTION 'Revoked session retained Operations access';
 END IF;
END
$test$;
RESET ROLE;

-- A valid account signature without the session proof must fail closed.
SELECT set_config('unibud.session_id','',true),
       set_config('unibud.session_context_signature','',true);
SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
  RAISE EXCEPTION 'Account-only context authorized Operations';
 END IF;
END
$test$;
RESET ROLE;

-- Unauthenticated audit entries are allowed only without actor/session claims.
SELECT set_config('unibud.account_id','',true),
       set_config('unibud.session_id','',true),
       set_config('unibud.context_expiry','',true),
       set_config('unibud.context_nonce','',true),
       set_config('unibud.context_signature','',true),
       set_config('unibud.session_context_signature','',true);
SET LOCAL ROLE unibud_app;
SELECT public.unibud_operator_record_access(
 'integrations.verification_delivery.read','unauthenticated',
 'f0230000-0000-4000-8000-000000000093'
);
RESET ROLE;

DO $test$
DECLARE actor UUID; session UUID;
BEGIN
 SELECT actor_account_id,session_id INTO actor,session
 FROM public.unibud_operator_audit_events
 WHERE request_id='f0230000-0000-4000-8000-000000000093';
 IF actor IS NOT NULL OR session IS NOT NULL THEN
  RAISE EXCEPTION 'Unauthenticated audit event must be unattributed';
 END IF;
END
$test$;

ROLLBACK;
