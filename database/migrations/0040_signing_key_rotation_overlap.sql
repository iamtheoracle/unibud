-- Safe overlapping signing-key rotation for the three independent UNIBUD trust domains.
-- Existing active keys remain valid until explicitly retired. No key material is
-- created, copied, or rotated by this migration.
BEGIN;

DROP INDEX unibud_private.context_signing_keys_one_active_idx;
DROP INDEX unibud_private.session_context_signing_keys_one_active_idx;
DROP INDEX unibud_private.operations_mfa_assertion_one_active_key_idx;

-- Enforce a maximum of two active verification keys per purpose. The advisory
-- transaction lock serializes concurrent provisioning/activation attempts.
CREATE FUNCTION unibud_private.enforce_signing_key_overlap_limit()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, unibud_private
AS $function$
DECLARE
  v_active_count INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(
    hashtextextended(TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME || ':active-key-limit', 0)
  );
  IF NEW.active THEN
    EXECUTE format(
      'SELECT count(*) FROM %I.%I WHERE active AND key_id <> $1',
      TG_TABLE_SCHEMA, TG_TABLE_NAME
    ) INTO v_active_count USING NEW.key_id;
    IF v_active_count >= 2 THEN
      RAISE EXCEPTION 'At most two active signing keys are permitted for %',
        TG_TABLE_NAME USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END
$function$;
REVOKE ALL ON FUNCTION unibud_private.enforce_signing_key_overlap_limit() FROM PUBLIC;

CREATE TRIGGER context_signing_keys_overlap_limit
BEFORE INSERT OR UPDATE OF active ON unibud_private.context_signing_keys
FOR EACH ROW EXECUTE FUNCTION unibud_private.enforce_signing_key_overlap_limit();
CREATE TRIGGER session_context_signing_keys_overlap_limit
BEFORE INSERT OR UPDATE OF active ON unibud_private.session_context_signing_keys
FOR EACH ROW EXECUTE FUNCTION unibud_private.enforce_signing_key_overlap_limit();
CREATE TRIGGER operations_mfa_assertion_keys_overlap_limit
BEFORE INSERT OR UPDATE OF active ON unibud_private.operations_mfa_assertion_signing_keys
FOR EACH ROW EXECUTE FUNCTION unibud_private.enforce_signing_key_overlap_limit();

CREATE OR REPLACE FUNCTION unibud_private.current_account_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account TEXT;
  v_expiry TEXT;
  v_nonce TEXT;
  v_signature TEXT;
  v_key BYTEA;
  v_expected BYTEA;
  v_supplied BYTEA;
  v_diff INTEGER;
  v_index INTEGER;
  v_now BIGINT;
  v_valid BOOLEAN := FALSE;
