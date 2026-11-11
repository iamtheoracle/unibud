-- Bounded maintenance for expired Operations MFA ephemeral state.
-- This worker is deliberately callable only by the trusted Operations owner.
BEGIN;

CREATE FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(
  p_batch_size INTEGER DEFAULT 200
)
RETURNS TABLE(
  expired_requests INTEGER,
  expired_step_up_sessions INTEGER,
  expired_assertion_nonces INTEGER,
  stale_rate_limit_buckets INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  IF p_batch_size IS NULL OR p_batch_size<1 OR p_batch_size>1000 THEN
    RAISE EXCEPTION 'Invalid maintenance batch size' USING ERRCODE='22023';
  END IF;

  SELECT unibud_private.expire_operations_mfa_security_requests(p_batch_size)
    INTO expired_requests;

  WITH due AS (
    SELECT session_id
    FROM public.unibud_operator_mfa_step_up_sessions
    WHERE expires_at<=statement_timestamp()
    ORDER BY expires_at,session_id
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  )
  DELETE FROM public.unibud_operator_mfa_step_up_sessions s
  USING due d
  WHERE s.session_id=d.session_id;
  GET DIAGNOSTICS expired_step_up_sessions=ROW_COUNT;

  -- Retain consumed nonces for 24 hours beyond assertion expiry to preserve
  -- replay evidence and accommodate delayed/retried requests. Step-up rows
  -- are removed first because their FK intentionally restricts nonce deletion.
  WITH due AS (
    SELECT nonce
    FROM public.unibud_operator_mfa_assertion_nonces
    WHERE expires_at<statement_timestamp()-interval '24 hours'
    ORDER BY expires_at,nonce
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  )
  DELETE FROM public.unibud_operator_mfa_assertion_nonces n
  USING due d
  WHERE n.nonce=d.nonce
    AND NOT EXISTS(
      SELECT 1 FROM public.unibud_operator_mfa_step_up_sessions s
      WHERE s.assertion_nonce=n.nonce
    );
  GET DIAGNOSTICS expired_assertion_nonces=ROW_COUNT;

  WITH due AS (
    SELECT account_id,action
    FROM public.unibud_operator_mfa_api_rate_limits
    WHERE updated_at<statement_timestamp()-interval '24 hours'
    ORDER BY updated_at,account_id,action
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  )
  DELETE FROM public.unibud_operator_mfa_api_rate_limits r
  USING due d
  WHERE r.account_id=d.account_id AND r.action=d.action;
  GET DIAGNOSTICS stale_rate_limit_buckets=ROW_COUNT;

  RETURN NEXT;
END
$function$;

ALTER FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(INTEGER)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(INTEGER)
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;
GRANT EXECUTE ON FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(INTEGER)
  TO unibud_ops_owner;

COMMENT ON FUNCTION unibud_private.maintain_operations_mfa_ephemeral_state(INTEGER) IS
'Bounded Operations-owned maintenance: expires pending security requests, removes expired exact-session step-ups, retains consumed assertion nonces for 24 hours beyond expiry before cleanup, and removes stale rate-limit buckets. Only a trusted scheduler/worker may execute it; this function does not itself schedule recurring execution.';

COMMIT;
