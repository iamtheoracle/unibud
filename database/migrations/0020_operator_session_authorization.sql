-- Separate workforce identities and session-derived operator authorization.
-- Consumer profile roles never grant staff/operator authority.
BEGIN;

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='unibud_operator_auth') THEN
    CREATE ROLE unibud_operator_auth NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='unibud_operator_owner') THEN
    CREATE ROLE unibud_operator_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT BYPASSRLS;
  END IF;
END;
$roles$;

CREATE TABLE public.operator_worker_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL UNIQUE REFERENCES public.accounts(id) ON DELETE RESTRICT,
  worker_status TEXT NOT NULL CHECK (worker_status IN ('pending','active','suspended','terminated')),
  worker_reference TEXT NOT NULL UNIQUE CHECK (length(worker_reference) BETWEEN 3 AND 80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  activated_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  terminated_at TIMESTAMPTZ,
  CHECK (
    (worker_status='pending' AND activated_at IS NULL AND suspended_at IS NULL AND terminated_at IS NULL)
    OR (worker_status='active' AND activated_at IS NOT NULL AND suspended_at IS NULL AND terminated_at IS NULL)
    OR (worker_status='suspended' AND activated_at IS NOT NULL AND suspended_at IS NOT NULL AND terminated_at IS NULL)
    OR (worker_status='terminated' AND activated_at IS NOT NULL AND terminated_at IS NOT NULL)
  )
);

CREATE TABLE public.operator_role_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_identity_id UUID NOT NULL REFERENCES public.operator_worker_identities(id) ON DELETE RESTRICT,
  role_key TEXT NOT NULL CHECK (role_key IN ('support_readonly','integration_operator','security_auditor','operations_admin')),
  permission_key TEXT NOT NULL CHECK (permission_key IN (
    'integration.diagnostics.read','security.audit.read','account.support.read',
    'operations.queue.read','operations.queue.assign','operations.queue.resolve'
  )),
  scope_key TEXT NOT NULL CHECK (scope_key IN ('global','region','assigned')),
  region_code TEXT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  granted_by_worker_id UUID REFERENCES public.operator_worker_identities(id) ON DELETE RESTRICT,
  CHECK (expires_at IS NULL OR expires_at > granted_at),
  CHECK (revoked_at IS NULL OR revoked_at >= granted_at),
  CHECK ((scope_key='region') = (region_code IS NOT NULL))
);

CREATE INDEX operator_role_grants_active_idx
  ON public.operator_role_grants(worker_identity_id,permission_key,expires_at)
  WHERE revoked_at IS NULL;

CREATE TABLE public.operator_access_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  worker_identity_id UUID REFERENCES public.operator_worker_identities(id) ON DELETE RESTRICT,
  actor_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  session_id UUID REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  permission_key TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','denied')),
  reason_code TEXT NOT NULL CHECK (reason_code IN (
    'granted','invalid_session','worker_not_active','permission_not_granted','invalid_permission'
  )),
  request_reference TEXT CHECK (request_reference IS NULL OR length(request_reference)<=128)
);

CREATE INDEX operator_access_audit_events_time_idx
  ON public.operator_access_audit_events(occurred_at DESC);
CREATE INDEX operator_access_audit_events_worker_idx
  ON public.operator_access_audit_events(worker_identity_id,occurred_at DESC);

ALTER TABLE public.operator_worker_identities OWNER TO unibud_operator_owner;
ALTER TABLE public.operator_role_grants OWNER TO unibud_operator_owner;
ALTER TABLE public.operator_access_audit_events OWNER TO unibud_operator_owner;
REVOKE ALL ON public.operator_worker_identities,public.operator_role_grants,public.operator_access_audit_events
  FROM PUBLIC,unibud_app,unibud_readonly,unibud_auth,unibud_operator_auth;
GRANT USAGE ON SCHEMA public TO unibud_operator_owner;
GRANT SELECT ON public.accounts,public.account_sessions TO unibud_operator_owner;
GRANT SELECT ON public.operator_worker_identities,public.operator_role_grants TO unibud_operator_owner;
GRANT INSERT ON public.operator_access_audit_events TO unibud_operator_owner;

