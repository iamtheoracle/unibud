-- Session-derived, global UNIBUD Operations authorization.
-- Apply after 0019_external_dependency_registry.sql.
-- Operator grants are provisioned out-of-band by a trusted database administrator.
-- Profile roles (student, tutor, institution staff, page admin, etc.) never grant Operations access.

BEGIN;

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'unibud_ops_owner') THEN
    CREATE ROLE unibud_ops_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT BYPASSRLS;
  END IF;
END;
$roles$;

CREATE TABLE public.unibud_operator_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  operator_role TEXT NOT NULL CHECK (operator_role IN (
    'platform_admin','operations_admin','integration_operator','support_readonly'
  )),
  permissions TEXT[] NOT NULL CHECK (
    cardinality(permissions) > 0
    AND permissions <@ ARRAY[
      'integrations.verification_delivery.read',
      'integrations.oracle_arc.read',
      'dependencies.read',
      'operations.audit.read',
      'operations.accounts.support_read'
    ]::TEXT[]
  ),
  granted_by UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  CHECK ((revoked_at IS NULL) = (revocation_reason IS NULL)),
  CHECK (expires_at IS NULL OR expires_at > granted_at)
);

CREATE INDEX unibud_operator_grants_active_account_idx
  ON public.unibud_operator_grants(account_id, granted_at DESC)
  WHERE revoked_at IS NULL;

CREATE TABLE public.unibud_operator_audit_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  permission TEXT NOT NULL CHECK (permission ~ '^[a-z][a-z0-9_.]{2,100}$'),
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','denied','unauthenticated','error')),
  request_id UUID NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX unibud_operator_audit_actor_time_idx
  ON public.unibud_operator_audit_events(actor_account_id, occurred_at DESC);

GRANT USAGE, CREATE ON SCHEMA public TO unibud_ops_owner;
GRANT SELECT ON public.accounts TO unibud_ops_owner;
ALTER TABLE public.unibud_operator_grants OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_operator_audit_events OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_operator_grants, public.unibud_operator_audit_events FROM PUBLIC, unibud_app, unibud_readonly, unibud_auth;

CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_account_id UUID,
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = p_account_id
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  )
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(UUID,TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(UUID,TEXT) TO unibud_app;

CREATE OR REPLACE FUNCTION public.unibud_operator_record_access(
  p_actor_account_id UUID,
  p_permission TEXT,
  p_outcome TEXT,
  p_request_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF p_permission !~ '^[a-z][a-z0-9_.]{2,100}$'
     OR p_outcome NOT IN ('allowed','denied','unauthenticated','error')
     OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid operator audit event' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.unibud_operator_audit_events(
    actor_account_id, permission, outcome, request_id
  ) VALUES (p_actor_account_id, p_permission, p_outcome, p_request_id);
END
$function$;
ALTER FUNCTION public.unibud_operator_record_access(UUID,TEXT,TEXT,UUID) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_record_access(UUID,TEXT,TEXT,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_record_access(UUID,TEXT,TEXT,UUID) TO unibud_app;

CREATE OR REPLACE FUNCTION public.unibud_operator_audit_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $function$
BEGIN
  RAISE EXCEPTION 'Operator audit events are append-only' USING ERRCODE = '55000';
END
$function$;
REVOKE ALL ON FUNCTION public.unibud_operator_audit_immutable() FROM PUBLIC;
CREATE TRIGGER unibud_operator_audit_no_mutation
  BEFORE UPDATE OR DELETE ON public.unibud_operator_audit_events
  FOR EACH ROW EXECUTE FUNCTION public.unibud_operator_audit_immutable();

COMMIT;
