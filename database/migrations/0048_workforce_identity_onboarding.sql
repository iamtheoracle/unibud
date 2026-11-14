-- Governed workforce identity, username issuance, first-login activation and duty audit.
-- Apply after 0047_operations_grant_notifications.sql.
-- Workforce titles are classifications, never a substitute for explicit permissions.
BEGIN;

-- Dedicated workforce permissions are explicit and remain subject to MFA step-up.
ALTER TABLE public.unibud_operator_grants
  DROP CONSTRAINT unibud_operator_grants_operator_role_check;
ALTER TABLE public.unibud_operator_grants
  ADD CONSTRAINT unibud_operator_grants_operator_role_check
  CHECK (operator_role IN (
    'platform_admin','operations_admin','integration_operator','support_readonly',
    'workforce_self'
  ));

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
      'operations.grants.approve',
      'operations.workforce.self_access',
      'operations.workforce.read',
      'operations.workforce.request',
      'operations.workforce.approve'
    ]::TEXT[]
  );

CREATE OR REPLACE FUNCTION unibud_private.operations_grant_permissions_valid(
  p_role TEXT,p_permissions TEXT[]
) RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path=pg_catalog
AS $function$
  SELECT CASE p_role
    WHEN 'platform_admin' THEN
      cardinality(p_permissions) BETWEEN 1 AND 13
      AND p_permissions <@ ARRAY[
        'integrations.verification_delivery.read','integrations.oracle_arc.read',
        'dependencies.read','operations.audit.read','operations.accounts.support_read',
        'operations.mfa.security.request','operations.mfa.security.approve',
        'operations.grants.request','operations.grants.approve',
        'operations.workforce.read','operations.workforce.request','operations.workforce.approve'
      ]::TEXT[]
    WHEN 'operations_admin' THEN
      cardinality(p_permissions) BETWEEN 1 AND 13
      AND p_permissions <@ ARRAY[
        'integrations.verification_delivery.read','integrations.oracle_arc.read',
        'dependencies.read','operations.audit.read','operations.accounts.support_read',
        'operations.mfa.security.request','operations.mfa.security.approve',
        'operations.grants.request','operations.grants.approve',
        'operations.workforce.read','operations.workforce.request','operations.workforce.approve'
      ]::TEXT[]
    WHEN 'integration_operator' THEN
      cardinality(p_permissions) BETWEEN 1 AND 3
      AND p_permissions <@ ARRAY[
        'integrations.verification_delivery.read','integrations.oracle_arc.read','dependencies.read'
      ]::TEXT[]
    WHEN 'support_readonly' THEN
      cardinality(p_permissions) BETWEEN 1 AND 3
      AND p_permissions <@ ARRAY[
        'operations.audit.read','operations.accounts.support_read','operations.workforce.read'
      ]::TEXT[]
    WHEN 'workforce_self' THEN
      cardinality(p_permissions)=1
      AND p_permissions <@ ARRAY['operations.workforce.self_access']::TEXT[]
    ELSE FALSE
  END
  AND cardinality(p_permissions)=cardinality(
    ARRAY(SELECT DISTINCT permission FROM unnest(p_permissions) AS item(permission))
  );
$function$;
ALTER FUNCTION unibud_private.operations_grant_permissions_valid(TEXT,TEXT[]) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.operations_grant_permissions_valid(TEXT,TEXT[]) FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read','integrations.oracle_arc.read',
    'dependencies.read','operations.audit.read','operations.accounts.support_read',
    'operations.mfa.security.request','operations.mfa.security.approve',
    'operations.grants.request','operations.grants.approve',
    'operations.workforce.self_access','operations.workforce.read',
    'operations.workforce.request','operations.workforce.approve'
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
    'notification_read','audit_read','grant_request','grant_decide','grant_read',
    'workforce_request','workforce_decide','workforce_read'
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
    WHEN 'workforce_request' THEN v_limit:=5; v_window:=900; v_permission:='operations.workforce.request';
    WHEN 'workforce_decide' THEN v_limit:=10; v_window:=900; v_permission:='operations.workforce.approve';
    WHEN 'workforce_read' THEN
      v_limit:=60; v_window:=60;
      IF NOT (public.unibud_operator_has_permission('operations.workforce.read')
        OR public.unibud_operator_has_permission('operations.workforce.approve')) THEN RETURN FALSE; END IF;
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

