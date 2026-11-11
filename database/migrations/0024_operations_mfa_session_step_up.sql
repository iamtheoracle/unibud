-- Database-enforced, exact-session Operations MFA step-up.
-- A server-signed assertion is proof that the TOTP verifier accepted one step;
-- PostgreSQL independently verifies the signature, consumes the nonce and
-- advances the TOTP counter atomically. App roles never access these tables.
BEGIN;

CREATE TABLE unibud_private.operations_mfa_assertion_signing_keys (
  key_id TEXT PRIMARY KEY,
  secret BYTEA NOT NULL CHECK (octet_length(secret) >= 32),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE UNIQUE INDEX operations_mfa_assertion_one_active_key_idx
  ON unibud_private.operations_mfa_assertion_signing_keys(active) WHERE active;
REVOKE ALL ON unibud_private.operations_mfa_assertion_signing_keys
  FROM PUBLIC, unibud_app, unibud_auth, unibud_readonly, unibud_migrator;
GRANT SELECT ON unibud_private.operations_mfa_assertion_signing_keys TO unibud_ops_owner;

CREATE TABLE public.unibud_operator_mfa_assertion_nonces (
  nonce UUID PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  session_id UUID NOT NULL REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  purpose TEXT NOT NULL CHECK (purpose IN ('enrollment_confirm','step_up','recovery')),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX unibud_operator_mfa_assertion_nonce_expiry_idx
  ON public.unibud_operator_mfa_assertion_nonces(expires_at);

CREATE TABLE public.unibud_operator_mfa_step_up_sessions (
  session_id UUID PRIMARY KEY REFERENCES public.account_sessions(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL,
  assertion_nonce UUID NOT NULL UNIQUE
    REFERENCES public.unibud_operator_mfa_assertion_nonces(nonce) ON DELETE RESTRICT,
  CHECK (expires_at > verified_at)
);
CREATE INDEX unibud_operator_mfa_step_up_expiry_idx
  ON public.unibud_operator_mfa_step_up_sessions(expires_at);

ALTER TABLE public.unibud_operator_mfa_assertion_nonces OWNER TO unibud_ops_owner;
ALTER TABLE public.unibud_operator_mfa_step_up_sessions OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_operator_mfa_assertion_nonces,
              public.unibud_operator_mfa_step_up_sessions
  FROM PUBLIC, unibud_app, unibud_auth, unibud_readonly, unibud_migrator;

CREATE FUNCTION unibud_private.current_session_has_mfa_step_up()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.unibud_operator_mfa_step_up_sessions step_up
    JOIN public.unibud_operator_mfa_credentials credential
      ON credential.account_id = step_up.account_id
     AND credential.state = 'active'
    WHERE (credential.locked_until IS NULL OR credential.locked_until <= statement_timestamp())
      AND step_up.account_id = unibud_private.current_account_id()
      AND step_up.session_id = unibud_private.current_session_id()
      AND step_up.expires_at > statement_timestamp()
  )
$function$;
ALTER FUNCTION unibud_private.current_session_has_mfa_step_up() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.current_session_has_mfa_step_up() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION unibud_private.current_session_has_mfa_step_up() TO unibud_ops_owner;

CREATE FUNCTION public.unibud_operator_mfa_consume_step_up(
  p_issued_at BIGINT,
  p_expires_at BIGINT,
  p_nonce UUID,
  p_matched_totp_step BIGINT,
  p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_session UUID;
  v_key BYTEA;
  v_expected BYTEA;
  v_supplied BYTEA;
  v_diff INTEGER := 0;
  v_i INTEGER;
  v_now BIGINT;
  v_updated UUID;
BEGIN
  v_account := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;

  IF v_account IS NULL OR v_session IS NULL OR p_issued_at IS NULL
     OR p_expires_at IS NULL OR p_nonce IS NULL OR p_matched_totp_step IS NULL
     OR p_matched_totp_step < 0 OR p_signature IS NULL OR p_signature !~ '^[0-9a-f]{64} > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
  WHEN OTHERS THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
  WHEN OTHERS THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
  WHEN OTHERS THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
  WHEN OTHERS THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
  WHEN OTHERS THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;

     OR p_issued_at > v_now + 5 OR p_expires_at < v_now
     OR p_expires_at <= p_issued_at OR p_expires_at - p_issued_at > 120 THEN
    RETURN FALSE;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.operations_mfa_assertion_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;

  v_expected := public.hmac(
    convert_to(
      'v1:' || v_account::TEXT || ':' || v_session::TEXT || ':step_up:' ||
      p_issued_at::TEXT || ':' || p_expires_at::TEXT || ':' ||
      p_nonce::TEXT || ':' || p_matched_totp_step::TEXT,
      'UTF8'
    ),
    v_key,
    'sha256'
  );
  v_supplied := decode(p_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected,v_i) # get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff <> 0 THEN RETURN FALSE; END IF;

  -- The active credential and strictly increasing TOTP step are consumed
  -- atomically; concurrent requests using one code cannot both succeed.
  UPDATE public.unibud_operator_mfa_credentials
  SET last_accepted_totp_step = p_matched_totp_step,
      failed_attempt_count = 0,
      locked_until = NULL,
      updated_at = clock_timestamp()
  WHERE account_id = v_account
    AND state = 'active'
    AND (locked_until IS NULL OR locked_until <= statement_timestamp())
    AND last_accepted_totp_step < p_matched_totp_step
  RETURNING account_id INTO v_updated;
  IF v_updated IS NULL THEN RETURN FALSE; END IF;

  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES (
    p_nonce,v_account,v_session,'step_up',to_timestamp(p_expires_at)
  );

  INSERT INTO public.unibud_operator_mfa_step_up_sessions(
    session_id,account_id,verified_at,expires_at,assertion_nonce
  ) VALUES (
    v_session,v_account,clock_timestamp(),clock_timestamp()+interval '5 minutes',p_nonce
  )
  ON CONFLICT (session_id) DO UPDATE
    SET account_id=EXCLUDED.account_id,
        verified_at=EXCLUDED.verified_at,
        expires_at=EXCLUDED.expires_at,
        assertion_nonce=EXCLUDED.assertion_nonce;

  RETURN TRUE;
EXCEPTION
  WHEN unique_violation THEN RETURN FALSE;
  WHEN OTHERS THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT)
  TO unibud_app;

-- Until enrollment and challenge routes are complete, an account without an
-- active MFA credential and an exact-session step-up is deliberately denied.
CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(
  p_permission TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read',
    'integrations.oracle_arc.read',
    'dependencies.read',
    'operations.audit.read',
    'operations.accounts.support_read'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id = g.account_id
    WHERE g.account_id = v_actor
      AND a.status = 'active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at > statement_timestamp())
      AND p_permission = ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_step_up_sessions IS
'Short-lived Operations MFA step-up bound to one exact persisted session. A new session, rotation, logout or expiry does not inherit this state.';
COMMENT ON FUNCTION public.unibud_operator_mfa_consume_step_up(BIGINT,BIGINT,UUID,BIGINT,TEXT) IS
'Consumes a server-signed TOTP assertion once, advances the account TOTP counter atomically and grants a five-minute exact-session step-up.';

COMMIT;
