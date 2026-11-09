-- UNIBUD profile invitations: resolve a public UNIBUD identity server-side and
-- require the invited account to accept before delegated access becomes active.
BEGIN;

CREATE TABLE public.profile_invitations (
  id UUID PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  owner_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  invitee_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  role TEXT NOT NULL CHECK (role IN ('admin','moderator','editor','member','seller','provider','professional','student','staff','operator','viewer')),
  can_switch_to_profile BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','cancelled','expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  responded_at TIMESTAMPTZ,
  CHECK (owner_account_id <> invitee_account_id),
  CHECK (expires_at > created_at),
  CHECK ((status='pending') = (responded_at IS NULL))
);
CREATE UNIQUE INDEX profile_invitations_one_pending_idx
  ON public.profile_invitations(profile_id,invitee_account_id) WHERE status='pending';
CREATE INDEX profile_invitations_invitee_idx
  ON public.profile_invitations(invitee_account_id,status,created_at DESC);

ALTER TABLE public.profile_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_invitations FORCE ROW LEVEL SECURITY;
CREATE POLICY profile_invitations_participant_isolation ON public.profile_invitations
  USING (owner_account_id=unibud_private.current_account_id()
      OR invitee_account_id=unibud_private.current_account_id())
  WITH CHECK (owner_account_id=unibud_private.current_account_id());

GRANT SELECT ON public.profile_invitations TO unibud_app;
GRANT SELECT,INSERT,UPDATE ON public.profile_invitations TO unibud_profile_owner;

CREATE OR REPLACE FUNCTION public.profile_invite_by_handle(
  p_invitation_id UUID,p_profile_id UUID,p_owner_account_id UUID,
  p_invitee_handle TEXT,p_role TEXT,p_can_switch BOOLEAN
)
RETURNS TABLE(invitation_id UUID,invitee_handle TEXT,invitee_display_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_invitee UUID; v_handle TEXT; v_name TEXT;
BEGIN
 IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
    OR p_role IS NULL OR p_role NOT IN ('admin','moderator','editor','member','seller','provider','professional','student','staff','operator','viewer')
    OR p_invitee_handle IS NULL OR length(trim(p_invitee_handle)) NOT BETWEEN 3 AND 30 THEN
   RAISE EXCEPTION 'Invalid profile invitation' USING ERRCODE='42501';
 END IF;
 SELECT a.id,p.handle,CASE WHEN p.visibility='private' THEN 'UNIBUD member' ELSE p.display_name END INTO v_invitee,v_handle,v_name
 FROM public.profiles p JOIN public.accounts a ON a.id=p.owner_account_id
 WHERE p.kind='personal' AND p.status='active' AND p.visibility IN ('public','limited')
   AND p.handle_normalized=lower(trim(leading '@' from p_invitee_handle))
   AND a.status='active'
 LIMIT 1;
 IF v_invitee IS NULL OR v_invitee=p_owner_account_id THEN
   RAISE EXCEPTION 'UNIBUD identity not found or not eligible' USING ERRCODE='P0002';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.profiles p JOIN public.profile_memberships m
     ON m.profile_id=p.id AND m.account_id=p_owner_account_id
      AND m.relationship='owner' AND m.status='active'
   WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
     AND p.kind='page_community' AND p.status='active'
 ) THEN
   RAISE EXCEPTION 'Only the page owner may invite a delegate' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.profile_invitations(id,profile_id,owner_account_id,invitee_account_id,role,can_switch_to_profile)
 VALUES(p_invitation_id,p_profile_id,p_owner_account_id,v_invitee,p_role,p_can_switch);
 RETURN QUERY SELECT p_invitation_id,v_handle,v_name;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_respond_to_invitation(
 p_invitation_id UUID,p_invitee_account_id UUID,p_accept BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_invitation public.profile_invitations%ROWTYPE;
BEGIN
 IF p_invitee_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
  RAISE EXCEPTION 'Invitation recipient authentication required' USING ERRCODE='42501';
 END IF;
 SELECT * INTO v_invitation FROM public.profile_invitations
 WHERE id=p_invitation_id AND invitee_account_id=p_invitee_account_id
 FOR UPDATE;
 IF NOT FOUND OR v_invitation.status<>'pending' THEN RETURN FALSE; END IF;
 IF v_invitation.expires_at<=clock_timestamp() THEN
  UPDATE public.profile_invitations SET status='expired',responded_at=clock_timestamp() WHERE id=p_invitation_id;
  RETURN FALSE;
 END IF;
 IF NOT p_accept THEN
  UPDATE public.profile_invitations SET status='declined',responded_at=clock_timestamp() WHERE id=p_invitation_id;
  RETURN TRUE;
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.profiles p JOIN public.accounts a ON a.id=p.owner_account_id
   WHERE p.id=v_invitation.profile_id AND p.owner_account_id=v_invitation.owner_account_id
     AND p.kind='page_community' AND p.status='active' AND a.status='active') THEN
  UPDATE public.profile_invitations SET status='cancelled',responded_at=clock_timestamp() WHERE id=p_invitation_id;
  RETURN FALSE;
 END IF;
 INSERT INTO public.profile_memberships(
  id,profile_id,account_id,owner_account_id,profile_owner_account_id,
  relationship,role,status,can_switch_to_profile,granted_by_account_id,granted_at,revoked_at
 ) VALUES (
  gen_random_uuid(),v_invitation.profile_id,p_invitee_account_id,NULL,v_invitation.owner_account_id,
  'delegated',v_invitation.role,'active',v_invitation.can_switch_to_profile,
  v_invitation.owner_account_id,clock_timestamp(),NULL
 )
 ON CONFLICT(profile_id,account_id) DO UPDATE
 SET role=EXCLUDED.role,status='active',can_switch_to_profile=EXCLUDED.can_switch_to_profile,
     granted_by_account_id=EXCLUDED.granted_by_account_id,granted_at=EXCLUDED.granted_at,revoked_at=NULL
 WHERE public.profile_memberships.relationship='delegated'
   AND public.profile_memberships.profile_owner_account_id=v_invitation.owner_account_id;
 IF NOT FOUND THEN
  RAISE EXCEPTION 'Existing profile relationship cannot be overwritten' USING ERRCODE='42501';
 END IF;
 UPDATE public.profile_invitations SET status='accepted',responded_at=clock_timestamp() WHERE id=p_invitation_id;
 RETURN TRUE;
