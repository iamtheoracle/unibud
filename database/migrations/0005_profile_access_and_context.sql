-- Profile ownership, delegated access and per-session profile context.
-- All membership mutations use narrow SECURITY DEFINER procedures. A delegate
-- cannot self-grant membership by inserting a row with their own account ID.

BEGIN;

ALTER TABLE profile_memberships
  ADD COLUMN profile_owner_account_id UUID;

UPDATE profile_memberships membership
SET profile_owner_account_id = profile.owner_account_id
FROM profiles profile
WHERE profile.id = membership.profile_id;

ALTER TABLE profile_memberships
  ALTER COLUMN profile_owner_account_id SET NOT NULL,
  ADD CONSTRAINT profile_memberships_profile_owner_fk
    FOREIGN KEY (profile_owner_account_id,profile_id)
    REFERENCES profiles(owner_account_id,id) ON DELETE RESTRICT;

ALTER TABLE account_sessions
  ADD COLUMN active_profile_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
  ADD COLUMN profile_context_version UUID,
  ADD CONSTRAINT account_sessions_profile_context_pair
    CHECK ((active_profile_id IS NULL) = (profile_context_version IS NULL));

DROP POLICY profile_memberships_account_isolation ON profile_memberships;
CREATE POLICY profile_memberships_account_isolation ON profile_memberships
  USING (
    account_id = unibud_private.current_account_id()
    OR profile_owner_account_id = unibud_private.current_account_id()
  )
  WITH CHECK (
    account_id = unibud_private.current_account_id()
    OR profile_owner_account_id = unibud_private.current_account_id()
  );

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'unibud_profile_owner') THEN
    CREATE ROLE unibud_profile_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT BYPASSRLS;
  END IF;
END;
$roles$;

GRANT SELECT ON accounts TO unibud_profile_owner;
GRANT SELECT, INSERT, UPDATE ON profiles, profile_memberships, account_sessions TO unibud_profile_owner;
GRANT USAGE ON SCHEMA unibud_private TO unibud_profile_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_account_id() TO unibud_profile_owner;
GRANT CREATE ON SCHEMA public TO unibud_profile_owner;

