-- PostgreSQL coverage for own-account MFA status and exact-session step-up reporting.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES
 ('f0280000-0000-4000-8000-000000000001','active'),
 ('f0280000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0280000-0000-4000-8000-000000000011','f0280000-0000-4000-8000-000000000001',decode(repeat('b1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0280000-0000-4000-8000-000000000012','f0280000-0000-4000-8000-000000000001',decode(repeat('b2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0280000-0000-4000-8000-000000000013','f0280000-0000-4000-8000-000000000002',decode(repeat('b3',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0280000-0000-4000-8000-000000000001','integration_operator',
 ARRAY['integrations.verification_delivery.read']::text[],'f0280000-0000-4000-8000-000000000001');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES ('f0280000-0000-4000-8000-000000000001',
 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at)
VALUES ('f0280000-0000-4000-8000-000000000021','f0280000-0000-4000-8000-000000000001',
 'f0280000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce)
VALUES ('f0280000-0000-4000-8000-000000000011','f0280000-0000-4000-8000-000000000001',
 clock_timestamp()+interval '5 minutes','f0280000-0000-4000-8000-000000000021');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-status-account',decode(repeat('b1',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-status-session',decode(repeat('b2',32),'hex'));

WITH x AS (
 SELECT 'f0280000-0000-4000-8000-000000000001'::text a,
        'f0280000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0280000-0000-4000-8000-000000000031'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('b1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('b2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE status JSONB;
BEGIN
 status:=public.unibud_operator_mfa_get_status();
 IF status->>'operator'<>'true' OR status->>'credentialState'<>'active'
    OR status->>'stepUpExpiresAt' IS NULL THEN
  RAISE EXCEPTION 'Current operator session status did not report active credential and exact-session step-up';
 END IF;
 BEGIN
  EXECUTE 'SELECT state FROM public.unibud_operator_mfa_credentials';
  RAISE EXCEPTION 'Application role directly read credential table';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;

-- The same operator on a second valid session must not inherit the first session's step-up.
WITH x AS (
 SELECT 'f0280000-0000-4000-8000-000000000001'::text a,
        'f0280000-0000-4000-8000-000000000012'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0280000-0000-4000-8000-000000000032'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('b1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('b2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE status JSONB;
BEGIN
 status:=public.unibud_operator_mfa_get_status();
 IF status->>'operator'<>'true' OR status->>'stepUpExpiresAt' IS NOT NULL THEN
  RAISE EXCEPTION 'Step-up leaked to a different session';
 END IF;
END
$test$;
RESET ROLE;

-- A non-operator cannot discover or claim Operations MFA state.
WITH x AS (
 SELECT 'f0280000-0000-4000-8000-000000000002'::text a,
        'f0280000-0000-4000-8000-000000000013'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0280000-0000-4000-8000-000000000033'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('b1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('b2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE status JSONB;
BEGIN
 status:=public.unibud_operator_mfa_get_status();
 IF status->>'operator'<>'false' OR status->>'credentialState'<>'none' THEN
  RAISE EXCEPTION 'Non-operator discovered Operations MFA state';
 END IF;
END
$test$;
RESET ROLE;
ROLLBACK;