END;
$function$;


CREATE OR REPLACE FUNCTION public.profile_list_incoming_invitations(p_invitee_account_id UUID)
RETURNS TABLE(
 id UUID,profile_id UUID,profile_name TEXT,profile_handle TEXT,
 owner_display_name TEXT,owner_handle TEXT,role TEXT,
 can_switch_to_profile BOOLEAN,created_at TIMESTAMPTZ,expires_at TIMESTAMPTZ
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
 SELECT i.id,i.profile_id,p.display_name,p.handle,owner_profile.display_name,owner_profile.handle,
        i.role,i.can_switch_to_profile,i.created_at,i.expires_at
 FROM public.profile_invitations i
 JOIN public.profiles p ON p.id=i.profile_id
 JOIN public.profiles owner_profile ON owner_profile.owner_account_id=i.owner_account_id
   AND owner_profile.kind='personal' AND owner_profile.status='active'
 WHERE i.invitee_account_id=p_invitee_account_id
   AND p_invitee_account_id=unibud_private.current_account_id()
   AND i.status='pending' AND i.expires_at>statement_timestamp()
 ORDER BY i.created_at DESC
$function$;

DO $ownership$
DECLARE signature TEXT;
BEGIN
 FOR signature IN
  SELECT p.oid::regprocedure::TEXT FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname IN ('profile_invite_by_handle','profile_respond_to_invitation','profile_list_incoming_invitations')
 LOOP EXECUTE format('ALTER FUNCTION %s OWNER TO unibud_profile_owner',signature); END LOOP;
END;
$ownership$;
REVOKE ALL ON FUNCTION public.profile_invite_by_handle(UUID,UUID,UUID,TEXT,TEXT,BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_respond_to_invitation(UUID,UUID,BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_list_incoming_invitations(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_invite_by_handle(UUID,UUID,UUID,TEXT,TEXT,BOOLEAN) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_respond_to_invitation(UUID,UUID,BOOLEAN) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_list_incoming_invitations(UUID) TO unibud_app;

COMMIT;