CREATE TABLE public.unibud_workforce_invitation_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_role TEXT NOT NULL CHECK (requested_role IN ('staff','operator','admin')),
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending','approved','rejected','cancelled','expired')),
  requester_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  requester_session_id UUID NOT NULL REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  approver_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  approver_session_id UUID REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  reason_code TEXT NOT NULL CHECK (reason_code ~ '^[a-z][a-z0-9_]{2,47}$'),
  decision_reason_code TEXT CHECK (decision_reason_code IS NULL OR decision_reason_code ~ '^[a-z][a-z0-9_]{2,47}$'),
  workforce_account_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()+interval '30 minutes',
  decided_at TIMESTAMPTZ,
  CHECK (expires_at>created_at),
  CHECK (requester_account_id<>approver_account_id),
  CHECK (
    (state='pending' AND approver_account_id IS NULL AND approver_session_id IS NULL
      AND workforce_account_id IS NULL AND decided_at IS NULL AND decision_reason_code IS NULL)
    OR
    (state='approved' AND approver_account_id IS NOT NULL AND approver_session_id IS NOT NULL
      AND workforce_account_id IS NOT NULL AND decided_at IS NOT NULL AND decision_reason_code IS NOT NULL)
    OR
    (state='rejected' AND approver_account_id IS NOT NULL AND approver_session_id IS NOT NULL
      AND workforce_account_id IS NULL AND decided_at IS NOT NULL AND decision_reason_code IS NOT NULL)
    OR
    (state IN ('cancelled','expired') AND approver_account_id IS NULL AND approver_session_id IS NULL
      AND workforce_account_id IS NULL AND decided_at IS NOT NULL AND decision_reason_code IS NOT NULL)
  )
);

CREATE TABLE public.unibud_workforce_accounts (
  workforce_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE RESTRICT,
  username TEXT NOT NULL UNIQUE CHECK (username ~ '^ub-(staff|operator|admin)-[a-f0-9]{16}$'),
  workforce_role TEXT NOT NULL CHECK (workforce_role IN ('staff','operator','admin')),
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN (
    'invited','email_verification_pending','mfa_enrollment_required','active','suspended','revoked'
  )),
  activation_code_digest BYTEA NOT NULL CHECK (octet_length(activation_code_digest)=32),
  activation_expires_at TIMESTAMPTZ NOT NULL,
  activation_attempts INTEGER NOT NULL DEFAULT 0 CHECK (activation_attempts BETWEEN 0 AND 5),
  activation_consumed_at TIMESTAMPTZ,
  first_name TEXT,
  last_name TEXT,
  email_identity_id UUID UNIQUE REFERENCES public.authentication_identities(id) ON DELETE RESTRICT,
  email_verified_at TIMESTAMPTZ,
  passcode_hash TEXT CHECK (
    passcode_hash IS NULL OR
    passcode_hash ~ '^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$'
  ),
  passcode_changed_at TIMESTAMPTZ,
  created_by_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  approved_by_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  mfa_enrolled_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ,
  CHECK ((first_name IS NULL AND last_name IS NULL AND email_identity_id IS NULL
          AND passcode_hash IS NULL AND passcode_changed_at IS NULL)
      OR (first_name IS NOT NULL AND last_name IS NOT NULL AND email_identity_id IS NOT NULL
          AND passcode_hash IS NOT NULL AND passcode_changed_at IS NOT NULL)),
  CHECK (status<>'invited' OR activation_consumed_at IS NULL),
  CHECK (status NOT IN ('email_verification_pending','mfa_enrollment_required','active') OR activation_consumed_at IS NOT NULL),
  CHECK ((email_verified_at IS NULL) OR email_identity_id IS NOT NULL),
  CHECK ((mfa_enrolled_at IS NULL) OR email_verified_at IS NOT NULL),
  CHECK (status<>'active' OR (onboarding_completed_at IS NOT NULL AND mfa_enrolled_at IS NOT NULL))
);

ALTER TABLE public.unibud_workforce_invitation_requests
  ADD CONSTRAINT unibud_workforce_invitation_workforce_fk
  FOREIGN KEY (workforce_account_id) REFERENCES public.unibud_workforce_accounts(workforce_id) ON DELETE RESTRICT;

CREATE INDEX unibud_workforce_status_idx
  ON public.unibud_workforce_accounts(status,created_at DESC);
CREATE INDEX unibud_workforce_role_idx
  ON public.unibud_workforce_accounts(workforce_role,status);

