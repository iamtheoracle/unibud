-- Dual-control Operations operator-grant request, approval and revocation lifecycle.
-- Grant-management bootstrap permissions remain DBA-provisioned and cannot be
-- assigned through this workflow. No application role receives table mutation rights.
BEGIN;

ALTER TABLE public.unibud_operator_grants
  DROP CONSTRAINT unibud_operator_grants_permissions_check;
ALTER TABLE public.unibud_operator_grants
  ADD CONSTRAINT unibud_operator_grants_permissions_check CHECK (
    cardinality(permissions) > 0
    AND permissions <@ ARRAY[
      'integrations.verification_delivery.read',
      'integrations.oracle_arc.read',
      'dependencies.read',
      'operations.audit.read',
      'operations.accounts.support_read',
      'operations.mfa.security.request',
      'operations.mfa.security.approve',
      'operations.grants.request',
      'operations.grants.approve'
    ]::TEXT[]
  );

CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read','integrations.oracle_arc.read',
    'dependencies.read','operations.audit.read','operations.accounts.support_read',
    'operations.mfa.security.request','operations.mfa.security.approve',
    'operations.grants.request','operations.grants.approve'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id=g.account_id
    WHERE g.account_id=v_actor AND a.status='active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND p_permission=ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;
 
ALTER TABLE public.unibud_operator_mfa_api_rate_limits
  DROP CONSTRAINT unibud_operator_mfa_api_rate_limits_action_check;
