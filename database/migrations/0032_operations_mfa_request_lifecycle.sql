-- Requester cancellation and bounded expiry processing for Operations MFA dual control.
BEGIN;

ALTER TABLE public.unibud_operator_mfa_events
  DROP CONSTRAINT unibud_operator_mfa_events_event_type_check;
ALTER TABLE public.unibud_operator_mfa_events
  ADD CONSTRAINT unibud_operator_mfa_events_event_type_check CHECK (event_type IN (
    'enrollment_started','enrollment_confirmed','challenge_failed',
    'challenge_succeeded','locked_out','recovery_code_redeemed',
    'recovery_codes_regenerated','credential_removed',
    'security_reset_requested','security_reset_approved',
    'security_reset_rejected','security_credential_disabled',
    'security_reset_cancelled','security_reset_expired'
  ));

CREATE FUNCTION public.unibud_operator_mfa_cancel_security_change(
  p_request_id UUID,p_reason_code TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID; v_request public.unibud_operator_mfa_security_requests%ROWTYPE;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_request_id IS NULL
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.mfa.security.request') THEN
    RETURN FALSE;
  END IF;
  SELECT * INTO v_request
    FROM public.unibud_operator_mfa_security_requests
    WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND OR v_request.state<>'pending'
     OR v_request.expires_at<=statement_timestamp()
     OR v_request.requester_account_id<>v_actor
     OR v_request.requester_session_id<>v_session THEN
    RETURN FALSE;
  END IF;
  UPDATE public.unibud_operator_mfa_security_requests
    SET state='cancelled',decided_at=clock_timestamp()
    WHERE request_id=p_request_id AND state='pending';
  IF NOT FOUND THEN RETURN FALSE; END IF;
  INSERT INTO public.unibud_operator_mfa_events(
    actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
  ) VALUES(v_actor,v_session,'security_reset_cancelled',
    v_request.target_account_id,p_request_id,p_reason_code);
  RETURN TRUE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_cancel_security_change(UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_cancel_security_change(UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_cancel_security_change(UUID,TEXT) TO unibud_app;

-- A bounded, idempotent sweep. It is deliberately unavailable to the app role;
-- a trusted scheduler/worker must invoke it using the NOLOGIN Operations owner.
CREATE FUNCTION unibud_private.expire_operations_mfa_security_requests(p_batch_size INTEGER DEFAULT 200)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE v_count INTEGER;
BEGIN
  IF p_batch_size IS NULL OR p_batch_size<1 OR p_batch_size>1000 THEN
    RAISE EXCEPTION 'Invalid expiry batch size' USING ERRCODE='22023';
  END IF;
  WITH due AS (
    SELECT request_id,target_account_id,reason_code
    FROM public.unibud_operator_mfa_security_requests
    WHERE state='pending' AND expires_at<=statement_timestamp()
    ORDER BY expires_at,created_at
    FOR UPDATE SKIP LOCKED
    LIMIT p_batch_size
  ), expired AS (
    UPDATE public.unibud_operator_mfa_security_requests r
      SET state='expired',decided_at=clock_timestamp()
      FROM due d
      WHERE r.request_id=d.request_id AND r.state='pending'
      RETURNING r.request_id,r.target_account_id,r.reason_code
  )
  INSERT INTO public.unibud_operator_mfa_events(
    actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
  )
  SELECT NULL,NULL,'security_reset_expired',target_account_id,request_id,'request_expired'
  FROM expired;
  GET DIAGNOSTICS v_count=ROW_COUNT;
  RETURN v_count;
END
$function$;
ALTER FUNCTION unibud_private.expire_operations_mfa_security_requests(INTEGER)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.expire_operations_mfa_security_requests(INTEGER)
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;
GRANT EXECUTE ON FUNCTION unibud_private.expire_operations_mfa_security_requests(INTEGER)
  TO unibud_ops_owner;

COMMENT ON FUNCTION public.unibud_operator_mfa_cancel_security_change(UUID,TEXT) IS
'Cancels only the caller original pending request, bound to the same verified account and exact persisted session with current MFA step-up.';
COMMENT ON FUNCTION unibud_private.expire_operations_mfa_security_requests(INTEGER) IS
'Idempotent bounded expiry worker. Only the trusted Operations owner may execute; expiry audit is explicitly system-attributed (NULL actor/session).';

COMMIT;