CREATE TABLE public.unibud_workforce_audit_events (
  event_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  actor_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  actor_session_id UUID REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  subject_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  workforce_id UUID REFERENCES public.unibud_workforce_accounts(workforce_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type ~ '^[a-z][a-z0-9_.]{2,80}$'),
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','denied','success','failure')),
  request_id UUID NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(event_data)='object'),
  CHECK ((actor_account_id IS NULL)=(actor_session_id IS NULL))
);
CREATE INDEX unibud_workforce_audit_actor_time_idx
  ON public.unibud_workforce_audit_events(actor_account_id,occurred_at DESC)
  WHERE actor_account_id IS NOT NULL;
CREATE INDEX unibud_workforce_audit_subject_time_idx
  ON public.unibud_workforce_audit_events(subject_account_id,occurred_at DESC)
  WHERE subject_account_id IS NOT NULL;
CREATE INDEX unibud_workforce_audit_type_time_idx
  ON public.unibud_workforce_audit_events(event_type,occurred_at DESC);

ALTER TABLE public.unibud_workforce_invitation_requests OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_workforce_accounts OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_workforce_audit_events OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_workforce_invitation_requests,
  public.unibud_workforce_accounts,public.unibud_workforce_audit_events
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;
GRANT SELECT,INSERT,UPDATE ON public.accounts,public.authentication_identities TO unibud_ops_owner;
GRANT EXECUTE ON FUNCTION unibud_private.secure_bytea_equal(BYTEA,BYTEA) TO unibud_ops_owner;

CREATE FUNCTION unibud_private.prevent_workforce_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  RAISE EXCEPTION 'Workforce audit events are immutable' USING ERRCODE='55000';
END
$function$;
ALTER FUNCTION unibud_private.prevent_workforce_audit_mutation() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.prevent_workforce_audit_mutation() FROM PUBLIC;
CREATE TRIGGER unibud_workforce_audit_immutable
BEFORE UPDATE OR DELETE ON public.unibud_workforce_audit_events
FOR EACH ROW EXECUTE FUNCTION unibud_private.prevent_workforce_audit_mutation();

