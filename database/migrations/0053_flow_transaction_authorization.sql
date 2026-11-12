-- Flow transaction-specific confirmation and one-time authorization consumption.
-- Authorization changes an instruction to "authorized"; it does not debit or settle funds.
BEGIN;

ALTER TABLE public.flow_authorization_challenges
  ADD COLUMN challenge BYTEA;
ALTER TABLE public.flow_authorization_challenges
  ADD CONSTRAINT flow_authorization_challenges_challenge_length_check
  CHECK(challenge IS NULL OR octet_length(challenge)=32);
ALTER TABLE public.flow_authorization_challenges
  ADD CONSTRAINT flow_authorization_challenges_challenge_digest_check
  CHECK(challenge IS NULL OR public.digest(challenge,'sha256')=challenge_digest);

GRANT SELECT,UPDATE ON public.flow_payment_intents TO unibud_flow_owner;
GRANT SELECT,INSERT,UPDATE ON public.flow_authorization_challenges TO unibud_flow_owner;
GRANT SELECT,UPDATE ON public.flow_biometric_credentials TO unibud_flow_owner;
GRANT INSERT ON public.security_audit_events TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION public.flow_consume_flow_rate_limit(TEXT) TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION public.flow_consume_step_up_assertion(TEXT,BYTEA,BIGINT,UUID,TEXT)
  TO unibud_flow_owner;

CREATE FUNCTION public.flow_get_payment_intent_confirmation_details(p_payment_intent_id UUID)
RETURNS TABLE(
  payment_intent_id UUID,flow_account_id UUID,amount NUMERIC,currency CHAR(3),
  fee_amount NUMERIC,purpose_code TEXT,recipient_ref_ciphertext BYTEA,
  recipient_ref_digest BYTEA,details_digest BYTEA,status TEXT,created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
BEGIN
  IF v_account IS NULL OR v_session IS NULL OR p_payment_intent_id IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT i.payment_intent_id,i.flow_account_id,i.amount,i.currency,i.fee_amount,
         i.purpose_code,i.recipient_ref_ciphertext,i.recipient_ref_digest,
         i.details_digest,i.status,i.created_at
    FROM public.flow_payment_intents i
   WHERE i.account_id=v_account AND i.payment_intent_id=p_payment_intent_id
     AND i.status IN ('created','awaiting_authorization');
END
$function$;

CREATE FUNCTION public.flow_create_authorization_challenge(
  p_payment_intent_id UUID,p_auth_method TEXT,p_challenge BYTEA,p_expires_at TIMESTAMPTZ
)
RETURNS TABLE(
  authorization_id UUID,challenge_digest BYTEA,details_digest BYTEA,expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_allowed BOOLEAN;
  v_intent public.flow_payment_intents%ROWTYPE;
  v_authorization UUID;
  v_challenge_digest BYTEA;
  v_request UUID:=gen_random_uuid();
BEGIN
  IF v_account IS NULL OR v_session IS NULL
     OR p_payment_intent_id IS NULL
     OR p_auth_method IS NULL OR p_auth_method NOT IN ('transaction_pin','webauthn')
     OR p_challenge IS NULL OR octet_length(p_challenge)<>32
     OR p_expires_at IS NULL
     OR p_expires_at<=clock_timestamp()+interval '30 seconds'
     OR p_expires_at>clock_timestamp()+interval '2 minutes' THEN
    RETURN;
  END IF;

  SELECT r.allowed INTO v_allowed
    FROM public.flow_consume_flow_rate_limit('authorization_create') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization.create','denied',
      'flow_payment_intent',p_payment_intent_id,v_request::TEXT,v_session::TEXT,
      'rate_limited','{}'::jsonb);
    RETURN;
  END IF;

  SELECT * INTO v_intent
    FROM public.flow_payment_intents i
   WHERE i.account_id=v_account AND i.payment_intent_id=p_payment_intent_id
     AND i.status IN ('created','awaiting_authorization')
   FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;

  UPDATE public.flow_authorization_challenges
     SET failed_at=clock_timestamp()
   WHERE payment_intent_id=p_payment_intent_id
     AND account_id=v_account AND consumed_at IS NULL AND failed_at IS NULL
     AND expires_at<=clock_timestamp();

  v_challenge_digest:=public.digest(p_challenge,'sha256');
  INSERT INTO public.flow_authorization_challenges(
    payment_intent_id,account_id,session_id,challenge,challenge_digest,
    details_digest,auth_method,expires_at
  ) VALUES(
    p_payment_intent_id,v_account,v_session,p_challenge,v_challenge_digest,
    v_intent.details_digest,p_auth_method,p_expires_at
  ) ON CONFLICT DO NOTHING
  RETURNING flow_authorization_challenges.authorization_id
    INTO v_authorization;

  IF v_authorization IS NULL THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization.create','denied',
      'flow_payment_intent',p_payment_intent_id,v_request::TEXT,v_session::TEXT,
      'active_authorization_challenge_exists','{}'::jsonb);
    RETURN;
  END IF;

  IF v_intent.status='created' THEN
    UPDATE public.flow_payment_intents
       SET status='awaiting_authorization'
     WHERE payment_intent_id=p_payment_intent_id AND account_id=v_account;
  END IF;

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
    request_id,session_reference,event_data
  ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization.create','success',
    'flow_payment_intent',p_payment_intent_id,v_request::TEXT,v_session::TEXT,
    jsonb_build_object('authorization_id',v_authorization,'auth_method',p_auth_method));
  RETURN QUERY SELECT v_authorization,v_challenge_digest,v_intent.details_digest,p_expires_at;
