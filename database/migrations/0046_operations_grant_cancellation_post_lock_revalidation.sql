-- Revalidate grant-request cancellation using wall-clock time after any row-lock wait.
BEGIN;

CREATE OR REPLACE FUNCTION public.unibud_operator_cancel_grant_change(
  p_request_id UUID,p_reason_code TEXT,
  p_issued_at BIGINT,p_assertion_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
  v_request public.unibud_operator_grant_requests%ROWTYPE;
  v_now TIMESTAMPTZ;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_request_id IS NULL
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.grants.request')
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('grant_cancel')
     OR NOT unibud_private.consume_operations_password_reauth_assertion(
       p_issued_at,p_assertion_expires_at,p_nonce,p_signature
     ) THEN RETURN FALSE; END IF;

  SELECT * INTO v_request FROM public.unibud_operator_grant_requests
    WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- A lock wait can outlive the request, session, authenticator or step-up.
  -- Capture wall-clock time only after the request row is exclusively locked.
  v_now:=clock_timestamp();
  IF v_request.state<>'pending'
     OR v_request.expires_at<=v_now
     OR v_request.requester_account_id<>v_actor
     OR v_request.requester_session_id<>v_session
     OR to_timestamp(p_assertion_expires_at)<=v_now THEN RETURN FALSE; END IF;

  IF NOT EXISTS(
    SELECT 1 FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id=a.id
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    JOIN public.unibud_operator_mfa_step_up_sessions su
      ON su.account_id=a.id AND su.session_id=s.id
    WHERE a.id=v_actor AND a.status='active'
      AND s.id=v_session AND s.status='active' AND s.revoked_at IS NULL
      AND s.issued_at<=v_now AND s.idle_expires_at>v_now AND s.absolute_expires_at>v_now
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>v_now)
      AND 'operations.grants.request'=ANY(g.permissions)
      AND c.state='active' AND (c.locked_until IS NULL OR c.locked_until<=v_now)
      AND su.expires_at>v_now
  ) THEN RETURN FALSE; END IF;

  UPDATE public.unibud_operator_grant_requests
    SET state='cancelled',decided_at=clock_timestamp(),decision_reason_code=p_reason_code
    WHERE request_id=p_request_id AND state='pending'
      AND requester_account_id=v_actor AND requester_session_id=v_session
      AND expires_at>clock_timestamp();
  IF NOT FOUND THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_audit_events(
    actor_account_id,session_id,permission,outcome,request_id
  ) VALUES(v_actor,v_session,'operations.grants.request','allowed',p_request_id);
  RETURN TRUE;
END
$function$;
ALTER FUNCTION public.unibud_operator_cancel_grant_change(UUID,TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_cancel_grant_change(UUID,TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_cancel_grant_change(UUID,TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

COMMENT ON FUNCTION public.unibud_operator_cancel_grant_change(UUID,TEXT,BIGINT,BIGINT,UUID,TEXT) IS
'Cancels only the original requester pending request in the exact same persisted session. Revalidates request expiry, assertion expiry, live session, scoped grant, authenticator and MFA step-up using wall-clock time after acquiring the request row lock.';

COMMIT;
