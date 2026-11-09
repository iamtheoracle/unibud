-- Two-party, password-reauthenticated profile ownership transfer.
-- Personal profiles are account identity and are never transferable.
BEGIN;

-- Membership ownership references must change in the same transaction as the
-- canonical profile owner. Defer this one FK only inside the final transfer RPC.
ALTER TABLE public.profile_memberships
  DROP CONSTRAINT profile_memberships_profile_owner_fk;
ALTER TABLE public.profile_memberships
  ADD CONSTRAINT profile_memberships_profile_owner_fk
  FOREIGN KEY (profile_owner_account_id,profile_id)
  REFERENCES public.profiles(owner_account_id,id) ON DELETE RESTRICT
  DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE public.profile_lifecycle_notifications
  DROP CONSTRAINT profile_lifecycle_notifications_event_type_check;
ALTER TABLE public.profile_lifecycle_notifications
  ADD CONSTRAINT profile_lifecycle_notifications_event_type_check
  CHECK(event_type IN(
    'profile_archived','profile_restored',
    'ownership_transfer_requested','ownership_transfer_accepted',
    'ownership_transfer_completed','ownership_transfer_cancelled','ownership_transfer_expired','delegated_access_suspended','delegated_access_review_required','profile_invitation_cancelled_by_archive'
  ));

CREATE TABLE public.profile_ownership_transfers(
 id UUID PRIMARY KEY,
 profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
 current_owner_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
 recipient_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
 status TEXT NOT NULL DEFAULT 'pending_recipient' CHECK(status IN('pending_recipient','recipient_accepted','recipient_declined','cancelled','expired','completed')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
 expires_at TIMESTAMPTZ NOT NULL,
 recipient_responded_at TIMESTAMPTZ,
 completed_at TIMESTAMPTZ,
 cancelled_at TIMESTAMPTZ,
 CHECK(current_owner_account_id<>recipient_account_id),
 CHECK(expires_at>created_at),
 CHECK((status='recipient_accepted')=(recipient_responded_at IS NOT NULL) OR status IN('recipient_declined','cancelled','expired','completed')),
 CHECK((status='completed')=(completed_at IS NOT NULL))
);
CREATE UNIQUE INDEX profile_ownership_transfers_one_open_idx
 ON public.profile_ownership_transfers(profile_id)
 WHERE status IN('pending_recipient','recipient_accepted');
CREATE INDEX profile_ownership_transfers_recipient_idx
 ON public.profile_ownership_transfers(recipient_account_id,status,created_at DESC);

ALTER TABLE public.profile_ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_ownership_transfers FORCE ROW LEVEL SECURITY;
CREATE POLICY profile_ownership_transfers_participant_only
 ON public.profile_ownership_transfers
 USING(current_owner_account_id=unibud_private.current_account_id()
    OR recipient_account_id=unibud_private.current_account_id())
 WITH CHECK(current_owner_account_id=unibud_private.current_account_id());
REVOKE ALL ON public.profile_ownership_transfers FROM PUBLIC,unibud_app,unibud_readonly;
GRANT SELECT,INSERT,UPDATE ON public.profile_ownership_transfers TO unibud_profile_owner;
GRANT SELECT ON public.authentication_identities TO unibud_profile_owner;
GRANT DELETE ON public.profile_memberships TO unibud_profile_owner;
GRANT SELECT,UPDATE ON public.resource_grants TO unibud_profile_owner;

-- Archiving suspends active delegated memberships. Restore deliberately leaves
-- them suspended so the owner must explicitly review and reactivate access.
CREATE OR REPLACE FUNCTION public.profile_archive_owned(
 p_profile_id UUID,p_owner_account_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_profile public.profiles%ROWTYPE; v_active_owned_count INTEGER; v_suspended_delegate_ids UUID[]; v_revoked_grant_account_ids UUID[]; v_notified_access_account_ids UUID[]; v_cancelled_invitee_ids UUID[];
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Authenticated profile owner required' USING ERRCODE='42501';
 END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_account_id::text,0));
 IF NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active') THEN
  RAISE EXCEPTION 'Active account required' USING ERRCODE='42501';
 END IF;
 SELECT p.* INTO v_profile FROM public.profiles p
 WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND THEN RETURN FALSE; END IF;
 IF v_profile.kind NOT IN('creator','page_community') OR NOT EXISTS(
  SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id
   AND m.relationship='owner' AND m.role='owner' AND m.status='active')
 THEN RAISE EXCEPTION 'Only the owning account may archive an owned creator or page profile' USING ERRCODE='42501'; END IF;
 IF v_profile.status='archived' THEN RETURN TRUE; END IF;
 IF v_profile.status<>'active' THEN RAISE EXCEPTION 'Only an active profile can be archived' USING ERRCODE='55000'; END IF;
 SELECT count(*) INTO v_active_owned_count FROM public.profiles p JOIN public.profile_memberships m
 ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
  AND m.role='owner' AND m.status='active'
 WHERE p.owner_account_id=p_owner_account_id AND p.status='active';
 IF v_active_owned_count<=1 OR NOT EXISTS(
  SELECT 1 FROM public.profiles p JOIN public.profile_memberships m ON m.profile_id=p.id
   AND m.account_id=p_owner_account_id AND m.relationship='owner' AND m.role='owner' AND m.status='active'
  WHERE p.owner_account_id=p_owner_account_id AND p.kind='personal' AND p.status='active')
 THEN RAISE EXCEPTION 'At least one active owned profile and the personal identity must remain available' USING ERRCODE='23514'; END IF;

 UPDATE public.profiles SET status='archived',updated_at=clock_timestamp()
 WHERE id=p_profile_id AND owner_account_id=p_owner_account_id;
 WITH suspended AS (
  UPDATE public.profile_memberships SET status='suspended'
  WHERE profile_id=p_profile_id AND relationship='delegated' AND status='active'
  RETURNING account_id
 )
 SELECT COALESCE(array_agg(account_id),ARRAY[]::UUID[]) INTO v_suspended_delegate_ids FROM suspended;
 WITH revoked AS (
  UPDATE public.resource_grants SET revoked_at=clock_timestamp()
  WHERE resource_type='profile' AND resource_id=p_profile_id AND revoked_at IS NULL
  RETURNING subject_account_id
 )
 SELECT COALESCE(array_agg(DISTINCT subject_account_id),ARRAY[]::UUID[]) INTO v_revoked_grant_account_ids FROM revoked;
 SELECT COALESCE(array_agg(DISTINCT affected.account_id),ARRAY[]::UUID[]) INTO v_notified_access_account_ids
 FROM (
  SELECT unnest(v_suspended_delegate_ids) AS account_id
  UNION
  SELECT unnest(v_revoked_grant_account_ids) AS account_id
 ) affected;
 WITH cancelled AS (
  UPDATE public.profile_invitations SET status='cancelled',responded_at=clock_timestamp()
  WHERE profile_id=p_profile_id AND status='pending'
  RETURNING invitee_account_id
 )
 SELECT COALESCE(array_agg(invitee_account_id),ARRAY[]::UUID[]) INTO v_cancelled_invitee_ids FROM cancelled;
 UPDATE public.account_sessions SET active_profile_id=NULL,profile_context_version=NULL
 WHERE account_id=p_owner_account_id AND active_profile_id=p_profile_id AND status='active';
 INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(gen_random_uuid(),p_owner_account_id,'unibud','profile.archive','success','profile',p_profile_id,
  'owner_requested',jsonb_build_object('profile_kind',v_profile.kind,'previous_status',v_profile.status,
   'new_status','archived','suspended_delegate_account_ids',to_jsonb(v_suspended_delegate_ids),
   'revoked_profile_grant_account_ids',to_jsonb(v_revoked_grant_account_ids),
   'cancelled_invitee_account_ids',to_jsonb(v_cancelled_invitee_ids)));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(p_owner_account_id,p_profile_id,'profile_archived',
  jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle,
   'suspendedDelegateCount',cardinality(v_suspended_delegate_ids),'cancelledInvitationCount',cardinality(v_cancelled_invitee_ids)));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 SELECT delegate_account,p_profile_id,'delegated_access_suspended',
  jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle,'reason','profile_archived')
 FROM unnest(v_notified_access_account_ids) AS delegate_account;
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 SELECT invitee_account,p_profile_id,'profile_invitation_cancelled_by_archive',
  jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle,'reason','profile_archived')
 FROM unnest(v_cancelled_invitee_ids) AS invitee_account;
 RETURN TRUE;
