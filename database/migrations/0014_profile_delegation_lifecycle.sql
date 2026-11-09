-- Delegation and invitation lifecycle controls.
-- Pending invitations can be cancelled by their owner; active delegations can
-- be role-adjusted, suspended, restored, or permanently revoked. Revoked access
-- is terminal and can only return through a fresh recipient-accepted invitation.
BEGIN;

CREATE OR REPLACE FUNCTION public.profile_manage_delegated_access(
  p_profile_id UUID,p_owner_account_id UUID,p_delegate_account_id UUID,
  p_role TEXT,p_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR p_delegate_account_id IS NULL OR p_delegate_account_id=p_owner_account_id
     OR p_role IS NULL OR p_role NOT IN (
       'admin','moderator','editor','member','seller','provider',
       'professional','student','staff','operator','viewer'
     )
     OR p_status IS NULL OR p_status NOT IN ('active','suspended')
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships owner_membership
         ON owner_membership.profile_id=p.id
        AND owner_membership.account_id=p_owner_account_id
        AND owner_membership.relationship='owner'
        AND owner_membership.role='owner'
        AND owner_membership.status='active'
       WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
         AND p.kind='page_community' AND p.status='active'
     ) THEN
    RAISE EXCEPTION 'Only the active page owner may manage delegated access' USING ERRCODE='42501';
  END IF;

  UPDATE public.profile_memberships
  SET role=p_role,status=p_status,
      revoked_at=NULL
  WHERE profile_id=p_profile_id AND account_id=p_delegate_account_id
    AND profile_owner_account_id=p_owner_account_id
    AND relationship='delegated'
    AND status IN ('active','suspended')
    AND revoked_at IS NULL;
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_cancel_invitation(
  p_invitation_id UUID,p_owner_account_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE v_invitation public.profile_invitations%ROWTYPE;
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id() THEN
    RAISE EXCEPTION 'Invitation owner authentication required' USING ERRCODE='42501';
  END IF;
  SELECT * INTO v_invitation FROM public.profile_invitations
   WHERE id=p_invitation_id AND owner_account_id=p_owner_account_id
   FOR UPDATE;
  IF NOT FOUND OR v_invitation.status<>'pending' THEN RETURN FALSE; END IF;

  IF v_invitation.expires_at<=clock_timestamp() THEN
    UPDATE public.profile_invitations
      SET status='expired',responded_at=clock_timestamp()
      WHERE id=p_invitation_id AND status='pending';
    RETURN FALSE;
  END IF;

  UPDATE public.profile_invitations
    SET status='cancelled',responded_at=clock_timestamp()
    WHERE id=p_invitation_id AND status='pending';
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.profile_list_outgoing_invitations(
  p_owner_account_id UUID,p_profile_id UUID
)
RETURNS TABLE(
 id UUID,profile_id UUID,invitee_handle TEXT,role TEXT,status TEXT,
 created_at TIMESTAMPTZ,expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
BEGIN
  IF p_owner_account_id IS DISTINCT FROM unibud_private.current_account_id()
     OR NOT EXISTS (
       SELECT 1 FROM public.profiles p
       JOIN public.profile_memberships m ON m.profile_id=p.id
        AND m.account_id=p_owner_account_id AND m.relationship='owner'
        AND m.status='active' AND m.role='owner'
       WHERE p.id=p_profile_id AND p.owner_account_id=p_owner_account_id
         AND p.kind='page_community'
     ) THEN
    RAISE EXCEPTION 'Only the active page owner may view outgoing invitations' USING ERRCODE='42501';
  END IF;

  UPDATE public.profile_invitations
    SET status='expired',responded_at=clock_timestamp()
    WHERE profile_invitations.profile_id=p_profile_id
      AND owner_account_id=p_owner_account_id
      AND status='pending' AND expires_at<=clock_timestamp();

  RETURN QUERY
    SELECT i.id,i.profile_id,recipient.handle,i.role,i.status,i.created_at,i.expires_at
    FROM public.profile_invitations i
    JOIN public.profiles recipient ON recipient.owner_account_id=i.invitee_account_id
      AND recipient.kind='personal'
    WHERE i.profile_id=p_profile_id AND i.owner_account_id=p_owner_account_id
      AND i.status IN ('pending','expired')
    ORDER BY i.created_at DESC;
END;
$function$;

ALTER FUNCTION public.profile_manage_delegated_access(UUID,UUID,UUID,TEXT,TEXT) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_cancel_invitation(UUID,UUID) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.profile_list_outgoing_invitations(UUID,UUID) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.profile_manage_delegated_access(UUID,UUID,UUID,TEXT,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_cancel_invitation(UUID,UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.profile_list_outgoing_invitations(UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.profile_manage_delegated_access(UUID,UUID,UUID,TEXT,TEXT) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_cancel_invitation(UUID,UUID) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.profile_list_outgoing_invitations(UUID,UUID) TO unibud_app;

COMMENT ON FUNCTION public.profile_manage_delegated_access(UUID,UUID,UUID,TEXT,TEXT) IS
 'Owner-only exact-page role and active/suspended lifecycle control. Revoked access is terminal.';
COMMENT ON FUNCTION public.profile_cancel_invitation(UUID,UUID) IS
 'Cancels only a pending invitation owned by the authenticated account; expired and responded invitations cannot be rewritten.';
COMMENT ON FUNCTION public.profile_list_outgoing_invitations(UUID,UUID) IS
 'Owner-only outgoing invitation list; expires overdue pending invitations before returning state.';
COMMIT;