ALTER TABLE public.unibud_operator_mfa_api_rate_limits
  ADD CONSTRAINT unibud_operator_mfa_api_rate_limits_action_check
  CHECK (action IN (
    'request_create','request_decide','request_cancel','request_read',
    'notification_read','audit_read','grant_request','grant_decide','grant_read'
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
    WHEN 'grant_read' THEN v_limit:=60; v_window:=60; v_permission:='operations.grants.approve';
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

CREATE FUNCTION unibud_private.operations_grant_permissions_valid(
  p_role TEXT,p_permissions TEXT[]
) RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path=pg_catalog
AS $function$
  SELECT CASE p_role
    WHEN 'platform_admin' THEN
      cardinality(p_permissions) BETWEEN 1 AND 7
      AND p_permissions <@ ARRAY[
        'integrations.verification_delivery.read','integrations.oracle_arc.read',
        'dependencies.read','operations.audit.read','operations.accounts.support_read',
        'operations.mfa.security.request','operations.mfa.security.approve'
      ]::TEXT[]
    WHEN 'operations_admin' THEN
      cardinality(p_permissions) BETWEEN 1 AND 7
      AND p_permissions <@ ARRAY[
        'integrations.verification_delivery.read','integrations.oracle_arc.read',
        'dependencies.read','operations.audit.read','operations.accounts.support_read',
        'operations.mfa.security.request','operations.mfa.security.approve'
      ]::TEXT[]
    WHEN 'integration_operator' THEN
      cardinality(p_permissions) BETWEEN 1 AND 3
      AND p_permissions <@ ARRAY[
        'integrations.verification_delivery.read','integrations.oracle_arc.read',
        'dependencies.read'
      ]::TEXT[]
    WHEN 'support_readonly' THEN
      cardinality(p_permissions) BETWEEN 1 AND 2
      AND p_permissions <@ ARRAY[
        'operations.audit.read','operations.accounts.support_read'
      ]::TEXT[]
    ELSE FALSE
  END
  AND cardinality(p_permissions)=cardinality(ARRAY(SELECT DISTINCT x FROM unnest(p_permissions) x));
$function$;
ALTER FUNCTION unibud_private.operations_grant_permissions_valid(TEXT,TEXT[]) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.operations_grant_permissions_valid(TEXT,TEXT[]) FROM PUBLIC;

CREATE TABLE public.unibud_operator_grant_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_action TEXT NOT NULL CHECK (requested_action IN ('grant','revoke')),
  target_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  target_grant_id UUID REFERENCES public.unibud_operator_grants(id) ON DELETE RESTRICT,
  requested_role TEXT CHECK (requested_role IS NULL OR requested_role IN (
    'platform_admin','operations_admin','integration_operator','support_readonly'
  )),
  requested_permissions TEXT[],
  requested_expires_at TIMESTAMPTZ,
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending','approved','rejected','cancelled','expired')),
  requester_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  requester_session_id UUID NOT NULL REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  approver_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  approver_session_id UUID REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  reason_code TEXT NOT NULL CHECK (reason_code ~ '^[a-z][a-z0-9_]{2,47}$'),
  decision_reason_code TEXT CHECK (decision_reason_code IS NULL OR decision_reason_code ~ '^[a-z][a-z0-9_]{2,47}$'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()+interval '30 minutes',
  decided_at TIMESTAMPTZ,
  created_grant_id UUID REFERENCES public.unibud_operator_grants(id) ON DELETE RESTRICT,
  CHECK (expires_at>created_at),
  CHECK (requester_account_id<>approver_account_id),
  CHECK (target_account_id<>approver_account_id),
  CHECK (
    (requested_action='grant' AND target_grant_id IS NULL
      AND requested_role IS NOT NULL AND requested_permissions IS NOT NULL
      AND requested_expires_at IS NOT NULL
      AND unibud_private.operations_grant_permissions_valid(requested_role,requested_permissions))
    OR
    (requested_action='revoke' AND target_grant_id IS NOT NULL
      AND requested_role IS NULL AND requested_permissions IS NULL
      AND requested_expires_at IS NULL)
  ),
  CHECK (
    (state='pending' AND approver_account_id IS NULL AND approver_session_id IS NULL
      AND decided_at IS NULL AND decision_reason_code IS NULL AND created_grant_id IS NULL)
    OR
    (state='approved' AND approver_account_id IS NOT NULL AND approver_session_id IS NOT NULL
      AND decided_at IS NOT NULL AND decision_reason_code IS NOT NULL)
    OR
    (state IN ('rejected','cancelled','expired') AND decided_at IS NOT NULL
      AND approver_account_id IS NULL AND approver_session_id IS NULL
      AND created_grant_id IS NULL)
  )
);
CREATE UNIQUE INDEX unibud_operator_grant_one_pending_target_idx
  ON public.unibud_operator_grant_requests(target_account_id,requested_action)
  WHERE state='pending';
CREATE INDEX unibud_operator_grant_requests_queue_idx
  ON public.unibud_operator_grant_requests(created_at DESC,request_id DESC)
  WHERE state='pending';
ALTER TABLE public.unibud_operator_grant_requests OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_operator_grant_requests
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;

CREATE FUNCTION public.unibud_operator_request_grant_change(
  p_action TEXT,p_target_account_id UUID,p_target_grant_id UUID,
  p_role TEXT,p_permissions TEXT[],p_expires_at TIMESTAMPTZ,p_reason_code TEXT,
  p_issued_at BIGINT,p_assertion_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID; v_request UUID; v_now TIMESTAMPTZ:=clock_timestamp();
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_target_account_id IS NULL
     OR p_action NOT IN ('grant','revoke')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.grants.request')
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('grant_request')
     OR NOT unibud_private.consume_operations_password_reauth_assertion(
       p_issued_at,p_assertion_expires_at,p_nonce,p_signature
     ) THEN RETURN NULL; END IF;
  IF p_target_account_id=v_actor OR NOT EXISTS(
    SELECT 1 FROM public.accounts a WHERE a.id=p_target_account_id AND a.status='active'
  ) THEN RETURN NULL; END IF;

  IF p_action='grant' THEN
    IF p_target_grant_id IS NOT NULL OR p_expires_at IS NULL
       OR p_expires_at<=v_now+interval '1 hour'
       OR p_expires_at>v_now+interval '90 days'
       OR NOT unibud_private.operations_grant_permissions_valid(p_role,p_permissions)
       OR p_permissions && ARRAY['operations.grants.request','operations.grants.approve']::TEXT[] THEN
      RETURN NULL;
    END IF;
  ELSE
    IF p_target_grant_id IS NULL OR p_role IS NOT NULL OR p_permissions IS NOT NULL OR p_expires_at IS NOT NULL
       OR NOT EXISTS(
         SELECT 1 FROM public.unibud_operator_grants g
         WHERE g.id=p_target_grant_id AND g.account_id=p_target_account_id
           AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>v_now)
           AND NOT (g.permissions && ARRAY['operations.grants.request','operations.grants.approve']::TEXT[])
       ) THEN RETURN NULL; END IF;
  END IF;

  INSERT INTO public.unibud_operator_grant_requests(
    requested_action,target_account_id,target_grant_id,requested_role,
    requested_permissions,requested_expires_at,requester_account_id,
    requester_session_id,reason_code
  ) VALUES(
    p_action,p_target_account_id,p_target_grant_id,p_role,p_permissions,p_expires_at,
    v_actor,v_session,p_reason_code
  ) RETURNING request_id INTO v_request;

  INSERT INTO public.unibud_operator_audit_events(
    actor_account_id,session_id,permission,outcome,request_id
  ) VALUES(v_actor,v_session,'operations.grants.request','allowed',v_request);
  RETURN v_request;
END
$function$;
ALTER FUNCTION public.unibud_operator_request_grant_change(TEXT,UUID,UUID,TEXT,TEXT[],TIMESTAMPTZ,TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_request_grant_change(TEXT,UUID,UUID,TEXT,TEXT[],TIMESTAMPTZ,TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_request_grant_change(TEXT,UUID,UUID,TEXT,TEXT[],TIMESTAMPTZ,TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

CREATE FUNCTION public.unibud_operator_decide_grant_change(
  p_request_id UUID,p_decision TEXT,p_reason_code TEXT,
  p_issued_at BIGINT,p_assertion_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_actor UUID; v_session UUID; v_request public.unibud_operator_grant_requests%ROWTYPE;
  v_now TIMESTAMPTZ; v_new_grant UUID;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_request_id IS NULL
     OR p_decision NOT IN ('approve','reject')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.grants.approve')
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('grant_decide')
     OR NOT unibud_private.consume_operations_password_reauth_assertion(
       p_issued_at,p_assertion_expires_at,p_nonce,p_signature
     ) THEN RETURN FALSE; END IF;

  SELECT * INTO v_request FROM public.unibud_operator_grant_requests
    WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  v_now:=clock_timestamp();
  IF v_request.state<>'pending' OR v_request.expires_at<=v_now
     OR v_request.requester_account_id=v_actor
     OR v_request.target_account_id=v_actor
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
      AND 'operations.grants.approve'=ANY(g.permissions)
      AND c.state='active' AND (c.locked_until IS NULL OR c.locked_until<=v_now)
      AND su.expires_at>v_now
  ) THEN RETURN FALSE; END IF;

  IF NOT EXISTS(
    SELECT 1 FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id=a.id
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    WHERE a.id=v_request.requester_account_id AND a.status='active'
      AND s.id=v_request.requester_session_id AND s.status='active'
      AND s.revoked_at IS NULL AND s.issued_at<=v_now
      AND s.idle_expires_at>v_now AND s.absolute_expires_at>v_now
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>v_now)
      AND 'operations.grants.request'=ANY(g.permissions)
      AND c.state='active' AND (c.locked_until IS NULL OR c.locked_until<=v_now)
  ) THEN RETURN FALSE; END IF;

  IF p_decision='approve' THEN
    IF NOT EXISTS(SELECT 1 FROM public.accounts a
      WHERE a.id=v_request.target_account_id AND a.status='active') THEN RETURN FALSE; END IF;
    IF v_request.requested_action='grant' THEN
      IF NOT unibud_private.operations_grant_permissions_valid(
        v_request.requested_role,v_request.requested_permissions)
        OR v_request.requested_permissions && ARRAY[
          'operations.grants.request','operations.grants.approve'
        ]::TEXT[] OR v_request.requested_expires_at<=v_now
        OR v_request.requested_expires_at>v_now+interval '90 days' THEN RETURN FALSE; END IF;
      INSERT INTO public.unibud_operator_grants(
        account_id,operator_role,permissions,granted_by,expires_at
      ) VALUES(v_request.target_account_id,v_request.requested_role,
        v_request.requested_permissions,v_actor,v_request.requested_expires_at)
      RETURNING id INTO v_new_grant;
    ELSE
      UPDATE public.unibud_operator_grants
        SET revoked_at=v_now,revocation_reason=p_reason_code
        WHERE id=v_request.target_grant_id
          AND account_id=v_request.target_account_id
          AND revoked_at IS NULL
          AND NOT (permissions && ARRAY[
            'operations.grants.request','operations.grants.approve'
          ]::TEXT[]);
      IF NOT FOUND THEN RETURN FALSE; END IF;
    END IF;
    UPDATE public.unibud_operator_grant_requests
      SET state='approved',approver_account_id=v_actor,approver_session_id=v_session,
          decision_reason_code=p_reason_code,decided_at=clock_timestamp(),
          created_grant_id=v_new_grant
      WHERE request_id=p_request_id AND state='pending'
        AND expires_at>clock_timestamp();
    IF NOT FOUND THEN RAISE EXCEPTION 'Grant request expired during approval'; END IF;
  ELSE
    UPDATE public.unibud_operator_grant_requests
      SET state='rejected',approver_account_id=v_actor,approver_session_id=v_session,
          decision_reason_code=p_reason_code,decided_at=clock_timestamp()
      WHERE request_id=p_request_id AND state='pending'
        AND expires_at>clock_timestamp();
    IF NOT FOUND THEN RETURN FALSE; END IF;
  END IF;

  INSERT INTO public.unibud_operator_audit_events(
    actor_account_id,session_id,permission,outcome,request_id
  ) VALUES(v_actor,v_session,'operations.grants.approve','allowed',p_request_id);
  RETURN TRUE;
END
$function$;
ALTER FUNCTION public.unibud_operator_decide_grant_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_decide_grant_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_decide_grant_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

CREATE FUNCTION public.unibud_operator_list_grant_requests(
  p_request_id UUID DEFAULT NULL,p_limit INTEGER DEFAULT 50,
  p_before_created_at TIMESTAMPTZ DEFAULT NULL,p_before_request_id UUID DEFAULT NULL
) RETURNS TABLE(
  request_id UUID,requested_action TEXT,target_account_id UUID,target_grant_id UUID,
  requested_role TEXT,requested_permissions TEXT[],requested_expires_at TIMESTAMPTZ,
  state TEXT,requester_account_id UUID,approver_account_id UUID,reason_code TEXT,
  created_at TIMESTAMPTZ,expires_at TIMESTAMPTZ,decided_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF p_limit IS NULL OR p_limit<1 OR p_limit>100
     OR ((p_before_created_at IS NULL)<>(p_before_request_id IS NULL)) THEN
    RAISE EXCEPTION 'Invalid Operations grant request query' USING ERRCODE='22023';
  END IF;
  IF unibud_private.current_account_id() IS NULL
     OR unibud_private.current_session_id() IS NULL
     OR NOT public.unibud_operator_has_permission('operations.grants.approve')
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('grant_read') THEN RETURN; END IF;
  IF p_request_id IS NOT NULL THEN
    RETURN QUERY SELECT r.request_id,r.requested_action,r.target_account_id,r.target_grant_id,
      r.requested_role,r.requested_permissions,r.requested_expires_at,r.state,
      r.requester_account_id,r.approver_account_id,r.reason_code,r.created_at,r.expires_at,r.decided_at
      FROM public.unibud_operator_grant_requests r WHERE r.request_id=p_request_id;
    RETURN;
  END IF;
  RETURN QUERY SELECT r.request_id,r.requested_action,r.target_account_id,r.target_grant_id,
    r.requested_role,r.requested_permissions,r.requested_expires_at,r.state,
    r.requester_account_id,r.approver_account_id,r.reason_code,r.created_at,r.expires_at,r.decided_at
    FROM public.unibud_operator_grant_requests r
    WHERE r.state='pending'
      AND (p_before_created_at IS NULL OR
        (r.created_at,r.request_id)<(p_before_created_at,p_before_request_id))
    ORDER BY r.created_at DESC,r.request_id DESC LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_operator_list_grant_requests(UUID,INTEGER,TIMESTAMPTZ,UUID)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_list_grant_requests(UUID,INTEGER,TIMESTAMPTZ,UUID)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_list_grant_requests(UUID,INTEGER,TIMESTAMPTZ,UUID)
  TO unibud_app;

COMMENT ON TABLE public.unibud_operator_grant_requests IS
'Protected dual-control grant/revocation requests. App roles have no direct table access; grant creation and revocation occur only in the independently approved SECURITY DEFINER transition.';
COMMENT ON FUNCTION public.unibud_operator_decide_grant_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT) IS
'Performs an atomic grant/revocation decision after independent actor, live exact-session MFA, password reauthentication, requester grant/session and current target state validation. Grant-management bootstrap permissions are never assignable through this workflow.';

COMMIT;
