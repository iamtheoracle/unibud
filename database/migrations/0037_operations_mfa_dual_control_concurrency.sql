-- Revalidate dual-control actors and request expiry after row-lock waits.
-- statement_timestamp() is fixed at statement start and can become stale while
-- SELECT ... FOR UPDATE waits. Sensitive decisions must use wall-clock time
-- after acquiring the request lock and immediately before terminal mutation.
BEGIN;

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_decide_security_change(
  p_request_id UUID,p_decision TEXT,p_reason_code TEXT,
  p_issued_at BIGINT,p_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
  v_request public.unibud_operator_mfa_security_requests%ROWTYPE;
  v_now TIMESTAMPTZ;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_request_id IS NULL
     OR p_decision IS NULL OR p_decision NOT IN ('approve','reject')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.mfa.security.approve')
     OR NOT unibud_private.consume_operations_password_reauth_assertion(
       p_issued_at,p_expires_at,p_nonce,p_signature
     ) THEN RETURN FALSE; END IF;

  -- Serialize every terminal transition on the request row. The expiry and
  -- actor checks below deliberately happen after this lock has been acquired.
  SELECT * INTO v_request
    FROM public.unibud_operator_mfa_security_requests
    WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  v_now:=clock_timestamp();
  IF v_request.state<>'pending'
     OR v_request.expires_at<=v_now
     OR to_timestamp(p_expires_at)<=v_now THEN
    RETURN FALSE;
  END IF;

  -- Revalidate the approver's live account, exact persisted session, scoped
  -- grant, active/unlocked authenticator and exact-session MFA step-up after
  -- any lock wait. A step-up that expires while waiting is not reusable.
  IF NOT EXISTS (
    SELECT 1
    FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id=a.id
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    JOIN public.unibud_operator_mfa_step_up_sessions su
      ON su.account_id=a.id AND su.session_id=s.id
    WHERE a.id=v_actor AND a.status='active'
      AND s.id=v_session AND s.status='active' AND s.revoked_at IS NULL
      AND s.issued_at<=v_now
      AND s.idle_expires_at>v_now AND s.absolute_expires_at>v_now
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>v_now)
      AND 'operations.mfa.security.approve'=ANY(g.permissions)
      AND c.state='active'
      AND (c.locked_until IS NULL OR c.locked_until<=v_now)
      AND su.expires_at>v_now
  ) THEN RETURN FALSE; END IF;

  -- Revalidate the requester's original account, grant, MFA credential and
  -- exact persisted session. The requester need not remain logged in at
  -- approval time, but the recorded session must still be live and unrevoked.
  IF NOT EXISTS (
    SELECT 1
    FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id=a.id
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    WHERE a.id=v_request.requester_account_id AND a.status='active'
      AND s.id=v_request.requester_session_id AND s.status='active'
      AND s.revoked_at IS NULL AND s.issued_at<=v_now
      AND s.idle_expires_at>v_now AND s.absolute_expires_at>v_now
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>v_now)
      AND 'operations.mfa.security.request'=ANY(g.permissions)
      AND c.state='active'
      AND (c.locked_until IS NULL OR c.locked_until<=v_now)
  ) THEN RETURN FALSE; END IF;

  IF p_decision='approve' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.accounts a
      JOIN public.unibud_operator_grants g ON g.account_id=a.id
      JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
      WHERE a.id=v_request.target_account_id AND a.status='active'
        AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>v_now)
        AND cardinality(g.permissions)>0
        AND c.state='active'
        AND (c.locked_until IS NULL OR c.locked_until<=v_now)
    ) THEN RETURN FALSE; END IF;

    UPDATE public.unibud_operator_mfa_security_requests
      SET state='completed',approver_account_id=v_actor,approver_session_id=v_session,
          decided_at=clock_timestamp(),completed_at=clock_timestamp()
      WHERE request_id=p_request_id AND state='pending'
        AND expires_at>clock_timestamp();
    IF NOT FOUND THEN RETURN FALSE; END IF;

    DELETE FROM public.unibud_operator_mfa_step_up_sessions
      WHERE account_id=v_request.target_account_id;
    DELETE FROM public.unibud_operator_mfa_recovery_codes
      WHERE account_id=v_request.target_account_id;
    DELETE FROM public.unibud_operator_mfa_credentials
      WHERE account_id=v_request.target_account_id;
    INSERT INTO public.unibud_operator_mfa_events(
      actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
    ) VALUES(v_actor,v_session,
      CASE WHEN v_request.requested_action='disable'
        THEN 'security_credential_disabled' ELSE 'security_reset_approved' END,
      v_request.target_account_id,p_request_id,p_reason_code);
  ELSE
    UPDATE public.unibud_operator_mfa_security_requests
      SET state='rejected',approver_account_id=v_actor,approver_session_id=v_session,
          decided_at=clock_timestamp()
      WHERE request_id=p_request_id AND state='pending'
        AND expires_at>clock_timestamp();
    IF NOT FOUND THEN RETURN FALSE; END IF;
    INSERT INTO public.unibud_operator_mfa_events(
      actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
    ) VALUES(v_actor,v_session,'security_reset_rejected',
      v_request.target_account_id,p_request_id,p_reason_code);
  END IF;
  RETURN TRUE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_cancel_security_change(
  p_request_id UUID,p_reason_code TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
  v_request public.unibud_operator_mfa_security_requests%ROWTYPE;
  v_now TIMESTAMPTZ;
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
  IF NOT FOUND THEN RETURN FALSE; END IF;

  v_now:=clock_timestamp();
  IF v_request.state<>'pending' OR v_request.expires_at<=v_now
     OR v_request.requester_account_id<>v_actor
     OR v_request.requester_session_id<>v_session
     OR NOT EXISTS (
       SELECT 1
       FROM public.accounts a
       JOIN public.account_sessions s ON s.account_id=a.id
       JOIN public.unibud_operator_grants g ON g.account_id=a.id
       JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
       JOIN public.unibud_operator_mfa_step_up_sessions su
         ON su.account_id=a.id AND su.session_id=s.id
       WHERE a.id=v_actor AND a.status='active'
         AND s.id=v_session AND s.status='active' AND s.revoked_at IS NULL
         AND s.issued_at<=v_now
         AND s.idle_expires_at>v_now AND s.absolute_expires_at>v_now
         AND g.revoked_at IS NULL
         AND (g.expires_at IS NULL OR g.expires_at>v_now)
         AND 'operations.mfa.security.request'=ANY(g.permissions)
         AND c.state='active'
         AND (c.locked_until IS NULL OR c.locked_until<=v_now)
         AND su.expires_at>v_now
     ) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.unibud_operator_mfa_security_requests
    SET state='cancelled',decided_at=clock_timestamp()
    WHERE request_id=p_request_id AND state='pending'
      AND expires_at>clock_timestamp();
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

COMMENT ON FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT) IS
'Performs one dual-control terminal transition under a row lock. Revalidates expiry, actor session, grant and MFA step-up using wall-clock time after lock acquisition; approval invalidates target MFA state atomically.';
COMMENT ON FUNCTION public.unibud_operator_mfa_cancel_security_change(UUID,TEXT) IS
'Cancels only the original requester's pending request on the same live exact session. Expiry, grant, authenticator and MFA step-up are revalidated after acquiring the request row lock.';

COMMIT;
