-- Exact session ownership and exact immutable transaction-digest binding.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0500000-0000-4000-8000-000000000101','active'),
 ('f0500000-0000-4000-8000-000000000102','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0500000-0000-4000-8000-000000000111','f0500000-0000-4000-8000-000000000101',
  decode(repeat('a1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0500000-0000-4000-8000-000000000112','f0500000-0000-4000-8000-000000000102',
  decode(repeat('a2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES (
 'f0500000-0000-4000-8000-000000000121','f0500000-0000-4000-8000-000000000101',
 decode('01','hex'),digest('ml-customer-50a','sha256'),
 decode('02','hex'),digest('ml-account-50a','sha256'),'active'
);
INSERT INTO public.flow_payment_intents(
 payment_intent_id,flow_account_id,account_id,idempotency_key_digest,
 recipient_ref_ciphertext,recipient_ref_digest,amount,currency,fee_amount,
 details_digest,purpose_code,status
) VALUES (
 'f0500000-0000-4000-8000-000000000131',
 'f0500000-0000-4000-8000-000000000121',
 'f0500000-0000-4000-8000-000000000101',
 digest('intent-50-idem','sha256'),decode('aa','hex'),
 digest('intent-50-recipient','sha256'),100.00,'NGN',1.00,
 digest('intent-50-details','sha256'),'member_transfer','created'
);

-- The matching digest and same-account session are accepted.
INSERT INTO public.flow_authorization_challenges(
 authorization_id,payment_intent_id,account_id,session_id,
 challenge_digest,details_digest,auth_method,expires_at
) VALUES (
 'f0500000-0000-4000-8000-000000000141',
 'f0500000-0000-4000-8000-000000000131',
 'f0500000-0000-4000-8000-000000000101',
 'f0500000-0000-4000-8000-000000000111',
 digest('challenge-50-valid','sha256'),
 digest('intent-50-details','sha256'),'transaction_pin',
 clock_timestamp()+interval '2 minutes'
);
UPDATE public.flow_authorization_challenges
   SET consumed_at=clock_timestamp()
 WHERE authorization_id='f0500000-0000-4000-8000-000000000141';

DO $constraints$
BEGIN
  BEGIN
    INSERT INTO public.flow_authorization_challenges(
      payment_intent_id,account_id,session_id,challenge_digest,
      details_digest,auth_method,expires_at
    ) VALUES (
      'f0500000-0000-4000-8000-000000000131',
      'f0500000-0000-4000-8000-000000000101',
      'f0500000-0000-4000-8000-000000000112',
      digest('challenge-50-wrong-session','sha256'),
      digest('intent-50-details','sha256'),'webauthn',
      clock_timestamp()+interval '2 minutes'
    );
    RAISE EXCEPTION 'Cross-account session was accepted for a Flow authorization challenge';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  BEGIN
    INSERT INTO public.flow_authorization_challenges(
      payment_intent_id,account_id,session_id,challenge_digest,
      details_digest,auth_method,expires_at
    ) VALUES (
      'f0500000-0000-4000-8000-000000000131',
      'f0500000-0000-4000-8000-000000000101',
      'f0500000-0000-4000-8000-000000000111',
      digest('challenge-50-wrong-digest','sha256'),
      digest('different-details','sha256'),'transaction_pin',
      clock_timestamp()+interval '2 minutes'
    );
    RAISE EXCEPTION 'Challenge with a different transaction digest was accepted';
  EXCEPTION WHEN foreign_key_violation THEN NULL;
  END;

  INSERT INTO public.flow_authorization_challenges(
    authorization_id,payment_intent_id,account_id,session_id,challenge_digest,
    details_digest,auth_method,expires_at
  ) VALUES (
    'f0500000-0000-4000-8000-000000000142',
    'f0500000-0000-4000-8000-000000000131',
    'f0500000-0000-4000-8000-000000000101',
    'f0500000-0000-4000-8000-000000000111',
    digest('challenge-50-second-valid','sha256'),
    digest('intent-50-details','sha256'),'webauthn',clock_timestamp()+interval '2 minutes'
  );

  BEGIN
    INSERT INTO public.flow_authorization_challenges(
      payment_intent_id,account_id,session_id,challenge_digest,
      details_digest,auth_method,expires_at
    ) VALUES (
      'f0500000-0000-4000-8000-000000000131',
      'f0500000-0000-4000-8000-000000000101',
      'f0500000-0000-4000-8000-000000000111',
      digest('challenge-50-second-active','sha256'),
      digest('intent-50-details','sha256'),'webauthn',
      clock_timestamp()+interval '2 minutes'
    );
    RAISE EXCEPTION 'Multiple active authorization challenges were accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
END
$constraints$;

ROLLBACK;
