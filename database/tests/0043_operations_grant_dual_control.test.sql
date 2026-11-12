-- PostgreSQL tests for database-enforced dual-control operator grants.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES
 ('f0430000-0000-4000-8000-000000000001','active'),
 ('f0430000-0000-4000-8000-000000000002','active'),
 ('f0430000-0000-4000-8000-000000000003','active');
INSERT INTO public.account_sessions(id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at) VALUES
 ('f0430000-0000-4000-8000-000000000011','f0430000-0000-4000-8000-000000000001',decode(repeat('a1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0430000-0000-4000-8000-000000000012','f0430000-0000-4000-8000-000000000002',decode(repeat('a2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('f0430000-0000-4000-8000-000000000001','platform_admin',ARRAY['operations.grants.request']::text[],'f0430000-0000-4000-8000-000000000001'),
 ('f0430000-0000-4000-8000-000000000002','platform_admin',ARRAY['operations.grants.approve']::text[],'f0430000-0000-4000-8000-000000000002');
INSERT INTO public.unibud_operator_mfa_credentials(account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step) VALUES
 ('f0430000-0000-4000-8000-000000000001','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0430000-0000-4000-8000-000000000002','v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at) VALUES
 ('f0430000-0000-4000-8000-000000000021','f0430000-0000-4000-8000-000000000001','f0430000-0000-4000-8000-000000000011','step_up',clock_timestamp()+interval '1 minute'),
 ('f0430000-0000-4000-8000-000000000022','f0430000-0000-4000-8000-000000000002','f0430000-0000-4000-8000-000000000012','step_up',clock_timestamp()+interval '1 minute');
INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,expires_at,assertion_nonce) VALUES
 ('f0430000-0000-4000-8000-000000000011','f0430000-0000-4000-8000-000000000001',clock_timestamp()+interval '5 minutes','f0430000-0000-4000-8000-000000000021'),
 ('f0430000-0000-4000-8000-000000000012','f0430000-0000-4000-8000-000000000002',clock_timestamp()+interval '5 minutes','f0430000-0000-4000-8000-000000000022');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-grants-account',decode(repeat('d1',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-grants-session',decode(repeat('d2',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret) VALUES ('ci-grants-assertion',decode(repeat('d3',32),'hex'));

-- Requester signs a short-lived password reauthentication assertion.
WITH x AS (
 SELECT 'f0430000-0000-4000-8000-000000000001'::text a,
 'f0430000-0000-4000-8000-000000000011'::text s,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'f0430000-0000-4000-8000-000000000031'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $request$
DECLARE i BIGINT; e BIGINT; n UUID; sig TEXT; rid UUID;
BEGIN
 i:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; e:=i+60;
 n:='f0430000-0000-4000-8000-000000000032';
 sig:=encode(public.hmac(convert_to(
  'v1:f0430000-0000-4000-8000-000000000001:f0430000-0000-4000-8000-000000000011:password_reauth:'||
  i::TEXT||':'||e::TEXT||':'||n::TEXT||':-','UTF8'),decode(repeat('d3',32),'hex'),'sha256'),'hex');
 rid:=public.unibud_operator_request_grant_change(
  'grant','f0430000-0000-4000-8000-000000000003',NULL,'integration_operator',
  ARRAY['integrations.verification_delivery.read','dependencies.read']::text[],
  clock_timestamp()+interval '30 days','new_operator',i,e,n,sig);
 IF rid IS NULL THEN RAISE EXCEPTION 'Valid grant request was not created'; END IF;
 PERFORM set_config('test.grant_request_id',rid::TEXT,true);
END
$request$;

-- The requester cannot approve its own request.
DO $self$
DECLARE i BIGINT; e BIGINT; n UUID; sig TEXT;
BEGIN
 i:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; e:=i+60;
 n:='f0430000-0000-4000-8000-000000000033';
 sig:=encode(public.hmac(convert_to(
  'v1:f0430000-0000-4000-8000-000000000001:f0430000-0000-4000-8000-000000000011:password_reauth:'||
  i::TEXT||':'||e::TEXT||':'||n::TEXT||':-','UTF8'),decode(repeat('d3',32),'hex'),'sha256'),'hex');
 IF public.unibud_operator_decide_grant_change(
   current_setting('test.grant_request_id')::UUID,'approve','self_approval',i,e,n,sig) THEN
   RAISE EXCEPTION 'Requester approved its own grant request';
 END IF;
END
$self$;
RESET ROLE;

-- An independent, separately authenticated approver approves the request.
WITH x AS (
 SELECT 'f0430000-0000-4000-8000-000000000002'::text a,
 'f0430000-0000-4000-8000-000000000012'::text s,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'f0430000-0000-4000-8000-000000000041'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $approve$
DECLARE i BIGINT; e BIGINT; n UUID; sig TEXT;
BEGIN
 i:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; e:=i+60;
 n:='f0430000-0000-4000-8000-000000000042';
 sig:=encode(public.hmac(convert_to(
  'v1:f0430000-0000-4000-8000-000000000002:f0430000-0000-4000-8000-000000000012:password_reauth:'||
  i::TEXT||':'||e::TEXT||':'||n::TEXT||':-','UTF8'),decode(repeat('d3',32),'hex'),'sha256'),'hex');
 IF NOT public.unibud_operator_decide_grant_change(
   current_setting('test.grant_request_id')::UUID,'approve','approved_after_review',i,e,n,sig) THEN
   RAISE EXCEPTION 'Independent grant approval failed';
 END IF;
END
$approve$;
RESET ROLE;

DO $verify_grant$
DECLARE v_id UUID;
BEGIN
 SELECT id INTO v_id FROM public.unibud_operator_grants
 WHERE account_id='f0430000-0000-4000-8000-000000000003'
   AND revoked_at IS NULL AND 'integrations.verification_delivery.read'=ANY(permissions);
 IF v_id IS NULL THEN RAISE EXCEPTION 'Approved grant was not created'; END IF;
 PERFORM set_config('test.created_grant_id',v_id::TEXT,true);
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_grant_requests
   WHERE request_id=current_setting('test.grant_request_id')::UUID
   AND state='approved' AND requester_account_id='f0430000-0000-4000-8000-000000000001'
   AND approver_account_id='f0430000-0000-4000-8000-000000000002'
   AND created_grant_id=v_id) THEN RAISE EXCEPTION 'Distinct grant actors were not persisted'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_audit_events
   WHERE request_id=current_setting('test.grant_request_id')::UUID
   AND permission='operations.grants.approve' AND outcome='allowed') THEN
   RAISE EXCEPTION 'Grant approval audit record missing'; END IF;
END
$verify_grant$;

-- Application role cannot directly read grant requests or mutate operator grants.
SET LOCAL ROLE unibud_app;
DO $privileges$
BEGIN
 BEGIN
  EXECUTE 'SELECT request_id FROM public.unibud_operator_grant_requests';
  RAISE EXCEPTION 'Application role directly read protected grant requests';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
  EXECUTE 'UPDATE public.unibud_operator_grants SET revoked_at=clock_timestamp()';
  RAISE EXCEPTION 'Application role directly mutated operator grants';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$privileges$;
RESET ROLE;

-- Grant-management permissions cannot be requested for another operator.
WITH x AS (
 SELECT 'f0430000-0000-4000-8000-000000000001'::text a,
 'f0430000-0000-4000-8000-000000000011'::text s,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'f0430000-0000-4000-8000-000000000051'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $bootstrap$
DECLARE i BIGINT; e BIGINT; n UUID; sig TEXT; rid UUID;
BEGIN
 i:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; e:=i+60;
 n:='f0430000-0000-4000-8000-000000000052';
 sig:=encode(public.hmac(convert_to(
  'v1:f0430000-0000-4000-8000-000000000001:f0430000-0000-4000-8000-000000000011:password_reauth:'||
  i::TEXT||':'||e::TEXT||':'||n::TEXT||':-','UTF8'),decode(repeat('d3',32),'hex'),'sha256'),'hex');
 rid:=public.unibud_operator_request_grant_change(
  'grant','f0430000-0000-4000-8000-000000000003',NULL,'platform_admin',
  ARRAY['operations.grants.approve']::text[],clock_timestamp()+interval '10 days',
  'bootstrap_escalation',i,e,n,sig);
 IF rid IS NOT NULL THEN RAISE EXCEPTION 'Grant-management permission was assignable through self-service'; END IF;
END
$bootstrap$;
RESET ROLE;
ROLLBACK;
