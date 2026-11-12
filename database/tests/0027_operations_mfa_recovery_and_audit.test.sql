-- PostgreSQL integration coverage for one-time recovery and MFA audit isolation.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES ('f0270000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES ('f0270000-0000-4000-8000-000000000011','f0270000-0000-4000-8000-000000000001',
 decode(repeat('91',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0270000-0000-4000-8000-000000000001','integration_operator',
 ARRAY['integrations.verification_delivery.read']::text[],'f0270000-0000-4000-8000-000000000001');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES ('f0270000-0000-4000-8000-000000000001',
 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),floor(extract(epoch FROM clock_timestamp())/30)::BIGINT);
INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest)
VALUES ('f0270000-0000-4000-8000-000000000001',decode(repeat('a',64),'hex'));
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at)
VALUES ('f0270000-0000-4000-8000-000000000021','f0270000-0000-4000-8000-000000000001',
 'f0270000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce)
VALUES ('f0270000-0000-4000-8000-000000000011','f0270000-0000-4000-8000-000000000001',
 clock_timestamp()+interval '5 minutes','f0270000-0000-4000-8000-000000000021');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-recovery-account',decode(repeat('91',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-recovery-session',decode(repeat('92',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret) VALUES ('ci-mfa-recovery-assertion',decode(repeat('93',32),'hex'));

WITH x AS (
 SELECT 'f0270000-0000-4000-8000-000000000001'::text a,
        'f0270000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0270000-0000-4000-8000-000000000031'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('91',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('92',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; redeemed BOOLEAN;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0270000-0000-4000-8000-000000000032';
 signature:=encode(public.hmac(convert_to(
  'v1:f0270000-0000-4000-8000-000000000001:f0270000-0000-4000-8000-000000000011:recovery:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('93',32),'hex'),'sha256'),'hex');
 IF public.unibud_operator_mfa_redeem_recovery_code_candidates(ARRAY[repeat('a',64)]::text[],issued,expires,nonce,repeat('0',64)) THEN
  RAISE EXCEPTION 'Forged recovery assertion was accepted';
 END IF;
 redeemed:=public.unibud_operator_mfa_redeem_recovery_code_candidates(ARRAY[repeat('a',64)]::text[],issued,expires,nonce,signature);
 IF redeemed IS DISTINCT FROM TRUE THEN RAISE EXCEPTION 'Valid recovery code was not redeemed'; END IF;
 IF public.unibud_operator_mfa_redeem_recovery_code_candidates(ARRAY[repeat('a',64)]::text[],issued,expires,nonce,signature) THEN
  RAISE EXCEPTION 'Recovery code or assertion was replayed';
 END IF;
 BEGIN
  EXECUTE 'SELECT event_type FROM public.unibud_operator_mfa_events';
  RAISE EXCEPTION 'Application role directly read MFA audit events';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;
DO $test$
BEGIN
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_credentials
  WHERE account_id='f0270000-0000-4000-8000-000000000001') THEN
  RAISE EXCEPTION 'Old authenticator credential survived recovery';
 END IF;
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_step_up_sessions
  WHERE account_id='f0270000-0000-4000-8000-000000000001') THEN
  RAISE EXCEPTION 'Recovery did not revoke every session step-up';
 END IF;
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_recovery_codes
  WHERE account_id='f0270000-0000-4000-8000-000000000001') THEN
  RAISE EXCEPTION 'Old recovery-code set survived recovery';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_events
  WHERE actor_account_id='f0270000-0000-4000-8000-000000000001'
    AND session_id='f0270000-0000-4000-8000-000000000011'
    AND event_type='recovery_code_redeemed') THEN
  RAISE EXCEPTION 'Recovery redemption audit event was not recorded';
 END IF;
END
$test$;

SET LOCAL ROLE unibud_ops_owner;
DO $test$
BEGIN
 BEGIN
  UPDATE public.unibud_operator_mfa_events
  SET event_type='challenge_succeeded'
  WHERE event_type='recovery_code_redeemed';
  RAISE EXCEPTION 'MFA audit event mutation unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;
ROLLBACK;
