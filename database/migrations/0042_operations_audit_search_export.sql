-- Permission-gated, bounded Operations audit search and export read model.
BEGIN;

ALTER TABLE public.unibud_operator_mfa_api_rate_limits
  DROP CONSTRAINT unibud_operator_mfa_api_rate_limits_action_check;
ALTER TABLE public.unibud_operator_mfa_api_rate_limits
  ADD CONSTRAINT unibud_operator_mfa_api_rate_limits_action_check
  CHECK (action IN ('request_create','request_decide','request_cancel','request_read','notification_read','audit_read'));

CREATE OR REPLACE FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(p_action TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_limit INTEGER;
  v_window INTEGER;
  v_permission TEXT;
  v_count INTEGER;
  v_now TIMESTAMPTZ:=clock_timestamp();
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
    WHEN 'notification_read' THEN
      -- Security notices remain available to validated sessions before step-up.
      v_limit:=60; v_window:=60;
    WHEN 'audit_read' THEN v_limit:=30; v_window:=60; v_permission:='operations.audit.read';
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

CREATE FUNCTION public.unibud_operator_search_audit_events(
  p_from TIMESTAMPTZ,
  p_to TIMESTAMPTZ,
  p_permission TEXT DEFAULT NULL,
  p_outcome TEXT DEFAULT NULL,
  p_actor UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 100,
  p_before_occurred_at TIMESTAMPTZ DEFAULT NULL,
  p_before_id BIGINT DEFAULT NULL
)
RETURNS TABLE(
  event_id BIGINT,
  actor_account_id UUID,
  session_id UUID,
  permission TEXT,
  outcome TEXT,
  request_id UUID,
  occurred_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
BEGIN
  IF p_from IS NULL OR p_to IS NULL OR p_from>=p_to
     OR p_to>statement_timestamp()+interval '1 minute'
     OR p_from<p_to-interval '90 days'
     OR p_limit IS NULL OR p_limit<1 OR p_limit>1000
     OR ((p_before_occurred_at IS NULL)<>(p_before_id IS NULL))
     OR (p_permission IS NOT NULL AND p_permission !~ '^[a-z][a-z0-9_.]{2,100}$')
     OR (p_outcome IS NOT NULL AND p_outcome NOT IN ('allowed','denied','unauthenticated','error')) THEN
    RAISE EXCEPTION 'Invalid Operations audit query' USING ERRCODE='22023';
  END IF;
  IF unibud_private.current_account_id() IS NULL
     OR unibud_private.current_session_id() IS NULL
     OR NOT public.unibud_operator_has_permission('operations.audit.read') THEN
    RETURN;
  END IF;
  RETURN QUERY
    SELECT e.id,e.actor_account_id,e.session_id,e.permission,e.outcome,e.request_id,e.occurred_at
    FROM public.unibud_operator_audit_events e
    WHERE e.occurred_at>=p_from AND e.occurred_at<p_to
      AND (p_permission IS NULL OR e.permission=p_permission)
      AND (p_outcome IS NULL OR e.outcome=p_outcome)
      AND (p_actor IS NULL OR e.actor_account_id=p_actor)
      AND (p_before_occurred_at IS NULL OR (e.occurred_at,e.id)<(p_before_occurred_at,p_before_id))
    ORDER BY e.occurred_at DESC,e.id DESC
    LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_search_audit_events(TIMESTAMPTZ,TIMESTAMPTZ,TEXT,TEXT,UUID,INTEGER,TIMESTAMPTZ,BIGINT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_search_audit_events(TIMESTAMPTZ,TIMESTAMPTZ,TEXT,TEXT,UUID,INTEGER,TIMESTAMPTZ,BIGINT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_search_audit_events(TIMESTAMPTZ,TIMESTAMPTZ,TEXT,TEXT,UUID,INTEGER,TIMESTAMPTZ,BIGINT)
  TO unibud_app;
COMMENT ON FUNCTION public.unibud_operator_search_audit_events(TIMESTAMPTZ,TIMESTAMPTZ,TEXT,TEXT,UUID,INTEGER,TIMESTAMPTZ,BIGINT) IS
'Searches append-only Operations audit metadata for the current exact-session, MFA-stepped-up account with operations.audit.read. Time range is limited to 90 days and result page to 1000 rows; no request bodies, secrets or personal contact fields are exposed.';

COMMIT;