CREATE FUNCTION public.unibud_workforce_request_invitation(
  p_role TEXT,p_reason_code TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID; v_request UUID;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_role IS NULL
     OR p_role NOT IN ('staff','operator','admin')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.workforce.request')
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('workforce_request') THEN
    RETURN NULL;
  END IF;
  INSERT INTO public.unibud_workforce_invitation_requests(
    requested_role,requester_account_id,requester_session_id,reason_code
  ) VALUES(p_role,v_actor,v_session,p_reason_code)
  RETURNING request_id INTO v_request;
  INSERT INTO public.unibud_workforce_audit_events(
    actor_account_id,actor_session_id,event_type,outcome,request_id,event_data
  ) VALUES(v_actor,v_session,'workforce.invitation.requested','success',v_request,
    jsonb_build_object('requestedRole',p_role,'reasonCode',p_reason_code));
  RETURN v_request;
END
$function$;
ALTER FUNCTION public.unibud_workforce_request_invitation(TEXT,TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_request_invitation(TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_request_invitation(TEXT,TEXT) TO unibud_app;

CREATE FUNCTION public.unibud_workforce_list_invitation_requests(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  request_id UUID,requested_role TEXT,state TEXT,requester_account_id UUID,
  created_at TIMESTAMPTZ,expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF NOT (public.unibud_operator_has_permission('operations.workforce.read')
       OR public.unibud_operator_has_permission('operations.workforce.approve'))
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('workforce_read')
     OR p_limit IS NULL OR p_limit<1 OR p_limit>100 THEN RETURN; END IF;
  RETURN QUERY SELECT r.request_id,r.requested_role,r.state,r.requester_account_id,r.created_at,r.expires_at
    FROM public.unibud_workforce_invitation_requests r
    WHERE r.state='pending' AND r.expires_at>statement_timestamp()
    ORDER BY r.created_at,r.request_id LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_workforce_list_invitation_requests(INTEGER) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_list_invitation_requests(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_list_invitation_requests(INTEGER) TO unibud_app;

CREATE FUNCTION public.unibud_workforce_decide_invitation(
  p_request_id UUID,p_decision TEXT,p_reason_code TEXT,
  p_username TEXT,p_activation_digest BYTEA
) RETURNS TABLE(workforce_id UUID,account_id UUID,username TEXT,decision_state TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_actor UUID; v_session UUID; v_request public.unibud_workforce_invitation_requests%ROWTYPE;
  v_workforce UUID; v_account UUID; v_prefix TEXT;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL
     OR p_request_id IS NULL OR p_decision IS NULL OR p_decision NOT IN ('approve','reject')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.workforce.approve')
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('workforce_decide') THEN RETURN; END IF;

  SELECT * INTO v_request FROM public.unibud_workforce_invitation_requests
    WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND OR v_request.state<>'pending' OR v_request.expires_at<=statement_timestamp()
     OR v_request.requester_account_id=v_actor THEN RETURN; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id=a.id
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    WHERE a.id=v_request.requester_account_id AND a.status='active'
      AND s.id=v_request.requester_session_id AND s.status='active' AND s.revoked_at IS NULL
      AND s.issued_at<=statement_timestamp() AND s.idle_expires_at>statement_timestamp()
      AND s.absolute_expires_at>statement_timestamp()
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND 'operations.workforce.request'=ANY(g.permissions)
      AND c.state='active' AND (c.locked_until IS NULL OR c.locked_until<=statement_timestamp())
  ) THEN RETURN; END IF;

  IF v_request.requested_role='admin' AND NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id=v_actor AND g.operator_role='platform_admin'
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND 'operations.workforce.approve'=ANY(g.permissions)
  ) THEN RETURN; END IF;
  IF v_request.requested_role='operator' AND NOT EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    WHERE g.account_id=v_actor AND g.operator_role IN ('platform_admin','operations_admin')
      AND g.revoked_at IS NULL AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND 'operations.workforce.approve'=ANY(g.permissions)
  ) THEN RETURN; END IF;

  IF p_decision='reject' THEN
    UPDATE public.unibud_workforce_invitation_requests SET state='rejected',
      approver_account_id=v_actor,approver_session_id=v_session,
      decision_reason_code=p_reason_code,decided_at=clock_timestamp()
    WHERE request_id=p_request_id;
    INSERT INTO public.unibud_workforce_audit_events(
      actor_account_id,actor_session_id,event_type,outcome,request_id,event_data
    ) VALUES(v_actor,v_session,'workforce.invitation.rejected','success',p_request_id,
      jsonb_build_object('requestedRole',v_request.requested_role,'reasonCode',p_reason_code));
    RETURN QUERY SELECT NULL::UUID,NULL::UUID,NULL::TEXT,'rejected'::TEXT;
    RETURN;
  END IF;

  v_prefix:=CASE v_request.requested_role
    WHEN 'staff' THEN 'ub-staff-'
    WHEN 'operator' THEN 'ub-operator-'
    ELSE 'ub-admin-' END;
  IF p_username IS NULL OR p_username !~ ('^'||v_prefix||'[a-f0-9]{16}$')
     OR p_activation_digest IS NULL OR octet_length(p_activation_digest)<>32 THEN RETURN; END IF;

  v_account:=gen_random_uuid();
  v_workforce:=gen_random_uuid();
  INSERT INTO public.accounts(id,status) VALUES(v_account,'pending_verification');
  INSERT INTO public.unibud_workforce_accounts(
    workforce_id,account_id,username,workforce_role,status,
    activation_code_digest,activation_expires_at,created_by_account_id,approved_by_account_id
  ) VALUES(
    v_workforce,v_account,p_username,v_request.requested_role,'invited',
    p_activation_digest,clock_timestamp()+interval '15 minutes',
    v_request.requester_account_id,v_actor
  );
  -- This narrow self-access grant permits the person to enrol MFA and view
  -- their own workforce landing page; it grants no staff data or admin action.
  INSERT INTO public.unibud_operator_grants(
    account_id,operator_role,permissions,granted_by,expires_at
  ) VALUES(
    v_account,'workforce_self',ARRAY['operations.workforce.self_access']::TEXT[],
    v_actor,NULL
  );
  UPDATE public.unibud_workforce_invitation_requests SET state='approved',
    approver_account_id=v_actor,approver_session_id=v_session,
    workforce_account_id=v_workforce,decision_reason_code=p_reason_code,
    decided_at=clock_timestamp()
  WHERE request_id=p_request_id;
  INSERT INTO public.unibud_workforce_audit_events(
    actor_account_id,actor_session_id,subject_account_id,workforce_id,
    event_type,outcome,request_id,event_data
  ) VALUES(v_actor,v_session,v_account,v_workforce,'workforce.invitation.approved','success',p_request_id,
    jsonb_build_object('workforceRole',v_request.requested_role,'username',p_username,'reasonCode',p_reason_code));
  RETURN QUERY SELECT v_workforce,v_account,p_username,'approved'::TEXT;
END
$function$;
ALTER FUNCTION public.unibud_workforce_decide_invitation(UUID,TEXT,TEXT,TEXT,BYTEA) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_decide_invitation(UUID,TEXT,TEXT,TEXT,BYTEA) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_decide_invitation(UUID,TEXT,TEXT,TEXT,BYTEA) TO unibud_app;

CREATE FUNCTION public.unibud_workforce_activate(
  p_username TEXT,p_activation_digest BYTEA,p_first_name TEXT,p_last_name TEXT,
  p_email_identity_id UUID,p_email_ciphertext BYTEA,p_email_lookup_digest BYTEA,p_passcode_hash TEXT
) RETURNS TABLE(account_id UUID,identity_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_workforce public.unibud_workforce_accounts%ROWTYPE; v_identity UUID;
BEGIN
  IF p_username IS NULL OR p_username !~ '^ub-(staff|operator|admin)-[a-f0-9]{16}$'
     OR p_activation_digest IS NULL OR octet_length(p_activation_digest)<>32
     OR p_first_name IS NULL OR length(trim(p_first_name)) NOT BETWEEN 1 AND 80
     OR p_last_name IS NULL OR length(trim(p_last_name)) NOT BETWEEN 1 AND 80
     OR p_email_identity_id IS NULL
     OR p_email_ciphertext IS NULL OR octet_length(p_email_ciphertext)<30 OR octet_length(p_email_ciphertext)>2048
     OR p_email_lookup_digest IS NULL OR octet_length(p_email_lookup_digest)<>32
     OR p_passcode_hash IS NULL
     OR p_passcode_hash !~ '^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$' THEN
    RAISE EXCEPTION 'Invalid workforce activation payload' USING ERRCODE='22023';
  END IF;

  SELECT * INTO v_workforce FROM public.unibud_workforce_accounts
    WHERE username=p_username FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  IF v_workforce.status<>'invited' OR v_workforce.activation_consumed_at IS NOT NULL
     OR v_workforce.activation_expires_at<=statement_timestamp()
     OR v_workforce.activation_attempts>=5 THEN RETURN; END IF;

  IF NOT unibud_private.secure_bytea_equal(v_workforce.activation_code_digest,p_activation_digest) THEN
    UPDATE public.unibud_workforce_accounts
      SET activation_attempts=LEAST(activation_attempts+1,5),
          status=CASE WHEN activation_attempts+1>=5 THEN 'revoked' ELSE status END,
          updated_at=clock_timestamp()
    WHERE workforce_id=v_workforce.workforce_id;
    INSERT INTO public.unibud_workforce_audit_events(
      subject_account_id,workforce_id,event_type,outcome,request_id,event_data
    ) VALUES(v_workforce.account_id,v_workforce.workforce_id,'workforce.activation.failed','failure',gen_random_uuid(),
      jsonb_build_object('attempts',LEAST(v_workforce.activation_attempts+1,5)));
    RETURN;
  END IF;

  v_identity:=p_email_identity_id;
  INSERT INTO public.authentication_identities(
    id,account_id,issuer,subject,method,identifier_ciphertext,
    identifier_lookup_digest,is_primary,status
  ) VALUES(
    v_identity,v_workforce.account_id,'urn:unibud:workforce',gen_random_uuid()::TEXT,
    'email',p_email_ciphertext,p_email_lookup_digest,true,'active'
  );
  UPDATE public.unibud_workforce_accounts
    SET status='email_verification_pending',
        activation_consumed_at=clock_timestamp(),
        first_name=trim(p_first_name),last_name=trim(p_last_name),
        email_identity_id=v_identity,passcode_hash=p_passcode_hash,
        passcode_changed_at=clock_timestamp(),updated_at=clock_timestamp()
    WHERE workforce_id=v_workforce.workforce_id;
  INSERT INTO public.unibud_workforce_audit_events(
    subject_account_id,workforce_id,event_type,outcome,request_id,event_data
  ) VALUES(v_workforce.account_id,v_workforce.workforce_id,'workforce.activation.started','success',gen_random_uuid(),
    jsonb_build_object('emailVerificationRequired',true,'mfaRequired',true));
  RETURN QUERY SELECT v_workforce.account_id,v_identity;
EXCEPTION WHEN unique_violation THEN
  RETURN;
END
$function$;
ALTER FUNCTION public.unibud_workforce_activate(TEXT,BYTEA,TEXT,TEXT,UUID,BYTEA,BYTEA,TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_activate(TEXT,BYTEA,TEXT,TEXT,UUID,BYTEA,BYTEA,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_activate(TEXT,BYTEA,TEXT,TEXT,UUID,BYTEA,BYTEA,TEXT) TO unibud_auth;

CREATE FUNCTION public.unibud_workforce_lookup_login(p_username TEXT)
RETURNS TABLE(account_id UUID,account_status TEXT,workforce_status TEXT,passcode_hash TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
  SELECT w.account_id,a.status,w.status,w.passcode_hash
  FROM public.unibud_workforce_accounts w
  JOIN public.accounts a ON a.id=w.account_id
  WHERE w.username=lower(trim(p_username))
    AND w.status IN ('mfa_enrollment_required','active')
    AND w.email_verified_at IS NOT NULL
  LIMIT 1
$function$;
ALTER FUNCTION public.unibud_workforce_lookup_login(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_lookup_login(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_lookup_login(TEXT) TO unibud_auth;

CREATE FUNCTION public.unibud_workforce_record_login(
  p_username_digest BYTEA,p_username TEXT,p_outcome TEXT,p_request_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE v_account UUID; v_workforce UUID;
BEGIN
  IF p_username_digest IS NULL OR octet_length(p_username_digest)<>32
     OR p_username IS NULL OR length(p_username)>100
     OR p_outcome IS NULL OR p_outcome NOT IN ('success','failure') OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid workforce login audit event' USING ERRCODE='22023';
  END IF;
  SELECT account_id,workforce_id INTO v_account,v_workforce
    FROM public.unibud_workforce_accounts WHERE username=lower(trim(p_username));
  INSERT INTO public.unibud_workforce_audit_events(
    subject_account_id,workforce_id,event_type,outcome,request_id,event_data
  ) VALUES(v_account,v_workforce,'workforce.login.'||p_outcome,
    p_outcome,p_request_id,jsonb_build_object('usernameDigest',encode(p_username_digest,'hex')));
END
$function$;
ALTER FUNCTION public.unibud_workforce_record_login(BYTEA,TEXT,TEXT,UUID) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_record_login(BYTEA,TEXT,TEXT,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_record_login(BYTEA,TEXT,TEXT,UUID) TO unibud_auth;

CREATE FUNCTION public.unibud_workforce_get_self()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_actor UUID; v_workforce public.unibud_workforce_accounts%ROWTYPE;
BEGIN
  v_actor:=unibud_private.current_account_id();
  IF v_actor IS NULL OR unibud_private.current_session_id() IS NULL
     OR NOT public.unibud_operator_has_permission('operations.workforce.self_access') THEN
    RETURN NULL;
  END IF;
  SELECT * INTO v_workforce FROM public.unibud_workforce_accounts
    WHERE account_id=v_actor AND status='active';
  IF NOT FOUND THEN RETURN NULL; END IF;
  RETURN jsonb_build_object(
    'username',v_workforce.username,'role',v_workforce.workforce_role,
    'firstName',v_workforce.first_name,'lastName',v_workforce.last_name,
    'emailVerifiedAt',v_workforce.email_verified_at,
    'mfaEnrolledAt',v_workforce.mfa_enrolled_at,
    'onboardingCompletedAt',v_workforce.onboarding_completed_at,
    'recentActivity',COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'eventType',activity.event_type,'outcome',activity.outcome,
        'occurredAt',activity.occurred_at,'resourceType',activity.resource_type,
        'resourceId',activity.resource_id
      ) ORDER BY activity.occurred_at DESC)
      FROM (
        SELECT event_type,outcome,occurred_at,resource_type,resource_id
        FROM public.unibud_workforce_audit_events
        WHERE workforce_id=v_workforce.workforce_id
        ORDER BY occurred_at DESC,event_id DESC LIMIT 20
      ) activity
    ),'[]'::JSONB)
  );
END
$function$;
ALTER FUNCTION public.unibud_workforce_get_self() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_get_self() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_get_self() TO unibud_app;

CREATE FUNCTION public.unibud_workforce_list_directory(p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  workforce_id UUID,username TEXT,workforce_role TEXT,status TEXT,
  first_name TEXT,last_name TEXT,created_at TIMESTAMPTZ,
  onboarding_completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF NOT (public.unibud_operator_has_permission('operations.workforce.read')
       OR public.unibud_operator_has_permission('operations.workforce.approve'))
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('workforce_read')
     OR p_limit IS NULL OR p_limit<1 OR p_limit>100 THEN RETURN; END IF;
  RETURN QUERY
    SELECT w.workforce_id,w.username,w.workforce_role,w.status,
      w.first_name,w.last_name,w.created_at,w.onboarding_completed_at
    FROM public.unibud_workforce_accounts w
    ORDER BY w.created_at DESC,w.workforce_id LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_workforce_list_directory(INTEGER) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_list_directory(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_list_directory(INTEGER) TO unibud_app;

CREATE FUNCTION public.unibud_workforce_list_activity(p_workforce_id UUID,p_limit INTEGER DEFAULT 50)
RETURNS TABLE(
  event_id BIGINT,occurred_at TIMESTAMPTZ,actor_account_id UUID,actor_session_id UUID,
  event_type TEXT,outcome TEXT,request_id UUID,resource_type TEXT,resource_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF p_workforce_id IS NULL
     OR NOT (public.unibud_operator_has_permission('operations.workforce.read')
       OR public.unibud_operator_has_permission('operations.workforce.approve'))
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('workforce_read')
     OR p_limit IS NULL OR p_limit<1 OR p_limit>100 THEN RETURN; END IF;
  RETURN QUERY
    SELECT e.event_id,e.occurred_at,e.actor_account_id,e.actor_session_id,
      e.event_type,e.outcome,e.request_id,e.resource_type,e.resource_id
    FROM public.unibud_workforce_audit_events e
    WHERE e.workforce_id=p_workforce_id
    ORDER BY e.occurred_at DESC,e.event_id DESC LIMIT p_limit;
END
$function$;
ALTER FUNCTION public.unibud_workforce_list_activity(UUID,INTEGER) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_list_activity(UUID,INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_list_activity(UUID,INTEGER) TO unibud_app;

CREATE FUNCTION public.unibud_workforce_get_metrics()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF NOT (public.unibud_operator_has_permission('operations.workforce.read')
       OR public.unibud_operator_has_permission('operations.workforce.approve'))
     OR NOT public.unibud_operator_mfa_consume_api_rate_limit('workforce_read') THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
    'total', (SELECT count(*) FROM public.unibud_workforce_accounts),
    'active', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE status='active'),
    'invited', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE status='invited'),
    'emailVerificationPending', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE status='email_verification_pending'),
    'mfaEnrollmentRequired', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE status='mfa_enrollment_required'),
    'suspended', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE status='suspended'),
    'staff', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE workforce_role='staff'),
    'operators', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE workforce_role='operator'),
    'administrators', (SELECT count(*) FROM public.unibud_workforce_accounts WHERE workforce_role='admin'),
    'eventsLast24Hours', (SELECT count(*) FROM public.unibud_workforce_audit_events WHERE occurred_at>=statement_timestamp()-interval '24 hours'),
    'loginFailuresLast24Hours', (SELECT count(*) FROM public.unibud_workforce_audit_events
      WHERE event_type='workforce.login.failure' AND occurred_at>=statement_timestamp()-interval '24 hours'),
    'dutyEventsLast7Days', (SELECT count(*) FROM public.unibud_workforce_audit_events
      WHERE event_type LIKE 'duty.%' AND occurred_at>=statement_timestamp()-interval '7 days'),
    'dutyFailuresLast7Days', (SELECT count(*) FROM public.unibud_workforce_audit_events
      WHERE event_type LIKE 'duty.%' AND outcome IN ('denied','failure')
        AND occurred_at>=statement_timestamp()-interval '7 days')
  );
END
$function$;
ALTER FUNCTION public.unibud_workforce_get_metrics() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_get_metrics() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_get_metrics() TO unibud_app;

CREATE FUNCTION public.unibud_workforce_record_activity(
  p_event_type TEXT,p_resource_type TEXT,p_resource_id UUID,p_outcome TEXT,
  p_request_id UUID,p_event_data JSONB DEFAULT '{}'::JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID; v_workforce UUID;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL
     OR p_event_type IS NULL OR p_event_type !~ '^duty\.[a-z][a-z0-9_.]{1,70}$'
     OR p_outcome IS NULL OR p_outcome NOT IN ('allowed','denied','success','failure')
     OR p_request_id IS NULL OR p_event_data IS NULL
     OR jsonb_typeof(p_event_data)<>'object' OR octet_length(p_event_data::TEXT)>4096
     OR NOT public.unibud_operator_has_permission('operations.workforce.self_access') THEN
    RETURN FALSE;
  END IF;
  SELECT workforce_id INTO v_workforce FROM public.unibud_workforce_accounts
    WHERE account_id=v_actor AND status='active';
  IF v_workforce IS NULL THEN RETURN FALSE; END IF;
  INSERT INTO public.unibud_workforce_audit_events(
    actor_account_id,actor_session_id,subject_account_id,workforce_id,
    event_type,outcome,request_id,resource_type,resource_id,event_data
  ) VALUES(v_actor,v_session,v_actor,v_workforce,p_event_type,p_outcome,p_request_id,
    p_resource_type,p_resource_id,p_event_data);
  RETURN TRUE;
END
$function$;
ALTER FUNCTION public.unibud_workforce_record_activity(TEXT,TEXT,UUID,TEXT,UUID,JSONB) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_workforce_record_activity(TEXT,TEXT,UUID,TEXT,UUID,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_workforce_record_activity(TEXT,TEXT,UUID,TEXT,UUID,JSONB) TO unibud_app;

CREATE FUNCTION unibud_private.sync_workforce_email_verification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF NEW.verified_at IS NOT NULL AND OLD.verified_at IS NULL THEN
    UPDATE public.unibud_workforce_accounts
      SET email_verified_at=NEW.verified_at,status='mfa_enrollment_required',
          updated_at=clock_timestamp()
    WHERE email_identity_id=NEW.id AND account_id=NEW.account_id
      AND status='email_verification_pending';
  END IF;
  RETURN NEW;
END
$function$;
ALTER FUNCTION unibud_private.sync_workforce_email_verification() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.sync_workforce_email_verification() FROM PUBLIC;
CREATE TRIGGER unibud_workforce_email_verified
AFTER UPDATE OF verified_at ON public.authentication_identities
FOR EACH ROW EXECUTE FUNCTION unibud_private.sync_workforce_email_verification();

CREATE FUNCTION unibud_private.sync_workforce_mfa_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF NEW.state='active' AND OLD.state IS DISTINCT FROM NEW.state THEN
    UPDATE public.unibud_workforce_accounts
      SET status='active',mfa_enrolled_at=NEW.confirmed_at,
          onboarding_completed_at=NEW.confirmed_at,updated_at=clock_timestamp()
    WHERE account_id=NEW.account_id AND status='mfa_enrollment_required'
      AND email_verified_at IS NOT NULL;
  END IF;
  RETURN NEW;
END
$function$;
ALTER FUNCTION unibud_private.sync_workforce_mfa_activation() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.sync_workforce_mfa_activation() FROM PUBLIC;
CREATE TRIGGER unibud_workforce_mfa_activated
AFTER UPDATE OF state ON public.unibud_operator_mfa_credentials
FOR EACH ROW EXECUTE FUNCTION unibud_private.sync_workforce_mfa_activation();

GRANT USAGE ON SCHEMA public TO unibud_ops_owner;
GRANT SELECT,INSERT,UPDATE ON public.unibud_workforce_invitation_requests,
  public.unibud_workforce_accounts,public.unibud_workforce_audit_events,
  public.unibud_operator_grants,public.unibud_operator_mfa_api_rate_limits,
  public.unibud_operator_mfa_credentials TO unibud_ops_owner;
GRANT SELECT ON public.accounts,public.account_sessions,public.authentication_identities
  TO unibud_ops_owner;
GRANT USAGE,SELECT ON SEQUENCE public.unibud_workforce_audit_events_event_id_seq TO unibud_ops_owner;

COMMENT ON TABLE public.unibud_workforce_accounts IS
'System-issued workforce usernames and first-login activation. Workforce role is a classification; actual permissions remain separate, scoped and MFA-gated.';
COMMENT ON TABLE public.unibud_workforce_audit_events IS
'Append-only workforce identity, login, invitation and duty activity audit. Actor and session are database-derived when authenticated.';
COMMENT ON FUNCTION public.unibud_workforce_decide_invitation(UUID,TEXT,TEXT,TEXT,BYTEA) IS
'Two-person workforce invitation approval. Admin invitations require a platform_admin approver; all new workforce identities receive only self-access until separately granted permissions.';
COMMENT ON FUNCTION public.unibud_workforce_activate(TEXT,BYTEA,TEXT,TEXT,UUID,BYTEA,BYTEA,TEXT) IS
'Consumes one short-lived activation code, binds a new verified-email identity and six-digit workforce passcode, and requires email verification plus MFA before workforce dashboard access.';
COMMENT ON FUNCTION public.unibud_workforce_record_activity(TEXT,TEXT,UUID,TEXT,UUID,JSONB) IS
'Records duty activity only for the authenticated workforce actor and exact signed session after MFA step-up; callers cannot select the actor.';

COMMIT;