END;
$function$;
ALTER FUNCTION public.profile_archive_owned(UUID,UUID) OWNER TO unibud_profile_owner;

-- Restoring a profile does not revive suspended access. Notify each suspended
-- delegate that the profile is back but their grant still needs owner review.
CREATE OR REPLACE FUNCTION public.profile_restore_owned(
 p_profile_id UUID,p_owner_account_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
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
 SELECT p.* INTO v_profile FROM public.profiles p
 WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND THEN RETURN FALSE; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id
  AND m.relationship='owner' AND m.role='owner' AND m.status='active') THEN
  RAISE EXCEPTION 'Only the owning account may restore this profile' USING ERRCODE='42501';
 END IF;
 IF v_profile.status='active' THEN RETURN TRUE; END IF;
 IF v_profile.status<>'archived' OR v_profile.kind NOT IN('creator','page_community') THEN
  RAISE EXCEPTION 'This profile cannot be restored through profile recovery' USING ERRCODE='55000';
 END IF;
 UPDATE public.profiles SET status='active',updated_at=clock_timestamp() WHERE id=p_profile_id;
 INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(gen_random_uuid(),p_owner_account_id,'unibud','profile.restore','success','profile',p_profile_id,'owner_requested',
  jsonb_build_object('profile_kind',v_profile.kind,'previous_status','archived','new_status','active',
   'suspended_delegate_account_ids',(SELECT COALESCE(jsonb_agg(account_id),'[]'::jsonb)
    FROM public.profile_memberships WHERE profile_id=p_profile_id AND relationship='delegated' AND status='suspended')));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(p_owner_account_id,p_profile_id,'profile_restored',jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 SELECT account_id,p_profile_id,'delegated_access_review_required',
  jsonb_build_object('profileName',v_profile.display_name,'handle',v_profile.handle,'reason','profile_restored_owner_review')
 FROM public.profile_memberships WHERE profile_id=p_profile_id AND relationship='delegated' AND status='suspended';
 RETURN TRUE;
END;
$function$;
ALTER FUNCTION public.profile_restore_owned(UUID,UUID) OWNER TO unibud_profile_owner;

-- Extend owner-visible lifecycle history to include transfer requests,
-- recipient consent, cancellation and completion audit events.
CREATE OR REPLACE FUNCTION public.profile_list_lifecycle_history(
  p_profile_id UUID,p_owner_account_id UUID
)
RETURNS TABLE(
  id UUID,occurred_at TIMESTAMPTZ,action TEXT,outcome TEXT,reason_code TEXT,event_data JSONB
)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
  OR NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
   ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
    AND m.role='owner' AND m.status='active'
   WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id)
 THEN RAISE EXCEPTION 'Only the active profile owner may view lifecycle history' USING ERRCODE='42501'; END IF;
 RETURN QUERY SELECT e.id,e.occurred_at,e.action,e.outcome,e.reason_code,e.event_data
 FROM public.security_audit_events e
 WHERE e.resource_type='profile' AND e.resource_id=p_profile_id AND e.application_id='unibud'
  AND (e.action IN('profile.archive','profile.restore') OR e.action LIKE 'profile.ownership_transfer.%')
 ORDER BY e.occurred_at DESC;
END;
$function$;
ALTER FUNCTION public.profile_list_lifecycle_history(UUID,UUID) OWNER TO unibud_profile_owner;

-- Direct app SQL must not bypass the serialized archive/restore procedures.
CREATE OR REPLACE FUNCTION public.reject_profile_status_change()
RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(OLD.owner_account_id::text,0));
  IF current_user<>'unibud_profile_owner' THEN
   RAISE EXCEPTION 'Profile lifecycle state can change only through an approved owner procedure'
    USING ERRCODE='55000';
  END IF;
 END IF;
 RETURN NEW;
END;
$function$;
CREATE TRIGGER profiles_status_change_requires_procedure
BEFORE UPDATE OF status ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.reject_profile_status_change();
REVOKE ALL ON FUNCTION public.reject_profile_status_change() FROM PUBLIC;

