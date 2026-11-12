-- Account-wide database rate limit for Flow payment-intent creation.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0550000-0000-4000-8000-000000000001','active'),
 ('f0550000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0550000-0000-4000-8000-000000000011','f0550000-0000-4000-8000-000000000001',
  decode(repeat('d1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0550000-0000-4000-8000-000000000012','f0550000-0000-4000-8000-000000000002',
  decode(repeat('d2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES
 ('f0550000-0000-4000-8000-000000000021','f0550000-0000-4000-8000-000000000001',
  decode('01','hex'),digest('ml-customer-55','sha256'),
  decode('02','hex'),digest('ml-account-55','sha256'),'active'),
 ('f0550000-0000-4000-8000-000000000022','f0550000-0000-4000-8000-000000000002',
  decode('03','hex'),digest('ml-customer-55b','sha256'),
  decode('04','hex'),digest('ml-account-55b','sha256'),'active');

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-intent-rate-ci-account',decode(repeat('d3',32),'hex'),true);
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-intent-rate-ci-session',decode(repeat('d4',32),'hex'),true);

WITH ctx AS (
 SELECT 'f0550000-0000-4000-8000-000000000001'::TEXT AS account_id,
        'f0550000-0000-4000-8000-000000000011'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0550000-0000-4000-8000-000000000099'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('d3',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('d4',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $rate$
DECLARE
  v_index INTEGER;
  v_intent UUID;
  v_count INTEGER;
  v_locked TIMESTAMPTZ;
BEGIN
  FOR v_index IN 1..10 LOOP
    v_intent:=public.flow_create_payment_intent(
      'f0550000-0000-4000-8000-000000000021',
      digest('intent-rate-key-'||v_index::TEXT,'sha256'),
      decode(repeat('aa',29),'hex'),
      digest('intent-rate-recipient','sha256'),
      100.00,'NGN',1.00,'member_transfer'
    );
    IF v_intent IS NULL THEN
      RAISE EXCEPTION 'Valid payment-intent request % was unexpectedly rate limited',v_index;
    END IF;
  END LOOP;

  v_intent:=public.flow_create_payment_intent(
    'f0550000-0000-4000-8000-000000000021',
    digest('intent-rate-key-11','sha256'),
    decode(repeat('aa',29),'hex'),
    digest('intent-rate-recipient','sha256'),
    100.00,'NGN',1.00,'member_transfer'
  );
  IF v_intent IS NOT NULL THEN
    RAISE EXCEPTION 'The eleventh payment-intent request bypassed the account rate limit';
  END IF;

  SELECT request_count,locked_until INTO v_count,v_locked
    FROM public.flow_transaction_rate_limits
   WHERE account_id='f0550000-0000-4000-8000-000000000001'
     AND action='payment_intent_create';
  IF v_count<>11 OR v_locked<=clock_timestamp() THEN
    RAISE EXCEPTION 'Intent creation rate-limit state was not persisted atomically';
  END IF;

  SELECT count(*) INTO v_count FROM public.flow_payment_intents
   WHERE account_id='f0550000-0000-4000-8000-000000000001';
  IF v_count<>10 THEN
    RAISE EXCEPTION 'Expected ten persisted intents, found %',v_count;
  END IF;

  -- Account two has an independent bucket and is not locked by account one.
  PERFORM set_config('unibud.account_id','f0550000-0000-4000-8000-000000000002',true);
  PERFORM set_config('unibud.session_id','f0550000-0000-4000-8000-000000000012',true);
  PERFORM set_config('unibud.context_expiry',floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT,true);
  PERFORM set_config('unibud.context_nonce','f0550000-0000-4000-8000-000000000098',true);
  PERFORM set_config('unibud.context_signature',
    encode(public.hmac(convert_to(
      'f0550000-0000-4000-8000-000000000002:'||
      current_setting('unibud.context_expiry')||':'||
      current_setting('unibud.context_nonce'),'UTF8'),
      decode(repeat('d3',32),'hex'),'sha256'),'hex'),true);
  PERFORM set_config('unibud.session_context_signature',
    encode(public.hmac(convert_to(
      'v1:f0550000-0000-4000-8000-000000000002:f0550000-0000-4000-8000-000000000012:'||
      current_setting('unibud.context_expiry')||':'||
      current_setting('unibud.context_nonce'),'UTF8'),
      decode(repeat('d4',32),'hex'),'sha256'),'hex'),true);

  v_intent:=public.flow_create_payment_intent(
    'f0550000-0000-4000-8000-000000000022',
    digest('intent-rate-key-account-two','sha256'),
    decode(repeat('bb',29),'hex'),
    digest('intent-rate-recipient-two','sha256'),
    75.00,'NGN',0.00,'member_transfer'
  );
  IF v_intent IS NULL THEN
    RAISE EXCEPTION 'One account rate limit incorrectly blocked a different account';
  END IF;
END
$rate$;
RESET ROLE;

ROLLBACK;
