-- Flow transaction PIN lifecycle and database-backed abuse controls.
-- PIN verification is an authentication factor only; it never approves or posts a payment.
BEGIN;

GRANT SELECT,INSERT,UPDATE ON public.flow_transaction_credentials TO unibud_flow_owner;
GRANT SELECT,INSERT,UPDATE ON public.flow_transaction_rate_limits TO unibud_flow_owner;
GRANT INSERT ON public.security_audit_events TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_account_id() TO unibud_flow_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_session_id() TO unibud_flow_owner;

CREATE FUNCTION public.flow_consume_pin_rate_limit(p_action TEXT)
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
    WHEN 'pin_enroll' THEN v_window:=3600; v_limit:=3; v_lock:=3600;
    WHEN 'pin_recovery' THEN v_window:=3600; v_limit:=3; v_lock:=3600;
    ELSE RAISE EXCEPTION 'Unsupported Flow PIN rate-limit action' USING ERRCODE='22023';
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
      THEN 1 ELSE current_bucket.request_count+1 END,
    locked_until=CASE
      WHEN current_bucket.locked_until>v_now THEN current_bucket.locked_until
      WHEN current_bucket.window_started_at+(v_window*interval '1 second')<=v_now THEN NULL
      WHEN current_bucket.request_count+1>v_limit THEN v_now+(v_lock*interval '1 second')
      ELSE current_bucket.locked_until END,
    updated_at=v_now
  RETURNING
    (current_bucket.request_count<=v_limit AND (current_bucket.locked_until IS NULL OR current_bucket.locked_until<=v_now)),
    current_bucket.request_count,current_bucket.locked_until;
END
$function$;

CREATE FUNCTION public.flow_pin_enroll(p_pin_hash_phc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_allowed BOOLEAN;
  v_count INTEGER;
  v_locked TIMESTAMPTZ;
  v_request UUID:=gen_random_uuid();
BEGIN
  IF v_account IS NULL OR v_session IS NULL
     OR p_pin_hash_phc IS NULL
     OR length(p_pin_hash_phc)<40 OR length(p_pin_hash_phc)>512
     OR p_pin_hash_phc !~ '^\$argon2id\$v=19\$m=[0-9]+,t=[0-9]+,p=[0-9]+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$' THEN
    RETURN false;
  END IF;
  SELECT r.allowed,r.request_count,r.locked_until
    INTO v_allowed,v_count,v_locked
    FROM public.flow_consume_pin_rate_limit('pin_enroll') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.enroll','denied',
      'flow_transaction_credential',v_account,v_request::TEXT,v_session::TEXT,
      'rate_limited','{}'::jsonb);
    RETURN false;
  END IF;

  INSERT INTO public.flow_transaction_credentials(account_id,pin_hash_phc)
  VALUES(v_account,p_pin_hash_phc)
  ON CONFLICT(account_id) DO NOTHING;
  IF NOT FOUND THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.enroll','denied',
      'flow_transaction_credential',v_account,v_request::TEXT,v_session::TEXT,
      'pin_already_enrolled','{}'::jsonb);
    RETURN false;
  END IF;

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
    request_id,session_reference,event_data
  ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.enroll','success',
    'flow_transaction_credential',v_account,v_request::TEXT,v_session::TEXT,'{}'::jsonb);
  RETURN true;
END
$function$;

CREATE FUNCTION public.flow_pin_begin_verification()
RETURNS TABLE(allowed BOOLEAN,pin_hash_phc TEXT,locked_until TIMESTAMPTZ)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_allowed BOOLEAN;
  v_count INTEGER;
  v_rate_lock TIMESTAMPTZ;
  v_pin_hash TEXT;
  v_pin_lock TIMESTAMPTZ;
  v_request UUID:=gen_random_uuid();
BEGIN
  IF v_account IS NULL OR v_session IS NULL THEN
    RETURN QUERY SELECT false,NULL::TEXT,NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  SELECT r.allowed,r.request_count,r.locked_until
    INTO v_allowed,v_count,v_rate_lock
    FROM public.flow_consume_pin_rate_limit('pin_verify') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.verify','denied',
      'flow_transaction_credential',v_account,v_request::TEXT,v_session::TEXT,
      'rate_limited','{}'::jsonb);
    RETURN QUERY SELECT false,NULL::TEXT,v_rate_lock;
    RETURN;
  END IF;

  SELECT c.pin_hash_phc,c.locked_until INTO v_pin_hash,v_pin_lock
    FROM public.flow_transaction_credentials c
   WHERE c.account_id=v_account;
  IF v_pin_hash IS NULL THEN
    RETURN QUERY SELECT false,NULL::TEXT,NULL::TIMESTAMPTZ;
    RETURN;
  END IF;
  IF v_pin_lock>clock_timestamp() THEN
    RETURN QUERY SELECT false,NULL::TEXT,v_pin_lock;
    RETURN;
  END IF;
  RETURN QUERY SELECT true,v_pin_hash,NULL::TIMESTAMPTZ;
END
$function$;

