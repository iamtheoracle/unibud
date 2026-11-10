-- Session-derived UNIBUD Operations authorization.
-- Apply after 0019_external_dependency_registry.sql on PostgreSQL 16+.
-- Role assignment is global platform authority, separate from profile membership.
-- No public endpoint can grant or elevate Operations roles.

BEGIN;

CREATE TABLE public.operations_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  role_key TEXT NOT NULL CHECK (role_key IN ('operations_admin','operations_auditor','integration_operator')),
  permissions TEXT[] NOT NULL CHECK (
    cardinality(permissions) > 0
    AND array_position(permissions, NULL) IS NULL
    AND permissions <@ ARRAY[
      'operations.integrations.read',
      'operations.integrations.manage',
      'operations.audit.read',
      'operations.accounts.support'
    ]::TEXT[]
  ),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked','expired')),
  granted_by_service TEXT NOT NULL CHECK (length(granted_by_service) BETWEEN 1 AND 80),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by_service TEXT,
  reason_code TEXT NOT NULL CHECK (length(reason_code) BETWEEN 2 AND 80),
  CHECK (expires_at IS NULL OR expires_at > granted_at),
  CHECK ((status = 'revoked') = (revoked_at IS NOT NULL)),
  CHECK ((status = 'revoked') = (revoked_by_service IS NOT NULL))
);

CREATE INDEX operations_role_assignments_account_active_idx
  ON public.operations_role_assignments(account_id, granted_at DESC)
  WHERE status = 'active';

ALTER TABLE public.operations_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations_role_assignments FORCE ROW LEVEL SECURITY;
CREATE POLICY operations_role_assignments_deny_app
  ON public.operations_role_assignments
  USING (false) WITH CHECK (false);

ALTER TABLE public.operations_role_assignments OWNER TO unibud_profile_owner;
GRANT SELECT ON public.accounts, public.account_sessions TO unibud_profile_owner;
GRANT INSERT ON public.security_audit_events TO unibud_profile_owner;
REVOKE ALL ON public.operations_role_assignments FROM PUBLIC, unibud_app, unibud_readonly, unibud_auth;

CREATE OR REPLACE FUNCTION public.operations_authorize_session(
  p_account_id UUID,
  p_session_id UUID,
  p_permission TEXT,
  p_request_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_allowed BOOLEAN := FALSE;
BEGIN
  IF p_account_id IS NULL OR p_session_id IS NULL OR p_permission NOT IN (
    'operations.integrations.read','operations.integrations.manage',
    'operations.audit.read','operations.accounts.support'
  ) THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id = a.id
    JOIN public.operations_role_assignments r ON r.account_id = a.id
    WHERE a.id = p_account_id
      AND a.status = 'active'
      AND s.id = p_session_id
      AND s.status = 'active'
      AND s.revoked_at IS NULL
      AND s.idle_expires_at > clock_timestamp()
      AND s.absolute_expires_at > clock_timestamp()
      AND r.status = 'active'
      AND (r.expires_at IS NULL OR r.expires_at > clock_timestamp())
      AND p_permission = ANY(r.permissions)
  ) INTO v_allowed;

  INSERT INTO public.security_audit_events (
    id, actor_account_id, application_id, action, outcome,
    resource_type, request_id, reason_code, event_data
  ) VALUES (
    gen_random_uuid(), p_account_id, 'operations',
    'operations.authorization.' || p_permission,
    CASE WHEN v_allowed THEN 'allowed' ELSE 'denied' END,
    'operations_permission', NULLIF(left(p_request_id, 120), ''),
    CASE WHEN v_allowed THEN 'active_assignment_and_session' ELSE 'missing_or_inactive_assignment_or_session' END,
    jsonb_build_object('permission', p_permission, 'sessionId', p_session_id)
  );

  RETURN v_allowed;
END;
$function$;

ALTER FUNCTION public.operations_authorize_session(UUID,UUID,TEXT,TEXT)
  OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.operations_authorize_session(UUID,UUID,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operations_authorize_session(UUID,UUID,TEXT,TEXT) TO unibud_app;

CREATE OR REPLACE FUNCTION public.operations_revoke_account_roles(
  p_account_id UUID,
  p_reason_code TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_revoked INTEGER;
BEGIN
  IF p_account_id IS NULL OR p_reason_code IS NULL
     OR length(p_reason_code) NOT BETWEEN 2 AND 80 THEN
    RAISE EXCEPTION 'Invalid Operations revocation request' USING ERRCODE = '22023';
  END IF;

  UPDATE public.operations_role_assignments
  SET status = 'revoked',
      revoked_at = clock_timestamp(),
      revoked_by_service = 'operations_security_control'
  WHERE account_id = p_account_id AND status = 'active';
  GET DIAGNOSTICS v_revoked = ROW_COUNT;

  UPDATE public.account_sessions
  SET status = 'revoked',
      revoked_at = clock_timestamp(),
      revocation_reason = 'operations_role_revoked'
  WHERE account_id = p_account_id AND status = 'active';

  INSERT INTO public.security_audit_events (
    id, actor_service, application_id, action, outcome,
    resource_type, resource_id, reason_code, event_data
  ) VALUES (
    gen_random_uuid(), 'operations_security_control', 'operations',
    'operations.roles.revoke_all', 'success',
    'account', p_account_id, p_reason_code,
    jsonb_build_object('revokedAssignments', v_revoked, 'sessionsRevoked', TRUE)
  );

  RETURN v_revoked;
END;
$function$;

ALTER FUNCTION public.operations_revoke_account_roles(UUID,TEXT)
  OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.operations_revoke_account_roles(UUID,TEXT) FROM PUBLIC, unibud_app, unibud_readonly;

COMMENT ON TABLE public.operations_role_assignments IS
'Global platform Operations authority. Never inferred from profile memberships or client-supplied role claims. Provision and revoke through controlled database administration only.';
COMMENT ON FUNCTION public.operations_authorize_session(UUID,UUID,TEXT,TEXT) IS
'Authorizes only an active account and exact active server-validated session with a current explicit Operations assignment; writes allowed and denied audit events.';
COMMENT ON FUNCTION public.operations_revoke_account_roles(UUID,TEXT) IS
'Restricted security-control operation: revokes all Operations assignments and all active account sessions, recording an append-only audit event. Not executable by application roles.';

COMMIT;
