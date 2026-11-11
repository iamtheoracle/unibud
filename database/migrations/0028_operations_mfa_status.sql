-- Expose only the current operator's own MFA enrollment and exact-session assurance state.
BEGIN;

CREATE FUNCTION public.unibud_operator_mfa_get_status()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_session UUID;
  v_operator BOOLEAN := FALSE;
  v_state TEXT;
  v_enrollment_expires TIMESTAMPTZ;
  v_locked_until TIMESTAMPTZ;
  v_step_up_expires TIMESTAMPTZ;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_account IS NULL OR v_session IS NULL THEN
    RETURN jsonb_build_object(
      'operator',false,'credentialState','none','locked',false,
      'stepUpExpiresAt',NULL
    );
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id=v_account AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND cardinality(g.permissions)>0
  ) INTO v_operator;
  IF NOT v_operator THEN
    RETURN jsonb_build_object(
      'operator',false,'credentialState','none','locked',false,
      'stepUpExpiresAt',NULL
    );
  END IF;

  SELECT state,enrollment_expires_at,locked_until
  INTO v_state,v_enrollment_expires,v_locked_until
  FROM public.unibud_operator_mfa_credentials
  WHERE account_id=v_account;

  SELECT expires_at INTO v_step_up_expires
  FROM public.unibud_operator_mfa_step_up_sessions
  WHERE account_id=v_account AND session_id=v_session
    AND expires_at>statement_timestamp();

  RETURN jsonb_build_object(
    'operator',true,
    'credentialState',CASE
      WHEN v_state='pending' AND v_enrollment_expires<=statement_timestamp() THEN 'expired'
      ELSE COALESCE(v_state,'none')
    END,
    'enrollmentExpiresAt',CASE
      WHEN v_state='pending' THEN v_enrollment_expires
      ELSE NULL
    END,
    'locked',v_locked_until IS NOT NULL AND v_locked_until>statement_timestamp(),
    'lockedUntil',CASE
      WHEN v_locked_until>statement_timestamp() THEN v_locked_until
      ELSE NULL
    END,
    'stepUpExpiresAt',v_step_up_expires
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_get_status() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_get_status() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_get_status() TO unibud_app;
COMMENT ON FUNCTION public.unibud_operator_mfa_get_status() IS
'Returns only the current verified account and exact session MFA status; accepts no caller-supplied identity.';

COMMIT;
