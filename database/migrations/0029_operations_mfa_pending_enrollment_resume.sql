-- Reissue pending TOTP provisioning details only after current-session password reauthentication.
BEGIN;

CREATE FUNCTION public.unibud_operator_mfa_read_pending_secret(
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
  p_signature TEXT
) RETURNS TEXT
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
  v_secret TEXT;
BEGIN
  v_account:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  v_now:=floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_account IS NULL OR v_session IS NULL
     OR p_issued_at IS NULL OR p_expires_at IS NULL OR p_nonce IS NULL
     OR p_signature IS NULL OR length(p_signature)<>64 OR p_signature~'[^0-9a-f]'
     OR p_issued_at>v_now+5 OR p_expires_at<v_now
     OR p_expires_at<=p_issued_at OR p_expires_at-p_issued_at>120 THEN
    RETURN NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id=v_account AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND cardinality(g.permissions)>0
  ) THEN RETURN NULL; END IF;

  SELECT secret INTO v_key FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active ORDER BY created_at DESC LIMIT 1;
  IF v_key IS NULL THEN RETURN NULL; END IF;
  v_expected:=public.hmac(convert_to(
    'v1:'||v_account::TEXT||':'||v_session::TEXT||':password_reauth:'||
    p_issued_at::TEXT||':'||p_expires_at::TEXT||':'||p_nonce::TEXT||':-','UTF8'),
    v_key,'sha256');
  v_supplied:=decode(p_signature,'hex');
  IF octet_length(v_supplied)<>32 THEN RETURN NULL; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff:=v_diff|(get_byte(v_expected,v_i)#get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff<>0 THEN RETURN NULL; END IF;

  SELECT encrypted_totp_secret INTO v_secret
  FROM public.unibud_operator_mfa_credentials
  WHERE account_id=v_account AND state='pending'
    AND enrollment_expires_at>statement_timestamp()
    AND (locked_until IS NULL OR locked_until<=statement_timestamp());
  IF v_secret IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (p_nonce,v_account,v_session,'password_reauth',to_timestamp(p_expires_at));
  RETURN v_secret;
EXCEPTION
  WHEN unique_violation THEN RETURN NULL;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_read_pending_secret(BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_read_pending_secret(BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_read_pending_secret(BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;
COMMENT ON FUNCTION public.unibud_operator_mfa_read_pending_secret(BIGINT,BIGINT,UUID,TEXT) IS
'Returns only the current verified operator session pending encrypted seed after a fresh signed password_reauth assertion; consumes the assertion nonce.';

COMMIT;
