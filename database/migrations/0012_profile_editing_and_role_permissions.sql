-- Profile identity editing and explicit page-role permissions.
-- Delegated roles are profile-scoped; specialised roles do not inherit admin powers.
BEGIN;

CREATE TABLE public.profile_role_permissions (
  role TEXT NOT NULL CHECK (role IN (
    'admin','moderator','editor','member','seller','provider',
    'professional','student','staff','operator','viewer'
  )),
  permission TEXT NOT NULL CHECK (permission IN (
    'profile.read','profile.update_identity',
    'content.create','content.update','content.publish','content.delete','content.moderate',
    'members.view',
    'marketplace.manage_listing','service.manage_availability',
    'education.manage_assigned_records','operations.view_assigned_work'
  )),
  PRIMARY KEY(role,permission)
);
ALTER TABLE public.profile_role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_role_permissions FORCE ROW LEVEL SECURITY;
CREATE POLICY profile_role_permissions_deny_app ON public.profile_role_permissions
  USING (false) WITH CHECK (false);
REVOKE ALL ON public.profile_role_permissions FROM PUBLIC,unibud_app;
GRANT SELECT ON public.profile_role_permissions TO unibud_profile_owner;

INSERT INTO public.profile_role_permissions(role,permission) VALUES
 ('admin','profile.read'),('admin','profile.update_identity'),
 ('admin','content.create'),('admin','content.update'),('admin','content.publish'),
 ('admin','content.delete'),('admin','content.moderate'),('admin','members.view'),
 ('moderator','profile.read'),('moderator','content.moderate'),('moderator','members.view'),
 ('editor','profile.read'),('editor','content.create'),('editor','content.update'),('editor','content.publish'),
 ('member','profile.read'),('viewer','profile.read'),
 ('seller','profile.read'),('seller','marketplace.manage_listing'),
 ('provider','profile.read'),('provider','service.manage_availability'),
 ('professional','profile.read'),('professional','education.manage_assigned_records'),
 ('student','profile.read'),('staff','profile.read'),('operator','profile.read'),
 ('staff','operations.view_assigned_work'),('operator','operations.view_assigned_work');

CREATE OR REPLACE FUNCTION public.profile_authorize_action(
  p_profile_id UUID,p_account_id UUID,p_permission TEXT
)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
  SELECT CASE
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

CREATE OR REPLACE FUNCTION public.profile_update_owned(
  p_profile_id UUID,p_owner_account_id UUID,p_display_name TEXT,
  p_handle TEXT,p_handle_normalized TEXT,p_visibility TEXT
)
RETURNS TABLE(
  profile_id UUID,owner_account_id UUID,kind TEXT,handle TEXT,
  display_name TEXT,visibility TEXT,status TEXT
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR length(trim(p_display_name)) NOT BETWEEN 1 AND 80
     OR p_handle_normalized !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$'
     OR p_handle <> p_handle_normalized
     OR p_visibility NOT IN ('private','limited','public')
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships m ON m.profile_id=p.id
         AND m.account_id=p_owner_account_id AND m.relationship='owner'
         AND m.status='active' AND m.role='owner'
       WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
         AND p.status='active' AND p.kind IN ('creator','page_community')
     ) THEN
    RAISE EXCEPTION 'Only the owner may update an active creator or page profile' USING ERRCODE='42501';
  END IF;

  RETURN QUERY
  UPDATE public.profiles p
    SET display_name=trim(p_display_name),handle=p_handle,
        handle_normalized=p_handle_normalized,visibility=p_visibility,updated_at=clock_timestamp()
  WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
    AND p.status='active'
  RETURNING p.id,p.owner_account_id,p.kind,p.handle,p.display_name,p.visibility,p.status;
END;
$function$;

ALTER FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_update_owned(UUID,UUID,TEXT,TEXT,TEXT,TEXT) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_update_owned(UUID,UUID,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_update_owned(UUID,UUID,TEXT,TEXT,TEXT,TEXT) TO unibud_app;

COMMENT ON TABLE public.profile_role_permissions IS
  'Explicit, least-privilege permissions for profile-scoped delegated roles. Owner authority is evaluated separately.';
COMMENT ON FUNCTION public.profile_authorize_action(UUID,UUID,TEXT) IS
  'Checks active account, profile and exact-profile membership before evaluating a permission. No membership means deny.';
COMMENT ON FUNCTION public.profile_update_owned(UUID,UUID,TEXT,TEXT,TEXT,TEXT) IS
  'Owner-only edit of creator/page identity. Personal identity is managed through account security/onboarding flows.';

COMMIT;