CREATE FUNCTION public.flow_pin_record_failure()
RETURNS TABLE(locked_until TIMESTAMPTZ,failed_attempts SMALLINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_locked TIMESTAMPTZ;
  v_attempts SMALLINT;
BEGIN
  IF v_account IS NULL OR v_session IS NULL THEN
    RETURN QUERY SELECT NULL::TIMESTAMPTZ,0::SMALLINT;
    RETURN;
  END IF;
  UPDATE public.flow_transaction_credentials c
     SET failed_attempts=LEAST(c.failed_attempts+1,20)::SMALLINT,
         locked_until=CASE WHEN c.failed_attempts+1>=5
           THEN clock_timestamp()+interval '15 minutes' ELSE c.locked_until END,
         updated_at=clock_timestamp()
   WHERE c.account_id=v_account
     AND (c.locked_until IS NULL OR c.locked_until<=clock_timestamp())
  RETURNING c.locked_until,c.failed_attempts INTO v_locked,v_attempts;
  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
    request_id,session_reference,reason_code,event_data
  ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.verify','failure',
    'flow_transaction_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,
    CASE WHEN v_locked IS NOT NULL THEN 'pin_locked' ELSE 'invalid_pin' END,
    jsonb_build_object('failed_attempts',COALESCE(v_attempts,0)));
  RETURN QUERY SELECT v_locked,COALESCE(v_attempts,0::SMALLINT);
END
$function$;

CREATE FUNCTION public.flow_pin_record_success()
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
  IF v_account IS NULL OR v_session IS NULL THEN RETURN false; END IF;
  UPDATE public.flow_transaction_credentials
     SET failed_attempts=0,locked_until=NULL,updated_at=clock_timestamp()
   WHERE account_id=v_account
     AND (locked_until IS NULL OR locked_until<=clock_timestamp());
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated=1 THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.verify','success',
      'flow_transaction_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,'{}'::jsonb);
  END IF;
  RETURN v_updated=1;
END
$function$;

CREATE FUNCTION public.flow_pin_recover(p_pin_hash_phc TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_allowed BOOLEAN;
  v_count INTEGER;
  v_locked TIMESTAMPTZ;
  v_updated INTEGER;
BEGIN
  IF v_account IS NULL OR v_session IS NULL
     OR p_pin_hash_phc IS NULL
     OR length(p_pin_hash_phc)<40 OR length(p_pin_hash_phc)>512
     OR p_pin_hash_phc !~ '^\$argon2id\$v=19\$m=[0-9]+,t=[0-9]+,p=[0-9]+\$[A-Za-z0-9+/]+\$[A-Za-z0-9+/]+$' THEN
    RETURN false;
  END IF;
  SELECT r.allowed,r.request_count,r.locked_until
    INTO v_allowed,v_count,v_locked
    FROM public.flow_consume_pin_rate_limit('pin_recovery') r;
  IF NOT COALESCE(v_allowed,false) THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,reason_code,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.recover','denied',
      'flow_transaction_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,
      'rate_limited','{}'::jsonb);
    RETURN false;
  END IF;
  UPDATE public.flow_transaction_credentials
     SET pin_hash_phc=p_pin_hash_phc,failed_attempts=0,locked_until=NULL,
         recovery_token_digest=NULL,recovery_expires_at=NULL,updated_at=clock_timestamp()
   WHERE account_id=v_account;
  GET DIAGNOSTICS v_updated=ROW_COUNT;
  IF v_updated=1 THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,event_data
    ) VALUES(gen_random_uuid(),v_account,'flow','flow.pin.recover','success',
      'flow_transaction_credential',v_account,gen_random_uuid()::TEXT,v_session::TEXT,'{}'::jsonb);
  END IF;
  RETURN v_updated=1;
END
$function$;

ALTER FUNCTION public.flow_consume_pin_rate_limit(TEXT) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_pin_enroll(TEXT) OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_pin_begin_verification() OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_pin_record_failure() OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_pin_record_success() OWNER TO unibud_flow_owner;
ALTER FUNCTION public.flow_pin_recover(TEXT) OWNER TO unibud_flow_owner;

REVOKE ALL ON FUNCTION public.flow_consume_pin_rate_limit(TEXT),
  public.flow_pin_enroll(TEXT),public.flow_pin_begin_verification(),
  public.flow_pin_record_failure(),public.flow_pin_record_success(),public.flow_pin_recover(TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.flow_pin_enroll(TEXT),
  public.flow_pin_begin_verification(),public.flow_pin_record_failure(),
  public.flow_pin_record_success(),public.flow_pin_recover(TEXT)
  TO unibud_app;

COMMENT ON FUNCTION public.flow_pin_begin_verification() IS
'Returns the current account Argon2id verifier only to the authenticated server function caller after atomic database rate limiting. It does not authorize a payment.';
COMMENT ON FUNCTION public.flow_pin_record_success() IS
'Resets PIN failure state only when the account is not locked. This result is not a payment authorization proof.';
COMMENT ON FUNCTION public.flow_pin_recover(TEXT) IS
'Changes the transaction PIN after the server has independently reauthenticated the account password. Never authorizes or posts a payment.';

COMMIT;