-- Serialize invitation and delegated-membership mutations against transfer
-- request/finalization by locking the same profile row before checking open consent.
CREATE OR REPLACE FUNCTION public.guard_profile_membership_during_transfer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF NEW.relationship='delegated' AND NEW.status IN('active','suspended') THEN
  PERFORM 1 FROM public.profiles WHERE id=NEW.profile_id FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public.profile_ownership_transfers
   WHERE profile_id=NEW.profile_id AND status IN('pending_recipient','recipient_accepted')
    AND expires_at>clock_timestamp()) THEN
   RAISE EXCEPTION 'Delegated access cannot be added or reactivated while profile ownership transfer consent is open'
    USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.guard_profile_membership_during_transfer() OWNER TO unibud_profile_owner;
CREATE TRIGGER profile_memberships_block_access_during_transfer
BEFORE INSERT OR UPDATE OF relationship,status ON public.profile_memberships
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_membership_during_transfer();
REVOKE ALL ON FUNCTION public.guard_profile_membership_during_transfer() FROM PUBLIC;

-- Profile-scoped resource grants share the same lifecycle lock. This blocks
-- grants from racing archive or appearing while transfer consent is open.
CREATE OR REPLACE FUNCTION public.guard_profile_resource_grant_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE v_profile_status TEXT;
BEGIN
 IF NEW.resource_type<>'profile' OR NEW.revoked_at IS NOT NULL THEN RETURN NEW; END IF;
 SELECT status INTO v_profile_status FROM public.profiles WHERE id=NEW.resource_id FOR UPDATE;
 IF v_profile_status IS DISTINCT FROM 'active' THEN
  RAISE EXCEPTION 'Active profile required for a new or updated profile-scoped grant'
   USING ERRCODE='23514';
 END IF;
 IF EXISTS(SELECT 1 FROM public.profile_ownership_transfers
  WHERE profile_id=NEW.resource_id AND status IN('pending_recipient','recipient_accepted')
   AND expires_at>clock_timestamp()) THEN
  RAISE EXCEPTION 'Profile-scoped grants are blocked while ownership transfer consent is open'
   USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.guard_profile_resource_grant_lifecycle() OWNER TO unibud_profile_owner;
CREATE TRIGGER resource_grants_profile_lifecycle_guard
BEFORE INSERT OR UPDATE ON public.resource_grants
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_resource_grant_lifecycle();
REVOKE ALL ON FUNCTION public.guard_profile_resource_grant_lifecycle() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.guard_profile_invitation_during_transfer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF NEW.status='pending' THEN
  PERFORM 1 FROM public.profiles WHERE id=NEW.profile_id FOR UPDATE;
  IF EXISTS(SELECT 1 FROM public.profile_ownership_transfers
   WHERE profile_id=NEW.profile_id AND status IN('pending_recipient','recipient_accepted')
    AND expires_at>clock_timestamp()) THEN
   RAISE EXCEPTION 'New invitations are blocked while profile ownership transfer consent is open'
    USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.guard_profile_invitation_during_transfer() OWNER TO unibud_profile_owner;
CREATE TRIGGER profile_invitations_block_new_pending_during_transfer
BEFORE INSERT OR UPDATE OF status ON public.profile_invitations
FOR EACH ROW EXECUTE FUNCTION public.guard_profile_invitation_during_transfer();
REVOKE ALL ON FUNCTION public.guard_profile_invitation_during_transfer() FROM PUBLIC;

-- Authentication identity verification changes serialize with transfer consent.
CREATE OR REPLACE FUNCTION public.lock_auth_identity_for_profile_transfer()
RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF NEW.status IS DISTINCT FROM OLD.status OR NEW.verified_at IS DISTINCT FROM OLD.verified_at THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(OLD.account_id::text,0));
 END IF;
 RETURN NEW;
END;
$function$;
CREATE TRIGGER authentication_identity_transfer_eligibility_lock
BEFORE UPDATE OF status,verified_at ON public.authentication_identities
FOR EACH ROW EXECUTE FUNCTION public.lock_auth_identity_for_profile_transfer();
REVOKE ALL ON FUNCTION public.lock_auth_identity_for_profile_transfer() FROM PUBLIC;

-- The immutable-owner trigger permits a change only while executing the
-- dedicated SECURITY DEFINER transfer procedure under its non-login owner.
CREATE OR REPLACE FUNCTION public.reject_profile_owner_change()
RETURNS trigger LANGUAGE plpgsql
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF NEW.owner_account_id IS DISTINCT FROM OLD.owner_account_id
    AND current_user<>'unibud_profile_owner' THEN
  RAISE EXCEPTION 'Profile ownership can change only through the verified ownership-transfer procedure'
   USING ERRCODE='55000';
 END IF;
 RETURN NEW;
END;
$function$;

