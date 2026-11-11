-- PostgreSQL tests for Operations MFA security-request cancellation and expiry.
\\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0320000-0000-4000-8000-000000000001','active'),
 ('f0320000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0320000-0000-4000-8000-000000000011','f0320000-0000-4000-8000-000000000001',decode(repeat('d1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0320000-0000-4000-8000-000000000012','f0320000-0000-4000-8000-000000000002',decode(repeat('d2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('f0320000-0000-4000-8000-000000000001','operations_admin',ARRAY['operations.mfa.security.request']::text[],'f0320000-0000-4000-8000-000000000001'),
 ('f0320000-0000-4000-8000-000000000002','integration_operator',ARRAY['operations.accounts.support_read']::text[],'f0320000-0000-4000-8000-000000000002');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('f0320000-0000-4000-8000-000000000001','v1.'||repeat('J',16)||'.'||repeat('K',22)||'.'||repeat('L',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0320000-0000-4000-8000-000000000002','v1.'||repeat('M',16)||'.'||repeat('N',22)||'.'||repeat('O',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at)
VALUES ('f0320000-0000-4000-8000-000000000021','f0320000-0000-4000-8000-000000000001','f0320000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce)
VALUES ('f0320000-0000-4000-8000-000000000011','f0320000-0000-4000-8000-000000000001',clock_timestamp()+interval '5 minutes','f0320000-0000-4000-8000-000000000021');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-mfa-lifecycle-account',decode(repeat('d3',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-mfa-lifecycle-session',decode(repeat('d4',32),'hex'));

WITH x AS (
 SELECT 'f0320000-0000-4000-8000-000000000001'::text a,
        'f0320000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0320000-0000-4000-8000-000000000022'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d3',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d4',32),'hex'),'sha256'),'hex'),true)
FROM x;

INSERT INTO public.unibud_operator_mfa_security_requests(
 request_id,target_account_id,requested_action,requester_account_id,requester_session_id,reason_code,expires_at
) VALUES
 ('f0320000-0000-4000-8000-000000000031','f0320000-0000-4000-8000-000000000002','reset','f0320000-0000-4000-8000-000000000001','f0320000-0000-4000-8000-000000000011','lost_device',clock_timestamp()+interval '20 minutes'),
 ('f0320000-0000-4000-8000-000000000032','f0320000-0000-4000-8000-000000000002','disable','f0320000-0000-4000-8000-000000000001','f0320000-0000-4000-8000-000000000011','lost_device',clock_timestamp()-interval '1 minute');

SET LOCAL ROLE unibud_app;
DO $cancel$
BEGIN
 IF NOT public.unibud_operator_mfa_cancel_security_change(
   'f0320000-0000-4000-8000-000000000031','requester_cancelled'
 ) THEN RAISE EXCEPTION 'Requester could not cancel own pending request'; END IF;
 IF public.unibud_operator_mfa_cancel_security_change(
   'f0320000-0000-4000-8000-000000000032','requester_cancelled'
 ) THEN RAISE EXCEPTION 'Expired request was cancellable'; END IF;
 BEGIN
  PERFORM unibud_private.expire_operations_mfa_security_requests(10);
  RAISE EXCEPTION 'Application role executed protected expiry worker';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$cancel$;
RESET ROLE;

SET LOCAL ROLE unibud_ops_owner;
SELECT unibud_private.expire_operations_mfa_security_requests(10);
RESET ROLE;

DO $verify$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_security_requests
   WHERE request_id='f0320000-0000-4000-8000-000000000031' AND state='cancelled') THEN
   RAISE EXCEPTION 'Cancellation state was not persisted';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_security_requests
   WHERE request_id='f0320000-0000-4000-8000-000000000032' AND state='expired') THEN
   RAISE EXCEPTION 'Expiry worker did not expire due request';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_events
   WHERE security_request_id='f0320000-0000-4000-8000-000000000031'
     AND event_type='security_reset_cancelled'
     AND actor_account_id='f0320000-0000-4000-8000-000000000001') THEN
   RAISE EXCEPTION 'Cancellation audit event missing or actor incorrect';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.unibud_operator_mfa_events
   WHERE security_request_id='f0320000-0000-4000-8000-000000000032'
     AND event_type='security_reset_expired'
     AND actor_account_id IS NULL AND session_id IS NULL) THEN
   RAISE EXCEPTION 'System expiry audit attribution missing';
 END IF;
END
$verify$;
ROLLBACK;
