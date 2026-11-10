-- Bind Operations authorization and audit attribution to the existing
-- cryptographically verified transaction account context.
-- Apply after 0020_session_derived_operations_rbac.sql.
-- Caller-settable GUCs are not trusted: current_account_id() verifies the HMAC
-- against the private database key and enforces the short expiry window.

BEGIN;

-- The previous interfaces accepted arbitrary account UUIDs and are unsafe even
-- though the HTTP route happened to pass a session-derived value.
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(UUID,TEXT) FROM PUBLIC, unibud_app;
REVOKE ALL ON FUNCTION public.unibud_operator_record_access(UUID,TEXT,TEXT,UUID) FROM PUBLIC, unibud_app;
DROP FUNCTION public.unibud_operator_has_permission(UUID,TEXT);
DROP FUNCTION public.unibud_operator_record_access(UUID,TEXT,TEXT,UUID);

GRANT USAGE ON SCHEMA unibud_private TO unibud_ops_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_account_id() TO unibud_ops_owner;

CREATE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  IF v_actor IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

CREATE FUNCTION public.unibud_operator_record_access(
  p_permission TEXT,
  p_outcome TEXT,
  p_request_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
BEGIN
  IF p_permission IS NULL
     OR p_permission NOT IN (
       'integrations.verification_delivery.read',
       'integrations.oracle_arc.read',
       'dependencies.read',
       'operations.audit.read',
       'operations.accounts.support_read'
     )
     OR p_outcome NOT IN ('allowed','denied','unauthenticated','error')
     OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid operator audit event' USING ERRCODE = '22023';
  END IF;

  v_actor := unibud_private.current_account_id();
  IF (v_actor IS NULL AND p_outcome <> 'unauthenticated')
     OR (v_actor IS NOT NULL AND p_outcome = 'unauthenticated') THEN
    RAISE EXCEPTION 'Audit actor context is invalid' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.unibud_operator_audit_events(
    actor_account_id, permission, outcome, request_id
  ) VALUES (v_actor, p_permission, p_outcome, p_request_id);
END
$function$;
ALTER FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) TO unibud_app;

COMMENT ON FUNCTION public.unibud_operator_has_permission(TEXT) IS
'Checks the Operations grant for the account authenticated by unibud_private.current_account_id(); accepts no actor identifier from the caller.';
COMMENT ON FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) IS
'Records an Operations decision using only the cryptographically verified transaction account context; unauthenticated events have a NULL actor.';

COMMIT;
