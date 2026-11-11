-- Verify overlapping old/new keys for each independent signing purpose.
-- Synthetic key material and accounts are confined to this rolled-back test.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status)
VALUES ('f0400000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 'f0400000-0000-4000-8000-000000000011',
 'f0400000-0000-4000-8000-000000000001',decode(repeat('40',32),'hex'),
 clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES (
 'f0400000-0000-4000-8000-000000000001',
 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000
);

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-rotation-account-old',decode(repeat('51',32),'hex')),
       ('ci-rotation-account-new',decode(repeat('52',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-rotation-session-old',decode(repeat('61',32),'hex')),
       ('ci-rotation-session-new',decode(repeat('62',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-rotation-mfa-old',decode(repeat('71',32),'hex')),
       ('ci-rotation-mfa-new',decode(repeat('72',32),'hex'));

DO $limit$
BEGIN
  BEGIN
    INSERT INTO unibud_private.context_signing_keys(key_id,secret)
    VALUES ('ci-rotation-account-third',decode(repeat('53',32),'hex'));
    RAISE EXCEPTION 'Third active account key was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
    VALUES ('ci-rotation-session-third',decode(repeat('63',32),'hex'));
    RAISE EXCEPTION 'Third active session key was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
    VALUES ('ci-rotation-mfa-third',decode(repeat('73',32),'hex'));
    RAISE EXCEPTION 'Third active MFA key was accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
END
$limit$;

-- Sign with the OLD key in each purpose while both keys are active.
WITH x AS (
 SELECT 'f0400000-0000-4000-8000-000000000001'::text a,
        'f0400000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0400000-0000-4000-8000-000000000021'::text n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('51',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('61',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $old_key$
DECLARE issued BIGINT; expires BIGINT; accepted BOOLEAN;
BEGIN
 IF unibud_private.current_account_id() IS DISTINCT FROM
    'f0400000-0000-4000-8000-000000000001'::uuid THEN
   RAISE EXCEPTION 'Old account-context key failed during overlap';
 END IF;
 issued:=floor(extract(epoch FROM clock_timestamp()))::bigint;
 expires:=issued+60;
 accepted:=public.unibud_operator_mfa_consume_step_up(
   issued,expires,'f0400000-0000-4000-8000-000000000031',1001,
   encode(public.hmac(convert_to(
    'v1:f0400000-0000-4000-8000-000000000001:f0400000-0000-4000-8000-000000000011:step_up:'||
    issued::text||':'||expires::text||':f0400000-0000-4000-8000-000000000031:1001','UTF8'),
    decode(repeat('71',32),'hex'),'sha256'),'hex')
 );
 IF accepted IS DISTINCT FROM TRUE THEN
   RAISE EXCEPTION 'Old session/MFA keys failed during overlap';
 END IF;
END
$old_key$;
RESET ROLE;

-- The NEW account, session and MFA keys all verify before retiring the old keys.
WITH x AS (
 SELECT 'f0400000-0000-4000-8000-000000000001'::text a,
        'f0400000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0400000-0000-4000-8000-000000000022'::text n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('52',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('62',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $new_key$
DECLARE issued BIGINT; expires BIGINT; accepted BOOLEAN;
BEGIN
 IF unibud_private.current_account_id() IS DISTINCT FROM
    'f0400000-0000-4000-8000-000000000001'::uuid THEN
   RAISE EXCEPTION 'New account-context key failed during overlap';
 END IF;
 issued:=floor(extract(epoch FROM clock_timestamp()))::bigint;
 expires:=issued+60;
 accepted:=public.unibud_operator_mfa_consume_step_up(
   issued,expires,'f0400000-0000-4000-8000-000000000032',1002,
   encode(public.hmac(convert_to(
    'v1:f0400000-0000-4000-8000-000000000001:f0400000-0000-4000-8000-000000000011:step_up:'||
    issued::text||':'||expires::text||':f0400000-0000-4000-8000-000000000032:1002','UTF8'),
    decode(repeat('72',32),'hex'),'sha256'),'hex')
 );
 IF accepted IS DISTINCT FROM TRUE THEN
   RAISE EXCEPTION 'New session/MFA keys failed during overlap';
 END IF;
END
$new_key$;
RESET ROLE;

-- Retire old keys only after the overlap; old signatures must now fail closed.
UPDATE unibud_private.context_signing_keys
 SET active=FALSE WHERE key_id='ci-rotation-account-old';
UPDATE unibud_private.session_context_signing_keys
 SET active=FALSE WHERE key_id='ci-rotation-session-old';
UPDATE unibud_private.operations_mfa_assertion_signing_keys
 SET active=FALSE WHERE key_id='ci-rotation-mfa-old';

WITH x AS (
 SELECT 'f0400000-0000-4000-8000-000000000001'::text a,
        'f0400000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0400000-0000-4000-8000-000000000023'::text n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('51',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('61',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $retired$
BEGIN
 IF unibud_private.current_account_id() IS NOT NULL THEN
   RAISE EXCEPTION 'Retired account-context key was accepted';
 END IF;
END
$retired$;
RESET ROLE;

-- Retired session/MFA keys also fail; a tampered new signature fails as well.
WITH x AS (
 SELECT 'f0400000-0000-4000-8000-000000000001'::text a,
        'f0400000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0400000-0000-4000-8000-000000000024'::text n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('52',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('61',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $retired_session$
BEGIN
 IF unibud_private.current_account_id() IS NULL THEN
   RAISE EXCEPTION 'New account key unexpectedly failed after retirement';
 END IF;
 IF public.unibud_operator_mfa_consume_step_up(
   floor(extract(epoch FROM clock_timestamp()))::bigint,
   floor(extract(epoch FROM clock_timestamp()))::bigint+60,
   'f0400000-0000-4000-8000-000000000033',1003,repeat('0',64)
 ) THEN
   RAISE EXCEPTION 'Invalid/retired session or MFA signature was accepted';
 END IF;
END
$retired_session$;
RESET ROLE;

ROLLBACK;