-- Expiry and participant-account deactivation are terminal, audited transfer
-- outcomes. Both parties receive durable notifications.
CREATE OR REPLACE FUNCTION public.profile_audit_expired_ownership_transfer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF NEW.status='expired' AND OLD.status IN('pending_recipient','recipient_accepted') THEN
  INSERT INTO public.security_audit_events(id,actor_service,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
  VALUES(gen_random_uuid(),'unibud_profile_transfer_guard','unibud','profile.ownership_transfer.expired','success','profile',NEW.profile_id,
   'transfer_window_elapsed',jsonb_build_object('transfer_id',NEW.id,'owner_account_id',NEW.current_owner_account_id,'recipient_account_id',NEW.recipient_account_id));
  INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
  VALUES(NEW.current_owner_account_id,NEW.profile_id,'ownership_transfer_expired',jsonb_build_object('transferId',NEW.id)),
   (NEW.recipient_account_id,NEW.profile_id,'ownership_transfer_expired',jsonb_build_object('transferId',NEW.id));
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.profile_audit_expired_ownership_transfer() OWNER TO unibud_profile_owner;
CREATE TRIGGER profile_ownership_transfer_expiry_audit
AFTER UPDATE OF status ON public.profile_ownership_transfers
FOR EACH ROW EXECUTE FUNCTION public.profile_audit_expired_ownership_transfer();
REVOKE ALL ON FUNCTION public.profile_audit_expired_ownership_transfer() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.profile_cancel_transfers_for_inactive_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE v_transfer public.profile_ownership_transfers%ROWTYPE;
BEGIN
 IF OLD.status='active' AND NEW.status<>'active' THEN
  PERFORM pg_advisory_xact_lock(hashtextextended(NEW.id::text,0));
  FOR v_transfer IN
   UPDATE public.profile_ownership_transfers AS transfer
    SET status='cancelled',cancelled_at=clock_timestamp()
    WHERE transfer.status IN('pending_recipient','recipient_accepted')
     AND (transfer.current_owner_account_id=NEW.id OR transfer.recipient_account_id=NEW.id)
    RETURNING *
  LOOP
   INSERT INTO public.security_audit_events(id,actor_service,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
   VALUES(gen_random_uuid(),'unibud_profile_transfer_guard','unibud','profile.ownership_transfer.cancelled','success','profile',v_transfer.profile_id,
    'participant_account_inactive',jsonb_build_object('transfer_id',v_transfer.id,'affected_account_id',NEW.id));
   INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
   VALUES(v_transfer.current_owner_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
     jsonb_build_object('transferId',v_transfer.id,'reason','participant_account_inactive')),
    (v_transfer.recipient_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
     jsonb_build_object('transferId',v_transfer.id,'reason','participant_account_inactive'));
  END LOOP;
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.profile_cancel_transfers_for_inactive_account() OWNER TO unibud_profile_owner;
CREATE TRIGGER accounts_cancel_profile_transfers_when_inactive
AFTER UPDATE OF status ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.profile_cancel_transfers_for_inactive_account();
REVOKE ALL ON FUNCTION public.profile_cancel_transfers_for_inactive_account() FROM PUBLIC;

-- Losing the last verified sign-in identity also invalidates open consent.
CREATE OR REPLACE FUNCTION public.profile_cancel_transfers_for_unverified_identity()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE v_transfer public.profile_ownership_transfers%ROWTYPE;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.authentication_identities i
  WHERE i.account_id=NEW.account_id AND i.status='active' AND i.verified_at IS NOT NULL) THEN
  FOR v_transfer IN
   UPDATE public.profile_ownership_transfers AS transfer
    SET status='cancelled',cancelled_at=clock_timestamp()
    WHERE transfer.status IN('pending_recipient','recipient_accepted')
     AND (transfer.current_owner_account_id=NEW.account_id OR transfer.recipient_account_id=NEW.account_id)
    RETURNING *
  LOOP
   INSERT INTO public.security_audit_events(id,actor_service,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
   VALUES(gen_random_uuid(),'unibud_profile_transfer_guard','unibud','profile.ownership_transfer.cancelled','success','profile',v_transfer.profile_id,
    'participant_identity_unverified',jsonb_build_object('transfer_id',v_transfer.id,'affected_account_id',NEW.account_id));
   INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
   VALUES(v_transfer.current_owner_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
     jsonb_build_object('transferId',v_transfer.id,'reason','participant_identity_unverified')),
    (v_transfer.recipient_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
     jsonb_build_object('transferId',v_transfer.id,'reason','participant_identity_unverified'));
  END LOOP;
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.profile_cancel_transfers_for_unverified_identity() OWNER TO unibud_profile_owner;
CREATE TRIGGER authentication_identity_cancel_profile_transfers_when_unverified
AFTER UPDATE OF status,verified_at ON public.authentication_identities
FOR EACH ROW EXECUTE FUNCTION public.profile_cancel_transfers_for_unverified_identity();
REVOKE ALL ON FUNCTION public.profile_cancel_transfers_for_unverified_identity() FROM PUBLIC;

-- Archiving or restricting a profile invalidates any outstanding transfer
-- consent. A pending acceptance must never survive a profile becoming inactive.
CREATE OR REPLACE FUNCTION public.profile_cancel_open_transfer_on_inactive()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE v_transfer public.profile_ownership_transfers%ROWTYPE;
BEGIN
 IF OLD.status='active' AND NEW.status<>'active' THEN
  FOR v_transfer IN
   UPDATE public.profile_ownership_transfers
    SET status='cancelled',cancelled_at=clock_timestamp()
    WHERE profile_id=NEW.id AND status IN('pending_recipient','recipient_accepted')
    RETURNING *
  LOOP
   INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
   VALUES(gen_random_uuid(),NEW.owner_account_id,'unibud','profile.ownership_transfer.cancelled','success','profile',NEW.id,
    'profile_became_inactive',jsonb_build_object('transfer_id',v_transfer.id,'recipient_account_id',v_transfer.recipient_account_id));
   INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
   VALUES(v_transfer.current_owner_account_id,NEW.id,'ownership_transfer_cancelled',
     jsonb_build_object('transferId',v_transfer.id,'reason','profile_became_inactive')),
    (v_transfer.recipient_account_id,NEW.id,'ownership_transfer_cancelled',
     jsonb_build_object('transferId',v_transfer.id,'reason','profile_became_inactive'));
  END LOOP;
 END IF;
 RETURN NEW;
END;
$function$;
ALTER FUNCTION public.profile_cancel_open_transfer_on_inactive() OWNER TO unibud_profile_owner;
CREATE TRIGGER profiles_cancel_open_transfer_when_inactive
AFTER UPDATE OF status ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profile_cancel_open_transfer_on_inactive();
REVOKE ALL ON FUNCTION public.profile_cancel_open_transfer_on_inactive() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_profile_owner_change() FROM PUBLIC;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_preflight(
 p_profile_id UUID,p_owner_account_id UUID
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_profile public.profiles%ROWTYPE; v_owned INTEGER; v_delegated INTEGER; v_pending INTEGER; v_open INTEGER; v_personal BOOLEAN; v_verified BOOLEAN;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Transfer preflight denied' USING ERRCODE='42501';
 END IF;
 SELECT * INTO v_profile FROM public.profiles WHERE id=p_profile_id AND owner_account_id=p_owner_account_id;
 IF NOT FOUND OR v_profile.kind NOT IN('creator','page_community') OR NOT EXISTS(SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id AND m.account_id=p_owner_account_id AND m.relationship='owner' AND m.role='owner' AND m.status='active') THEN
  RAISE EXCEPTION 'Only an owned creator or page/community profile can be transferred' USING ERRCODE='42501';
 END IF;
 SELECT count(*) INTO v_owned FROM public.profiles p
 JOIN public.profile_memberships m ON m.profile_id=p.id AND m.account_id=p_owner_account_id
  AND m.relationship='owner' AND m.role='owner' AND m.status='active'
 WHERE p.owner_account_id=p_owner_account_id AND p.status='active';
 SELECT count(*) INTO v_delegated FROM public.profile_memberships
 WHERE profile_id=p_profile_id AND relationship='delegated' AND status IN('active','suspended');
 SELECT count(*) INTO v_pending FROM public.profile_invitations
 WHERE profile_id=p_profile_id AND status='pending' AND expires_at>clock_timestamp();
 SELECT count(*) INTO v_open FROM public.profile_ownership_transfers
 WHERE profile_id=p_profile_id AND status IN('pending_recipient','recipient_accepted') AND expires_at>clock_timestamp();
 SELECT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m ON m.profile_id=p.id
  AND m.account_id=p_owner_account_id AND m.relationship='owner' AND m.role='owner' AND m.status='active'
  WHERE p.owner_account_id=p_owner_account_id AND p.kind='personal' AND p.status='active') INTO v_personal;
 SELECT EXISTS(SELECT 1 FROM public.authentication_identities i WHERE i.account_id=p_owner_account_id AND i.status='active' AND i.verified_at IS NOT NULL) INTO v_verified;
 RETURN jsonb_build_object(
  'profileId',p_profile_id,'profileKind',v_profile.kind,'profileStatus',v_profile.status,
  'activeOwnedProfiles',v_owned,'activeDelegatedRelationships',v_delegated,
  'pendingInvitations',v_pending,'openTransferRequests',v_open,
  'personalIdentityAvailable',v_personal,'verifiedIdentityAvailable',v_verified,
  'canTransfer',v_profile.status='active' AND v_owned>1 AND v_personal AND v_verified AND v_delegated=0 AND v_pending=0 AND v_open=0
 );
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_request(
 p_transfer_id UUID,p_profile_id UUID,p_owner_account_id UUID,p_recipient_handle TEXT
) RETURNS TABLE(transfer_id UUID,recipient_handle TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_recipient UUID; v_handle TEXT; v_profile public.profiles%ROWTYPE; v_owned INTEGER;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
    OR p_recipient_handle IS NULL OR length(trim(p_recipient_handle)) NOT BETWEEN 3 AND 30
 THEN RAISE EXCEPTION 'Invalid ownership transfer request' USING ERRCODE='22023'; END IF;

 -- Resolve the intended account, then lock both participants in a stable order.
 SELECT a.id,p.handle INTO v_recipient,v_handle
 FROM public.profiles p JOIN public.accounts a ON a.id=p.owner_account_id
 WHERE p.kind='personal' AND p.status='active' AND a.status='active'
  AND p.handle_normalized=lower(trim(leading '@' from trim(p_recipient_handle))) LIMIT 1;
 IF v_recipient IS NULL OR v_recipient=p_owner_account_id
  OR NOT EXISTS(SELECT 1 FROM public.authentication_identities i
   WHERE i.account_id=v_recipient AND i.status='active' AND i.verified_at IS NOT NULL)
 THEN RAISE EXCEPTION 'Recipient identity is not eligible for this transfer' USING ERRCODE='P0002'; END IF;

 PERFORM pg_advisory_xact_lock(LEAST(hashtextextended(p_owner_account_id::text,0),hashtextextended(v_recipient::text,0)));
 PERFORM pg_advisory_xact_lock(GREATEST(hashtextextended(p_owner_account_id::text,0),hashtextextended(v_recipient::text,0)));
 SELECT * INTO v_profile FROM public.profiles WHERE id=p_profile_id AND owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND OR v_profile.kind NOT IN('creator','page_community') OR v_profile.status<>'active'
  OR NOT EXISTS(SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id
   AND m.account_id=p_owner_account_id AND m.relationship='owner' AND m.role='owner' AND m.status='active')
 THEN RAISE EXCEPTION 'Only the owner of an active creator or page/community profile may transfer it' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active')
  OR NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=v_recipient AND status='active')
  OR NOT EXISTS(SELECT 1 FROM public.authentication_identities i
   WHERE i.account_id=v_recipient AND i.status='active' AND i.verified_at IS NOT NULL)
  OR NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
   ON m.profile_id=p.id AND m.account_id=v_recipient AND m.relationship='owner'
    AND m.role='owner' AND m.status='active'
   WHERE p.owner_account_id=v_recipient AND p.kind='personal' AND p.status='active')
 THEN RAISE EXCEPTION 'Owner or recipient account eligibility changed; authenticate again and retry' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM public.profile_memberships m WHERE m.profile_id=p_profile_id AND m.account_id=v_recipient)
 THEN RAISE EXCEPTION 'Recipient identity is not eligible for this transfer' USING ERRCODE='P0002'; END IF;

 -- Expire stale rows only after participant/profile locks serialize this request.
 UPDATE public.profile_ownership_transfers SET status='expired',cancelled_at=clock_timestamp()
  WHERE profile_id=p_profile_id AND status IN('pending_recipient','recipient_accepted') AND expires_at<=clock_timestamp();
 UPDATE public.profile_invitations SET status='expired',responded_at=clock_timestamp()
  WHERE profile_id=p_profile_id AND status='pending' AND expires_at<=clock_timestamp();

 SELECT count(*) INTO v_owned FROM public.profiles p JOIN public.profile_memberships m
 ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
  AND m.role='owner' AND m.status='active'
 WHERE p.owner_account_id=p_owner_account_id AND p.status='active';
 IF v_owned<=1 OR NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
  ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
  AND m.role='owner' AND m.status='active'
  WHERE p.owner_account_id=p_owner_account_id AND p.kind='personal' AND p.status='active')
 THEN RAISE EXCEPTION 'Transfer would remove the account’s remaining owned profile or personal identity' USING ERRCODE='23514'; END IF;
 IF EXISTS(SELECT 1 FROM public.profile_memberships WHERE profile_id=p_profile_id
   AND relationship='delegated' AND status IN('active','suspended'))
 OR EXISTS(SELECT 1 FROM public.profile_invitations WHERE profile_id=p_profile_id
   AND status='pending' AND expires_at>clock_timestamp())
 OR EXISTS(SELECT 1 FROM public.profile_ownership_transfers WHERE profile_id=p_profile_id
   AND status IN('pending_recipient','recipient_accepted'))
 THEN RAISE EXCEPTION 'Resolve delegated access, pending invitations and open transfers before requesting transfer' USING ERRCODE='23514'; END IF;

 INSERT INTO public.profile_ownership_transfers(id,profile_id,current_owner_account_id,recipient_account_id,expires_at)
 VALUES(p_transfer_id,p_profile_id,p_owner_account_id,v_recipient,clock_timestamp()+interval '7 days');
 INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(gen_random_uuid(),p_owner_account_id,'unibud','profile.ownership_transfer.requested','success','profile',p_profile_id,
  'owner_requested',jsonb_build_object('transfer_id',p_transfer_id,'recipient_account_id',v_recipient,'profile_kind',v_profile.kind));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(v_recipient,p_profile_id,'ownership_transfer_requested',
  jsonb_build_object('transferId',p_transfer_id,'profileName',v_profile.display_name,'handle',v_profile.handle));
 RETURN QUERY SELECT p_transfer_id,v_handle;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_list_incoming(p_recipient_account_id UUID)
