-- Account-wide database rate limit for payment-intent creation.
BEGIN;

ALTER TABLE public.flow_transaction_rate_limits
  DROP CONSTRAINT flow_transaction_rate_limits_action_check;
ALTER TABLE public.flow_transaction_rate_limits
  ADD CONSTRAINT flow_transaction_rate_limits_action_check
  CHECK(action IN (
    'pin_verify','pin_enroll','pin_recovery','webauthn_verify',
    'webauthn_register','authorization_create','payment_intent_create'
  ));

CREATE OR REPLACE FUNCTION public.flow_consume_flow_rate_limit(p_action TEXT)
RETURNS TABLE(allowed BOOLEAN,request_count INTEGER,locked_until TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_now TIMESTAMPTZ:=clock_timestamp();
  v_window INTEGER;
  v_limit INTEGER;
  v_lock INTEGER;
BEGIN
  IF v_account IS NULL OR v_session IS NULL THEN
    RETURN QUERY SELECT false,0,NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  CASE p_action
    WHEN 'pin_verify' THEN v_window:=900; v_limit:=5; v_lock:=900;
    WHEN 'webauthn_verify' THEN v_window:=900; v_limit:=5; v_lock:=900;
    WHEN 'pin_enroll' THEN v_window:=3600; v_limit:=3; v_lock:=3600;
    WHEN 'pin_recovery' THEN v_window:=3600; v_limit:=3; v_lock:=3600;
    WHEN 'webauthn_register' THEN v_window:=3600; v_limit:=3; v_lock:=3600;
    WHEN 'authorization_create' THEN v_window:=900; v_limit:=5; v_lock:=900;
    WHEN 'payment_intent_create' THEN v_window:=900; v_limit:=20; v_lock:=900;
    ELSE RAISE EXCEPTION 'Unsupported Flow rate-limit action' USING ERRCODE='22023';
  END CASE;

  RETURN QUERY
  INSERT INTO public.flow_transaction_rate_limits AS current_bucket(
    account_id,action,window_started_at,request_count,locked_until,updated_at
  ) VALUES(v_account,p_action,v_now,1,NULL,v_now)
  ON CONFLICT(account_id,action) DO UPDATE SET
    window_started_at=CASE
      WHEN current_bucket.window_started_at+(v_window*interval '1 second')<=v_now
      THEN v_now ELSE current_bucket.window_started_at END,
    request_count=CASE
      WHEN current_bucket.window_started_at+(v_window*interval '1 second')<=v_now
      THEN 1 ELSE LEAST(current_bucket.request_count+1,v_limit+1) END,
    locked_until=CASE
      WHEN current_bucket.locked_until>v_now THEN current_bucket.locked_until
      WHEN current_bucket.window_started_at+(v_window*interval '1 second')<=v_now THEN NULL
      WHEN current_bucket.request_count+1>v_limit THEN v_now+(v_lock*interval '1 second')
      ELSE current_bucket.locked_until END,
    updated_at=v_now
  RETURNING
    (current_bucket.request_count<=v_limit AND (current_bucket.locked_until IS NULL OR current_bucket.locked_until<=v_now)),
    current_bucket.request_count,current_bucket.locked_until;
END;
$function$;

CREATE OR REPLACE FUNCTION public.flow_create_payment_intent(
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
  v_allowed BOOLEAN;
  v_request_count INTEGER;
  v_locked_until TIMESTAMPTZ;
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

  SELECT r.allowed,r.request_count,r.locked_until
    INTO v_allowed,v_request_count,v_locked_until
    FROM public.flow_consume_flow_rate_limit('payment_intent_create') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,
      resource_type,resource_id,request_id,session_reference,reason_code,event_data
    ) VALUES(
      gen_random_uuid(),v_actor,'flow','flow.payment_intent.create','denied',
      'flow_account',p_flow_account_id,v_request_id::TEXT,v_session::TEXT,
      'rate_limited',jsonb_build_object(
        'request_count',v_request_count,'locked_until',v_locked_until
      )
    );
    RETURN NULL;
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
  )
  ON CONFLICT(flow_account_id,idempotency_key_digest) DO NOTHING
  RETURNING payment_intent_id INTO v_intent_id;

  IF NOT FOUND THEN
    SELECT * INTO v_existing
      FROM public.flow_payment_intents
     WHERE flow_account_id=p_flow_account_id
       AND account_id=v_actor
       AND idempotency_key_digest=p_idempotency_key_digest;
    IF NOT FOUND THEN RETURN NULL; END IF;

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

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,
    resource_type,resource_id,request_id,session_reference,event_data
  ) VALUES(
    gen_random_uuid(),v_actor,'flow','flow.payment_intent.create','success',
    'flow_payment_intent',v_intent_id,v_request_id::TEXT,v_session::TEXT,
    jsonb_build_object('purpose_code',p_purpose_code,'currency',p_currency)
  );

  RETURN v_intent_id;
END;
$function$;

COMMENT ON FUNCTION public.flow_create_payment_intent(UUID,BYTEA,BYTEA,BYTEA,NUMERIC,TEXT,NUMERIC,TEXT) IS
'Creates an account-owned Flow payment instruction under a verified exact session, with a database-enforced account-wide limit of 20 creation attempts per 15 minutes. Idempotent retries return the same intent only when recipient, amount, currency, fee and purpose match. Does not debit, reserve, submit or settle funds.';

COMMIT;
