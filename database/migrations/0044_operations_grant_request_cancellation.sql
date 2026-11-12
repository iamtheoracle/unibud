-- Same-session requester cancellation for pending Operations grant changes.
BEGIN;

ALTER TABLE public.unibud_operator_mfa_api_rate_limits
  DROP CONSTRAINT unibud_operator_mfa_api_rate_limits_action_check;
ALTER TABLE public.unibud_operator_mfa_api_rate_limits
  ADD CONSTRAINT unibud_operator_mfa_api_rate_limits_action_check
  CHECK (action IN (
    'request_create','request_decide','request_cancel','request_read',
    'notification_read','audit_read','grant_request','grant_decide','grant_read','grant_cancel'
  ));

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_actor UUID; v_limit INTEGER; v_window INTEGER; v_permission TEXT;
  v_count INTEGER; v_now TIMESTAMPTZ:=clock_timestamp();
BEGIN
  v_actor:=unibud_private.current_account_id();
  IF v_actor IS NULL OR unibud_private.current_session_id() IS NULL THEN RETURN FALSE; END IF;
  CASE p_action
    WHEN 'request_create' THEN v_limit:=5; v_window:=900; v_permission:='operations.mfa.security.request';
    WHEN 'request_decide' THEN v_limit:=10; v_window:=900; v_permission:='operations.mfa.security.approve';
    WHEN 'request_cancel' THEN v_limit:=10; v_window:=900; v_permission:='operations.mfa.security.request';
    WHEN 'request_read' THEN
      v_limit:=60; v_window:=60;
      IF NOT (public.unibud_operator_has_permission('operations.mfa.security.approve')
        OR public.unibud_operator_has_permission('operations.mfa.security.request')) THEN RETURN FALSE; END IF;
    WHEN 'notification_read' THEN v_limit:=60; v_window:=60;
    WHEN 'audit_read' THEN v_limit:=30; v_window:=60; v_permission:='operations.audit.read';
    WHEN 'grant_request' THEN v_limit:=5; v_window:=900; v_permission:='operations.grants.request';
    WHEN 'grant_decide' THEN v_limit:=10; v_window:=900; v_permission:='operations.grants.approve';
    WHEN 'grant_read' THEN
      v_limit:=60; v_window:=60;
      IF NOT (public.unibud_operator_has_permission('operations.grants.approve')
        OR public.unibud_operator_has_permission('operations.grants.request')) THEN RETURN FALSE; END IF;
    WHEN 'grant_cancel' THEN v_limit:=10; v_window:=900; v_permission:='operations.grants.request';
    ELSE RETURN FALSE;
  END CASE;
  IF v_permission IS NOT NULL AND NOT public.unibud_operator_has_permission(v_permission) THEN RETURN FALSE; END IF;
  INSERT INTO public.unibud_operator_mfa_api_rate_limits(account_id,action,window_started_at,request_count,updated_at)
  VALUES(v_actor,p_action,v_now,1,v_now)
  ON CONFLICT(account_id,action) DO UPDATE SET
    window_started_at=CASE
      WHEN public.unibud_operator_mfa_api_rate_limits.window_started_at+(v_window*interval '1 second')<=v_now THEN v_now
      ELSE public.unibud_operator_mfa_api_rate_limits.window_started_at END,
    request_count=CASE
      WHEN public.unibud_operator_mfa_api_rate_limits.window_started_at+(v_window*interval '1 second')<=v_now THEN 1
      ELSE public.unibud_operator_mfa_api_rate_limits.request_count+1 END,
    updated_at=v_now
  RETURNING request_count INTO v_count;
  RETURN v_count<=v_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT) TO unibud_app;

CREATE FUNCTION public.unibud_operator_cancel_grant_change(
  p_request_id UUID,p_reason_code TEXT,
  p_issued_at BIGINT,p_assertion_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_actor UUID; v_session UUID; v_request public.unibud_operator_grant_requests%ROWTYPE;
  v_now TIMESTAMPTZ:=clock_timestamp();
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
  IF NOT FOUND OR v_request.state<>'pending'
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
'Cancels only the still-pending request created by the current account in the exact same persisted session, with live MFA step-up and single-use password reauthentication.';

COMMIT;
