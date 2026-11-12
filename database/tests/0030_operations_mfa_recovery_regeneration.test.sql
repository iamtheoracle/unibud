-- PostgreSQL coverage for recovery-code regeneration and fresh exact-session assurance.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES
 ('f0300000-0000-4000-8000-000000000001','active'),
 ('f0300000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0300000-0000-4000-8000-000000000011','f0300000-0000-4000-8000-000000000001',decode(repeat('d1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0300000-0000-4000-8000-000000000012','f0300000-0000-4000-8000-000000000002',decode(repeat('d2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('f0300000-0000-4000-8000-000000000001','integration_operator',ARRAY['integrations.verification_delivery.read']::text[],'f0300000-0000-4000-8000-000000000001'),
 ('f0300000-0000-4000-8000-000000000002','integration_operator',ARRAY['integrations.verification_delivery.read']::text[],'f0300000-0000-4000-8000-000000000002');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('f0300000-0000-4000-8000-000000000001','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0300000-0000-4000-8000-000000000002','v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest)
VALUES ('f0300000-0000-4000-8000-000000000001',decode(repeat('a',64),'hex'));
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at)
VALUES ('f0300000-0000-4000-8000-000000000021','f0300000-0000-4000-8000-000000000001','f0300000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce)
VALUES ('f0300000-0000-4000-8000-000000000011','f0300000-0000-4000-8000-000000000001',clock_timestamp()+interval '5 minutes','f0300000-0000-4000-8000-000000000021');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-regenerate-account',decode(repeat('d1',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-regenerate-session',decode(repeat('d2',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret) VALUES ('ci-mfa-regenerate-assertion',decode(repeat('d3',32),'hex'));

WITH x AS (
 SELECT 'f0300000-0000-4000-8000-000000000001'::text a,
        'f0300000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0300000-0000-4000-8000-000000000031'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; digests TEXT[]; regenerated BOOLEAN;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0300000-0000-4000-8000-000000000032';
 signature:=encode(public.hmac(convert_to(
  'v1:f0300000-0000-4000-8000-000000000001:f0300000-0000-4000-8000-000000000011:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('d3',32),'hex'),'sha256'),'hex');
 digests:=ARRAY[repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64),
  repeat('5',64),repeat('6',64),repeat('7',64),repeat('8',64)];
 IF public.unibud_operator_mfa_regenerate_recovery_codes(issued,expires,nonce,repeat('0',64),digests) THEN
  RAISE EXCEPTION 'Forged recovery regeneration assertion was accepted';
 END IF;
 regenerated:=public.unibud_operator_mfa_regenerate_recovery_codes(issued,expires,nonce,signature,digests);
 IF regenerated IS DISTINCT FROM TRUE THEN RAISE EXCEPTION 'Valid recovery regeneration failed'; END IF;
 IF public.unibud_operator_mfa_regenerate_recovery_codes(issued,expires,nonce,signature,digests) THEN
  RAISE EXCEPTION 'Recovery regeneration assertion was replayed';
 END IF;
 BEGIN
  EXECUTE 'SELECT code_digest FROM public.unibud_operator_mfa_recovery_codes';
  RAISE EXCEPTION 'Application role directly read recovery digests';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;
DO $test$
DECLARE count_codes INTEGER;
BEGIN
 SELECT count(*) INTO count_codes FROM public.unibud_operator_mfa_recovery_codes
 WHERE account_id='f0300000-0000-4000-8000-000000000001' AND redeemed_at IS NULL;
 IF count_codes<>8 OR EXISTS (
  SELECT 1 FROM public.unibud_operator_mfa_recovery_codes
  WHERE account_id='f0300000-0000-4000-8000-000000000001'
    AND code_digest=decode(repeat('a',64),'hex')
 ) THEN RAISE EXCEPTION 'Recovery code set was not atomically replaced'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_events
  WHERE actor_account_id='f0300000-0000-4000-8000-000000000001'
    AND session_id='f0300000-0000-4000-8000-000000000011'
    AND event_type='recovery_codes_regenerated') THEN
  RAISE EXCEPTION 'Recovery regeneration audit event missing';
 END IF;
END
$test$;

-- Account two has an active credential but no current-session step-up.
WITH x AS (
 SELECT 'f0300000-0000-4000-8000-000000000002'::text a,
        'f0300000-0000-4000-8000-000000000012'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0300000-0000-4000-8000-000000000041'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; digests TEXT[];
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0300000-0000-4000-8000-000000000042';
 signature:=encode(public.hmac(convert_to(
  'v1:f0300000-0000-4000-8000-000000000002:f0300000-0000-4000-8000-000000000012:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('d3',32),'hex'),'sha256'),'hex');
 digests:=ARRAY[repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64),
  repeat('5',64),repeat('6',64),repeat('7',64),repeat('8',64)];
 IF public.unibud_operator_mfa_regenerate_recovery_codes(issued,expires,nonce,signature,digests) THEN
  RAISE EXCEPTION 'Recovery codes regenerated without current-session MFA step-up';
 END IF;
END
$test$;
RESET ROLE;
ROLLBACK;
