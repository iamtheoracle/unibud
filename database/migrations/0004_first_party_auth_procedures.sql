-- Trusted first-party authentication operations.
-- These narrow SECURITY DEFINER procedures are the only unauthenticated path
-- to account lookup/creation/session bootstrap. Runtime receives EXECUTE only.
-- Apply after 0003_credentials_and_verification.sql.

BEGIN;

DO $roles$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'unibud_auth') THEN
    CREATE ROLE unibud_auth NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'unibud_auth_owner') THEN
    CREATE ROLE unibud_auth_owner NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT BYPASSRLS;
  END IF;
END;
$roles$;

ALTER TABLE verification_challenges
  ADD COLUMN authentication_identity_id UUID REFERENCES authentication_identities(id) ON DELETE RESTRICT,
  ADD COLUMN verified_at TIMESTAMPTZ;

CREATE UNIQUE INDEX authentication_identity_lookup_unique
  ON authentication_identities(method, identifier_lookup_digest)
  WHERE status = 'active' AND identifier_lookup_digest IS NOT NULL;

GRANT SELECT, INSERT, UPDATE ON
  accounts, authentication_identities, password_credentials,
  verification_challenges, account_sessions
TO unibud_auth_owner;
GRANT USAGE ON SCHEMA unibud_private TO unibud_auth_owner;
CREATE OR REPLACE FUNCTION unibud_private.secure_bytea_equal(left_value BYTEA, right_value BYTEA)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = pg_catalog
AS $function$
DECLARE
  difference INTEGER := 0;
  position INTEGER;
