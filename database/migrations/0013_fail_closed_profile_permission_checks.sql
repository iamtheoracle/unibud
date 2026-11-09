-- Fail closed for unknown or future permission strings, including for owners.
-- The TypeScript union is not a security boundary: runtime callers can still supply
-- arbitrary values, so the database must reject unknown permissions itself.
BEGIN;

CREATE OR REPLACE FUNCTION public.profile_authorize_action(
  p_profile_id UUID,p_account_id UUID,p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
  SELECT CASE
    WHEN p_permission IS NULL OR p_permission NOT IN (
      'profile.read','profile.update_identity',
      'content.create','content.update','content.publish','content.delete','content.moderate',
      'members.view','marketplace.manage_listing','service.manage_availability',
      'education.manage_assigned_records','operations.view_assigned_work'
    ) THEN FALSE
    WHEN p_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN FALSE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.accounts a WHERE a.id=p_account_id AND a.status='active'
    ) THEN FALSE
    WHEN NOT EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id=p_profile_id AND p.status='active'
    ) THEN FALSE
    ELSE EXISTS (
      SELECT 1
      FROM public.profile_memberships m
      JOIN public.profiles p ON p.id=m.profile_id
      WHERE m.profile_id=p_profile_id AND m.account_id=p_account_id
        AND m.status='active' AND p.status='active'
        AND (
          (m.relationship='owner' AND m.role='owner')
          OR EXISTS (
            SELECT 1 FROM public.profile_role_permissions rp
            WHERE rp.role=m.role AND rp.permission=p_permission
          )
        )
    )
  END
$function$;

ALTER FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) TO unibud_app;
COMMENT ON FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) IS
  'Fail-closed exact-profile authorization. Unknown/null permission strings are denied before owner or delegated-role evaluation.';

COMMIT;
