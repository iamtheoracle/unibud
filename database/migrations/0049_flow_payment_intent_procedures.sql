-- First-party Flow payment-intent creation procedure.
-- A payment intent is only an authenticated instruction. This procedure does
-- not debit, credit, reserve funds, contact a provider or claim settlement.
BEGIN;

GRANT USAGE ON SCHEMA unibud_private TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_account_id() TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_session_id() TO unibud_flow_owner;
GRANT INSERT ON public.security_audit_events TO unibud_flow_owner;

CREATE FUNCTION public.flow_create_payment_intent(
  p_flow_account_id UUID,
  p_idempotency_key_digest BYTEA,
  p_recipient_ref_ciphertext BYTEA,
  p_recipient_ref_digest BYTEA,
  p_amount NUMERIC,
  p_currency TEXT,
  p_fee_amount NUMERIC,
  p_purpose_code TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
  v_intent_id UUID;
  v_existing public.flow_payment_intents%ROWTYPE;
  v_details_digest BYTEA;
  v_request_id UUID:=gen_random_uuid();
  v_now TIMESTAMPTZ:=clock_timestamp();
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL
     OR p_flow_account_id IS NULL
     OR p_idempotency_key_digest IS NULL OR octet_length(p_idempotency_key_digest)<>32
     OR p_recipient_ref_ciphertext IS NULL
     OR octet_length(p_recipient_ref_ciphertext)<29
     OR octet_length(p_recipient_ref_ciphertext)>4096
     OR p_recipient_ref_digest IS NULL OR octet_length(p_recipient_ref_digest)<>32
     OR p_amount IS NULL OR p_amount<=0 OR p_amount>9999999999999999.9999
     OR p_amount<>round(p_amount,4)
     OR p_fee_amount IS NULL OR p_fee_amount<0 OR p_fee_amount>9999999999999999.9999
     OR p_fee_amount<>round(p_fee_amount,4)
     OR p_currency IS NULL OR p_currency !~ '^[A-Z]{3}$'
     OR p_purpose_code IS NULL OR p_purpose_code !~ '^[a-z][a-z0-9_]{1,47}$' THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS(
    SELECT 1 FROM public.flow_customer_accounts f
     WHERE f.flow_account_id=p_flow_account_id
       AND f.account_id=v_actor
       AND f.status='active'
  ) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,
      resource_type,resource_id,request_id,session_reference,reason_code,event_data
    ) VALUES(
      gen_random_uuid(),v_actor,'flow','flow.payment_intent.create','denied',
      'flow_account',p_flow_account_id,v_request_id::TEXT,v_session::TEXT,
      'flow_account_unavailable','{}'::jsonb
    );
    RETURN NULL;
  END IF;

  -- A repeated idempotency key returns the original intent only when all
  -- transaction-defining fields match. It never creates a second instruction.
  SELECT * INTO v_existing
    FROM public.flow_payment_intents
   WHERE flow_account_id=p_flow_account_id
     AND account_id=v_actor
     AND idempotency_key_digest=p_idempotency_key_digest;
  IF FOUND THEN
    IF v_existing.recipient_ref_digest<>p_recipient_ref_digest
       OR v_existing.amount<>p_amount
       OR v_existing.currency<>p_currency
       OR v_existing.fee_amount<>p_fee_amount
       OR v_existing.purpose_code<>p_purpose_code THEN
      INSERT INTO public.security_audit_events(
        id,actor_account_id,application_id,action,outcome,
        resource_type,resource_id,request_id,session_reference,reason_code,event_data
      ) VALUES(
        gen_random_uuid(),v_actor,'flow','flow.payment_intent.idempotency_replay','denied',
        'flow_payment_intent',v_existing.payment_intent_id,v_request_id::TEXT,v_session::TEXT,
        'idempotency_payload_mismatch','{}'::jsonb
      );
      RETURN NULL;
    END IF;

    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,
      resource_type,resource_id,request_id,session_reference,reason_code,event_data
    ) VALUES(
      gen_random_uuid(),v_actor,'flow','flow.payment_intent.idempotency_replay','success',
      'flow_payment_intent',v_existing.payment_intent_id,v_request_id::TEXT,v_session::TEXT,
      'idempotent_replay','{}'::jsonb
    );
    RETURN v_existing.payment_intent_id;
  END IF;

  v_intent_id:=gen_random_uuid();
  v_details_digest:=public.digest(convert_to(
    jsonb_build_object(
      'account_id',v_actor::TEXT,
      'flow_account_id',p_flow_account_id::TEXT,
      'payment_intent_id',v_intent_id::TEXT,
      'recipient_ref_digest',encode(p_recipient_ref_digest,'hex'),
      'amount',p_amount::TEXT,
      'currency',p_currency,
      'fee_amount',p_fee_amount::TEXT,
      'purpose_code',p_purpose_code
    )::TEXT,'UTF8'),'sha256');

  INSERT INTO public.flow_payment_intents(
    payment_intent_id,flow_account_id,account_id,idempotency_key_digest,
    recipient_ref_ciphertext,recipient_ref_digest,amount,currency,fee_amount,
    details_digest,purpose_code,status,created_at
  ) VALUES(
    v_intent_id,p_flow_account_id,v_actor,p_idempotency_key_digest,
    p_recipient_ref_ciphertext,p_recipient_ref_digest,p_amount,p_currency,
    p_fee_amount,v_details_digest,p_purpose_code,'created',v_now
  );

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,
    resource_type,resource_id,request_id,session_reference,event_data
  ) VALUES(
    gen_random_uuid(),v_actor,'flow','flow.payment_intent.create','success',
    'flow_payment_intent',v_intent_id,v_request_id::TEXT,v_session::TEXT,
    jsonb_build_object('purpose_code',p_purpose_code,'currency',p_currency)
  );

  RETURN v_intent_id;
END
$function$;

ALTER FUNCTION public.flow_create_payment_intent(UUID,BYTEA,BYTEA,BYTEA,NUMERIC,TEXT,NUMERIC,TEXT)
  OWNER TO unibud_flow_owner;
REVOKE ALL ON FUNCTION public.flow_create_payment_intent(UUID,BYTEA,BYTEA,BYTEA,NUMERIC,TEXT,NUMERIC,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.flow_create_payment_intent(UUID,BYTEA,BYTEA,BYTEA,NUMERIC,TEXT,NUMERIC,TEXT)
  TO unibud_app;

COMMENT ON FUNCTION public.flow_create_payment_intent(UUID,BYTEA,BYTEA,BYTEA,NUMERIC,TEXT,NUMERIC,TEXT) IS
'Creates an account-owned Flow payment instruction under a verified exact session. Idempotent retries return the same intent only when recipient, amount, currency, fee and purpose match. Does not debit, reserve, submit or settle funds.';

COMMIT;
