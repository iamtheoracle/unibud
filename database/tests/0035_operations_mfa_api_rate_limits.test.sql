-- PostgreSQL authorization and throttle tests for privileged Operations MFA API actions.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0350000-0000-4000-8000-000000000001','active'),
 ('f0350000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0350000-0000-4000-8000-000000000011','f0350000-0000-4000-8000-000000000001',decode(repeat('f1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0350000-0000-4000-8000-000000000012','f0350000-0000-4000-8000-000000000002',decode(repeat('f2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('f0350000-0000-4000-8000-000000000001','operations_admin',ARRAY['operations.mfa.security.request']::text[],'f0350000-0000-4000-8000-000000000001'),
 ('f0350000-0000-4000-8000-000000000002','operations_admin',ARRAY['operations.mfa.security.approve']::text[],'f0350000-0000-4000-8000-000000000002');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('f0350000-0000-4000-8000-000000000001','v1.'||repeat('S',16)||'.'||repeat('T',22)||'.'||repeat('U',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0350000-0000-4000-8000-000000000002','v1.'||repeat('V',16)||'.'||repeat('W',22)||'.'||repeat('X',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at) VALUES
 ('f0350000-0000-4000-8000-000000000021','f0350000-0000-4000-8000-000000000001','f0350000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute'),
 ('f0350000-0000-4000-8000-000000000022','f0350000-0000-4000-8000-000000000002','f0350000-0000-4000-8000-000000000012','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce) VALUES
 ('f0350000-0000-4000-8000-000000000011','f0350000-0000-4000-8000-000000000001',clock_timestamp()+interval '5 minutes','f0350000-0000-4000-8000-000000000021'),
 ('f0350000-0000-4000-8000-000000000012','f0350000-0000-4000-8000-000000000002',clock_timestamp()+interval '5 minutes','f0350000-0000-4000-8000-000000000022');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-api-limit-account',decode(repeat('f3',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-api-limit-session',decode(repeat('f4',32),'hex'));

WITH x AS (
 SELECT 'f0350000-0000-4000-8000-000000000001'::text a,
        'f0350000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0350000-0000-4000-8000-000000000031'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('f3',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('f4',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $requester$
DECLARE i INTEGER;
BEGIN
 FOR i IN 1..5 LOOP
   IF NOT public.unibud_operator_mfa_consume_api_rate_limit('request_create') THEN
     RAISE EXCEPTION 'Allowed requester API action was denied before limit';
   END IF;
 END LOOP;
 IF public.unibud_operator_mfa_consume_api_rate_limit('request_create') THEN
   RAISE EXCEPTION 'Requester API action was not throttled at fixed limit';
 END IF;
 IF public.unibud_operator_mfa_consume_api_rate_limit('request_decide') THEN
   RAISE EXCEPTION 'Requester permission incorrectly allowed decision action';
 END IF;
 BEGIN
   PERFORM 1 FROM public.unibud_operator_mfa_api_rate_limits;
   RAISE EXCEPTION 'Application role directly read protected rate-limit table';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$requester$;
RESET ROLE;

WITH x AS (
 SELECT 'f0350000-0000-4000-8000-000000000002'::text a,
        'f0350000-0000-4000-8000-000000000012'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0350000-0000-4000-8000-000000000032'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('f3',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('f4',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $approver$
BEGIN
 IF NOT public.unibud_operator_mfa_consume_api_rate_limit('request_decide') THEN
   RAISE EXCEPTION 'Approver could not consume decision rate-limit bucket';
 END IF;
 IF NOT public.unibud_operator_mfa_consume_api_rate_limit('request_read') THEN
   RAISE EXCEPTION 'Approver could not consume read rate-limit bucket';
 END IF;
 IF public.unibud_operator_mfa_consume_api_rate_limit('request_create') THEN
   RAISE EXCEPTION 'Approval-only operator incorrectly consumed request creation bucket';
 END IF;
END
$approver$;
RESET ROLE;
ROLLBACK;