CREATE OR REPLACE FUNCTION public.profile_create_owned(
  p_profile_id UUID,
  p_membership_id UUID,
  p_account_id UUID,
  p_kind TEXT,
  p_handle TEXT,
  p_handle_normalized TEXT,
  p_display_name TEXT,
  p_visibility TEXT
)
RETURNS TABLE(
  profile_id UUID,
  owner_account_id UUID,
  kind TEXT,
  handle TEXT,
  display_name TEXT,
  visibility TEXT,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
BEGIN
  IF p_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.id=p_account_id AND a.status='active') THEN
    RAISE EXCEPTION 'Authenticated active account is required' USING ERRCODE='42501';
  END IF;

  INSERT INTO public.profiles(
    id,owner_account_id,kind,handle,handle_normalized,display_name,visibility
  ) VALUES (
    p_profile_id,p_account_id,p_kind,p_handle,p_handle_normalized,p_display_name,
    COALESCE(p_visibility,'private')
  );

  INSERT INTO public.profile_memberships(
    id,profile_id,account_id,owner_account_id,profile_owner_account_id,
    relationship,role,status,can_switch_to_profile,granted_by_account_id
  ) VALUES (
    p_membership_id,p_profile_id,p_account_id,p_account_id,p_account_id,
    'owner','owner','active',TRUE,p_account_id
  );

  RETURN QUERY
    SELECT p.id,p.owner_account_id,p.kind,p.handle,p.display_name,p.visibility,p.status
    FROM public.profiles p WHERE p.id=p_profile_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_grant_delegated_access(
  p_profile_id UUID,
  p_owner_account_id UUID,
  p_delegate_account_id UUID,
  p_role TEXT,
  p_can_switch BOOLEAN
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE membership_id UUID := gen_random_uuid();
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR p_delegate_account_id IS NULL OR p_delegate_account_id = p_owner_account_id
     OR p_role IS NULL OR p_role NOT IN ('admin','moderator','editor','member','seller','provider','professional','student','staff','operator','viewer')
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships owner_membership
         ON owner_membership.profile_id=p.id
        AND owner_membership.account_id=p_owner_account_id
        AND owner_membership.relationship='owner'
        AND owner_membership.status='active'
       JOIN public.accounts delegate_account
         ON delegate_account.id=p_delegate_account_id AND delegate_account.status='active'
       WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id AND p.status='active'
     ) THEN
    RAISE EXCEPTION 'Only the active profile owner may grant delegated access' USING ERRCODE='42501';
  END IF;

  INSERT INTO public.profile_memberships(
    id,profile_id,account_id,owner_account_id,profile_owner_account_id,
    relationship,role,status,can_switch_to_profile,granted_by_account_id,
    granted_at,revoked_at
  ) VALUES (
    membership_id,p_profile_id,p_delegate_account_id,NULL,p_owner_account_id,
    'delegated',p_role,'active',p_can_switch,p_owner_account_id,clock_timestamp(),NULL
  )
  ON CONFLICT (profile_id,account_id) DO UPDATE
    SET role=EXCLUDED.role,status='active',
        can_switch_to_profile=EXCLUDED.can_switch_to_profile,
        granted_by_account_id=EXCLUDED.granted_by_account_id,
        granted_at=EXCLUDED.granted_at,revoked_at=NULL
    WHERE public.profile_memberships.relationship='delegated'
      AND public.profile_memberships.profile_owner_account_id=p_owner_account_id
  RETURNING id INTO membership_id;

  IF membership_id IS NULL THEN
    RAISE EXCEPTION 'Existing profile membership cannot be overwritten' USING ERRCODE='42501';
  END IF;
  RETURN membership_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_revoke_delegated_access(
  p_profile_id UUID,
  p_owner_account_id UUID,
  p_delegate_account_id UUID,
  p_revoked_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR p_revoked_at IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships owner_membership
         ON owner_membership.profile_id=p.id
        AND owner_membership.account_id=p_owner_account_id
        AND owner_membership.relationship='owner'
        AND owner_membership.status='active'
       WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
     ) THEN
    RAISE EXCEPTION 'Only the active profile owner may revoke delegated access' USING ERRCODE='42501';
  END IF;

  UPDATE public.profile_memberships
  SET status='revoked',revoked_at=p_revoked_at
  WHERE profile_id=p_profile_id
    AND account_id=p_delegate_account_id
    AND profile_owner_account_id=p_owner_account_id
    AND relationship='delegated'
    AND status='active';
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_set_active_context(
  p_account_id UUID,
  p_session_id UUID,
  p_profile_id UUID,
  p_context_version UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
BEGIN
  IF p_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR p_context_version IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships m
         ON m.profile_id=p.id AND m.account_id=p_account_id
        AND m.status='active' AND m.can_switch_to_profile
       WHERE p.id=p_profile_id AND p.status='active'
     ) THEN
    RETURN FALSE;
  END IF;

  UPDATE public.account_sessions
  SET active_profile_id=p_profile_id,profile_context_version=p_context_version
  WHERE id=p_session_id AND account_id=p_account_id
    AND status='active' AND revoked_at IS NULL
    AND idle_expires_at > clock_timestamp()
    AND absolute_expires_at > clock_timestamp()
    AND EXISTS (SELECT 1 FROM public.accounts a WHERE a.id=p_account_id AND a.status='active');
  RETURN FOUND;
END;
$function$;

DO $ownership$
DECLARE signature TEXT;
BEGIN
  FOR signature IN
    SELECT p.oid::regprocedure::TEXT
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN (
      'profile_create_owned','profile_grant_delegated_access',
      'profile_revoke_delegated_access','profile_set_active_context'
    )
  LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO unibud_profile_owner',signature);
  END LOOP;
END;
$ownership$;

REVOKE CREATE ON SCHEMA public FROM unibud_profile_owner;

REVOKE INSERT, UPDATE ON profiles, profile_memberships, account_sessions,
  authentication_identities, password_credentials, verification_challenges,
  resource_grants, accounts
FROM unibud_app;
REVOKE UPDATE ON account_sessions FROM unibud_app;

REVOKE ALL ON FUNCTION public.profile_create_owned(UUID,UUID,UUID,TEXT,TEXT,TEXT,TEXT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_grant_delegated_access(UUID,UUID,UUID,TEXT,BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_revoke_delegated_access(UUID,UUID,UUID,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_set_active_context(UUID,UUID,UUID,UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.profile_create_owned(UUID,UUID,UUID,TEXT,TEXT,TEXT,TEXT,TEXT) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_grant_delegated_access(UUID,UUID,UUID,TEXT,BOOLEAN) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_revoke_delegated_access(UUID,UUID,UUID,TIMESTAMPTZ) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_set_active_context(UUID,UUID,UUID,UUID) TO unibud_app;

COMMIT;
