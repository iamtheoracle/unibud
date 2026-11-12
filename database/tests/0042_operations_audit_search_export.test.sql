-- PostgreSQL authorization, bounded-search and data-minimisation tests.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES ('f0420000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at)
VALUES ('f0420000-0000-4000-8000-000000000011','f0420000-0000-4000-8000-000000000001',
 decode(repeat('42',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0420000-0000-4000-8000-000000000001','operations_admin',
 ARRAY['operations.audit.read']::text[],'f0420000-0000-4000-8000-000000000001');
INSERT INTO public.unibud_operator_mfa_credentials(account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step)
VALUES ('f0420000-0000-4000-8000-000000000001','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at)
VALUES ('f0420000-0000-4000-8000-000000000021','f0420000-0000-4000-8000-000000000001',
 'f0420000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce)
VALUES ('f0420000-0000-4000-8000-000000000011','f0420000-0000-4000-8000-000000000001',
 clock_timestamp()+interval '5 minutes','f0420000-0000-4000-8000-000000000021');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-audit-account',decode(repeat('43',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-audit-session',decode(repeat('44',32),'hex'));
INSERT INTO public.unibud_operator_audit_events(actor_account_id,session_id,permission,outcome,request_id,occurred_at)
VALUES
 ('f0420000-0000-4000-8000-000000000001','f0420000-0000-4000-8000-000000000011',
  'operations.audit.read','allowed','f0420000-0000-4000-8000-000000000031',clock_timestamp()-interval '2 minutes'),
 ('f0420000-0000-4000-8000-000000000001','f0420000-0000-4000-8000-000000000011',
  'operations.audit.read','denied','f0420000-0000-4000-8000-000000000032',clock_timestamp()-interval '1 minute');
WITH x AS (
 SELECT 'f0420000-0000-4000-8000-000000000001'::text a,
 'f0420000-0000-4000-8000-000000000011'::text s,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'f0420000-0000-4000-8000-000000000022'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('43',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('44',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE v_count INTEGER;
BEGIN
 SELECT count(*) INTO v_count FROM public.unibud_operator_search_audit_events(
  clock_timestamp()-interval '1 day',clock_timestamp(), 'operations.audit.read',NULL,NULL,100,NULL,NULL);
 IF v_count<>2 THEN RAISE EXCEPTION 'Expected two filtered audit records, received %',v_count; END IF;
 SELECT count(*) INTO v_count FROM public.unibud_operator_search_audit_events(
  clock_timestamp()-interval '1 day',clock_timestamp(), NULL,'allowed',NULL,100,NULL,NULL);
 IF v_count<>1 THEN RAISE EXCEPTION 'Outcome filter returned unexpected row count %',v_count; END IF;
 IF NOT public.unibud_operator_mfa_consume_api_rate_limit('audit_read') THEN
  RAISE EXCEPTION 'Authorised audit reader could not consume audit-read throttle';
 END IF;
 BEGIN
  PERFORM * FROM public.unibud_operator_search_audit_events(
   clock_timestamp()-interval '91 days',clock_timestamp(),NULL,NULL,NULL,100,NULL,NULL);
  RAISE EXCEPTION 'Audit search accepted a range exceeding 90 days';
 EXCEPTION WHEN invalid_parameter_value THEN NULL;
 END;
 BEGIN
  PERFORM * FROM public.unibud_operator_search_audit_events(
   clock_timestamp()-interval '1 day',clock_timestamp(),NULL,NULL,NULL,1001,NULL,NULL);
  RAISE EXCEPTION 'Audit search accepted more than 1000 rows';
 EXCEPTION WHEN invalid_parameter_value THEN NULL;
 END;
 BEGIN
  PERFORM 1 FROM public.unibud_operator_audit_events;
  RAISE EXCEPTION 'Application role directly read append-only audit table';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
ROLLBACK;
