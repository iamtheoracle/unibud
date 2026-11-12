-- Flow ownership, RLS, idempotency, lifecycle and settlement-mirror invariants.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0480000-0000-4000-8000-000000000001','active'),
 ('f0480000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0480000-0000-4000-8000-000000000011','f0480000-0000-4000-8000-000000000001',
  decode(repeat('61',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0480000-0000-4000-8000-000000000012','f0480000-0000-4000-8000-000000000002',
  decode(repeat('62',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES
 ('f0480000-0000-4000-8000-000000000021','f0480000-0000-4000-8000-000000000001',
  decode('01','hex'),digest('ml-customer-a','sha256'),decode('02','hex'),digest('ml-account-a','sha256'),'active'),
 ('f0480000-0000-4000-8000-000000000022','f0480000-0000-4000-8000-000000000002',
  decode('03','hex'),digest('ml-customer-b','sha256'),decode('04','hex'),digest('ml-account-b','sha256'),'active');

INSERT INTO public.flow_payment_intents(
 payment_intent_id,flow_account_id,account_id,idempotency_key_digest,
 recipient_ref_ciphertext,recipient_ref_digest,amount,currency,fee_amount,details_digest,purpose_code,status
) VALUES
 ('f0480000-0000-4000-8000-000000000031','f0480000-0000-4000-8000-000000000021',
  'f0480000-0000-4000-8000-000000000001',digest('idem-a','sha256'),decode('aa','hex'),
  digest('recipient-a','sha256'),1250.00,'NGN',10.00,digest('details-a','sha256'),'member_transfer','created'),
 ('f0480000-0000-4000-8000-000000000032','f0480000-0000-4000-8000-000000000022',
  'f0480000-0000-4000-8000-000000000002',digest('idem-b','sha256'),decode('bb','hex'),
  digest('recipient-b','sha256'),50.00,'NGN',0.00,digest('details-b','sha256'),'member_transfer','created');

-- One verified external settlement mirror event: two balanced postings.
INSERT INTO public.flow_journal_entries(
 journal_entry_id,account_id,flow_account_id,payment_intent_id,source_system,
 source_event_ref_digest,currency,entry_kind,effective_at
) VALUES (
 'f0480000-0000-4000-8000-000000000041','f0480000-0000-4000-8000-000000000001',
 'f0480000-0000-4000-8000-000000000021','f0480000-0000-4000-8000-000000000031',
 'moneylead',digest('settlement-event-1','sha256'),'NGN','settlement',clock_timestamp()
);
INSERT INTO public.flow_journal_postings(journal_entry_id,currency,account_code,side,amount) VALUES
 ('f0480000-0000-4000-8000-000000000041','NGN','CUSTOMER_CLEARING','debit',1260.00),
 ('f0480000-0000-4000-8000-000000000041','NGN','SETTLEMENT_CONTROL','credit',1260.00);
SET CONSTRAINTS flow_journal_entry_balance_check IMMEDIATE;
SET CONSTRAINTS flow_journal_entry_balance_check DEFERRED;

DO $constraints$
BEGIN
  BEGIN
    INSERT INTO public.flow_payment_intents(
      flow_account_id,account_id,idempotency_key_digest,recipient_ref_ciphertext,
      recipient_ref_digest,amount,currency,fee_amount,details_digest,purpose_code
    ) VALUES (
      'f0480000-0000-4000-8000-000000000021','f0480000-0000-4000-8000-000000000001',
      digest('idem-a','sha256'),decode('cc','hex'),digest('recipient-c','sha256'),
      1.00,'NGN',0.00,digest('details-c','sha256'),'member_transfer'
    );
    RAISE EXCEPTION 'Duplicate idempotency key was accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;

  BEGIN
    UPDATE public.flow_payment_intents SET amount=999.00
      WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';
    RAISE EXCEPTION 'Payment intent payload mutation was accepted';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  BEGIN
    UPDATE public.flow_journal_postings SET amount=1.00
      WHERE journal_entry_id='f0480000-0000-4000-8000-000000000041';
    RAISE EXCEPTION 'Journal posting mutation was accepted';
  EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
  END;

  -- The lifecycle cannot jump from creation directly to settlement.
  BEGIN
    UPDATE public.flow_payment_intents
       SET status='settled',settled_at=clock_timestamp()
     WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';
    RAISE EXCEPTION 'Payment intent skipped authorization and submission';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  UPDATE public.flow_payment_intents
     SET status='awaiting_authorization'
   WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';
  UPDATE public.flow_payment_intents
     SET status='authorized',authorized_at=clock_timestamp()
   WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';
  UPDATE public.flow_payment_intents
     SET status='submitted',submitted_at=clock_timestamp()
   WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';
  UPDATE public.flow_payment_intents
     SET status='settled',settled_at=clock_timestamp()
   WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';

  UPDATE public.flow_payment_intents
     SET status='refunded',refunded_at=clock_timestamp()
   WHERE payment_intent_id='f0480000-0000-4000-8000-000000000031';

  IF has_table_privilege('unibud_app','public.flow_transaction_credentials','SELECT')
     OR has_table_privilege('unibud_app','public.flow_authorization_challenges','SELECT')
     OR has_table_privilege('unibud_app','public.flow_biometric_credentials','SELECT')
     OR has_table_privilege('unibud_app','public.flow_payment_intents','INSERT')
     OR has_table_privilege('unibud_app','public.flow_journal_entries','INSERT')
     OR has_table_privilege('unibud_app','public.flow_journal_postings','UPDATE') THEN
    RAISE EXCEPTION 'Flow runtime privilege boundary is too broad';
  END IF;
  IF has_table_privilege('unibud_flow_ingest','public.flow_journal_entries','UPDATE')
     OR has_table_privilege('unibud_flow_ingest','public.flow_journal_postings','DELETE') THEN
    RAISE EXCEPTION 'Settlement ingest role has mutation privileges';
  END IF;
END
$constraints$;

-- Verify an unbalanced entry is rejected at deferred-constraint evaluation.
DO $balance$
BEGIN
  BEGIN
    INSERT INTO public.flow_journal_entries(
      journal_entry_id,account_id,flow_account_id,source_system,
      source_event_ref_digest,currency,entry_kind,effective_at
    ) VALUES (
      'f0480000-0000-4000-8000-000000000042','f0480000-0000-4000-8000-000000000001',
      'f0480000-0000-4000-8000-000000000021','moneylead',
      digest('unbalanced-event','sha256'),'NGN','adjustment',clock_timestamp()
    );
    INSERT INTO public.flow_journal_postings(journal_entry_id,currency,account_code,side,amount)
    VALUES ('f0480000-0000-4000-8000-000000000042','NGN','CUSTOMER_CLEARING','debit',10.00);
    SET CONSTRAINTS flow_journal_entry_balance_check IMMEDIATE;
    RAISE EXCEPTION 'Unbalanced journal entry was accepted';
  EXCEPTION WHEN check_violation THEN
    SET CONSTRAINTS flow_journal_entry_balance_check DEFERRED;
  END;
END
$balance$;

-- Signed context proves account A sees only its own Flow objects.
UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-ci-key',decode(repeat('6f',32),'hex'),true);
WITH ctx AS (
 SELECT 'f0480000-0000-4000-8000-000000000001'::TEXT AS account_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0480000-0000-4000-8000-000000000099'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('6f',32),'hex'),'sha256'),'hex'),true)
FROM ctx;
SET LOCAL ROLE unibud_app;
DO $rls$
DECLARE v_accounts INTEGER; v_intents INTEGER; v_journal INTEGER;
BEGIN
 SELECT count(*) INTO v_accounts FROM public.flow_customer_accounts;
 SELECT count(*) INTO v_intents FROM public.flow_payment_intents;
 SELECT count(*) INTO v_journal FROM public.flow_journal_entries;
 IF v_accounts<>1 OR v_intents<>1 OR v_journal<>1 THEN
   RAISE EXCEPTION 'Flow RLS did not isolate account A: %, %, %',v_accounts,v_intents,v_journal;
 END IF;
 IF unibud_private.current_account_id()<>'f0480000-0000-4000-8000-000000000001'::UUID THEN
   RAISE EXCEPTION 'Signed account context failed for Flow';
 END IF;
END
$rls$;
RESET ROLE;

ROLLBACK;
