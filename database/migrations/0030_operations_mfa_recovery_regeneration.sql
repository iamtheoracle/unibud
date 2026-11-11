-- Regenerate recovery codes only after current-session password reauthentication and fresh MFA step-up.
BEGIN;

ALTER TABLE public.unibud_operator_mfa_events
  DROP CONSTRAINT unibud_operator_mfa_events_event_type_check;
ALTER TABLE public.unibud_operator_mfa_events
  ADD CONSTRAINT unibud_operator_mfa_events_event_type_check
  CHECK (event_type IN (
    'enrollment_started','enrollment_confirmed','challenge_failed',
    'challenge_succeeded','locked_out','recovery_code_redeemed',
    'recovery_codes_regenerated','credential_removed'
  ));

CREATE FUNCTION public.unibud_operator_mfa_regenerate_recovery_codes(
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
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
  v_diff INTEGER:=0;
  v_i INTEGER;
  v_now BIGINT;
  v_active UUID;
  v_digest TEXT;
BEGIN
  v_account:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  v_now:=floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_account IS NULL OR v_session IS NULL
     OR p_issued_at IS NULL OR p_expires_at IS NULL OR p_nonce IS NULL
     OR p_signature IS NULL OR length(p_signature)<>64 OR p_signature~'[^0-9a-f]'
     OR p_issued_at>v_now+5 OR p_expires_at<v_now
     OR p_expires_at<=p_issued_at OR p_expires_at-p_issued_at>120
     OR p_recovery_digests IS NULL OR cardinality(p_recovery_digests)<8
     OR cardinality(p_recovery_digests)>16 THEN RETURN FALSE; END IF;
  IF EXISTS (
    SELECT 1 FROM unnest(p_recovery_digests) AS d(value)
    WHERE value IS NULL OR value !~ '^[0-9a-f]{64}$'
  ) OR (SELECT count(DISTINCT value) FROM unnest(p_recovery_digests) AS d(value))
       <>cardinality(p_recovery_digests) THEN RETURN FALSE; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id=v_account AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND cardinality(g.permissions)>0
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;
  SELECT account_id INTO v_active
  FROM public.unibud_operator_mfa_credentials
  WHERE account_id=v_account AND state='active'
    AND (locked_until IS NULL OR locked_until<=statement_timestamp());
  IF v_active IS NULL THEN RETURN FALSE; END IF;

  SELECT secret INTO v_key FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active ORDER BY created_at DESC LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;
  v_expected:=public.hmac(convert_to(
    'v1:'||v_account::TEXT||':'||v_session::TEXT||':password_reauth:'||
    p_issued_at::TEXT||':'||p_expires_at::TEXT||':'||p_nonce::TEXT||':-','UTF8'),
    v_key,'sha256');
  v_supplied:=decode(p_signature,'hex');
  IF octet_length(v_supplied)<>32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff:=v_diff|(get_byte(v_expected,v_i)#get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff<>0 THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (p_nonce,v_account,v_session,'password_reauth',to_timestamp(p_expires_at));

  DELETE FROM public.unibud_operator_mfa_recovery_codes WHERE account_id=v_account;
  FOREACH v_digest IN ARRAY p_recovery_digests LOOP
    INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest)
    VALUES (v_account,decode(v_digest,'hex'));
  END LOOP;
  INSERT INTO public.unibud_operator_mfa_events(actor_account_id,session_id,event_type)
  VALUES (v_account,v_session,'recovery_codes_regenerated');
  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_regenerate_recovery_codes(BIGINT,BIGINT,UUID,TEXT,TEXT[])
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_regenerate_recovery_codes(BIGINT,BIGINT,UUID,TEXT,TEXT[])
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_regenerate_recovery_codes(BIGINT,BIGINT,UUID,TEXT,TEXT[])
  TO unibud_app;
COMMENT ON FUNCTION public.unibud_operator_mfa_regenerate_recovery_codes(BIGINT,BIGINT,UUID,TEXT,TEXT[]) IS
'Requires a fresh password_reauth assertion and current exact-session MFA step-up; atomically replaces all recovery-code digests and records the regeneration event.';

COMMIT;
