-- Flow WebAuthn credential registration and session-bound challenge lifecycle.
-- This stores platform public keys only; biometric templates remain on devices.
BEGIN;

GRANT SELECT,INSERT ON public.flow_biometric_credentials TO unibud_flow_owner;
GRANT INSERT ON public.security_audit_events TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION public.flow_consume_flow_rate_limit(TEXT) TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION public.flow_consume_step_up_assertion(TEXT,BYTEA,BIGINT,UUID,TEXT) TO unibud_flow_owner;

CREATE TABLE public.flow_webauthn_registration_challenges (
  registration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  session_id UUID NOT NULL REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  challenge BYTEA NOT NULL CHECK(octet_length(challenge)=32),
  challenge_digest BYTEA NOT NULL UNIQUE CHECK(octet_length(challenge_digest)=32),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  FOREIGN KEY(session_id,account_id)
    REFERENCES public.account_sessions(id,account_id) ON DELETE RESTRICT,
  CHECK(expires_at>created_at),
  CHECK(NOT(consumed_at IS NOT NULL AND failed_at IS NOT NULL))
);
ALTER TABLE public.flow_webauthn_registration_challenges OWNER TO unibud_flow_owner;
ALTER TABLE public.flow_webauthn_registration_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flow_webauthn_registration_challenges FORCE ROW LEVEL SECURITY;
CREATE POLICY flow_webauthn_registration_challenges_owner_scope
  ON public.flow_webauthn_registration_challenges
  USING(account_id=unibud_private.current_account_id())
  WITH CHECK(account_id=unibud_private.current_account_id());
CREATE UNIQUE INDEX flow_webauthn_one_active_registration_per_session
  ON public.flow_webauthn_registration_challenges(account_id,session_id)
  WHERE consumed_at IS NULL AND failed_at IS NULL;
GRANT SELECT,INSERT,UPDATE ON public.flow_webauthn_registration_challenges TO unibud_flow_owner;
REVOKE ALL ON public.flow_webauthn_registration_challenges
  FROM PUBLIC,unibud_app,unibud_readonly,unibud_migrator,unibud_flow_ingest;

CREATE FUNCTION public.flow_webauthn_create_registration_challenge(
  p_challenge BYTEA,p_expires_at TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_allowed BOOLEAN;
  v_id UUID;
BEGIN
  IF v_account IS NULL OR v_session IS NULL
     OR p_challenge IS NULL OR octet_length(p_challenge)<>32
     OR p_expires_at IS NULL
     OR p_expires_at<=clock_timestamp()+interval '30 seconds'
     OR p_expires_at>clock_timestamp()+interval '5 minutes' THEN
    RETURN NULL;
  END IF;

  SELECT r.allowed INTO v_allowed
    FROM public.flow_consume_flow_rate_limit('webauthn_register') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.create','denied',
      'flow_biometric_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,
      'rate_limited','{}'::jsonb);
    RETURN NULL;
  END IF;

  UPDATE public.flow_webauthn_registration_challenges
     SET failed_at=clock_timestamp()
   WHERE account_id=v_account AND session_id=v_session
     AND consumed_at IS NULL AND failed_at IS NULL
     AND expires_at<=clock_timestamp();

  INSERT INTO public.flow_webauthn_registration_challenges(
    account_id,session_id,challenge,challenge_digest,expires_at
  ) VALUES(
    v_account,v_session,p_challenge,public.digest(p_challenge,'sha256'),p_expires_at
  ) ON CONFLICT DO NOTHING
  RETURNING registration_id INTO v_id;

  IF v_id IS NULL THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.create','denied',
      'flow_biometric_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,
      'active_registration_challenge_exists','{}'::jsonb);
    RETURN NULL;
  END IF;

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
    request_id,session_reference,event_data
  ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.create','success',
    'flow_biometric_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,'{}'::jsonb);
  RETURN v_id;
END
$function$;

CREATE FUNCTION public.flow_webauthn_get_registration_challenge(p_registration_id UUID)
RETURNS TABLE(challenge BYTEA,challenge_digest BYTEA,expires_at TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_allowed BOOLEAN;
BEGIN
  IF v_account IS NULL OR v_session IS NULL OR p_registration_id IS NULL THEN
    RETURN;
  END IF;
  SELECT r.allowed INTO v_allowed
    FROM public.flow_consume_flow_rate_limit('webauthn_verify') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.verify','denied',
      'flow_biometric_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,
      'rate_limited','{}'::jsonb);
    RETURN;
  END IF;
  RETURN QUERY
  SELECT c.challenge,c.challenge_digest,c.expires_at
    FROM public.flow_webauthn_registration_challenges c
   WHERE c.registration_id=p_registration_id
     AND c.account_id=v_account AND c.session_id=v_session
     AND c.consumed_at IS NULL AND c.failed_at IS NULL
     AND c.expires_at>clock_timestamp();
END
$function$;

CREATE FUNCTION public.flow_webauthn_fail_registration_challenge(p_registration_id UUID)
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
  IF v_account IS NULL OR v_session IS NULL OR p_registration_id IS NULL THEN
    RETURN false;
  END IF;
  UPDATE public.flow_webauthn_registration_challenges
     SET failed_at=clock_timestamp()
   WHERE registration_id=p_registration_id
     AND account_id=v_account AND session_id=v_session
     AND consumed_at IS NULL AND failed_at IS NULL;
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated=1 THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.verify','failure',
      'flow_biometric_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,
      'invalid_registration_response','{}'::jsonb);
  END IF;
  RETURN v_updated=1;
END
$function$;

