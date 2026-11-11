-- Start authenticator enrollment only after a server-verified password
-- reauthentication assertion bound to the exact active Operations session.
BEGIN;

ALTER TABLE public.unibud_operator_mfa_assertion_nonces
  DROP CONSTRAINT unibud_operator_mfa_assertion_nonces_purpose_check;
ALTER TABLE public.unibud_operator_mfa_assertion_nonces
  ADD CONSTRAINT unibud_operator_mfa_assertion_nonces_purpose_check
  CHECK (purpose IN ('password_reauth','enrollment_confirm','step_up','recovery'));

CREATE FUNCTION public.unibud_operator_mfa_begin_enrollment(
  p_encrypted_secret TEXT,
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
  v_saved UUID;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;

  IF v_account IS NULL OR v_session IS NULL
     OR p_encrypted_secret IS NULL
     OR length(p_encrypted_secret) < 48 OR length(p_encrypted_secret) > 512
     OR p_encrypted_secret !~ '^v1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{27}$'
     OR p_issued_at IS NULL OR p_expires_at IS NULL OR p_nonce IS NULL
     OR p_signature IS NULL OR length(p_signature) <> 64
     OR p_signature ~ '[^0-9a-f]'
     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id = v_account
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND cardinality(g.permissions) > 0
  ) THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':password_reauth:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' || p_nonce::TEXT || ':-',
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature,'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- An active credential cannot be replaced through ordinary enrollment.
  -- An expired pending enrollment may be safely replaced by a new seed.
  INSERT INTO public.unibud_operator_mfa_credentials(
    account_id,encrypted_totp_secret,state,enrollment_expires_at,
    confirmed_at,last_accepted_totp_step,failed_attempt_count,locked_until
  ) VALUES (
    v_account,p_encrypted_secret,'pending',
    clock_timestamp()+interval '10 minutes',NULL,NULL,0,NULL
  )
  ON CONFLICT (account_id) DO UPDATE
    SET encrypted_totp_secret=EXCLUDED.encrypted_totp_secret,
        state='pending',
        enrollment_expires_at=EXCLUDED.enrollment_expires_at,
        confirmed_at=NULL,
        last_accepted_totp_step=NULL,
        failed_attempt_count=0,
        locked_until=NULL,
        updated_at=clock_timestamp()
  WHERE public.unibud_operator_mfa_credentials.state='pending'
    AND public.unibud_operator_mfa_credentials.enrollment_expires_at <= statement_timestamp()
  RETURNING account_id INTO v_saved;
  IF v_saved IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'password_reauth',to_timestamp(p_expires_at)
  );

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_begin_enrollment(TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_begin_enrollment(TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_begin_enrollment(TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

CREATE FUNCTION public.unibud_operator_mfa_read_encrypted_secret()
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
  ) THEN
    RETURN NULL;
  END IF;

  SELECT encrypted_totp_secret INTO v_secret
  FROM public.unibud_operator_mfa_credentials
  WHERE account_id = v_account
    AND (
      (state='pending' AND enrollment_expires_at > statement_timestamp())
      OR (state='active' AND (locked_until IS NULL OR locked_until <= statement_timestamp()))
    );
  RETURN v_secret;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_read_encrypted_secret() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_read_encrypted_secret() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_read_encrypted_secret() TO unibud_app;

COMMENT ON FUNCTION public.unibud_operator_mfa_begin_enrollment(TEXT,BIGINT,BIGINT,UUID,TEXT) IS
'Creates or replaces only an expired pending MFA enrollment after verifying a short-lived password_reauth assertion bound to the current live Operations session.';
COMMENT ON FUNCTION public.unibud_operator_mfa_read_encrypted_secret() IS
'Returns the encrypted TOTP envelope only for the current verified account/session with an active Operations grant; intended for server-side decryption only.';

COMMIT;
