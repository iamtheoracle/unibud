-- Owned profile archive, restoration and recovery history.
-- Archive is reversible and never deletes profile content or ownership records.
BEGIN;

CREATE OR REPLACE FUNCTION public.profile_archive_owned(
  p_profile_id UUID,
  p_owner_account_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_active_owned_count INTEGER;
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
    RAISE EXCEPTION 'Authenticated profile owner required' USING ERRCODE='42501';
  END IF;

  -- Serialize lifecycle changes for one account without granting the procedure
  -- owner broad UPDATE rights on the accounts table.
  PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_account_id::text,0));
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active') THEN
    RAISE EXCEPTION 'Active account required' USING ERRCODE='42501';
  END IF;

  SELECT p.* INTO v_profile
    FROM public.profiles p
   WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
   FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  IF v_profile.kind NOT IN ('creator','page_community') OR
     NOT EXISTS (
       SELECT 1 FROM public.profile_memberships m
        WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id
          AND m.relationship='owner' AND m.role='owner' AND m.status='active'
     ) THEN
    RAISE EXCEPTION 'Only the owning account may archive an owned creator or page profile' USING ERRCODE='42501';
  END IF;

  IF v_profile.status='archived' THEN RETURN TRUE; END IF;
  IF v_profile.status<>'active' THEN
    RAISE EXCEPTION 'Only an active profile can be archived' USING ERRCODE='55000';
  END IF;

  SELECT count(*) INTO v_active_owned_count
    FROM public.profiles p
    JOIN public.profile_memberships m
      ON m.profile_id=p.id AND m.account_id=p_owner_account_id
     AND m.relationship='owner' AND m.role='owner' AND m.status='active'
   WHERE p.owner_account_id=p_owner_account_id AND p.status='active';
  IF v_active_owned_count<=1 OR NOT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.profile_memberships m ON m.profile_id=p.id
      AND m.account_id=p_owner_account_id AND m.relationship='owner'
      AND m.role='owner' AND m.status='active'
    WHERE p.owner_account_id=p_owner_account_id AND p.kind='personal'
      AND p.status='active'
  ) THEN
    RAISE EXCEPTION 'At least one active owned profile and the personal identity must remain available' USING ERRCODE='23514';
  END IF;

  UPDATE public.profiles SET status='archived',updated_at=clock_timestamp()
   WHERE id=p_profile_id AND owner_account_id=p_owner_account_id;

  -- Sessions cannot remain in an archived profile context. They stay valid;
  -- the next request must select one of the owner's remaining active profiles.
  UPDATE public.account_sessions
     SET active_profile_id=NULL,profile_context_version=NULL
   WHERE account_id=p_owner_account_id AND active_profile_id=p_profile_id
     AND status='active';

  INSERT INTO public.security_audit_events(
    id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data
  ) VALUES (
    gen_random_uuid(),p_owner_account_id,'unibud','profile.archive','success','profile',p_profile_id,
    'owner_requested',
    jsonb_build_object('profile_kind',v_profile.kind,'previous_status',v_profile.status,'new_status','archived')
  );
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_restore_owned(
  p_profile_id UUID,
  p_owner_account_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_profile public.profiles%ROWTYPE;
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
    RAISE EXCEPTION 'Authenticated profile owner required' USING ERRCODE='42501';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_account_id::text,0));
  IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active') THEN
    RAISE EXCEPTION 'Active account required' USING ERRCODE='42501';
  END IF;
  SELECT p.* INTO v_profile FROM public.profiles p
   WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
   FOR UPDATE;
  IF NOT FOUND THEN RETURN FALSE; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profile_memberships m
     WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id
       AND m.relationship='owner' AND m.role='owner' AND m.status='active'
  ) THEN
    RAISE EXCEPTION 'Only the owning account may restore this profile' USING ERRCODE='42501';
  END IF;
  IF v_profile.status='active' THEN RETURN TRUE; END IF;
  IF v_profile.status<>'archived' OR v_profile.kind NOT IN ('creator','page_community') THEN
    RAISE EXCEPTION 'This profile cannot be restored through profile recovery' USING ERRCODE='55000';
  END IF;

  UPDATE public.profiles SET status='active',updated_at=clock_timestamp()
   WHERE id=p_profile_id AND owner_account_id=p_owner_account_id;
  INSERT INTO public.security_audit_events(
    actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data
  ) VALUES (
    p_owner_account_id,'unibud','profile.restore','success','profile',p_profile_id,
    'owner_requested',
    jsonb_build_object('profile_kind',v_profile.kind,'previous_status','archived','new_status','active')
  );
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_list_lifecycle_history(
  p_profile_id UUID,
  p_owner_account_id UUID
)
RETURNS TABLE(
  id UUID,occurred_at TIMESTAMPTZ,action TEXT,outcome TEXT,reason_code TEXT,event_data JSONB
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships m ON m.profile_id=p.id
        AND m.account_id=p_owner_account_id AND m.relationship='owner'
        AND m.role='owner' AND m.status='active'
       WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
     ) THEN
    RAISE EXCEPTION 'Only the active profile owner may view lifecycle history' USING ERRCODE='42501';
  END IF;
  RETURN QUERY
    SELECT e.id,e.occurred_at,e.action,e.outcome,e.reason_code,e.event_data
      FROM public.security_audit_events e
     WHERE e.resource_type='profile' AND e.resource_id=p_profile_id
       AND e.application_id='unibud'
       AND e.action IN ('profile.archive','profile.restore')
     ORDER BY e.occurred_at DESC;
END;
$function$;

GRANT SELECT, INSERT ON public.security_audit_events TO unibud_profile_owner;
ALTER FUNCTION public.profile_archive_owned(UUID,UUID) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_restore_owned(UUID,UUID) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_list_lifecycle_history(UUID,UUID) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.profile_archive_owned(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_restore_owned(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_list_lifecycle_history(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_archive_owned(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_restore_owned(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_list_lifecycle_history(UUID,UUID) TO unibud_app;

COMMENT ON FUNCTION public.profile_archive_owned(UUID,UUID) IS
 'Owner-only reversible archive. Serializes account lifecycle and protects the active personal identity and remaining owned profiles.';
COMMENT ON FUNCTION public.profile_restore_owned(UUID,UUID) IS
 'Owner-only restoration of an archived creator or page profile; retains profile data and handle reservation.';
COMMENT ON FUNCTION public.profile_list_lifecycle_history(UUID,UUID) IS
 'Owner-only read of append-only profile archive and restoration audit events.';
COMMIT;