CREATE FUNCTION public.flow_webauthn_list_credentials()
RETURNS TABLE(credential_id BYTEA,public_key_cose BYTEA,signature_counter BIGINT,transports TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
BEGIN
  IF v_account IS NULL OR v_session IS NULL THEN RETURN; END IF;
  RETURN QUERY
  SELECT c.credential_id,c.public_key_cose,c.signature_counter,c.transports
    FROM public.flow_biometric_credentials c
   WHERE c.account_id=v_account AND c.status='active'
   ORDER BY c.created_at;
END
$function$;

CREATE FUNCTION public.flow_webauthn_register_credential(
  p_registration_id UUID,p_credential_id BYTEA,p_public_key_cose BYTEA,
  p_signature_counter BIGINT,p_transports TEXT[],p_payload_digest BYTEA,
  p_expires_epoch BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_challenge public.flow_webauthn_registration_challenges%ROWTYPE;
  v_expected_digest BYTEA;
  v_canonical_transports TEXT;
  v_inserted INTEGER;
  v_request UUID:=gen_random_uuid();
BEGIN
  IF v_account IS NULL OR v_session IS NULL
     OR p_registration_id IS NULL
     OR p_credential_id IS NULL OR octet_length(p_credential_id)<1 OR octet_length(p_credential_id)>1024
     OR p_public_key_cose IS NULL OR octet_length(p_public_key_cose)<1 OR octet_length(p_public_key_cose)>4096
     OR p_signature_counter IS NULL OR p_signature_counter<0
     OR p_transports IS NULL OR array_position(p_transports,NULL) IS NOT NULL
     OR NOT (p_transports <@ ARRAY['usb','nfc','ble','internal','hybrid']::TEXT[])
     OR p_payload_digest IS NULL OR octet_length(p_payload_digest)<>32 THEN
    RETURN false;
  END IF;

  SELECT * INTO v_challenge
    FROM public.flow_webauthn_registration_challenges c
   WHERE c.registration_id=p_registration_id
     AND c.account_id=v_account AND c.session_id=v_session
     AND c.consumed_at IS NULL AND c.failed_at IS NULL
     AND c.expires_at>clock_timestamp()
   FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  SELECT COALESCE(string_agg(value,',' ORDER BY value),'')
    INTO v_canonical_transports
    FROM (SELECT DISTINCT unnest(p_transports) AS value) t;
  IF p_transports<>CASE WHEN v_canonical_transports='' THEN ARRAY[]::TEXT[]
    ELSE string_to_array(v_canonical_transports,',') END THEN
    RETURN false;
  END IF;

  v_expected_digest:=public.digest(convert_to(
    encode(v_challenge.challenge_digest,'hex')||':'||
    encode(p_credential_id,'hex')||':'||
    encode(p_public_key_cose,'hex')||':'||
    p_signature_counter::TEXT||':'||v_canonical_transports,'UTF8'),'sha256');
  IF p_payload_digest<>v_expected_digest THEN RETURN false; END IF;

  IF NOT public.flow_consume_step_up_assertion(
    'webauthn_register',v_expected_digest,p_expires_epoch,p_nonce,p_signature
  ) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.verify','denied',
      'flow_biometric_credential',v_account,v_request::TEXT,v_session::TEXT,
      'step_up_assertion_invalid_or_replayed','{}'::jsonb);
    RETURN false;
  END IF;

  INSERT INTO public.flow_biometric_credentials(
    account_id,credential_id,public_key_cose,signature_counter,transports
  ) VALUES(
    v_account,p_credential_id,p_public_key_cose,p_signature_counter,p_transports
  ) ON CONFLICT(credential_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted=ROW_COUNT;
  IF v_inserted<>1 THEN
    UPDATE public.flow_webauthn_registration_challenges
       SET failed_at=clock_timestamp()
     WHERE registration_id=p_registration_id;
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.verify','denied',
      'flow_biometric_credential',v_account,v_request::TEXT,v_session::TEXT,
      'credential_already_registered','{}'::jsonb);
    RETURN false;
  END IF;

  UPDATE public.flow_webauthn_registration_challenges
     SET consumed_at=clock_timestamp()
   WHERE registration_id=p_registration_id
     AND account_id=v_account AND session_id=v_session
     AND consumed_at IS NULL AND failed_at IS NULL;
  GET DIAGNOSTICS v_inserted=ROW_COUNT;
  IF v_inserted<>1 THEN
    RAISE EXCEPTION 'WebAuthn registration challenge could not be consumed';
  END IF;

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
    request_id,session_reference,event_data
  ) VALUES(gen_random_uuid(),v_account,'flow','flow.webauthn.registration.verify','success',
    'flow_biometric_credential',v_account,v_request::TEXT,v_session::TEXT,
    jsonb_build_object('signature_counter',p_signature_counter,'transport_count',cardinality(p_transports)));
  RETURN true;
END
$function$;

ALTER FUNCTION public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_webauthn_get_registration_challenge(UUID) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_webauthn_fail_registration_challenge(UUID) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_webauthn_list_credentials() OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT)
  OWNER TO unibud_flow_owner;

REVOKE ALL ON FUNCTION public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ),
  public.flow_webauthn_get_registration_challenge(UUID),
  public.flow_webauthn_fail_registration_challenge(UUID),
  public.flow_webauthn_list_credentials(),
  public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ),
  public.flow_webauthn_get_registration_challenge(UUID),
  public.flow_webauthn_fail_registration_challenge(UUID),
  public.flow_webauthn_list_credentials(),
  public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT)
  TO unibud_app;

COMMENT ON TABLE public.flow_webauthn_registration_challenges IS
'Short-lived, account/session-bound one-use challenges for WebAuthn credential registration.';
COMMENT ON FUNCTION public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT) IS
'Persists only verified WebAuthn credential public keys and counters after exact challenge binding and a single-use server step-up assertion. It never receives biometric templates.';

COMMIT;
