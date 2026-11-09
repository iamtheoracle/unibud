-- Durable profile recovery notifications and fail-closed ownership/closure safeguards.
BEGIN;

CREATE TABLE public.profile_lifecycle_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type IN ('profile_archived','profile_restored')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  read_at TIMESTAMPTZ,
  details JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(details)='object')
);
CREATE INDEX profile_lifecycle_notifications_inbox_idx
  ON public.profile_lifecycle_notifications(account_id,created_at DESC);
ALTER TABLE public.profile_lifecycle_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_lifecycle_notifications FORCE ROW LEVEL SECURITY;
CREATE POLICY profile_lifecycle_notifications_owner_only
  ON public.profile_lifecycle_notifications
  USING (account_id=unibud_private.current_account_id())
  WITH CHECK (account_id=unibud_private.current_account_id());
REVOKE ALL ON public.profile_lifecycle_notifications FROM PUBLIC,unibud_app,unibud_readonly;
GRANT SELECT,INSERT,UPDATE ON public.profile_lifecycle_notifications TO unibud_profile_owner;

-- Profile ownership is immutable until a separately designed, verified,
-- consent-based transfer workflow exists. Archive is never an ownership transfer.
CREATE OR REPLACE FUNCTION public.reject_profile_owner_change()
RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public
AS $function$
BEGIN
  IF NEW.owner_account_id IS DISTINCT FROM OLD.owner_account_id THEN
    RAISE EXCEPTION 'Profile ownership cannot be changed without the verified ownership-transfer workflow'
      USING ERRCODE='55000';
  END IF;
  RETURN NEW;
END;
$function$;
CREATE TRIGGER profiles_owner_immutable
BEFORE UPDATE OF owner_account_id ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.reject_profile_owner_change();

-- An account cannot be closed while it owns any profile (including archived
-- profiles) or has active delegated access that still needs explicit release.
-- The account-closure flow must first provide a supported transfer/release and
-- retention process; no profile is silently orphaned or deleted.
CREATE OR REPLACE FUNCTION public.guard_account_profile_closure()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE v_owned INTEGER; v_delegated INTEGER;
BEGIN
  IF NEW.status='closed' AND OLD.status IS DISTINCT FROM 'closed' THEN
    SELECT count(*) INTO v_owned FROM public.profiles WHERE owner_account_id=OLD.id;
    SELECT count(*) INTO v_delegated FROM public.profile_memberships
      WHERE account_id=OLD.id AND relationship='delegated' AND status IN ('active','suspended');
    IF v_owned>0 OR v_delegated>0 THEN
      RAISE EXCEPTION 'Account closure blocked: transfer or release all owned profiles and delegated access through the approved recovery workflow first (owned profiles: %, delegated relationships: %)',v_owned,v_delegated
        USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
CREATE TRIGGER accounts_profile_closure_guard
BEFORE UPDATE OF status ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.guard_account_profile_closure();

