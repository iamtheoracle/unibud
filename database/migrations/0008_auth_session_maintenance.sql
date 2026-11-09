-- Missing narrowly scoped session maintenance and challenge-owner lookup procedures.
BEGIN;

DROP FUNCTION public.auth_lookup_session(BYTEA);
CREATE FUNCTION public.auth_lookup_session(p_credential_digest BYTEA)
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
  rotated_from_session_id UUID,
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
        s.rotated_from_session_id,s.active_profile_id,s.profile_context_version
 FROM public.account_sessions s
 JOIN public.accounts a ON a.id=s.account_id
 WHERE s.credential_digest=p_credential_digest
 LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.auth_lookup_challenge_account(p_challenge_id UUID)
RETURNS TABLE(account_id UUID, identity_id UUID, purpose TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
 SELECT vc.account_id,vc.authentication_identity_id,vc.purpose
 FROM public.verification_challenges vc
 WHERE vc.id=p_challenge_id
 LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.auth_touch_session(
 p_credential_digest BYTEA,p_now TIMESTAMPTZ,p_idle_expires_at TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
BEGIN
 IF p_credential_digest IS NULL OR octet_length(p_credential_digest)<>32
 OR p_now IS NULL OR p_idle_expires_at IS NULL OR p_idle_expires_at<=p_now THEN RETURN FALSE; END IF;
 UPDATE public.account_sessions
 SET last_seen_at=p_now,
     idle_expires_at=LEAST(p_idle_expires_at,absolute_expires_at)
 WHERE credential_digest=p_credential_digest
   AND status='active' AND revoked_at IS NULL
   AND issued_at<=p_now AND idle_expires_at>p_now AND absolute_expires_at>p_now
   AND EXISTS(SELECT 1 FROM public.accounts a WHERE a.id=account_sessions.account_id AND a.status='active');
 RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_revoke_all_sessions(
 p_account_id UUID,p_revoked_at TIMESTAMPTZ,p_reason TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE affected INTEGER;
BEGIN
 UPDATE public.account_sessions
 SET status='revoked',revoked_at=p_revoked_at,revocation_reason=left(p_reason,80)
 WHERE account_id=p_account_id AND status='active' AND revoked_at IS NULL;
 GET DIAGNOSTICS affected=ROW_COUNT;
 RETURN affected;
END;
$function$;

GRANT CREATE ON SCHEMA public TO unibud_auth_owner;
ALTER FUNCTION public.auth_lookup_session(BYTEA) OWNER TO unibud_auth_owner;
ALTER FUNCTION public.auth_lookup_challenge_account(UUID) OWNER TO unibud_auth_owner;
REVOKE CREATE ON SCHEMA public FROM unibud_auth_owner;
ALTER FUNCTION public.auth_touch_session(BYTEA,TIMESTAMPTZ,TIMESTAMPTZ) OWNER TO unibud_auth_owner;
ALTER FUNCTION public.auth_revoke_all_sessions(UUID,TIMESTAMPTZ,TEXT) OWNER TO unibud_auth_owner;

REVOKE ALL ON FUNCTION public.auth_lookup_session(BYTEA) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_lookup_challenge_account(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_touch_session(BYTEA,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_revoke_all_sessions(UUID,TIMESTAMPTZ,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_lookup_session(BYTEA) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_lookup_challenge_account(UUID) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_touch_session(BYTEA,TIMESTAMPTZ,TIMESTAMPTZ) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_revoke_all_sessions(UUID,TIMESTAMPTZ,TEXT) TO unibud_auth;

COMMIT;
