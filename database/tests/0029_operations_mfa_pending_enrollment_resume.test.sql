-- PostgreSQL tests for password-reauthenticated pending enrollment resume.
\set ON_ERROR_STOP on
BEGIN;
INSERT INTO public.accounts(id,status) VALUES ('f0290000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES ('f0290000-0000-4000-8000-000000000011','f0290000-0000-4000-8000-000000000001',
 decode(repeat('c1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0290000-0000-4000-8000-000000000001','integration_operator',
 ARRAY['integrations.verification_delivery.read']::text[],'f0290000-0000-4000-8000-000000000001');
INSERT INTO public.unibud_operator_mfa_credentials(account_id,encrypted_totp_secret,state,enrollment_expires_at)
VALUES ('f0290000-0000-4000-8000-000000000001',
 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'pending',clock_timestamp()+interval '10 minutes');
INSERT INTO unibud_private.context_signing_keys(key_id,secret) VALUES ('ci-mfa-resume-account',decode(repeat('c1',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret) VALUES ('ci-mfa-resume-session',decode(repeat('c2',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret) VALUES ('ci-mfa-resume-assertion',decode(repeat('c3',32),'hex'));
WITH x AS (
 SELECT 'f0290000-0000-4000-8000-000000000001'::text a,
        'f0290000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0290000-0000-4000-8000-000000000021'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('c1',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('c2',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; secret TEXT;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0290000-0000-4000-8000-000000000031';
 signature:=encode(public.hmac(convert_to(
  'v1:f0290000-0000-4000-8000-000000000001:f0290000-0000-4000-8000-000000000011:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('c3',32),'hex'),'sha256'),'hex');
 IF public.unibud_operator_mfa_read_pending_secret(issued,expires,nonce,repeat('0',64)) IS NOT NULL THEN
  RAISE EXCEPTION 'Forged password reauthentication assertion read pending seed';
 END IF;
 secret:=public.unibud_operator_mfa_read_pending_secret(issued,expires,nonce,signature);
 IF secret IS DISTINCT FROM 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27) THEN
  RAISE EXCEPTION 'Valid password reauthentication did not resume pending enrollment';
 END IF;
 IF public.unibud_operator_mfa_read_pending_secret(issued,expires,nonce,signature) IS NOT NULL THEN
  RAISE EXCEPTION 'Pending secret read assertion was replayed';
 END IF;
 BEGIN
  EXECUTE 'SELECT encrypted_totp_secret FROM public.unibud_operator_mfa_credentials';
  RAISE EXCEPTION 'Application role directly read MFA credential table';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;
UPDATE public.unibud_operator_mfa_credentials
SET state='active',confirmed_at=clock_timestamp(),last_accepted_totp_step=100
WHERE account_id='f0290000-0000-4000-8000-000000000001';
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; secret TEXT;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT; expires:=issued+60;
 nonce:='f0290000-0000-4000-8000-000000000032';
 signature:=encode(public.hmac(convert_to(
  'v1:f0290000-0000-4000-8000-000000000001:f0290000-0000-4000-8000-000000000011:password_reauth:'||
  issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('c3',32),'hex'),'sha256'),'hex');
 secret:=public.unibud_operator_mfa_read_pending_secret(issued,expires,nonce,signature);
 IF secret IS NOT NULL THEN RAISE EXCEPTION 'Active TOTP secret was exposed through pending-only accessor'; END IF;
END
$test$;
RESET ROLE;
ROLLBACK;