CREATE OR REPLACE FUNCTION public.profile_list_lifecycle_notifications(p_account_id UUID)
RETURNS TABLE(id UUID,profile_id UUID,event_type TEXT,created_at TIMESTAMPTZ,read_at TIMESTAMPTZ,details JSONB)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
 IF p_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Account notification access denied' USING ERRCODE='42501';
 END IF;
 RETURN QUERY SELECT n.id,n.profile_id,n.event_type,n.created_at,n.read_at,n.details
 FROM public.profile_lifecycle_notifications n
 WHERE n.account_id=p_account_id ORDER BY n.created_at DESC LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_mark_lifecycle_notification_read(p_account_id UUID,p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
 IF p_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Account notification access denied' USING ERRCODE='42501';
 END IF;
 UPDATE public.profile_lifecycle_notifications SET read_at=COALESCE(read_at,clock_timestamp())
 WHERE id=p_notification_id AND account_id=p_account_id;
 RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.account_profile_closure_preflight(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_owned INTEGER; v_active INTEGER; v_archived INTEGER; v_delegated INTEGER;
BEGIN
 IF p_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Account closure preflight denied' USING ERRCODE='42501';
 END IF;
 SELECT count(*),count(*) FILTER(WHERE status='active'),count(*) FILTER(WHERE status='archived')
 INTO v_owned,v_active,v_archived FROM public.profiles WHERE owner_account_id=p_account_id;
 SELECT count(*) INTO v_delegated FROM public.profile_memberships
 WHERE account_id=p_account_id AND relationship='delegated' AND status IN ('active','suspended');
 RETURN jsonb_build_object(
  'canClose',v_owned=0 AND v_delegated=0,
  'ownedProfiles',v_owned,'activeOwnedProfiles',v_active,
  'archivedOwnedProfiles',v_archived,'delegatedRelationships',v_delegated,
  'requiresOwnershipTransferWorkflow',v_owned>0,
  'requiresDelegationRelease',v_delegated>0
 );
END;
$function$;

ALTER FUNCTION public.profile_list_lifecycle_notifications(UUID) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_mark_lifecycle_notification_read(UUID,UUID) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.account_profile_closure_preflight(UUID) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.profile_list_lifecycle_notifications(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_mark_lifecycle_notification_read(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.account_profile_closure_preflight(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_list_lifecycle_notifications(UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_mark_lifecycle_notification_read(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.account_profile_closure_preflight(UUID) TO unibud_app;

-- Notify the owner in the same transaction as each state change.
CREATE OR REPLACE FUNCTION public.profile_archive_owned(p_profile_id UUID,p_owner_account_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_profile public.profiles%ROWTYPE; v_count INTEGER;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Authenticated profile owner required' USING ERRCODE='42501';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_account_id::text,0));
 IF NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active') THEN
  RAISE EXCEPTION 'Active account required' USING ERRCODE='42501';
 END IF;
 SELECT p.* INTO v_profile FROM public.profiles p WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND THEN RETURN FALSE; END IF;
 IF v_profile.kind NOT IN ('creator','page_community') OR NOT EXISTS(
  SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id
   AND m.relationship='owner' AND m.role='owner' AND m.status='active'
 ) THEN RAISE EXCEPTION 'Only the owning account may archive an owned creator or page profile' USING ERRCODE='42501'; END IF;
 IF v_profile.status='archived' THEN RETURN TRUE; END IF;
 IF v_profile.status<>'active' THEN RAISE EXCEPTION 'Only an active profile can be archived' USING ERRCODE='55000'; END IF;
 SELECT count(*) INTO v_count FROM public.profiles p JOIN public.profile_memberships m
 ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner' AND m.role='owner' AND m.status='active'
 WHERE p.owner_account_id=p_owner_account_id AND p.status='active';
 IF v_count<=1 OR NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m ON m.profile_id=p.id
  AND m.account_id=p_owner_account_id AND m.relationship='owner' AND m.role='owner' AND m.status='active'
  WHERE p.owner_account_id=p_owner_account_id AND p.kind='personal' AND p.status='active') THEN
  RAISE EXCEPTION 'At least one active owned profile and the personal identity must remain available' USING ERRCODE='23514';
 END IF;
 UPDATE public.profiles SET status='archived',updated_at=clock_timestamp() WHERE id=p_profile_id;
 UPDATE public.account_sessions SET active_profile_id=NULL,profile_context_version=NULL
  WHERE account_id=p_owner_account_id AND active_profile_id=p_profile_id AND status='active';
 INSERT INTO public.security_audit_events(actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(p_owner_account_id,'unibud','profile.archive','success','profile',p_profile_id,'owner_requested',
  jsonb_build_object('profile_kind',v_profile.kind,'previous_status',v_profile.status,'new_status','archived'));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(p_owner_account_id,p_profile_id,'profile_archived',jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle));
 RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_restore_owned(p_profile_id UUID,p_owner_account_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_profile public.profiles%ROWTYPE;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Authenticated profile owner required' USING ERRCODE='42501';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_account_id::text,0));
 IF NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active') THEN
  RAISE EXCEPTION 'Active account required' USING ERRCODE='42501';
 END IF;
 SELECT p.* INTO v_profile FROM public.profiles p WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND THEN RETURN FALSE; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id
  AND m.relationship='owner' AND m.role='owner' AND m.status='active') THEN
  RAISE EXCEPTION 'Only the owning account may restore this profile' USING ERRCODE='42501';
 END IF;
 IF v_profile.status='active' THEN RETURN TRUE; END IF;
 IF v_profile.status<>'archived' OR v_profile.kind NOT IN ('creator','page_community') THEN
  RAISE EXCEPTION 'This profile cannot be restored through profile recovery' USING ERRCODE='55000';
 END IF;
 UPDATE public.profiles SET status='active',updated_at=clock_timestamp() WHERE id=p_profile_id;
 INSERT INTO public.security_audit_events(actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(p_owner_account_id,'unibud','profile.restore','success','profile',p_profile_id,'owner_requested',
  jsonb_build_object('profile_kind',v_profile.kind,'previous_status','archived','new_status','active'));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(p_owner_account_id,p_profile_id,'profile_restored',jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle));
 RETURN TRUE;
END;
$function$;

ALTER FUNCTION public.reject_profile_owner_change() OWNER TO unibud_profile_owner;
ALTER FUNCTION public.guard_account_profile_closure() OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_archive_owned(UUID,UUID) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_restore_owned(UUID,UUID) OWNER TO unibud_profile_owner;
GRANT SELECT,INSERT ON public.security_audit_events TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.profile_archive_owned(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_restore_owned(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_archive_owned(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_restore_owned(UUID,UUID) TO unibud_app;
COMMIT;