END
$function$;

CREATE FUNCTION public.flow_get_authorization_challenge(p_authorization_id UUID)
RETURNS TABLE(
  authorization_id UUID,payment_intent_id UUID,challenge BYTEA,challenge_digest BYTEA,
  details_digest BYTEA,auth_method TEXT,expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_method TEXT;
  v_allowed BOOLEAN;
BEGIN
  IF v_account IS NULL OR v_session IS NULL OR p_authorization_id IS NULL THEN RETURN; END IF;
  SELECT c.auth_method INTO v_method
    FROM public.flow_authorization_challenges c
   WHERE c.authorization_id=p_authorization_id
     AND c.account_id=v_account AND c.session_id=v_session
     AND c.consumed_at IS NULL AND c.failed_at IS NULL
     AND c.expires_at>clock_timestamp();
  IF NOT FOUND THEN RETURN; END IF;

  IF v_method='webauthn' THEN
    SELECT r.allowed INTO v_allowed
      FROM public.flow_consume_flow_rate_limit('webauthn_verify') r;
    IF NOT COALESCE(v_allowed,false) THEN RETURN; END IF;
  END IF;

  RETURN QUERY
  SELECT c.authorization_id,c.payment_intent_id,c.challenge,c.challenge_digest,
         c.details_digest,c.auth_method,c.expires_at
    FROM public.flow_authorization_challenges c
   WHERE c.authorization_id=p_authorization_id
     AND c.account_id=v_account AND c.session_id=v_session
     AND c.consumed_at IS NULL AND c.failed_at IS NULL
     AND c.expires_at>clock_timestamp();
END
$function$;

CREATE FUNCTION public.flow_fail_authorization_challenge(p_authorization_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_updated INTEGER;
BEGIN
  IF v_account IS NULL OR v_session IS NULL OR p_authorization_id IS NULL THEN RETURN false; END IF;
  UPDATE public.flow_authorization_challenges
     SET failed_at=clock_timestamp()
   WHERE authorization_id=p_authorization_id
     AND account_id=v_account AND session_id=v_session
     AND consumed_at IS NULL AND failed_at IS NULL;
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated=1 THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization','failure',
      'flow_payment_intent',p_authorization_id,gen_random_uuid()::TEXT,v_session::TEXT,
      'authorization_challenge_failed','{}'::jsonb);
  END IF;
  RETURN v_updated=1;
END
$function$;

CREATE FUNCTION public.flow_authorize_payment_intent(
  p_authorization_id UUID,p_payload_digest BYTEA,p_expires_epoch BIGINT,
  p_nonce UUID,p_signature TEXT,p_credential_id BYTEA DEFAULT NULL,
  p_new_signature_counter BIGINT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_challenge public.flow_authorization_challenges%ROWTYPE;
  v_credential public.flow_biometric_credentials%ROWTYPE;
  v_action TEXT;
  v_expected_digest BYTEA;
  v_counter_text TEXT:='';
  v_credential_text TEXT:='';
  v_expires_epoch BIGINT;
  v_updated INTEGER;
  v_request UUID:=gen_random_uuid();
BEGIN
  IF v_account IS NULL OR v_session IS NULL
     OR p_authorization_id IS NULL
     OR p_payload_digest IS NULL OR octet_length(p_payload_digest)<>32 THEN
    RETURN false;
  END IF;

  SELECT * INTO v_challenge
    FROM public.flow_authorization_challenges c
   WHERE c.authorization_id=p_authorization_id
     AND c.account_id=v_account AND c.session_id=v_session
     AND c.consumed_at IS NULL AND c.failed_at IS NULL
     AND c.expires_at>clock_timestamp()
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;
  IF v_challenge.challenge IS NULL OR public.digest(v_challenge.challenge,'sha256')<>v_challenge.challenge_digest THEN
    RETURN false;
  END IF;

  v_expires_epoch:=floor(extract(epoch FROM v_challenge.expires_at))::BIGINT;
  IF v_challenge.auth_method='transaction_pin' THEN
    IF p_credential_id IS NOT NULL OR p_new_signature_counter IS NOT NULL THEN RETURN false; END IF;
    v_action:='transaction_pin_authorize';
  ELSIF v_challenge.auth_method='webauthn' THEN
    IF p_credential_id IS NULL OR p_new_signature_counter IS NULL OR p_new_signature_counter<0 THEN
      RETURN false;
    END IF;
    SELECT * INTO v_credential
      FROM public.flow_biometric_credentials c
     WHERE c.account_id=v_account AND c.credential_id=p_credential_id
       AND c.status='active'
     FOR UPDATE;
    IF NOT FOUND THEN RETURN false; END IF;
    IF v_credential.signature_counter>0
       AND p_new_signature_counter<=v_credential.signature_counter THEN
      INSERT INTO public.security_audit_events(
        id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
        request_id,session_reference,reason_code,event_data
      ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization','denied',
        'flow_biometric_credential',v_challenge.payment_intent_id,v_request::TEXT,v_session::TEXT,
        'webauthn_signature_counter_replay','{}'::jsonb);
      RETURN false;
    END IF;
    v_action:='transaction_webauthn_authorize';
    v_credential_text:=encode(p_credential_id,'hex');
    v_counter_text:=p_new_signature_counter::TEXT;
  ELSE
    RETURN false;
  END IF;

  v_expected_digest:=public.digest(convert_to(
    v_challenge.authorization_id::TEXT||':'||
    encode(v_challenge.challenge_digest,'hex')||':'||
    encode(v_challenge.details_digest,'hex')||':'||
    v_challenge.auth_method||':'||
    v_expires_epoch::TEXT||':'||
    v_credential_text||':'||v_counter_text,'UTF8'),'sha256');
  IF p_payload_digest<>v_expected_digest THEN RETURN false; END IF;

  IF NOT public.flow_consume_step_up_assertion(
    v_action,v_expected_digest,p_expires_epoch,p_nonce,p_signature
  ) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization','denied',
      'flow_payment_intent',v_challenge.payment_intent_id,v_request::TEXT,v_session::TEXT,
      'step_up_assertion_invalid_or_replayed','{}'::jsonb);
    RETURN false;
  END IF;

  IF v_challenge.auth_method='webauthn' THEN
    UPDATE public.flow_biometric_credentials
       SET signature_counter=p_new_signature_counter,last_used_at=clock_timestamp()
     WHERE account_id=v_account AND credential_id=p_credential_id
       AND status='active'
       AND (signature_counter=0 OR p_new_signature_counter>signature_counter);
    GET DIAGNOSTICS v_updated=ROW_COUNT;
    IF v_updated<>1 THEN RETURN false; END IF;
  END IF;

  UPDATE public.flow_authorization_challenges
     SET consumed_at=clock_timestamp()
   WHERE authorization_id=p_authorization_id AND account_id=v_account
     AND session_id=v_session AND consumed_at IS NULL AND failed_at IS NULL;
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated<>1 THEN RETURN false; END IF;

  UPDATE public.flow_payment_intents
     SET status='authorized',authorized_at=clock_timestamp()
   WHERE payment_intent_id=v_challenge.payment_intent_id
     AND account_id=v_account AND status='awaiting_authorization';
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated<>1 THEN
    RAISE EXCEPTION 'Payment intent could not transition to authorized';
  END IF;

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
    request_id,session_reference,event_data
  ) VALUES(gen_random_uuid(),v_account,'flow','flow.payment.authorization','success',
    'flow_payment_intent',v_challenge.payment_intent_id,v_request::TEXT,v_session::TEXT,
    jsonb_build_object('authorization_id',p_authorization_id,'auth_method',v_challenge.auth_method));
  RETURN true;
END
$function$;

ALTER FUNCTION public.flow_get_payment_intent_confirmation_details(UUID) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_get_authorization_challenge(UUID) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_fail_authorization_challenge(UUID) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT)
  OWNER TO unibud_flow_owner;

REVOKE ALL ON FUNCTION public.flow_get_payment_intent_confirmation_details(UUID),
  public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ),
  public.flow_get_authorization_challenge(UUID),public.flow_fail_authorization_challenge(UUID),
  public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.flow_get_payment_intent_confirmation_details(UUID),
  public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ),
  public.flow_get_authorization_challenge(UUID),public.flow_fail_authorization_challenge(UUID),
  public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT)
  TO unibud_app;

COMMENT ON FUNCTION public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT) IS
'Consumes a single-use transaction-specific PIN or WebAuthn step-up assertion bound to the exact payment intent, challenge, account, session, expiry and (for WebAuthn) credential counter. Authorization does not debit, submit or settle funds.';

COMMIT;
