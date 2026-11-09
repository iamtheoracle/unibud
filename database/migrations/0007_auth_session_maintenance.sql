-- Missing narrowly scoped session maintenance and challenge-owner lookup procedures.
BEGIN;

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
 OR p_idle_expires_at<=p_now THEN RETURN FALSE; END IF;
 UPDATE public.account_sessions
 SET last_seen_at=p_now,
     idle_expires_at=LEAST(p_idle_expires_at,absolute_expires_at)
 WHERE credential_digest=p_credential_digest
   AND status='active' AND revoked_at IS NULL
   AND idle_expires_at>p_now AND absolute_expires_at>p_now;
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

ALTER FUNCTION public.auth_lookup_challenge_account(UUID) OWNER TO unibud_auth_owner;
ALTER FUNCTION public.auth_touch_session(BYTEA,TIMESTAMPTZ,TIMESTAMPTZ) OWNER TO unibud_auth_owner;
ALTER FUNCTION public.auth_revoke_all_sessions(UUID,TIMESTAMPTZ,TEXT) OWNER TO unibud_auth_owner;

REVOKE ALL ON FUNCTION public.auth_lookup_challenge_account(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_touch_session(BYTEA,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_revoke_all_sessions(UUID,TIMESTAMPTZ,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_lookup_challenge_account(UUID) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_touch_session(BYTEA,TIMESTAMPTZ,TIMESTAMPTZ) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_revoke_all_sessions(UUID,TIMESTAMPTZ,TEXT) TO unibud_auth;

COMMIT;
