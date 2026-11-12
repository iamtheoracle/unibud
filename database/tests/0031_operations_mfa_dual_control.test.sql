-- PostgreSQL tests for dual-control MFA disable/reset.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES
 ('f0310000-0000-4000-8000-000000000001','active'),
 ('f0310000-0000-4000-8000-000000000002','active'),
 ('f0310000-0000-4000-8000-000000000003','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0310000-0000-4000-8000-000000000011','f0310000-0000-4000-8000-000000000001',decode(repeat('a1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0310000-0000-4000-8000-000000000012','f0310000-0000-4000-8000-000000000002',decode(repeat('a2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0310000-0000-4000-8000-000000000013','f0310000-0000-4000-8000-000000000003',decode(repeat('a3',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('f0310000-0000-4000-8000-000000000001','operations_admin',ARRAY['operations.mfa.security.request','operations.mfa.security.approve']::text[],'f0310000-0000-4000-8000-000000000001'),
 ('f0310000-0000-4000-8000-000000000002','integration_operator',ARRAY['operations.accounts.support_read','operations.mfa.security.approve']::text[],'f0310000-0000-4000-8000-000000000002'),
 ('f0310000-0000-4000-8000-000000000003','integration_operator',ARRAY['operations.accounts.support_read','operations.mfa.security.approve']::text[],'f0310000-0000-4000-8000-000000000003');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('f0310000-0000-4000-8000-000000000001','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0310000-0000-4000-8000-000000000002','v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0310000-0000-4000-8000-000000000003','v1.'||repeat('G',16)||'.'||repeat('H',22)||'.'||repeat('I',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest) VALUES
 ('f0310000-0000-4000-8000-000000000002',decode(repeat('b',64),'hex'));
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at) VALUES
 ('f0310000-0000-4000-8000-000000000021','f0310000-0000-4000-8000-000000000001','f0310000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute'),
 ('f0310000-0000-4000-8000-000000000022','f0310000-0000-4000-8000-000000000002','f0310000-0000-4000-8000-000000000012','step_up',clock_timestamp()+interval '1 minute'),
 ('f0310000-0000-4000-8000-000000000023','f0310000-0000-4000-8000-000000000003','f0310000-0000-4000-8000-000000000013','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce) VALUES
 ('f0310000-0000-4000-8000-000000000011','f0310000-0000-4000-8000-000000000001',clock_timestamp()+interval '5 minutes','f0310000-0000-4000-8000-000000000021'),
 ('f0310000-0000-4000-8000-000000000012','f0310000-0000-4000-8000-000000000002',clock_timestamp()+interval '5 minutes','f0310000-0000-4000-8000-000000000022'),
 ('f0310000-0000-4000-8000-000000000013','f0310000-0000-4000-8000-000000000003',clock_timestamp()+interval '5 minutes','f0310000-0000-4000-8000-000000000023');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-dual-account',decode(repeat('c1',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-dual-session',decode(repeat('c2',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret) VALUES ('ci-mfa-dual-assertion',decode(repeat('c3',32),'hex'));

-- Requester creates a reset request using a signed, single-use password assertion.
WITH x AS (
 SELECT 'f0310000-0000-4000-8000-000000000001'::text a,
        'f0310000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0310000-0000-4000-8000-000000000031'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('c2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $request$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; sig TEXT; rid UUID;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0310000-0000-4000-8000-000000000032';
 sig:=encode(public.hmac(convert_to(
  'v1:f0310000-0000-4000-8000-000000000001:f0310000-0000-4000-8000-000000000011:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('c3',32),'hex'),'sha256'),'hex');
 rid:=public.unibud_operator_mfa_request_security_change(
  'f0310000-0000-4000-8000-000000000002','reset','lost_device',
  issued,expires,nonce,sig
 );
 IF rid IS NULL THEN RAISE EXCEPTION 'Valid dual-control request was not created'; END IF;
 PERFORM set_config('test.request_id',rid::TEXT,true);
END
$request$;

-- Requester cannot approve their own request, even though they hold both permissions.
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; sig TEXT; ok BOOLEAN; rid UUID;
BEGIN
 rid:=current_setting('test.request_id')::UUID;
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0310000-0000-4000-8000-000000000033';
 sig:=encode(public.hmac(convert_to(
  'v1:f0310000-0000-4000-8000-000000000001:f0310000-0000-4000-8000-000000000011:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('c3',32),'hex'),'sha256'),'hex');
 ok:=public.unibud_operator_mfa_decide_security_change(rid,'approve','self_approval',issued,expires,nonce,sig);
 IF ok THEN RAISE EXCEPTION 'Requester approved their own MFA reset'; END IF;
END
$test$;
RESET ROLE;

-- Target cannot approve its own reset, even with an independent operator grant and session.
WITH x AS (
 SELECT 'f0310000-0000-4000-8000-000000000002'::text a,
        'f0310000-0000-4000-8000-000000000012'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0310000-0000-4000-8000-000000000041'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('c2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; sig TEXT; ok BOOLEAN; rid UUID;
BEGIN
 rid:=current_setting('test.request_id')::UUID;
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0310000-0000-4000-8000-000000000042';
 sig:=encode(public.hmac(convert_to(
  'v1:f0310000-0000-4000-8000-000000000002:f0310000-0000-4000-8000-000000000012:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('c3',32),'hex'),'sha256'),'hex');
 ok:=public.unibud_operator_mfa_decide_security_change(rid,'approve','target_self',issued,expires,nonce,sig);
 IF ok THEN RAISE EXCEPTION 'Target account approved its own MFA reset'; END IF;
END
$test$;
RESET ROLE;

-- A separate authorised operator approves. Credential, recovery digests and all
-- target step-ups are invalidated in the same transaction.
WITH x AS (
 SELECT 'f0310000-0000-4000-8000-000000000003'::text a,
        'f0310000-0000-4000-8000-000000000013'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0310000-0000-4000-8000-000000000051'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('c2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; sig TEXT; ok BOOLEAN; rid UUID;
BEGIN
 rid:=current_setting('test.request_id')::UUID;
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0310000-0000-4000-8000-000000000052';
 sig:=encode(public.hmac(convert_to(
  'v1:f0310000-0000-4000-8000-000000000003:f0310000-0000-4000-8000-000000000013:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('c3',32),'hex'),'sha256'),'hex');
 ok:=public.unibud_operator_mfa_decide_security_change(rid,'approve','approved',issued,expires,nonce,sig);
 IF ok IS DISTINCT FROM TRUE THEN RAISE EXCEPTION 'Independent operator approval failed'; END IF;
 IF public.unibud_operator_mfa_decide_security_change(rid,'approve','replay_try',
   issued,expires,'f0310000-0000-4000-8000-000000000053',sig) THEN
   RAISE EXCEPTION 'Completed request was approved twice';
 END IF;
END
$test$;
RESET ROLE;

DO $verify$
BEGIN
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_credentials
   WHERE account_id='f0310000-0000-4000-8000-000000000002') THEN
   RAISE EXCEPTION 'Target authenticator was not removed';
 END IF;
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_recovery_codes
   WHERE account_id='f0310000-0000-4000-8000-000000000002') THEN
   RAISE EXCEPTION 'Target recovery codes were not invalidated';
 END IF;
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_step_up_sessions
   WHERE account_id='f0310000-0000-4000-8000-000000000002') THEN
   RAISE EXCEPTION 'Target step-up sessions were not invalidated';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_security_requests
   WHERE request_id=current_setting('test.request_id')::UUID AND state='completed'
     AND requester_account_id='f0310000-0000-4000-8000-000000000001'
     AND approver_account_id='f0310000-0000-4000-8000-000000000003') THEN
   RAISE EXCEPTION 'Dual-control request did not record distinct actors';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_events
   WHERE security_request_id=current_setting('test.request_id')::UUID
     AND event_type='security_reset_approved') THEN
   RAISE EXCEPTION 'Approval audit event missing';
 END IF;
END
$verify$;

-- The privilege assertion must execute as the application role, not the
-- superuser used by the migration test harness.
SET LOCAL ROLE unibud_app;
DO $privilege$
BEGIN
 BEGIN
  EXECUTE 'SELECT request_id FROM public.unibud_operator_mfa_security_requests';
  RAISE EXCEPTION 'Application role directly read protected reset requests';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$privilege$;
RESET ROLE;
ROLLBACK;
