-- PostgreSQL integration tests for password-reauthenticated Operations MFA enrollment.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0250000-0000-4000-8000-000000000001','active'),
 ('f0250000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0250000-0000-4000-8000-000000000011',
  'f0250000-0000-4000-8000-000000000001',decode(repeat('71',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0250000-0000-4000-8000-000000000012',
  'f0250000-0000-4000-8000-000000000002',decode(repeat('72',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0250000-0000-4000-8000-000000000001','integration_operator',
 ARRAY['integrations.verification_delivery.read']::text[],
 'f0250000-0000-4000-8000-000000000001');

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-mfa-enroll-account',decode(repeat('71',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-mfa-enroll-session',decode(repeat('72',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-mfa-enroll-assertion',decode(repeat('73',32),'hex'));

-- Establish a valid exact-session context for the operator account.
WITH x AS (
 SELECT 'f0250000-0000-4000-8000-000000000001'::text AS a,
        'f0250000-0000-4000-8000-000000000011'::text AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
        'f0250000-0000-4000-8000-000000000021'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('71',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('72',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; started BOOLEAN; secret TEXT;
BEGIN
 issued := floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires := issued + 60;
 nonce := 'f0250000-0000-4000-8000-000000000031';
 signature := encode(public.hmac(
  convert_to('v1:f0250000-0000-4000-8000-000000000001:f0250000-0000-4000-8000-000000000011:password_reauth:'||
   issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('73',32),'hex'),'sha256'),'hex');

 IF public.unibud_operator_mfa_begin_enrollment(
   'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
   issued,expires,nonce,repeat('0',64)
 ) THEN
  RAISE EXCEPTION 'Forged password reauthentication assertion was accepted';
 END IF;
 IF public.unibud_operator_mfa_begin_enrollment(
   'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
   issued-200,expires-200,nonce,signature
 ) THEN
  RAISE EXCEPTION 'Expired password reauthentication assertion was accepted';
 END IF;

 started := public.unibud_operator_mfa_begin_enrollment(
  'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
  issued,expires,nonce,signature
 );
 IF started IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'Valid password reauthentication did not start pending enrollment';
 END IF;
 secret := public.unibud_operator_mfa_read_encrypted_secret();
 IF secret IS DISTINCT FROM 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27) THEN
  RAISE EXCEPTION 'Server-only encrypted secret accessor did not return pending envelope';
 END IF;
 BEGIN
  EXECUTE 'SELECT encrypted_totp_secret FROM public.unibud_operator_mfa_credentials';
  RAISE EXCEPTION 'Application role directly read MFA credential storage';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;
RESET ROLE;

DO $test$
DECLARE state_value TEXT; expires_at TIMESTAMPTZ;
BEGIN
 SELECT state,enrollment_expires_at INTO state_value,expires_at
 FROM public.unibud_operator_mfa_credentials
 WHERE account_id='f0250000-0000-4000-8000-000000000001';
 IF state_value <> 'pending' OR expires_at <= clock_timestamp() THEN
  RAISE EXCEPTION 'Pending enrollment state or expiry was not persisted correctly';
 END IF;
END
$test$;

-- The same reauthentication assertion cannot be replayed to replace the pending secret.
UPDATE public.unibud_operator_mfa_credentials
SET enrollment_expires_at=clock_timestamp()-interval '1 second'
WHERE account_id='f0250000-0000-4000-8000-000000000001';
WITH x AS (
 SELECT 'f0250000-0000-4000-8000-000000000001'::text AS a,
        'f0250000-0000-4000-8000-000000000011'::text AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
        'f0250000-0000-4000-8000-000000000022'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('71',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('72',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT;
BEGIN
 issued := floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires := issued + 60;
 nonce := 'f0250000-0000-4000-8000-000000000031';
 signature := encode(public.hmac(
  convert_to('v1:f0250000-0000-4000-8000-000000000001:f0250000-0000-4000-8000-000000000011:password_reauth:'||
   issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('73',32),'hex'),'sha256'),'hex');
 IF public.unibud_operator_mfa_begin_enrollment(
  'v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),
  issued,expires,nonce,signature
 ) THEN
  RAISE EXCEPTION 'Replayed password reauthentication assertion was accepted';
 END IF;
END
$test$;
RESET ROLE;

-- A non-operator account cannot begin enrollment, even with valid signed identity.
WITH x AS (
 SELECT 'f0250000-0000-4000-8000-000000000002'::text AS a,
        'f0250000-0000-4000-8000-000000000012'::text AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
        'f0250000-0000-4000-8000-000000000023'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('71',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('72',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT;
BEGIN
 issued := floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires := issued + 60;
 nonce := 'f0250000-0000-4000-8000-000000000032';
 signature := encode(public.hmac(
  convert_to('v1:f0250000-0000-4000-8000-000000000002:f0250000-0000-4000-8000-000000000012:password_reauth:'||
   issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':-','UTF8'),
  decode(repeat('73',32),'hex'),'sha256'),'hex');
 IF public.unibud_operator_mfa_begin_enrollment(
  'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
  issued,expires,nonce,signature
 ) THEN
  RAISE EXCEPTION 'Non-operator account began MFA enrollment';
 END IF;
 IF public.unibud_operator_mfa_read_encrypted_secret() IS NOT NULL THEN
  RAISE EXCEPTION 'Non-operator account read encrypted MFA secret';
 END IF;
END
$test$;
RESET ROLE;

ROLLBACK;
