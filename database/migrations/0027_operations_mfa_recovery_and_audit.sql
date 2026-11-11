-- One-time recovery-code redemption removes the compromised authenticator and all step-ups.
BEGIN;

CREATE TABLE public.unibud_operator_mfa_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.account_sessions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'enrollment_started','enrollment_confirmed','challenge_failed',
    'challenge_succeeded','locked_out','recovery_code_redeemed',
    'credential_removed'
  )),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE public.unibud_operator_mfa_events OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_operator_mfa_events
  FROM PUBLIC, unibud_app, unibud_auth, unibud_readonly, unibud_migrator;
CREATE INDEX unibud_operator_mfa_events_account_time_idx
  ON public.unibud_operator_mfa_events(actor_account_id, occurred_at DESC);
CREATE INDEX unibud_operator_mfa_events_session_time_idx
  ON public.unibud_operator_mfa_events(session_id, occurred_at DESC);

CREATE FUNCTION unibud_private.audit_operations_mfa_credential_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID := unibud_private.current_account_id();
  v_session UUID := unibud_private.current_session_id();
  v_event TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_event := 'enrollment_started';
  ELSIF TG_OP = 'DELETE' THEN
    v_event := 'credential_removed';
  ELSIF OLD.state = 'pending' AND NEW.state = 'active' THEN
    v_event := 'enrollment_confirmed';
  ELSIF NEW.failed_attempt_count > OLD.failed_attempt_count THEN
    IF NEW.locked_until IS NOT NULL AND
       (OLD.locked_until IS NULL OR NEW.locked_until > OLD.locked_until) THEN
      v_event := 'locked_out';
    ELSE
      v_event := 'challenge_failed';
    END IF;
  ELSIF NEW.last_accepted_totp_step IS NOT NULL
        AND (OLD.last_accepted_totp_step IS NULL
             OR NEW.last_accepted_totp_step > OLD.last_accepted_totp_step) THEN
    v_event := 'challenge_succeeded';
  END IF;

  IF v_event IS NOT NULL THEN
    INSERT INTO public.unibud_operator_mfa_events(actor_account_id,session_id,event_type)
    VALUES (v_actor,v_session,v_event);
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END
$function$;
ALTER FUNCTION unibud_private.audit_operations_mfa_credential_change() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.audit_operations_mfa_credential_change() FROM PUBLIC;
CREATE TRIGGER unibud_operator_mfa_credential_audit
AFTER INSERT OR UPDATE OR DELETE ON public.unibud_operator_mfa_credentials
FOR EACH ROW EXECUTE FUNCTION unibud_private.audit_operations_mfa_credential_change();

CREATE FUNCTION public.unibud_operator_mfa_redeem_recovery_code(
  p_digest TEXT,
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
  p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_session UUID;
  v_key BYTEA;
  v_expected BYTEA;
  v_supplied BYTEA;
  v_diff INTEGER := 0;
  v_i INTEGER;
  v_now BIGINT;
  v_redeemed UUID;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_account IS NULL OR v_session IS NULL
     OR p_digest IS NULL OR p_digest !~ '^[0-9a-f]{64}$'
     OR p_issued_at IS NULL OR p_expires_at IS NULL OR p_nonce IS NULL
     OR p_signature IS NULL OR length(p_signature) <> 64 OR p_signature ~ '[^0-9a-f]'
     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id=v_account AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND cardinality(g.permissions)>0
  ) THEN RETURN FALSE; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_mfa_credentials c
    WHERE c.account_id=v_account AND c.state='active'
      AND (c.locked_until IS NULL OR c.locked_until <= statement_timestamp())
  ) THEN RETURN FALSE; END IF;

  SELECT secret INTO v_key FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active ORDER BY created_at DESC LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;
  v_expected := public.hmac(convert_to(
    'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':recovery:' ||
    p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' || p_nonce::TEXT || ':-',
    'UTF8'),v_key,'sha256');
  v_supplied := decode(p_signature,'hex');
  IF octet_length(v_supplied)<>32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff<>0 THEN RETURN FALSE; END IF;

  UPDATE public.unibud_operator_mfa_recovery_codes
  SET redeemed_at=clock_timestamp()
  WHERE account_id=v_account AND code_digest=decode(p_digest,'hex')
    AND redeemed_at IS NULL
  RETURNING account_id INTO v_redeemed;
  IF v_redeemed IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (p_nonce,v_account,v_session,'recovery',to_timestamp(p_expires_at));

  -- Recovery never grants an Operations step-up. Remove every session's
  -- assurance and the old authenticator; a fresh password-reauthenticated
  -- enrollment is required before Operations access can resume.
  DELETE FROM public.unibud_operator_mfa_step_up_sessions WHERE account_id=v_account;
  DELETE FROM public.unibud_operator_mfa_credentials WHERE account_id=v_account;
  INSERT INTO public.unibud_operator_mfa_events(actor_account_id,session_id,event_type)
  VALUES (v_account,v_session,'recovery_code_redeemed');
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_redeem_recovery_code(TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code(TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code(TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_events IS
'Append-only Operations MFA lifecycle audit events. Contains no secrets, codes, tokens or submitted request data.';
COMMENT ON FUNCTION public.unibud_operator_mfa_redeem_recovery_code(TEXT,BIGINT,BIGINT,UUID,TEXT) IS
'Consumes one account-bound recovery digest exactly once, revokes every session step-up, removes the old authenticator and requires fresh password-reauthenticated enrollment.';

COMMIT;