RETURNS TABLE(transfer_id UUID,profile_id UUID,profile_name TEXT,profile_handle TEXT,
 owner_handle TEXT,created_at TIMESTAMPTZ,expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
 IF p_recipient_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Transfer inbox access denied' USING ERRCODE='42501';
 END IF;
 UPDATE public.profile_ownership_transfers AS transfer SET status='expired',cancelled_at=clock_timestamp()
 WHERE transfer.recipient_account_id=p_recipient_account_id AND transfer.status='pending_recipient' AND transfer.expires_at<=clock_timestamp();
 RETURN QUERY SELECT t.id,t.profile_id,p.display_name,p.handle,owner_profile.handle,t.created_at,t.expires_at
 FROM public.profile_ownership_transfers t
 JOIN public.profiles p ON p.id=t.profile_id
 JOIN public.profiles owner_profile ON owner_profile.owner_account_id=t.current_owner_account_id
  AND owner_profile.kind='personal' AND owner_profile.status='active'
 WHERE t.recipient_account_id=p_recipient_account_id AND t.status='pending_recipient'
  AND t.expires_at>clock_timestamp() ORDER BY t.created_at DESC LIMIT 50;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_list_outgoing(
 p_owner_account_id UUID,p_profile_id UUID
) RETURNS TABLE(transfer_id UUID,recipient_handle TEXT,status TEXT,created_at TIMESTAMPTZ,expires_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
  OR NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
   ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
    AND m.role='owner' AND m.status='active'
   WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id)
 THEN RAISE EXCEPTION 'Only the active owner may view outgoing transfer requests' USING ERRCODE='42501'; END IF;
 UPDATE public.profile_ownership_transfers AS transfer SET status='expired',cancelled_at=clock_timestamp()
 WHERE transfer.profile_id=p_profile_id AND transfer.current_owner_account_id=p_owner_account_id
  AND transfer.status IN('pending_recipient','recipient_accepted') AND transfer.expires_at<=clock_timestamp();
 RETURN QUERY SELECT t.id,recipient.handle,t.status,t.created_at,t.expires_at
 FROM public.profile_ownership_transfers t
 JOIN public.profiles recipient ON recipient.owner_account_id=t.recipient_account_id
  AND recipient.kind='personal' AND recipient.status='active'
 WHERE t.profile_id=p_profile_id AND t.current_owner_account_id=p_owner_account_id
  AND t.status IN('pending_recipient','recipient_accepted')
 ORDER BY t.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_respond(
 p_transfer_id UUID,p_recipient_account_id UUID,p_accept BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_transfer public.profile_ownership_transfers%ROWTYPE; v_profile public.profiles%ROWTYPE;
BEGIN
 IF p_recipient_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Only the intended recipient may respond to this transfer' USING ERRCODE='42501';
 END IF;
 -- Participant locks precede the transfer row, matching account/identity/profile
 -- eligibility triggers and the owner finalization lock order.
 SELECT * INTO v_transfer FROM public.profile_ownership_transfers
 WHERE id=p_transfer_id AND recipient_account_id=p_recipient_account_id;
 IF NOT FOUND OR v_transfer.status<>'pending_recipient' THEN RETURN FALSE; END IF;
 PERFORM pg_advisory_xact_lock(LEAST(hashtextextended(v_transfer.current_owner_account_id::text,0),hashtextextended(p_recipient_account_id::text,0)));
 PERFORM pg_advisory_xact_lock(GREATEST(hashtextextended(v_transfer.current_owner_account_id::text,0),hashtextextended(p_recipient_account_id::text,0)));
 SELECT * INTO v_transfer FROM public.profile_ownership_transfers
 WHERE id=p_transfer_id AND recipient_account_id=p_recipient_account_id FOR UPDATE;
 IF NOT FOUND OR v_transfer.status<>'pending_recipient' THEN RETURN FALSE; END IF;
 IF v_transfer.expires_at<=clock_timestamp() THEN
  UPDATE public.profile_ownership_transfers SET status='expired',cancelled_at=clock_timestamp() WHERE id=p_transfer_id;
  RETURN FALSE;
 END IF;
 SELECT * INTO v_profile FROM public.profiles
 WHERE id=v_transfer.profile_id AND owner_account_id=v_transfer.current_owner_account_id;
 IF NOT FOUND OR v_profile.status<>'active'
  OR NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=v_transfer.current_owner_account_id AND status='active')
  OR NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=p_recipient_account_id AND status='active')
  OR NOT EXISTS(SELECT 1 FROM public.authentication_identities WHERE account_id=p_recipient_account_id AND status='active' AND verified_at IS NOT NULL)
  OR NOT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
   ON m.profile_id=p.id AND m.account_id=p_recipient_account_id AND m.relationship='owner'
    AND m.role='owner' AND m.status='active'
   WHERE p.owner_account_id=p_recipient_account_id AND p.kind='personal' AND p.status='active')
 THEN
  UPDATE public.profile_ownership_transfers SET status='cancelled',cancelled_at=clock_timestamp() WHERE id=p_transfer_id;
  INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
  VALUES(gen_random_uuid(),p_recipient_account_id,'unibud','profile.ownership_transfer.cancelled','success','profile',v_transfer.profile_id,
   'participant_eligibility_changed',jsonb_build_object('transfer_id',p_transfer_id,'owner_account_id',v_transfer.current_owner_account_id));
  INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
  VALUES(v_transfer.current_owner_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
    jsonb_build_object('transferId',p_transfer_id,'reason','participant_eligibility_changed')),
   (p_recipient_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
    jsonb_build_object('transferId',p_transfer_id,'reason','participant_eligibility_changed'));
  RETURN FALSE;
 END IF;
 UPDATE public.profile_ownership_transfers SET status=CASE WHEN p_accept THEN 'recipient_accepted' ELSE 'recipient_declined' END,
  recipient_responded_at=clock_timestamp(),cancelled_at=CASE WHEN p_accept THEN NULL ELSE clock_timestamp() END
 WHERE id=p_transfer_id;
 INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(gen_random_uuid(),p_recipient_account_id,'unibud','profile.ownership_transfer.recipient_response','success','profile',v_transfer.profile_id,
  CASE WHEN p_accept THEN 'recipient_accepted' ELSE 'recipient_declined' END,
  jsonb_build_object('transfer_id',p_transfer_id,'owner_account_id',v_transfer.current_owner_account_id));
 IF p_accept THEN
  INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
  VALUES(v_transfer.current_owner_account_id,v_transfer.profile_id,'ownership_transfer_accepted',
   jsonb_build_object('transferId',p_transfer_id,'profileName',v_profile.display_name,'recipientAccountId',p_recipient_account_id));
 ELSE
  INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
  VALUES(v_transfer.current_owner_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
   jsonb_build_object('transferId',p_transfer_id,'reason','recipient_declined'));
 END IF;
 RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_cancel(
 p_transfer_id UUID,p_owner_account_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_transfer public.profile_ownership_transfers%ROWTYPE;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Transfer cancellation denied' USING ERRCODE='42501';
 END IF;
 SELECT * INTO v_transfer FROM public.profile_ownership_transfers
 WHERE id=p_transfer_id AND current_owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND OR v_transfer.status NOT IN('pending_recipient','recipient_accepted') THEN RETURN FALSE; END IF;
 UPDATE public.profile_ownership_transfers SET status='cancelled',cancelled_at=clock_timestamp() WHERE id=p_transfer_id;
 INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(gen_random_uuid(),p_owner_account_id,'unibud','profile.ownership_transfer.cancelled','success','profile',v_transfer.profile_id,
  'owner_cancelled',jsonb_build_object('transfer_id',p_transfer_id,'recipient_account_id',v_transfer.recipient_account_id));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(v_transfer.recipient_account_id,v_transfer.profile_id,'ownership_transfer_cancelled',
  jsonb_build_object('transferId',p_transfer_id));
 RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_ownership_transfer_complete(
 p_transfer_id UUID,p_owner_account_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_transfer public.profile_ownership_transfers%ROWTYPE; v_profile public.profiles%ROWTYPE;
 v_owned INTEGER; v_old_personal BOOLEAN; v_recipient_personal BOOLEAN; v_old_owner_handle TEXT; v_new_owner_handle TEXT;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Transfer completion denied' USING ERRCODE='42501';
 END IF;
 -- Read participant IDs without locking the transfer row. Acquire account locks
 -- first, then profile, then transfer: this matches archive/account-state triggers.
 SELECT * INTO v_transfer FROM public.profile_ownership_transfers
 WHERE id=p_transfer_id AND current_owner_account_id=p_owner_account_id;
 IF NOT FOUND OR v_transfer.status<>'recipient_accepted' THEN RETURN FALSE; END IF;
 PERFORM pg_advisory_xact_lock(LEAST(hashtextextended(p_owner_account_id::text,0),hashtextextended(v_transfer.recipient_account_id::text,0)));
 PERFORM pg_advisory_xact_lock(GREATEST(hashtextextended(p_owner_account_id::text,0),hashtextextended(v_transfer.recipient_account_id::text,0)));
 SELECT * INTO v_profile FROM public.profiles
 WHERE id=v_transfer.profile_id AND owner_account_id=p_owner_account_id FOR UPDATE;
 SELECT * INTO v_transfer FROM public.profile_ownership_transfers
 WHERE id=p_transfer_id AND current_owner_account_id=p_owner_account_id FOR UPDATE;
 IF NOT FOUND OR v_transfer.status<>'recipient_accepted' THEN RETURN FALSE; END IF;
 IF v_transfer.expires_at<=clock_timestamp() THEN
  UPDATE public.profile_ownership_transfers SET status='expired',cancelled_at=clock_timestamp() WHERE id=p_transfer_id;
  RETURN FALSE;
 END IF;
 IF NOT FOUND OR v_profile.id IS NULL OR v_profile.kind NOT IN('creator','page_community') OR v_profile.status<>'active'
  OR NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=p_owner_account_id AND status='active')
  OR NOT EXISTS(SELECT 1 FROM public.accounts WHERE id=v_transfer.recipient_account_id AND status='active')
 THEN RAISE EXCEPTION 'Transfer eligibility changed; request a new transfer after resolving account/profile state' USING ERRCODE='23514'; END IF;
 SELECT count(*) INTO v_owned FROM public.profiles p JOIN public.profile_memberships m
 ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
  AND m.role='owner' AND m.status='active'
 WHERE p.owner_account_id=p_owner_account_id AND p.status='active';
 SELECT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
  ON m.profile_id=p.id AND m.account_id=p_owner_account_id AND m.relationship='owner'
  AND m.role='owner' AND m.status='active'
  WHERE p.owner_account_id=p_owner_account_id AND p.kind='personal' AND p.status='active') INTO v_old_personal;
 SELECT EXISTS(SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
  ON m.profile_id=p.id AND m.account_id=v_transfer.recipient_account_id AND m.relationship='owner'
  AND m.role='owner' AND m.status='active'
  WHERE p.owner_account_id=v_transfer.recipient_account_id AND p.kind='personal' AND p.status='active')
  AND EXISTS(SELECT 1 FROM public.authentication_identities i WHERE i.account_id=v_transfer.recipient_account_id
   AND i.status='active' AND i.verified_at IS NOT NULL) INTO v_recipient_personal;
 SELECT handle INTO v_old_owner_handle FROM public.profiles
  WHERE owner_account_id=p_owner_account_id AND kind='personal' AND status='active' LIMIT 1;
 SELECT handle INTO v_new_owner_handle FROM public.profiles
  WHERE owner_account_id=v_transfer.recipient_account_id AND kind='personal' AND status='active' LIMIT 1;
 IF v_owned<=1 OR NOT v_old_personal OR NOT v_recipient_personal
  OR EXISTS(SELECT 1 FROM public.profile_memberships WHERE profile_id=v_profile.id
    AND relationship='delegated' AND status IN('active','suspended'))
  OR EXISTS(SELECT 1 FROM public.profile_invitations WHERE profile_id=v_profile.id
    AND status='pending' AND expires_at>clock_timestamp())
  OR EXISTS(SELECT 1 FROM public.profile_memberships WHERE profile_id=v_profile.id
    AND account_id=v_transfer.recipient_account_id)
 THEN RAISE EXCEPTION 'Transfer safeguards changed; remaining profiles, personal identity, recipient eligibility and all delegated access must be resolved' USING ERRCODE='23514'; END IF;

 SET CONSTRAINTS profile_memberships_profile_owner_fk DEFERRED;
 DELETE FROM public.profile_memberships WHERE profile_id=v_profile.id
  AND account_id=p_owner_account_id AND relationship='owner' AND role='owner' AND status='active';
 IF NOT FOUND THEN RAISE EXCEPTION 'Current owner membership is missing' USING ERRCODE='23514'; END IF;
 UPDATE public.profiles SET owner_account_id=v_transfer.recipient_account_id,updated_at=clock_timestamp()
  WHERE id=v_profile.id AND owner_account_id=p_owner_account_id;
 UPDATE public.profile_memberships SET profile_owner_account_id=v_transfer.recipient_account_id
  WHERE profile_id=v_profile.id;
 INSERT INTO public.profile_memberships(id,profile_id,account_id,owner_account_id,profile_owner_account_id,
  relationship,role,status,can_switch_to_profile,granted_by_account_id)
 VALUES(gen_random_uuid(),v_profile.id,v_transfer.recipient_account_id,v_transfer.recipient_account_id,
  v_transfer.recipient_account_id,'owner','owner','active',TRUE,v_transfer.recipient_account_id);

 UPDATE public.profile_invitations SET status='cancelled',responded_at=clock_timestamp()
 WHERE profile_id=v_profile.id AND status='pending';
 UPDATE public.resource_grants SET revoked_at=clock_timestamp()
 WHERE resource_type='profile' AND resource_id=v_profile.id AND revoked_at IS NULL;
 UPDATE public.account_sessions SET active_profile_id=NULL,profile_context_version=NULL
 WHERE active_profile_id=v_profile.id AND status='active';

 UPDATE public.profile_ownership_transfers SET status='completed',completed_at=clock_timestamp()
 WHERE id=p_transfer_id;
 INSERT INTO public.security_audit_events(id,actor_account_id,application_id,action,outcome,resource_type,resource_id,reason_code,event_data)
 VALUES(gen_random_uuid(),p_owner_account_id,'unibud','profile.ownership_transfer.completed','success','profile',v_profile.id,
  'two_party_consent_and_owner_reauthentication',
  jsonb_build_object('transfer_id',p_transfer_id,'previous_owner_account_id',p_owner_account_id,
   'new_owner_account_id',v_transfer.recipient_account_id,'previous_owner_handle',v_old_owner_handle,
   'new_owner_handle',v_new_owner_handle,'profile_kind',v_profile.kind));
 INSERT INTO public.profile_lifecycle_notifications(account_id,profile_id,event_type,details)
 VALUES(p_owner_account_id,v_profile.id,'ownership_transfer_completed',
  jsonb_build_object('transferId',p_transfer_id,'profileName',v_profile.display_name,'newOwnerAccountId',v_transfer.recipient_account_id,'newOwnerHandle',v_new_owner_handle)),
 (v_transfer.recipient_account_id,v_profile.id,'ownership_transfer_completed',
  jsonb_build_object('transferId',p_transfer_id,'profileName',v_profile.display_name,'previousOwnerAccountId',p_owner_account_id,'previousOwnerHandle',v_old_owner_handle));
 RETURN TRUE;
