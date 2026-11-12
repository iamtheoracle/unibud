-- Flow payment-intent procedure: exact session, ownership, idempotency and audit.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0490000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 'f0490000-0000-4000-8000-000000000011','f0490000-0000-4000-8000-000000000001',
 decode(repeat('71',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);
INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES (
 'f0490000-0000-4000-8000-000000000021','f0490000-0000-4000-8000-000000000001',
 decode('01','hex'),digest('moneylead-customer-49','sha256'),
 decode('02','hex'),digest('moneylead-account-49','sha256'),'active'
);

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-intent-ci-account',decode(repeat('72',32),'hex'),true);
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-intent-ci-session',decode(repeat('73',32),'hex'),true);

WITH ctx AS (
 SELECT 'f0490000-0000-4000-8000-000000000001'::TEXT AS account_id,
        'f0490000-0000-4000-8000-000000000011'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0490000-0000-4000-8000-000000000099'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('72',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('73',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $test$
DECLARE
  v_first UUID;
  v_repeat UUID;
  v_conflict UUID;
  v_count INTEGER;
BEGIN
  v_first:=public.flow_create_payment_intent(
    'f0490000-0000-4000-8000-000000000021',
    digest('flow-intent-idempotency-49','sha256'),
    decode(repeat('aa',32),'hex'),
    digest('recipient-49','sha256'),
    1250.00,'NGN',10.00,'member_transfer'
  );
  IF v_first IS NULL THEN RAISE EXCEPTION 'Flow payment intent was not created'; END IF;

  v_repeat:=public.flow_create_payment_intent(
    'f0490000-0000-4000-8000-000000000021',
    digest('flow-intent-idempotency-49','sha256'),
    decode(repeat('bb',32),'hex'),
    digest('recipient-49','sha256'),
    1250.00,'NGN',10.00,'member_transfer'
  );
  IF v_repeat IS DISTINCT FROM v_first THEN
    RAISE EXCEPTION 'Identical idempotent retry did not return original payment intent';
  END IF;

  v_conflict:=public.flow_create_payment_intent(
    'f0490000-0000-4000-8000-000000000021',
    digest('flow-intent-idempotency-49','sha256'),
    decode(repeat('cc',32),'hex'),
    digest('recipient-49','sha256'),
    1251.00,'NGN',10.00,'member_transfer'
  );
  IF v_conflict IS NOT NULL THEN
    RAISE EXCEPTION 'Changed amount reused an idempotency key';
  END IF;

  SELECT count(*) INTO v_count FROM public.flow_payment_intents
   WHERE account_id='f0490000-0000-4000-8000-000000000001';
  IF v_count<>1 THEN RAISE EXCEPTION 'Idempotency created duplicate intents: %',v_count; END IF;

  SELECT count(*) INTO v_count FROM public.security_audit_events
   WHERE actor_account_id='f0490000-0000-4000-8000-000000000001'
     AND application_id='flow' AND action LIKE 'flow.payment_intent.%';
  IF v_count<>3 THEN RAISE EXCEPTION 'Expected create, replay and mismatch audit events; found %',v_count; END IF;
END
$test$;
RESET ROLE;

ROLLBACK;