CREATE OR REPLACE FUNCTION public.operator_authorize_session(
  p_session_digest BYTEA,
  p_permission_key TEXT,
  p_request_reference TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE
  v_account_id UUID;
  v_session_id UUID;
  v_worker_id UUID;
  v_reason TEXT;
  v_allowed BOOLEAN := FALSE;
BEGIN
  IF p_session_digest IS NULL OR octet_length(p_session_digest)<>32 THEN
    v_reason := 'invalid_session';
  ELSIF p_permission_key IS NULL OR p_permission_key NOT IN (
    'integration.diagnostics.read','security.audit.read','account.support.read',
    'operations.queue.read','operations.queue.assign','operations.queue.resolve'
  ) THEN
    v_reason := 'invalid_permission';
  ELSE
    SELECT s.id,s.account_id INTO v_session_id,v_account_id
    FROM public.account_sessions s
    JOIN public.accounts a ON a.id=s.account_id AND a.status='active'
    WHERE s.credential_digest=p_session_digest
      AND s.status='active' AND s.revoked_at IS NULL
      AND s.idle_expires_at>statement_timestamp()
      AND s.absolute_expires_at>statement_timestamp()
    LIMIT 1;

    IF v_session_id IS NULL THEN
      v_reason := 'invalid_session';
    ELSE
      SELECT w.id INTO v_worker_id
      FROM public.operator_worker_identities w
      WHERE w.account_id=v_account_id AND w.worker_status='active'
        AND w.activated_at IS NOT NULL AND w.suspended_at IS NULL AND w.terminated_at IS NULL;
      IF v_worker_id IS NULL THEN
        v_reason := 'worker_not_active';
      ELSE
        v_allowed := EXISTS (
          SELECT 1 FROM public.operator_role_grants g
          WHERE g.worker_identity_id=v_worker_id
            AND g.permission_key=p_permission_key
            AND g.revoked_at IS NULL
            AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
            AND g.scope_key='global'
        );
        v_reason := CASE WHEN v_allowed THEN 'granted' ELSE 'permission_not_granted' END;
      END IF;
    END IF;
  END IF;

  INSERT INTO public.operator_access_audit_events(
    worker_identity_id,actor_account_id,session_id,permission_key,outcome,reason_code,request_reference
  ) VALUES (
    v_worker_id,v_account_id,v_session_id,
    CASE WHEN p_permission_key IN (
      'integration.diagnostics.read','security.audit.read','account.support.read',
      'operations.queue.read','operations.queue.assign','operations.queue.resolve'
    ) THEN p_permission_key ELSE 'invalid_permission' END,
    CASE WHEN v_allowed THEN 'allowed' ELSE 'denied' END,
    v_reason,
    CASE WHEN p_request_reference ~ '^[A-Za-z0-9._:-]{1,128}$' THEN p_request_reference ELSE NULL END
  );
  RETURN v_allowed;
END;
$function$;

ALTER FUNCTION public.operator_authorize_session(BYTEA,TEXT,TEXT) OWNER TO unibud_operator_owner;
REVOKE ALL ON FUNCTION public.operator_authorize_session(BYTEA,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.operator_authorize_session(BYTEA,TEXT,TEXT) TO unibud_auth;

COMMENT ON TABLE public.operator_worker_identities IS
  'Private workforce identity records. Consumer profile memberships and labels never create operator authority. Provisioning is restricted to trusted database administration.';
COMMENT ON TABLE public.operator_role_grants IS
  'Explicit least-privilege workforce permissions. Runtime application and auth roles cannot create or modify grants.';
COMMENT ON TABLE public.operator_access_audit_events IS
  'Append-only operator authorization decisions. Stores references and reason codes only, never credentials or sensitive request payloads.';
COMMENT ON FUNCTION public.operator_authorize_session(BYTEA,TEXT,TEXT) IS
  'Validates an opaque session digest against active account/session, active worker identity and unexpired global permission grant; records allow/deny audit event.';

COMMIT;
