-- PostgreSQL integration coverage for activation, recovery digest storage and lockout.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES
 ('f0260000-0000-4000-8000-000000000001','active'),
 ('f0260000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0260000-0000-4000-8000-000000000011','f0260000-0000-4000-8000-000000000001',decode(repeat('81',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0260000-0000-4000-8000-000000000012','f0260000-0000-4000-8000-000000000002',decode(repeat('82',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('f0260000-0000-4000-8000-000000000001','integration_operator',ARRAY['integrations.verification_delivery.read']::text[],'f0260000-0000-4000-8000-000000000001'),
 ('f0260000-0000-4000-8000-000000000002','integration_operator',ARRAY['integrations.verification_delivery.read']::text[],'f0260000-0000-4000-8000-000000000002');
INSERT INTO public.unibud_operator_mfa_credentials(account_id,encrypted_totp_secret,state,enrollment_expires_at)
VALUES
 ('f0260000-0000-4000-8000-000000000001','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),'pending',clock_timestamp()+interval '10 minutes'),
 ('f0260000-0000-4000-8000-000000000002','v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),'pending',clock_timestamp()+interval '10 minutes');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-confirm-account',decode(repeat('81',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-confirm-session',decode(repeat('82',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret) VALUES ('ci-mfa-confirm-assertion',decode(repeat('83',32),'hex'));

-- Account one: valid session-bound enrollment confirmation.
WITH x AS (
 SELECT 'f0260000-0000-4000-8000-000000000001'::text a,
        'f0260000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0260000-0000-4000-8000-000000000021'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('81',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('82',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; activated BOOLEAN; digests TEXT[]; accepted_step BIGINT;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0260000-0000-4000-8000-000000000031';
 signature:=encode(public.hmac(convert_to(
  'v1:f0260000-0000-4000-8000-000000000001:f0260000-0000-4000-8000-000000000011:enrollment_confirm:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':'||accepted_step::TEXT,'UTF8'),
  decode(repeat('83',32),'hex'),'sha256'),'hex');
 digests:=ARRAY[
  repeat('1',64),repeat('2',64),repeat('3',64),repeat('4',64),
  repeat('5',64),repeat('6',64),repeat('7',64),repeat('8',64)
 ];
 IF public.unibud_operator_mfa_confirm_enrollment(issued,expires,nonce,accepted_step,repeat('0',64),digests) THEN
  RAISE EXCEPTION 'Forged confirmation assertion was accepted';
 END IF;
 IF public.unibud_operator_mfa_confirm_enrollment(issued,expires,nonce,accepted_step,signature,ARRAY[repeat('a',64),repeat('a',64),repeat('b',64),repeat('c',64),repeat('d',64),repeat('e',64),repeat('f',64),repeat('0',64)]) THEN
  RAISE EXCEPTION 'Duplicate recovery digests were accepted';
 END IF;
 activated:=public.unibud_operator_mfa_confirm_enrollment(issued,expires,nonce,accepted_step,signature,digests);
 IF activated IS DISTINCT FROM TRUE THEN RAISE EXCEPTION 'Valid enrollment did not activate'; END IF;
 IF public.unibud_operator_mfa_confirm_enrollment(issued,expires,nonce,accepted_step,signature,digests) THEN
  RAISE EXCEPTION 'Confirmation assertion was replayed';
 END IF;
 BEGIN
  EXECUTE 'SELECT code_digest FROM public.unibud_operator_mfa_recovery_codes';
  RAISE EXCEPTION 'Application role directly read recovery-code storage';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;
DO $test$
DECLARE state_value TEXT; step_value BIGINT; recovery_count INTEGER;
BEGIN
 SELECT state,last_accepted_totp_step INTO state_value,step_value
 FROM public.unibud_operator_mfa_credentials
 WHERE account_id='f0260000-0000-4000-8000-000000000001';
 SELECT count(*) INTO recovery_count FROM public.unibud_operator_mfa_recovery_codes
 WHERE account_id='f0260000-0000-4000-8000-000000000001' AND redeemed_at IS NULL;
 IF state_value<>'active' OR step_value IS NULL OR recovery_count<>8 THEN
  RAISE EXCEPTION 'Activation or recovery digest persistence was incomplete';
 END IF;
END
$test$;

-- Account two: ten invalid attempts lock the credential and deny secret access.
WITH x AS (
 SELECT 'f0260000-0000-4000-8000-000000000002'::text a,
        'f0260000-0000-4000-8000-000000000012'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0260000-0000-4000-8000-000000000022'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('81',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('82',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE i INTEGER; failures INTEGER; secret TEXT;
BEGIN
 FOR i IN 1..10 LOOP
  failures:=public.unibud_operator_mfa_record_failed_attempt();
 END LOOP;
 IF failures<>10 THEN RAISE EXCEPTION 'Failure counter did not reach ten'; END IF;
 secret:=public.unibud_operator_mfa_read_encrypted_secret();
 IF secret IS NOT NULL THEN RAISE EXCEPTION 'Locked pending credential exposed encrypted secret'; END IF;
END
$test$;
RESET ROLE;
DO $test$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_credentials
  WHERE account_id='f0260000-0000-4000-8000-000000000002'
    AND failed_attempt_count=10 AND locked_until>clock_timestamp()) THEN
  RAISE EXCEPTION 'MFA lockout was not persisted';
 END IF;
END
$test$;
ROLLBACK;
