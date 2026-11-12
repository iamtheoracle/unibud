-- PostgreSQL requester-only visibility tests for the Operations MFA request read model.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0330000-0000-4000-8000-000000000001','active'),
 ('f0340000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 'f0330000-0000-4000-8000-000000000011',
 'f0330000-0000-4000-8000-000000000001',
 decode(repeat('e1',32),'hex'),clock_timestamp()-interval '1 minute',
 clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);
INSERT INTO public.unibud_operator_mfa_security_requests(
 request_id,target_account_id,requested_action,requester_account_id,requester_session_id,
 reason_code,created_at,expires_at
) VALUES (
 'f0340000-0000-4000-8000-000000000041',
 'f0340000-0000-4000-8000-000000000002','reset',
 'f0330000-0000-4000-8000-000000000001',
 'f0330000-0000-4000-8000-000000000011',
 'lost_device',clock_timestamp(),clock_timestamp()+interval '20 minutes'
);

INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0330000-0000-4000-8000-000000000001','operations_admin',
 ARRAY['operations.mfa.security.request']::text[],
 'f0330000-0000-4000-8000-000000000001');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES (
 'f0330000-0000-4000-8000-000000000001',
 'v1.'||repeat('P',16)||'.'||repeat('Q',22)||'.'||repeat('R',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000
);
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at)
VALUES ('f0330000-0000-4000-8000-000000000021',
 'f0330000-0000-4000-8000-000000000001',
 'f0330000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce)
VALUES ('f0330000-0000-4000-8000-000000000011',
 'f0330000-0000-4000-8000-000000000001',
 clock_timestamp()+interval '5 minutes','f0330000-0000-4000-8000-000000000021');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-mfa-read-account',decode(repeat('e3',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-mfa-read-session',decode(repeat('e4',32),'hex'));

WITH x AS (
 SELECT 'f0330000-0000-4000-8000-000000000001'::text a,
        'f0330000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0330000-0000-4000-8000-000000000022'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('e3',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('e4',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $read$
BEGIN
 IF (SELECT count(*) FROM public.unibud_operator_mfa_list_security_requests(NULL,50,NULL,NULL))<>1 THEN
   RAISE EXCEPTION 'Requester did not receive exactly their own pending request';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.unibud_operator_mfa_list_security_requests(
     'f0340000-0000-4000-8000-000000000041',50,NULL,NULL
   ) WHERE requester_account_id='f0330000-0000-4000-8000-000000000001'
 ) THEN
   RAISE EXCEPTION 'Requester could not read their own request detail';
 END IF;
 IF EXISTS (
   SELECT 1 FROM public.unibud_operator_mfa_list_security_requests(
     'f0340000-0000-4000-8000-000000000042',50,NULL,NULL
   )
 ) THEN
   RAISE EXCEPTION 'Requester received a request belonging to another account';
 END IF;
 BEGIN
   PERFORM 1 FROM public.unibud_operator_mfa_security_requests;
   RAISE EXCEPTION 'Application role directly read protected request table';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
   PERFORM * FROM public.unibud_operator_mfa_list_security_requests(NULL,101,NULL,NULL);
   RAISE EXCEPTION 'Read API accepted an unbounded page size';
 EXCEPTION WHEN invalid_parameter_value THEN NULL;
 END;
END
$read$;
ROLLBACK;
