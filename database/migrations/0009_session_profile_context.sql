-- Preserve selected profile context across session rotation and expose it on trusted lookup.
BEGIN;

CREATE OR REPLACE FUNCTION public.auth_lookup_session(p_credential_digest BYTEA)
RETURNS TABLE(
  session_id UUID,
  account_id UUID,
  session_status TEXT,
  account_status TEXT,
  issued_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  idle_expires_at TIMESTAMPTZ,
  absolute_expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  active_profile_id UUID,
  profile_context_version UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
 SELECT s.id,s.account_id,s.status,a.status,s.issued_at,s.last_seen_at,
        s.idle_expires_at,s.absolute_expires_at,s.revoked_at,
        s.active_profile_id,s.profile_context_version
 FROM public.account_sessions s
 JOIN public.accounts a ON a.id=s.account_id
 WHERE s.credential_digest=p_credential_digest
 LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.auth_rotate_session(
 p_old_credential_digest BYTEA,
 p_new_session_id UUID,
 p_new_credential_digest BYTEA,
 p_now TIMESTAMPTZ,
 p_idle_expires_at TIMESTAMPTZ,
 p_absolute_expires_at TIMESTAMPTZ
)
RETURNS TABLE(session_id UUID,account_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE old_session public.account_sessions%ROWTYPE;
BEGIN
 SELECT * INTO old_session
 FROM public.account_sessions
 WHERE credential_digest=p_old_credential_digest
 FOR UPDATE;

 IF NOT FOUND OR old_session.status<>'active'
    OR old_session.revoked_at IS NOT NULL
    OR old_session.idle_expires_at<=p_now
    OR old_session.absolute_expires_at<=p_now
    OR p_new_credential_digest IS NULL OR octet_length(p_new_credential_digest)<>32
    OR p_idle_expires_at<=p_now
    OR p_absolute_expires_at< p_idle_expires_at
    OR p_absolute_expires_at>old_session.absolute_expires_at
    OR NOT EXISTS(SELECT 1 FROM public.accounts a WHERE a.id=old_session.account_id AND a.status='active') THEN
   RETURN;
 END IF;

 UPDATE public.account_sessions
 SET status='revoked',revoked_at=p_now,revocation_reason='rotated'
 WHERE id=old_session.id;

 INSERT INTO public.account_sessions(
  id,account_id,credential_digest,issued_at,last_seen_at,
  idle_expires_at,absolute_expires_at,rotated_from_session_id,
  active_profile_id,profile_context_version
 ) VALUES (
  p_new_session_id,old_session.account_id,p_new_credential_digest,p_now,p_now,
  LEAST(p_idle_expires_at,old_session.absolute_expires_at),
  old_session.absolute_expires_at,old_session.id,
  old_session.active_profile_id,old_session.profile_context_version
 );

 RETURN QUERY SELECT p_new_session_id,old_session.account_id;
END;
$function$;

ALTER FUNCTION public.auth_lookup_session(BYTEA) OWNER TO unibud_auth_owner;
ALTER FUNCTION public.auth_rotate_session(BYTEA,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) OWNER TO unibud_auth_owner;
REVOKE ALL ON FUNCTION public.auth_lookup_session(BYTEA) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_rotate_session(BYTEA,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_lookup_session(BYTEA) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_rotate_session(BYTEA,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) TO unibud_auth;

COMMIT;