END;
$function$;

DO $ownership$
DECLARE signature TEXT;
BEGIN
 FOR signature IN
  SELECT p.oid::regprocedure::TEXT FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname IN(
   'profile_ownership_transfer_preflight','profile_ownership_transfer_request',
   'profile_ownership_transfer_list_incoming','profile_ownership_transfer_list_outgoing','profile_ownership_transfer_respond',
   'profile_ownership_transfer_cancel','profile_ownership_transfer_complete'
  )
 LOOP EXECUTE format('ALTER FUNCTION %s OWNER TO unibud_profile_owner',signature); END LOOP;
END;
$ownership$;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_preflight(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_request(UUID,UUID,UUID,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_list_incoming(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_list_outgoing(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_respond(UUID,UUID,BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_cancel(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_ownership_transfer_complete(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_preflight(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_request(UUID,UUID,UUID,TEXT) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_list_incoming(UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_list_outgoing(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_respond(UUID,UUID,BOOLEAN) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_cancel(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_ownership_transfer_complete(UUID,UUID) TO unibud_app;

COMMENT ON TABLE public.profile_ownership_transfers IS
 'Two-party, time-limited profile transfer consent. Recipient acceptance is not completion; current owner must reauthenticate and finalize.';
COMMENT ON FUNCTION public.profile_ownership_transfer_complete(UUID,UUID) IS
 'Finalizes an accepted transfer atomically, rechecks owner/recipient eligibility and remaining profile access, revokes scoped grants, clears active session profile contexts and writes immutable audit history.';
COMMIT;
