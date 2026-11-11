-- Database-enforced per-operator throttling for privileged MFA request APIs.
BEGIN;

CREATE TABLE public.unibud_operator_mfa_api_rate_limits (
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('request_create','request_decide','request_cancel','request_read')),
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count>=0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(account_id,action)
);
ALTER TABLE public.unibud_operator_mfa_api_rate_limits OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_operator_mfa_api_rate_limits
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;

CREATE FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(p_action TEXT)
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
  IF v_actor IS NULL OR unibud_private.current_session_id() IS NULL THEN
    RETURN FALSE;
  END IF;

  CASE p_action
    WHEN 'request_create' THEN v_limit:=5; v_window:=900; v_permission:='operations.mfa.security.request';
    WHEN 'request_decide' THEN v_limit:=10; v_window:=900; v_permission:='operations.mfa.security.approve';
    WHEN 'request_cancel' THEN v_limit:=10; v_window:=900; v_permission:='operations.mfa.security.request';
    WHEN 'request_read' THEN
      v_limit:=60; v_window:=60;
      IF NOT (
        public.unibud_operator_has_permission('operations.mfa.security.approve')
        OR public.unibud_operator_has_permission('operations.mfa.security.request')
      ) THEN RETURN FALSE; END IF;
    ELSE RETURN FALSE;
  END CASE;

  IF v_permission IS NOT NULL
     AND NOT public.unibud_operator_has_permission(v_permission) THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.unibud_operator_mfa_api_rate_limits(
    account_id,action,window_started_at,request_count,updated_at
  ) VALUES(v_actor,p_action,v_now,1,v_now)
  ON CONFLICT(account_id,action) DO UPDATE SET
    window_started_at=CASE
      WHEN public.unibud_operator_mfa_api_rate_limits.window_started_at
        + (v_window * interval '1 second')<=v_now THEN v_now
      ELSE public.unibud_operator_mfa_api_rate_limits.window_started_at END,
    request_count=CASE
      WHEN public.unibud_operator_mfa_api_rate_limits.window_started_at
        + (v_window * interval '1 second')<=v_now THEN 1
      ELSE public.unibud_operator_mfa_api_rate_limits.request_count+1 END,
    updated_at=v_now
  RETURNING request_count INTO v_count;

  RETURN v_count<=v_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT) TO unibud_app;

COMMENT ON FUNCTION public.unibud_operator_mfa_consume_api_rate_limit(TEXT) IS
'Atomically throttles privileged Operations MFA request APIs per authenticated account. Limits and permission mapping are fixed server-side; current exact-session MFA step-up and scoped grants are required.';

COMMIT;