BEGIN
  IF octet_length(left_value) <> octet_length(right_value) THEN
    RETURN FALSE;
  END IF;
  FOR position IN 0..octet_length(left_value) - 1 LOOP
    difference := difference | (get_byte(left_value, position) # get_byte(right_value, position));
  END LOOP;
  RETURN difference = 0;
END;
$function$;

REVOKE ALL ON FUNCTION unibud_private.secure_bytea_equal(BYTEA, BYTEA) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION unibud_private.secure_bytea_equal(BYTEA, BYTEA) TO unibud_auth_owner;

CREATE OR REPLACE FUNCTION public.auth_create_pending_account(
  p_account_id UUID,
  p_identity_id UUID,
  p_subject TEXT,
  p_method TEXT,
  p_identifier_ciphertext BYTEA,
  p_identifier_lookup_digest BYTEA,
  p_password_hash TEXT
)
RETURNS TABLE(account_id UUID, identity_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
BEGIN
  IF p_method NOT IN ('email','phone')
     OR p_subject IS NULL OR length(p_subject) < 16
     OR p_identifier_ciphertext IS NULL
     OR p_identifier_lookup_digest IS NULL OR octet_length(p_identifier_lookup_digest) <> 32
     OR p_password_hash IS NULL OR p_password_hash !~ '^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$' THEN
    RAISE EXCEPTION 'Invalid account registration payload' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.accounts(id,status) VALUES (p_account_id,'pending_verification');
  INSERT INTO public.authentication_identities(
    id,account_id,issuer,subject,method,identifier_ciphertext,
    identifier_lookup_digest,status
  ) VALUES (
    p_identity_id,p_account_id,'urn:unibud:first-party',p_subject,p_method,
    p_identifier_ciphertext,p_identifier_lookup_digest,'active'
  );
  INSERT INTO public.password_credentials(id,account_id,credential_hash)
    VALUES (gen_random_uuid(),p_account_id,p_password_hash);

  RETURN QUERY SELECT p_account_id,p_identity_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_lookup_identity(
  p_method TEXT,
  p_identifier_lookup_digest BYTEA
)
RETURNS TABLE(
  account_id UUID,
  identity_id UUID,
  account_status TEXT,
  identity_status TEXT,
  verified_at TIMESTAMPTZ,
  credential_hash TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT a.id, i.id, a.status, i.status, i.verified_at, pc.credential_hash
  FROM public.authentication_identities i
  JOIN public.accounts a ON a.id = i.account_id
  LEFT JOIN public.password_credentials pc ON pc.account_id = a.id
  WHERE i.method = p_method
    AND i.identifier_lookup_digest = p_identifier_lookup_digest
    AND i.status = 'active'
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.auth_create_verification_challenge(
  p_id UUID,
  p_account_id UUID,
  p_identity_id UUID,
  p_channel TEXT,
  p_purpose TEXT,
  p_target_digest BYTEA,
  p_code_digest BYTEA,
  p_created_at TIMESTAMPTZ,
  p_expires_at TIMESTAMPTZ,
  p_max_attempts INTEGER DEFAULT 5
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE identity_method TEXT;
BEGIN
  SELECT method INTO identity_method
  FROM public.authentication_identities
  WHERE id = p_identity_id AND account_id = p_account_id AND status = 'active';
  IF identity_method IS NULL
     OR (p_channel = 'email' AND identity_method <> 'email')
     OR (p_channel = 'phone' AND identity_method <> 'phone')
     OR p_purpose NOT IN ('email_verification','phone_verification','password_reset')
     OR (p_purpose = 'email_verification' AND p_channel <> 'email')
     OR (p_purpose = 'phone_verification' AND p_channel <> 'phone')
     OR p_channel NOT IN ('email','phone')
     OR p_target_digest IS NULL OR octet_length(p_target_digest) <> 32
     OR p_code_digest IS NULL OR octet_length(p_code_digest) <> 32
     OR p_expires_at <= p_created_at
     OR p_max_attempts NOT BETWEEN 1 AND 10 THEN
    RAISE EXCEPTION 'Invalid verification challenge payload' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.verification_challenges(
    id,account_id,authentication_identity_id,channel,purpose,
    target_digest,code_digest,created_at,expires_at,max_attempts
  ) VALUES (
    p_id,p_account_id,p_identity_id,p_channel,p_purpose,
    p_target_digest,p_code_digest,p_created_at,p_expires_at,p_max_attempts
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_revoke_verification_challenge(
  p_id UUID,
  p_revoked_at TIMESTAMPTZ
)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  UPDATE public.verification_challenges
  SET revoked_at = p_revoked_at
  WHERE id = p_id AND consumed_at IS NULL AND revoked_at IS NULL
$function$;

CREATE OR REPLACE FUNCTION public.auth_verify_challenge(
  p_id UUID,
  p_code_digest BYTEA,
  p_now TIMESTAMPTZ
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE challenge public.verification_challenges%ROWTYPE;
BEGIN
  SELECT * INTO challenge
  FROM public.verification_challenges
  WHERE id = p_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN 'not_found'; END IF;
  IF challenge.consumed_at IS NOT NULL THEN RETURN 'consumed'; END IF;
  IF challenge.revoked_at IS NOT NULL THEN RETURN 'locked'; END IF;
  IF challenge.expires_at <= p_now THEN RETURN 'expired'; END IF;
  IF challenge.attempts >= challenge.max_attempts THEN RETURN 'locked'; END IF;

  IF p_code_digest IS NULL OR NOT unibud_private.secure_bytea_equal(challenge.code_digest,p_code_digest) THEN
    UPDATE public.verification_challenges
    SET attempts = attempts + 1
    WHERE id = p_id;
    IF challenge.attempts + 1 >= challenge.max_attempts THEN
      RETURN 'locked';
    END IF;
    RETURN 'invalid';
  END IF;

  UPDATE public.verification_challenges
  SET verified_at = p_now,
      consumed_at = CASE WHEN purpose = 'password_reset' THEN NULL ELSE p_now END
  WHERE id = p_id;

  IF challenge.purpose IN ('email_verification','phone_verification') THEN
    UPDATE public.authentication_identities
    SET verified_at = COALESCE(verified_at,p_now), updated_at = p_now
    WHERE id = challenge.authentication_identity_id
      AND account_id = challenge.account_id
      AND status = 'active';
    IF NOT FOUND THEN RAISE EXCEPTION 'Challenge identity relationship is invalid'; END IF;
    UPDATE public.accounts
    SET status = 'active', updated_at = p_now
    WHERE id = challenge.account_id AND status = 'pending_verification';
  END IF;

  RETURN 'verified';
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_reset_password(
  p_challenge_id UUID,
  p_new_password_hash TEXT,
  p_now TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE challenge public.verification_challenges%ROWTYPE;
BEGIN
  IF p_new_password_hash IS NULL OR p_new_password_hash !~ '^scrypt\$ln=17,r=8,p=1\$[A-Za-z0-9_-]{22}\$[A-Za-z0-9_-]{86}$' THEN
    RETURN FALSE;
  END IF;
  SELECT * INTO challenge
  FROM public.verification_challenges
  WHERE id = p_challenge_id
  FOR UPDATE;

  IF NOT FOUND OR challenge.purpose <> 'password_reset'
     OR challenge.verified_at IS NULL OR challenge.consumed_at IS NOT NULL
     OR challenge.revoked_at IS NOT NULL OR challenge.expires_at <= p_now THEN
    RETURN FALSE;
  END IF;

  UPDATE public.password_credentials
  SET credential_hash = p_new_password_hash,
      updated_at = p_now,
      password_changed_at = p_now
  WHERE account_id = challenge.account_id;
  IF NOT FOUND THEN RETURN FALSE; END IF;

  UPDATE public.verification_challenges
  SET consumed_at = p_now
  WHERE id = p_challenge_id;
  UPDATE public.account_sessions
  SET status = 'revoked', revoked_at = p_now,
      revocation_reason = 'password_reset'
  WHERE account_id = challenge.account_id AND status = 'active';

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_create_session(
  p_session_id UUID,
  p_account_id UUID,
  p_credential_digest BYTEA,
  p_issued_at TIMESTAMPTZ,
  p_idle_expires_at TIMESTAMPTZ,
  p_absolute_expires_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  IF p_credential_digest IS NULL OR octet_length(p_credential_digest) <> 32
     OR p_idle_expires_at <= p_issued_at
     OR p_absolute_expires_at < p_idle_expires_at
     OR p_absolute_expires_at <= p_issued_at
     OR NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = p_account_id AND status = 'active') THEN
    RAISE EXCEPTION 'Invalid session issuance request' USING ERRCODE = '22023';
  END IF;
  INSERT INTO public.account_sessions(
    id,account_id,credential_digest,issued_at,last_seen_at,
    idle_expires_at,absolute_expires_at
  ) VALUES (
    p_session_id,p_account_id,p_credential_digest,p_issued_at,p_issued_at,
    p_idle_expires_at,p_absolute_expires_at
  );
  RETURN p_session_id;
END;
$function$;

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
  revoked_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
  SELECT s.id,s.account_id,s.status,a.status,s.issued_at,s.last_seen_at,
         s.idle_expires_at,s.absolute_expires_at,s.revoked_at
  FROM public.account_sessions s
  JOIN public.accounts a ON a.id = s.account_id
  WHERE s.credential_digest = p_credential_digest
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.auth_revoke_session(
  p_credential_digest BYTEA,
  p_revoked_at TIMESTAMPTZ,
  p_reason TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
BEGIN
  UPDATE public.account_sessions
  SET status = 'revoked', revoked_at = p_revoked_at,
      revocation_reason = left(p_reason,80)
  WHERE credential_digest = p_credential_digest AND status = 'active';
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auth_rotate_session(
  p_old_credential_digest BYTEA,
  p_new_session_id UUID,
  p_new_credential_digest BYTEA,
  p_now TIMESTAMPTZ,
  p_idle_expires_at TIMESTAMPTZ,
  p_absolute_expires_at TIMESTAMPTZ
)
RETURNS TABLE(session_id UUID, account_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE old_session public.account_sessions%ROWTYPE;
BEGIN
  SELECT * INTO old_session
  FROM public.account_sessions
  WHERE credential_digest = p_old_credential_digest
  FOR UPDATE;

  IF NOT FOUND OR old_session.status <> 'active'
     OR old_session.revoked_at IS NOT NULL
     OR old_session.idle_expires_at <= p_now
     OR old_session.absolute_expires_at <= p_now
     OR p_new_credential_digest IS NULL OR octet_length(p_new_credential_digest) <> 32
     OR p_idle_expires_at <= p_now
     OR p_absolute_expires_at < p_idle_expires_at
     OR NOT EXISTS (SELECT 1 FROM public.accounts WHERE id = old_session.account_id AND status = 'active') THEN
    RETURN;
  END IF;

  UPDATE public.account_sessions
  SET status = 'revoked', revoked_at = p_now, revocation_reason = 'rotated'
  WHERE id = old_session.id;

  INSERT INTO public.account_sessions(
    id,account_id,credential_digest,issued_at,last_seen_at,
    idle_expires_at,absolute_expires_at,rotated_from_session_id
  ) VALUES (
    p_new_session_id,old_session.account_id,p_new_credential_digest,p_now,p_now,
    p_idle_expires_at,p_absolute_expires_at,old_session.id
  );

  RETURN QUERY SELECT p_new_session_id,old_session.account_id;
END;
$function$;

-- The auth owner is a tightly scoped, NOLOGIN BYPASSRLS principal. It owns only
-- these reviewed procedures and has DML rights only on identity/auth tables.
GRANT CREATE ON SCHEMA public TO unibud_auth_owner;

DO $ownership$
DECLARE signature TEXT;
BEGIN
  FOR signature IN
    SELECT p.oid::regprocedure::TEXT
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'auth_create_pending_account','auth_lookup_identity',
      'auth_create_verification_challenge','auth_revoke_verification_challenge',
      'auth_verify_challenge','auth_reset_password','auth_create_session',
      'auth_lookup_session','auth_revoke_session','auth_rotate_session'
    )
  LOOP
    EXECUTE format('ALTER FUNCTION %s OWNER TO unibud_auth_owner',signature);
  END LOOP;
END;
$ownership$;

REVOKE CREATE ON SCHEMA public FROM unibud_auth_owner;

REVOKE ALL ON FUNCTION public.auth_create_pending_account(UUID,UUID,TEXT,TEXT,BYTEA,BYTEA,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_lookup_identity(TEXT,BYTEA) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_create_verification_challenge(UUID,UUID,UUID,TEXT,TEXT,BYTEA,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_revoke_verification_challenge(UUID,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_verify_challenge(UUID,BYTEA,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_reset_password(UUID,TEXT,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_create_session(UUID,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_lookup_session(BYTEA) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_revoke_session(BYTEA,TIMESTAMPTZ,TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.auth_rotate_session(BYTEA,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.auth_create_pending_account(UUID,UUID,TEXT,TEXT,BYTEA,BYTEA,TEXT) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_lookup_identity(TEXT,BYTEA) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_create_verification_challenge(UUID,UUID,UUID,TEXT,TEXT,BYTEA,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,INTEGER) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_revoke_verification_challenge(UUID,TIMESTAMPTZ) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_verify_challenge(UUID,BYTEA,TIMESTAMPTZ) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_reset_password(UUID,TEXT,TIMESTAMPTZ) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_create_session(UUID,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_lookup_session(BYTEA) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_revoke_session(BYTEA,TIMESTAMPTZ,TEXT) TO unibud_auth;
GRANT EXECUTE ON FUNCTION public.auth_rotate_session(BYTEA,UUID,BYTEA,TIMESTAMPTZ,TIMESTAMPTZ,TIMESTAMPTZ) TO unibud_auth;

COMMIT;
