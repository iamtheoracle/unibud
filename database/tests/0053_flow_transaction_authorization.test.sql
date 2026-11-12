-- Transaction authorization binds the exact immutable payment intent, session,
-- challenge expiry, method and WebAuthn counter. Authorization never posts money.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0540000-0000-4000-8000-000000000001','active'),
 ('f0540000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0540000-0000-4000-8000-000000000011','f0540000-0000-4000-8000-000000000001',
  decode(repeat('c1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0540000-0000-4000-8000-000000000012','f0540000-0000-4000-8000-000000000002',
  decode(repeat('c2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES(
 'f0540000-0000-4000-8000-000000000021','f0540000-0000-4000-8000-000000000001',
 decode(repeat('01',32),'hex'),digest('customer-54','sha256'),
 decode(repeat('02',32),'hex'),digest('account-54','sha256'),'active'
);

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-authz-ci-account',decode(repeat('c3',32),'hex'),true);
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-authz-ci-session',decode(repeat('c4',32),'hex'),true);
UPDATE unibud_private.flow_step_up_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.flow_step_up_signing_keys(key_id,secret,active)
VALUES('flow-authz-ci-step-up',decode(repeat('c5',32),'hex'),true);

WITH ctx AS (
 SELECT 'f0540000-0000-4000-8000-000000000001'::TEXT AS account_id,
        'f0540000-0000-4000-8000-000000000011'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0540000-0000-4000-8000-000000000099'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('c3',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('c4',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $authorization$
DECLARE
  v_flow_account UUID:='f0540000-0000-4000-8000-000000000021';
  v_intent_pin UUID;
  v_intent_webauthn UUID;
  v_intent_replay UUID;
  v_intent_cancel UUID;
  v_authorization UUID;
  v_challenge BYTEA;
  v_challenge_digest BYTEA;
  v_details_digest BYTEA;
  v_expires_at TIMESTAMPTZ;
  v_expires_epoch BIGINT;
  v_payload_digest BYTEA;
  v_nonce UUID;
  v_proof_expiry BIGINT;
  v_message TEXT;
  v_signature TEXT;
  v_recipient_cipher BYTEA:=decode(repeat('aa',29),'hex');
  v_recipient_digest BYTEA:=digest('member:recipient-54','sha256');
  v_credential_challenge BYTEA:=decode(repeat('d1',32),'hex');
  v_registration_id UUID;
  v_credential_id BYTEA:=decode('f05401020304','hex');
  v_public_key BYTEA:=decode('aabbccddeeff','hex');
  v_transports TEXT[]:=ARRAY['internal']::TEXT[];
  v_counter BIGINT:=0;
  v_proof_payload BYTEA;
  v_count INTEGER;
  v_status TEXT;
  v_authorized_at TIMESTAMPTZ;
  v_other_account TEXT:='f0540000-0000-4000-8000-000000000002';
  v_other_session TEXT:='f0540000-0000-4000-8000-000000000012';
  v_context_nonce TEXT;
  v_context_expiry TEXT;
BEGIN
  -- Create a real persisted intent using the same database procedure as the API.
  v_intent_pin:=public.flow_create_payment_intent(
    v_flow_account,digest('pin-idempotency','sha256'),v_recipient_cipher,v_recipient_digest,
    125.50,'NGN',2.00,'member_transfer'
  );
  IF v_intent_pin IS NULL THEN RAISE EXCEPTION 'PIN test intent was not created'; END IF;

  IF NOT EXISTS(
    SELECT 1 FROM public.flow_get_payment_intent_confirmation_details(v_intent_pin)
     WHERE amount=125.5000 AND currency='NGN' AND fee_amount=2.0000
       AND flow_account_id=v_flow_account AND status='created'
  ) THEN
    RAISE EXCEPTION 'Confirmation details do not match the persisted payment intent';
  END IF;

  v_challenge:=decode(repeat('e1',32),'hex');
  SELECT authorization_id,challenge_digest,details_digest,expires_at
    INTO v_authorization,v_challenge_digest,v_details_digest,v_expires_at
    FROM public.flow_create_authorization_challenge(
      v_intent_pin,'transaction_pin',v_challenge,clock_timestamp()+interval '110 seconds'
    );
  IF v_authorization IS NULL THEN RAISE EXCEPTION 'PIN authorization challenge was not created'; END IF;
  IF v_details_digest IS NULL OR v_challenge_digest<>digest(v_challenge,'sha256') THEN
    RAISE EXCEPTION 'PIN challenge digest binding is invalid';
  END IF;

  SELECT challenge INTO v_challenge
    FROM public.flow_get_authorization_challenge(v_authorization);
  IF v_challenge IS NULL THEN RAISE EXCEPTION 'PIN challenge could not be retrieved in its session'; END IF;

  v_expires_epoch:=floor(extract(epoch FROM v_expires_at))::BIGINT;
  v_payload_digest:=digest(convert_to(
    v_authorization::TEXT||':'||encode(v_challenge_digest,'hex')||':'||
    encode(v_details_digest,'hex')||':transaction_pin:'||v_expires_epoch::TEXT||'::','UTF8'),'sha256');
  v_nonce:=gen_random_uuid();
  v_proof_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::BIGINT;
  v_message:='flow-step-up:v1:f0540000-0000-4000-8000-000000000001:f0540000-0000-4000-8000-000000000011:transaction_pin_authorize:'||
    encode(v_payload_digest,'hex')||':'||v_proof_expiry::TEXT||':'||v_nonce::TEXT;
  v_signature:=encode(public.hmac(convert_to(v_message,'UTF8'),decode(repeat('c5',32),'hex'),'sha256'),'hex');

  IF public.flow_authorize_payment_intent(
    v_authorization,digest('altered-transaction','sha256'),v_proof_expiry,v_nonce,v_signature,NULL,NULL
  ) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Authorization accepted an altered transaction digest';
  END IF;
  IF public.flow_authorize_payment_intent(
    v_authorization,v_payload_digest,v_proof_expiry,v_nonce,v_signature,NULL,NULL
  ) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Correct transaction PIN step-up proof did not authorize the intent';
  END IF;
  IF public.flow_authorize_payment_intent(
    v_authorization,v_payload_digest,v_proof_expiry,v_nonce,v_signature,NULL,NULL
  ) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Consumed transaction authorization was replayed';
  END IF;

  -- Register a test public-key credential through the same WebAuthn registration
  -- procedure, then exercise a transaction-bound WebAuthn authorization.
  v_registration_id:=public.flow_webauthn_create_registration_challenge(
    v_credential_challenge,clock_timestamp()+interval '4 minutes'
  );
  IF v_registration_id IS NULL THEN RAISE EXCEPTION 'WebAuthn credential registration challenge missing'; END IF;
  v_challenge_digest:=digest(v_credential_challenge,'sha256');
  v_proof_payload:=digest(convert_to(
    encode(v_challenge_digest,'hex')||':'||encode(v_credential_id,'hex')||':'||
    encode(v_public_key,'hex')||':0:internal','UTF8'),'sha256');
  v_nonce:=gen_random_uuid();
  v_proof_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::BIGINT;
  v_message:='flow-step-up:v1:f0540000-0000-4000-8000-000000000001:f0540000-0000-4000-8000-000000000011:webauthn_register:'||
    encode(v_proof_payload,'hex')||':'||v_proof_expiry::TEXT||':'||v_nonce::TEXT;
  v_signature:=encode(public.hmac(convert_to(v_message,'UTF8'),decode(repeat('c5',32),'hex'),'sha256'),'hex');
  IF public.flow_webauthn_register_credential(
    v_registration_id,v_credential_id,v_public_key,0,v_transports,
    v_proof_payload,v_proof_expiry,v_nonce,v_signature
  ) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'WebAuthn test credential was not registered';
  END IF;

  v_intent_webauthn:=public.flow_create_payment_intent(
    v_flow_account,digest('webauthn-idempotency','sha256'),v_recipient_cipher,v_recipient_digest,
    55.00,'NGN',1.00,'member_transfer'
  );
  SELECT authorization_id,challenge_digest,details_digest,expires_at
    INTO v_authorization,v_challenge_digest,v_details_digest,v_expires_at
    FROM public.flow_create_authorization_challenge(
      v_intent_webauthn,'webauthn',decode(repeat('e2',32),'hex'),
      clock_timestamp()+interval '110 seconds'
    );
  IF v_authorization IS NULL THEN RAISE EXCEPTION 'WebAuthn authorization challenge was not created'; END IF;
  PERFORM 1 FROM public.flow_get_authorization_challenge(v_authorization);

  v_expires_epoch:=floor(extract(epoch FROM v_expires_at))::BIGINT;
  v_counter:=1;
  v_payload_digest:=digest(convert_to(
    v_authorization::TEXT||':'||encode(v_challenge_digest,'hex')||':'||
    encode(v_details_digest,'hex')||':webauthn:'||v_expires_epoch::TEXT||':'||
    encode(v_credential_id,'hex')||':'||v_counter::TEXT,'UTF8'),'sha256');
  v_nonce:=gen_random_uuid();
  v_proof_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::BIGINT;
  v_message:='flow-step-up:v1:f0540000-0000-4000-8000-000000000001:f0540000-0000-4000-8000-000000000011:transaction_webauthn_authorize:'||
    encode(v_payload_digest,'hex')||':'||v_proof_expiry::TEXT||':'||v_nonce::TEXT;
  v_signature:=encode(public.hmac(convert_to(v_message,'UTF8'),decode(repeat('c5',32),'hex'),'sha256'),'hex');

  IF public.flow_authorize_payment_intent(
    v_authorization,v_payload_digest,v_proof_expiry,v_nonce,v_signature,v_credential_id,v_counter
  ) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'WebAuthn transaction authorization failed';
  END IF;

  v_intent_replay:=public.flow_create_payment_intent(
    v_flow_account,digest('webauthn-replay-idempotency','sha256'),v_recipient_cipher,v_recipient_digest,
    56.00,'NGN',1.00,'member_transfer'
  );
  SELECT authorization_id,challenge_digest,details_digest,expires_at
    INTO v_authorization,v_challenge_digest,v_details_digest,v_expires_at
    FROM public.flow_create_authorization_challenge(
      v_intent_replay,'webauthn',decode(repeat('e3',32),'hex'),
      clock_timestamp()+interval '110 seconds'
    );
  PERFORM 1 FROM public.flow_get_authorization_challenge(v_authorization);
  v_expires_epoch:=floor(extract(epoch FROM v_expires_at))::BIGINT;
  v_payload_digest:=digest(convert_to(
    v_authorization::TEXT||':'||encode(v_challenge_digest,'hex')||':'||
    encode(v_details_digest,'hex')||':webauthn:'||v_expires_epoch::TEXT||':'||
    encode(v_credential_id,'hex')||':1','UTF8'),'sha256');
  v_nonce:=gen_random_uuid();
  v_proof_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::BIGINT;
  v_message:='flow-step-up:v1:f0540000-0000-4000-8000-000000000001:f0540000-0000-4000-8000-000000000011:transaction_webauthn_authorize:'||
    encode(v_payload_digest,'hex')||':'||v_proof_expiry::TEXT||':'||v_nonce::TEXT;
  v_signature:=encode(public.hmac(convert_to(v_message,'UTF8'),decode(repeat('c5',32),'hex'),'sha256'),'hex');
  IF public.flow_authorize_payment_intent(
    v_authorization,v_payload_digest,v_proof_expiry,v_nonce,v_signature,v_credential_id,1
  ) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'A non-increasing WebAuthn signature counter was accepted';
  END IF;
  PERFORM public.flow_fail_authorization_challenge(v_authorization);

  v_intent_cancel:=public.flow_create_payment_intent(
    v_flow_account,digest('cancel-idempotency','sha256'),v_recipient_cipher,v_recipient_digest,
    22.00,'NGN',0.50,'member_transfer'
  );
  SELECT authorization_id INTO v_authorization
    FROM public.flow_create_authorization_challenge(
      v_intent_cancel,'transaction_pin',decode(repeat('e4',32),'hex'),
      clock_timestamp()+interval '110 seconds'
    );
  IF v_authorization IS NULL THEN RAISE EXCEPTION 'Cancellation test challenge was not created'; END IF;
  IF public.flow_cancel_payment_intent(v_intent_cancel) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Pre-submission payment intent cancellation failed';
  END IF;
  IF public.flow_cancel_payment_intent(v_intent_cancel) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Payment intent cancellation is not idempotent';
  END IF;
  SELECT count(*) INTO v_count
    FROM public.flow_get_authorization_challenge(v_authorization);
  IF v_count<>0 THEN RAISE EXCEPTION 'Cancellation did not invalidate active authorization challenge'; END IF;
  PERFORM set_config('test.flow_cancelled_intent_id',v_intent_cancel::TEXT,true);

  SELECT signature_counter INTO v_counter
    FROM public.flow_webauthn_list_credentials()
   WHERE credential_id=v_credential_id;
  IF v_counter<>1 THEN RAISE EXCEPTION 'WebAuthn signature counter was not atomically advanced'; END IF;
  PERFORM set_config('test.flow_authorized_intent_id',v_intent_webauthn::TEXT,true);

  -- Another account cannot read the intent confirmation or consume its challenge.
  v_context_nonce:=gen_random_uuid()::TEXT;
  v_context_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::TEXT;
  PERFORM set_config('unibud.account_id',v_other_account,true);
  PERFORM set_config('unibud.session_id',v_other_session,true);
  PERFORM set_config('unibud.context_expiry',v_context_expiry,true);
  PERFORM set_config('unibud.context_nonce',v_context_nonce,true);
  PERFORM set_config('unibud.context_signature',
    encode(public.hmac(convert_to(v_other_account||':'||v_context_expiry||':'||v_context_nonce,'UTF8'),
      decode(repeat('c3',32),'hex'),'sha256'),'hex'),true);
  PERFORM set_config('unibud.session_context_signature',
    encode(public.hmac(convert_to('v1:'||v_other_account||':'||v_other_session||':'||v_context_expiry||':'||v_context_nonce,'UTF8'),
      decode(repeat('c4',32),'hex'),'sha256'),'hex'),true);
  SELECT count(*) INTO v_count FROM public.flow_get_payment_intent_confirmation_details(v_intent_pin);
  IF v_count<>0 THEN RAISE EXCEPTION 'Cross-account confirmation details were exposed'; END IF;
  SELECT count(*) INTO v_count FROM public.flow_get_authorization_challenge(v_authorization);
  IF v_count<>0 THEN RAISE EXCEPTION 'Cross-account authorization challenge was exposed'; END IF;
  IF public.flow_authorize_payment_intent(
    v_authorization,v_payload_digest,v_proof_expiry,v_nonce,v_signature,v_credential_id,1
  ) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Cross-account authorization was accepted';
  END IF;

  BEGIN
    EXECUTE 'SELECT recipient_ref_ciphertext FROM public.flow_payment_intents';
    RAISE EXCEPTION 'Application role can directly read Flow payment intents';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    EXECUTE 'SELECT authorization_id FROM public.flow_authorization_challenges';
    RAISE EXCEPTION 'Application role can directly read authorization challenges';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$authorization$;
RESET ROLE;

DO $persisted$
DECLARE
  v_status TEXT;
  v_authorized_at TIMESTAMPTZ;
BEGIN
  SELECT status,authorized_at INTO v_status,v_authorized_at
    FROM public.flow_payment_intents
   WHERE payment_intent_id=current_setting('test.flow_authorized_intent_id')::UUID;
  IF v_status<>'authorized' OR v_authorized_at IS NULL THEN
    RAISE EXCEPTION 'Authorization did not produce the expected authorized lifecycle state';
  END IF;
  SELECT status INTO v_status
    FROM public.flow_payment_intents
   WHERE payment_intent_id=current_setting('test.flow_cancelled_intent_id')::UUID;
  IF v_status<>'cancelled' THEN
    RAISE EXCEPTION 'Pre-submission cancellation did not persist the cancelled lifecycle state';
  END IF;
END
$persisted$;

ROLLBACK;
