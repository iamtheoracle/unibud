-- WebAuthn registration: exact session challenge, one-time step-up proof and public-key storage.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0530000-0000-4000-8000-000000000001','active'),
 ('f0530000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0530000-0000-4000-8000-000000000011','f0530000-0000-4000-8000-000000000001',
  decode(repeat('a1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0530000-0000-4000-8000-000000000012','f0530000-0000-4000-8000-000000000002',
  decode(repeat('a2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-webauthn-ci-account',decode(repeat('a4',32),'hex'),true);
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-webauthn-ci-session',decode(repeat('a5',32),'hex'),true);
UPDATE unibud_private.flow_step_up_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.flow_step_up_signing_keys(key_id,secret,active)
VALUES('flow-webauthn-ci-step-up',decode(repeat('a6',32),'hex'),true);

WITH ctx AS (
 SELECT 'f0530000-0000-4000-8000-000000000001'::TEXT AS account_id,
        'f0530000-0000-4000-8000-000000000011'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0530000-0000-4000-8000-000000000099'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('a4',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('a5',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $webauthn$
DECLARE
  v_challenge BYTEA:=decode(repeat('b1',32),'hex');
  v_challenge_digest BYTEA;
  v_registration UUID;
  v_second_registration UUID;
  v_credential_id BYTEA:=decode('010203040506','hex');
  v_public_key BYTEA:=decode('aabbccddeeff','hex');
  v_transports TEXT[]:=ARRAY['internal']::TEXT[];
  v_counter BIGINT:=0;
  v_payload_digest BYTEA;
  v_message TEXT;
  v_nonce UUID;
  v_expiry BIGINT;
  v_signature TEXT;
  v_count INTEGER;
  v_returned_challenge BYTEA;
  v_returned_id BYTEA;
BEGIN
  v_registration:=public.flow_webauthn_create_registration_challenge(
    v_challenge,clock_timestamp()+interval '4 minutes'
  );
  IF v_registration IS NULL THEN RAISE EXCEPTION 'WebAuthn registration challenge was not created'; END IF;

  IF public.flow_webauthn_create_registration_challenge(
    decode(repeat('b2',32),'hex'),clock_timestamp()+interval '4 minutes'
  ) IS NOT NULL THEN
    RAISE EXCEPTION 'A second active registration challenge was allowed for the same session';
  END IF;

  SELECT challenge INTO v_returned_challenge
    FROM public.flow_webauthn_get_registration_challenge(v_registration);
  IF v_returned_challenge IS DISTINCT FROM v_challenge THEN
    RAISE EXCEPTION 'WebAuthn challenge was not bound to the creating session';
  END IF;

  v_challenge_digest:=public.digest(v_challenge,'sha256');
  v_payload_digest:=public.digest(convert_to(
    encode(v_challenge_digest,'hex')||':'||
    encode(v_credential_id,'hex')||':'||
    encode(v_public_key,'hex')||':'||
    v_counter::TEXT||':internal','UTF8'),'sha256');
  v_nonce:=gen_random_uuid();
  v_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::BIGINT;
  v_message:='flow-step-up:v1:f0530000-0000-4000-8000-000000000001:f0530000-0000-4000-8000-000000000011:webauthn_register:'||
    encode(v_payload_digest,'hex')||':'||v_expiry::TEXT||':'||v_nonce::TEXT;
  v_signature:=encode(public.hmac(convert_to(v_message,'UTF8'),decode(repeat('a6',32),'hex'),'sha256'),'hex');

  IF public.flow_webauthn_register_credential(
    v_registration,v_credential_id,v_public_key,v_counter,v_transports,
    v_payload_digest,v_expiry,v_nonce,v_signature
  ) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Verified WebAuthn credential registration was not persisted';
  END IF;

  IF public.flow_webauthn_register_credential(
    v_registration,v_credential_id,v_public_key,v_counter,v_transports,
    v_payload_digest,v_expiry,v_nonce,v_signature
  ) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Consumed WebAuthn registration challenge was replayed';
  END IF;

  SELECT count(*) INTO v_count FROM public.flow_webauthn_list_credentials();
  IF v_count<>1 THEN RAISE EXCEPTION 'Expected one account-owned WebAuthn credential, found %',v_count; END IF;

  SELECT credential_id INTO v_returned_id
    FROM public.flow_webauthn_list_credentials();
  IF v_returned_id IS DISTINCT FROM v_credential_id THEN
    RAISE EXCEPTION 'WebAuthn credential identifier did not persist';
  END IF;

  -- A second registration challenge is allowed after the first was consumed.
  v_second_registration:=public.flow_webauthn_create_registration_challenge(
    decode(repeat('b3',32),'hex'),clock_timestamp()+interval '4 minutes'
  );
  IF v_second_registration IS NULL THEN RAISE EXCEPTION 'Second WebAuthn challenge was not created after consumption'; END IF;

  -- The same authenticator credential cannot be registered twice.
  v_challenge:=decode(repeat('b3',32),'hex');
  v_challenge_digest:=public.digest(v_challenge,'sha256');
  v_payload_digest:=public.digest(convert_to(
    encode(v_challenge_digest,'hex')||':'||
    encode(v_credential_id,'hex')||':'||
    encode(v_public_key,'hex')||':'||
    v_counter::TEXT||':internal','UTF8'),'sha256');
  v_nonce:=gen_random_uuid();
  v_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::BIGINT;
  v_message:='flow-step-up:v1:f0530000-0000-4000-8000-000000000001:f0530000-0000-4000-8000-000000000011:webauthn_register:'||
    encode(v_payload_digest,'hex')||':'||v_expiry::TEXT||':'||v_nonce::TEXT;
  v_signature:=encode(public.hmac(convert_to(v_message,'UTF8'),decode(repeat('a6',32),'hex'),'sha256'),'hex');
  IF public.flow_webauthn_register_credential(
    v_second_registration,v_credential_id,v_public_key,v_counter,v_transports,
    v_payload_digest,v_expiry,v_nonce,v_signature
  ) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Duplicate WebAuthn credential identifier was accepted';
  END IF;

  BEGIN
    EXECUTE 'SELECT credential_id FROM public.flow_biometric_credentials';
    RAISE EXCEPTION 'Application role can directly read biometric credential table';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$webauthn$;
RESET ROLE;

-- Switch to a different account/session: the first account's registration
-- challenge and credentials must not be visible or consumable.
WITH ctx AS (
 SELECT 'f0530000-0000-4000-8000-000000000002'::TEXT AS account_id,
        'f0530000-0000-4000-8000-000000000012'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0530000-0000-4000-8000-000000000098'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('a4',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('a5',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $isolation$
DECLARE v_count INTEGER;
BEGIN
  SELECT count(*) INTO v_count FROM public.flow_webauthn_list_credentials();
  IF v_count<>0 THEN RAISE EXCEPTION 'Another account observed WebAuthn credentials'; END IF;
END
$isolation$;
RESET ROLE;

ROLLBACK;
