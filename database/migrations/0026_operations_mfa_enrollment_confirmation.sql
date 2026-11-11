-- Confirm authenticator enrollment atomically; enforce failed-code lockout.
BEGIN;

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_read_encrypted_secret()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_session UUID;
  v_secret TEXT;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_account IS NULL OR v_session IS NULL THEN RETURN NULL; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id = v_account
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND cardinality(g.permissions) > 0
  ) THEN RETURN NULL; END IF;

  SELECT encrypted_totp_secret INTO v_secret
  FROM public.unibud_operator_mfa_credentials
  WHERE account_id = v_account
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND (
      (state = 'pending' AND enrollment_expires_at > statement_timestamp())
      OR state = 'active'
    );
  RETURN v_secret;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_read_encrypted_secret() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_read_encrypted_secret() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_read_encrypted_secret() TO unibud_app;

CREATE FUNCTION public.unibud_operator_mfa_record_failed_attempt()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_session UUID;
  v_count INTEGER;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_account IS NULL OR v_session IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id = v_account AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND cardinality(g.permissions) > 0
  ) THEN RETURN NULL; END IF;

  UPDATE public.unibud_operator_mfa_credentials
  SET failed_attempt_count = LEAST(failed_attempt_count + 1, 10),
      locked_until = CASE
        WHEN failed_attempt_count + 1 >= 10 THEN clock_timestamp() + interval '15 minutes'
        ELSE locked_until
      END,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND (state = 'active' OR (state = 'pending' AND enrollment_expires_at > statement_timestamp()))
  RETURNING failed_attempt_count INTO v_count;
  RETURN v_count;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_record_failed_attempt() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_record_failed_attempt() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_record_failed_attempt() TO unibud_app;

CREATE FUNCTION public.unibud_operator_mfa_confirm_enrollment(
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
  p_matched_totp_step BIGINT,
  p_signature TEXT,
  p_recovery_digests TEXT[]
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
  v_state UUID;
  v_digest TEXT;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_account IS NULL OR v_session IS NULL
     OR p_issued_at IS NULL OR p_expires_at IS NULL OR p_nonce IS NULL
     OR p_matched_totp_step IS NULL OR p_matched_totp_step < 0
     OR p_signature IS NULL OR length(p_signature) <> 64 OR p_signature ~ '[^0-9a-f]'
     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120
     OR p_recovery_digests IS NULL OR cardinality(p_recovery_digests) < 8
     OR cardinality(p_recovery_digests) > 16 THEN
    RETURN FALSE;
  END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(p_recovery_digests) AS d(value)
    WHERE value IS NULL OR value !~ '^[0-9a-f]{64}$'
  ) OR (SELECT count(DISTINCT value) FROM unnest(p_recovery_digests) AS d(value))
       <> cardinality(p_recovery_digests) THEN
    RETURN FALSE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id = v_account AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND cardinality(g.permissions) > 0
  ) THEN RETURN FALSE; END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active ORDER BY created_at DESC LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;
  v_expected := public.hmac(convert_to(
    'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':enrollment_confirm:' ||
    p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
    p_nonce::TEXT || ':' || p_matched_totp_step::TEXT, 'UTF8'), v_key, 'sha256');
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  UPDATE public.unibud_operator_mfa_credentials
  SET state = 'active',
      confirmed_at = clock_timestamp(),
      last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account AND state = 'pending'
    AND enrollment_expires_at > statement_timestamp()
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step IS NULL
  RETURNING account_id INTO v_state;
  IF v_state IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce, account_id, session_id, purpose, expires_at
  ) VALUES (p_nonce, v_account, v_session, 'enrollment_confirm', to_timestamp(p_expires_at));

  FOREACH v_digest IN ARRAY p_recovery_digests LOOP
    INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id, code_digest)
    VALUES (v_account, decode(v_digest, 'hex'));
  END LOOP;
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_confirm_enrollment(BIGINT,BIGINT,UUID,BIGINT,TEXT,TEXT[])
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_confirm_enrollment(BIGINT,BIGINT,UUID,BIGINT,TEXT,TEXT[])
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_confirm_enrollment(BIGINT,BIGINT,UUID,BIGINT,TEXT,TEXT[])
  TO unibud_app;

COMMENT ON FUNCTION public.unibud_operator_mfa_confirm_enrollment(BIGINT,BIGINT,UUID,BIGINT,TEXT,TEXT[]) IS
'Verifies a server-signed TOTP acceptance assertion and atomically activates the current-session pending credential, consumes the assertion nonce, and stores distinct recovery-code digests.';
COMMENT ON FUNCTION public.unibud_operator_mfa_record_failed_attempt() IS
'Atomically increments current operator MFA failures and locks verification for 15 minutes at ten failures.';

COMMIT;
