-- Account-wide payment-intent creation limit is enforced by PostgreSQL.
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
 ('f0550000-0000-4000-8000-000000000012','f0550000-0000-4000-8000-000000000001',
  decode(repeat('d2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0550000-0000-4000-8000-000000000013','f0550000-0000-4000-8000-000000000002',
  decode(repeat('d5',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES(
 'f0550000-0000-4000-8000-000000000021','f0550000-0000-4000-8000-000000000001',
 decode(repeat('01',32),'hex'),digest('customer-55','sha256'),
 decode(repeat('02',32),'hex'),digest('account-55','sha256'),'active'),
 ('f0550000-0000-4000-8000-000000000022','f0550000-0000-4000-8000-000000000002',
  decode(repeat('03',32),'hex'),digest('customer-55b','sha256'),
  decode(repeat('04',32),'hex'),digest('account-55b','sha256'),'active'
);

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-intent-limit-account',decode(repeat('d3',32),'hex'),true);
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-intent-limit-session',decode(repeat('d4',32),'hex'),true);

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
DO $limit$
DECLARE
  v_intent UUID;
  v_nonce TEXT;
  v_expiry TEXT;
  i INTEGER;
BEGIN
  FOR i IN 1..20 LOOP
    v_intent:=public.flow_create_payment_intent(
      'f0550000-0000-4000-8000-000000000021',
      digest('flow-limit-idempotency-'||i::TEXT,'sha256'),
      decode(repeat('ab',29),'hex'),
      digest('flow-limit-recipient-'||i::TEXT,'sha256'),
      1.00,'NGN',0.00,'member_transfer'
    );
    IF v_intent IS NULL THEN
      RAISE EXCEPTION 'Payment intent creation was denied before the 20-per-15-minute limit';
    END IF;
  END LOOP;

  IF public.flow_create_payment_intent(
    'f0550000-0000-4000-8000-000000000021',
    digest('flow-limit-idempotency-21','sha256'),
    decode(repeat('ab',29),'hex'),digest('flow-limit-recipient-21','sha256'),
    1.00,'NGN',0.00,'member_transfer'
  ) IS NOT NULL THEN
    RAISE EXCEPTION '21st payment intent was not rate limited';
  END IF;

  -- The limit is account-wide, not bypassed by opening another session.
  v_nonce:=gen_random_uuid()::TEXT;
  v_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::TEXT;
  PERFORM set_config('unibud.session_id','f0550000-0000-4000-8000-000000000012',true);
  PERFORM set_config('unibud.context_expiry',v_expiry,true);
  PERFORM set_config('unibud.context_nonce',v_nonce,true);
  PERFORM set_config('unibud.context_signature',
    encode(public.hmac(convert_to(
      'f0550000-0000-4000-8000-000000000001:'||v_expiry||':'||v_nonce,'UTF8'),
      decode(repeat('d3',32),'hex'),'sha256'),'hex'),true);
  PERFORM set_config('unibud.session_context_signature',
    encode(public.hmac(convert_to(
      'v1:f0550000-0000-4000-8000-000000000001:f0550000-0000-4000-8000-000000000012:'||
      v_expiry||':'||v_nonce,'UTF8'),
      decode(repeat('d4',32),'hex'),'sha256'),'hex'),true);

  IF public.flow_create_payment_intent(
    'f0550000-0000-4000-8000-000000000021',
    digest('flow-limit-idempotency-22','sha256'),
    decode(repeat('ab',29),'hex'),digest('flow-limit-recipient-22','sha256'),
    1.00,'NGN',0.00,'member_transfer'
  ) IS NOT NULL THEN
    RAISE EXCEPTION 'Payment intent limit was bypassed with a second session';
  END IF;

  -- A separate account has its own bucket and remains able to create an intent.
  v_nonce:=gen_random_uuid()::TEXT;
  v_expiry:=floor(extract(epoch FROM clock_timestamp())+60)::TEXT;
  PERFORM set_config('unibud.account_id','f0550000-0000-4000-8000-000000000002',true);
  PERFORM set_config('unibud.session_id','f0550000-0000-4000-8000-000000000013',true);
  PERFORM set_config('unibud.context_expiry',v_expiry,true);
  PERFORM set_config('unibud.context_nonce',v_nonce,true);
  PERFORM set_config('unibud.context_signature',
    encode(public.hmac(convert_to(
      'f0550000-0000-4000-8000-000000000002:'||v_expiry||':'||v_nonce,'UTF8'),
      decode(repeat('d3',32),'hex'),'sha256'),'hex'),true);
  PERFORM set_config('unibud.session_context_signature',
    encode(public.hmac(convert_to(
      'v1:f0550000-0000-4000-8000-000000000002:f0550000-0000-4000-8000-000000000013:'||
      v_expiry||':'||v_nonce,'UTF8'),
      decode(repeat('d4',32),'hex'),'sha256'),'hex'),true);
  IF public.flow_create_payment_intent(
    'f0550000-0000-4000-8000-000000000022',
    digest('flow-limit-idempotency-account-two','sha256'),
    decode(repeat('bc',29),'hex'),digest('flow-limit-recipient-account-two','sha256'),
    2.00,'NGN',0.00,'member_transfer'
  ) IS NULL THEN
    RAISE EXCEPTION 'One account rate limit incorrectly blocked a different account';
  END IF;

  BEGIN
    EXECUTE 'SELECT request_count FROM public.flow_transaction_rate_limits';
    RAISE EXCEPTION 'Application role can directly read Flow rate-limit records';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$limit$;
RESET ROLE;

DO $assert$
DECLARE
  v_requests INTEGER;
  v_locked_until TIMESTAMPTZ;
  v_intents INTEGER;
  v_denials INTEGER;
BEGIN
  SELECT request_count,locked_until INTO v_requests,v_locked_until
    FROM public.flow_transaction_rate_limits
   WHERE account_id='f0550000-0000-4000-8000-000000000001'
     AND action='payment_intent_create';
  IF v_requests<>21 OR v_locked_until<=clock_timestamp() THEN
    RAISE EXCEPTION 'Account-wide payment-intent limiter did not persist its lock';
  END IF;
  SELECT count(*) INTO v_intents FROM public.flow_payment_intents
   WHERE account_id='f0550000-0000-4000-8000-000000000001';
  IF v_intents<>20 THEN RAISE EXCEPTION 'Rate-limited requests created more than 20 intents'; END IF;
  SELECT count(*) INTO v_denials FROM public.security_audit_events
   WHERE actor_account_id='f0550000-0000-4000-8000-000000000001'
     AND action='flow.payment_intent.create' AND reason_code='rate_limited';
  IF v_denials<2 THEN RAISE EXCEPTION 'Rate-limited intent attempts were not audited'; END IF;
END
$assert$;

ROLLBACK;