BEGIN
  v_account := current_setting('unibud.account_id', true);
  v_expiry := current_setting('unibud.context_expiry', true);
  v_nonce := current_setting('unibud.context_nonce', true);
  v_signature := current_setting('unibud.context_signature', true);

  IF v_account IS NULL OR v_expiry IS NULL OR v_nonce IS NULL OR v_signature IS NULL
     OR v_nonce !~ '^[0-9a-fA-F-]{36}$'
     OR v_signature !~ '^[0-9a-f]{64}$'
     OR v_expiry !~ '^[0-9]{1,12}$'
     OR v_account !~ '^[0-9a-fA-F-]{36}$' THEN
    RETURN NULL;
  END IF;
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_expiry::BIGINT < v_now OR v_expiry::BIGINT > v_now + 120 THEN
    RETURN NULL;
  END IF;
  v_supplied := decode(v_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN NULL; END IF;

  -- Evaluate every active candidate; do not stop after the first match.
  FOR v_key IN
    SELECT secret FROM unibud_private.context_signing_keys
    WHERE active ORDER BY key_id
  LOOP
    v_expected := public.hmac(
      convert_to(v_account || ':' || v_expiry || ':' || v_nonce, 'UTF8'),
      v_key, 'sha256'
    );
    v_diff := 0;
    FOR v_index IN 0..31 LOOP
      v_diff := v_diff | (get_byte(v_expected, v_index) # get_byte(v_supplied, v_index));
    END LOOP;
    IF v_diff = 0 THEN v_valid := TRUE; END IF;
  END LOOP;
  IF NOT v_valid THEN RETURN NULL; END IF;
  RETURN v_account::UUID;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION unibud_private.current_session_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account_text TEXT;
  v_session_text TEXT;
  v_expiry_text TEXT;
  v_nonce TEXT;
  v_signature TEXT;
  v_account UUID;
  v_session UUID;
  v_key BYTEA;
  v_expected BYTEA;
  v_supplied BYTEA;
  v_diff INTEGER;
  v_index INTEGER;
  v_now BIGINT;
  v_valid BOOLEAN := FALSE;
BEGIN
  v_account_text := current_setting('unibud.account_id', true);
  v_session_text := current_setting('unibud.session_id', true);
  v_expiry_text := current_setting('unibud.context_expiry', true);
  v_nonce := current_setting('unibud.context_nonce', true);
  v_signature := current_setting('unibud.session_context_signature', true);
  IF v_account_text IS NULL OR v_session_text IS NULL
     OR v_expiry_text IS NULL OR v_nonce IS NULL OR v_signature IS NULL
     OR v_account_text !~ '^[0-9a-fA-F-]{36}$'
     OR v_session_text !~ '^[0-9a-fA-F-]{36}$'
     OR v_expiry_text !~ '^[0-9]{1,12}$'
     OR v_nonce !~ '^[0-9a-fA-F-]{36}$'
     OR v_signature !~ '^[0-9a-f]{64}$' THEN
    RETURN NULL;
  END IF;
  v_account := v_account_text::UUID;
  v_session := v_session_text::UUID;
  IF unibud_private.current_account_id() IS DISTINCT FROM v_account THEN
    RETURN NULL;
  END IF;
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_expiry_text::BIGINT < v_now OR v_expiry_text::BIGINT > v_now + 120 THEN
    RETURN NULL;
  END IF;
  v_supplied := decode(v_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN NULL; END IF;

  FOR v_key IN
    SELECT secret FROM unibud_private.session_context_signing_keys
    WHERE active ORDER BY key_id
  LOOP
    v_expected := public.hmac(
      convert_to('v1:' || v_account_text || ':' || v_session_text || ':' ||
                 v_expiry_text || ':' || v_nonce, 'UTF8'),
      v_key, 'sha256'
    );
    v_diff := 0;
    FOR v_index IN 0..31 LOOP
      v_diff := v_diff | (get_byte(v_expected, v_index) # get_byte(v_supplied, v_index));
    END LOOP;
    IF v_diff = 0 THEN v_valid := TRUE; END IF;
  END LOOP;
  IF NOT v_valid THEN RETURN NULL; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.account_sessions s
    JOIN public.accounts a ON a.id = s.account_id
    WHERE s.id = v_session AND s.account_id = v_account
      AND s.status = 'active' AND s.revoked_at IS NULL
      AND s.issued_at <= statement_timestamp()
      AND s.idle_expires_at > statement_timestamp()
      AND s.absolute_expires_at > statement_timestamp()
      AND a.status = 'active'
  ) THEN RETURN NULL; END IF;
  RETURN v_session;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;
ALTER FUNCTION unibud_private.current_session_id() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.current_session_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION unibud_private.current_session_id() TO unibud_ops_owner;

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_consume_step_up(
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
  p_matched_totp_step BIGINT,
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
  v_diff INTEGER;
  v_i INTEGER;
  v_now BIGINT;
  v_updated UUID;
  v_valid BOOLEAN := FALSE;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_account IS NULL OR v_session IS NULL OR p_issued_at IS NULL
     OR p_expires_at IS NULL OR p_nonce IS NULL OR p_matched_totp_step IS NULL
     OR p_matched_totp_step < 0 OR p_signature IS NULL
     OR length(p_signature) <> 64 OR p_signature ~ '[^0-9a-f]'
     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;

  FOR v_key IN
    SELECT secret FROM unibud_private.operations_mfa_assertion_signing_keys
    WHERE active ORDER BY key_id
  LOOP
    v_expected := public.hmac(
      convert_to(
        'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
        p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
        p_nonce::TEXT || ':' || p_matched_totp_step::TEXT, 'UTF8'
      ), v_key, 'sha256'
    );
    v_diff := 0;
    FOR v_i IN 0..31 LOOP
      v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
    END LOOP;
    IF v_diff = 0 THEN v_valid := TRUE; END IF;
  END LOOP;
  IF NOT v_valid THEN RETURN FALSE; END IF;

  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0, locked_until = NULL, updated_at = clock_timestamp()
  WHERE account_id = v_account AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at));

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce)
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id, verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at, assertion_nonce=EXCLUDED.assertion_nonce;
  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN
  RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

COMMENT ON FUNCTION unibud_private.current_account_id() IS
'Validates short-lived account context against every active account-context verification key during a maximum-two-key rotation overlap.';
COMMENT ON FUNCTION unibud_private.current_session_id() IS
'Validates exact-session context against every active session verification key, then independently checks persisted live session state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a one-time exact-session MFA assertion signed by either active Operations MFA assertion key during the bounded rotation overlap.';

COMMIT;
