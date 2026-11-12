-- Bind Operations authorization and audit to one persisted, live session.
-- Apply after 0022_operations_mfa_storage.sql.
-- Session GUCs are transport only; this verifier independently checks the HMAC
-- and the persisted session state. The app role cannot execute the verifier.

BEGIN;

ALTER TABLE public.unibud_operator_audit_events
  ADD COLUMN session_id UUID REFERENCES public.account_sessions(id) ON DELETE RESTRICT;

CREATE INDEX unibud_operator_audit_session_time_idx
  ON public.unibud_operator_audit_events(session_id, occurred_at DESC)
  WHERE session_id IS NOT NULL;

-- Session assertions use a separate key from the existing account-context
-- signer. A compromise of one signing purpose must not automatically forge the other.
CREATE TABLE unibud_private.session_context_signing_keys (
  key_id TEXT PRIMARY KEY,
  secret BYTEA NOT NULL CHECK (octet_length(secret) >= 32),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX session_context_signing_keys_one_active_idx
  ON unibud_private.session_context_signing_keys(active) WHERE active;
REVOKE ALL ON unibud_private.session_context_signing_keys
  FROM PUBLIC, unibud_app, unibud_readonly, unibud_migrator;

-- The NOLOGIN Operations owner is the only principal allowed to read the
-- dedicated session verifier key and persisted session row.
GRANT SELECT ON unibud_private.session_context_signing_keys TO unibud_ops_owner;
GRANT SELECT ON public.account_sessions TO unibud_ops_owner;
GRANT USAGE ON SCHEMA public TO unibud_ops_owner;
REVOKE CREATE ON SCHEMA public FROM unibud_ops_owner;
GRANT USAGE ON SCHEMA unibud_private TO unibud_ops_owner;
GRANT EXECUTE ON FUNCTION unibud_private.current_account_id() TO unibud_ops_owner;

CREATE FUNCTION unibud_private.current_session_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account_text TEXT;
  v_session_text TEXT;
  v_expiry_text TEXT;
  v_nonce TEXT;
  v_signature TEXT;
  v_account UUID;
  v_session UUID;
  v_key BYTEA;
  v_expected BYTEA;
  v_supplied BYTEA;
  v_diff INTEGER := 0;
  v_index INTEGER;
  v_now BIGINT;
BEGIN
  v_account_text := current_setting('unibud.account_id', true);
  v_session_text := current_setting('unibud.session_id', true);
  v_expiry_text := current_setting('unibud.context_expiry', true);
  v_nonce := current_setting('unibud.context_nonce', true);
  v_signature := current_setting('unibud.session_context_signature', true);

  IF v_account_text IS NULL OR v_session_text IS NULL
     OR v_expiry_text IS NULL OR v_nonce IS NULL OR v_signature IS NULL
     OR v_account_text !~ '^[0-9a-fA-F-]{36}$'
     OR v_session_text !~ '^[0-9a-fA-F-]{36}$'
     OR v_expiry_text !~ '^[0-9]{1,12}$'
     OR v_nonce !~ '^[0-9a-fA-F-]{36}$'
     OR v_signature !~ '^[0-9a-f]{64}$' THEN
    RETURN NULL;
  END IF;

  v_account := v_account_text::UUID;
  v_session := v_session_text::UUID;

  -- The independent account claim must also be valid and name the same account.
  IF unibud_private.current_account_id() IS DISTINCT FROM v_account THEN
    RETURN NULL;
  END IF;

  v_now := floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_expiry_text::BIGINT < v_now OR v_expiry_text::BIGINT > v_now + 120 THEN
    RETURN NULL;
  END IF;

  SELECT secret INTO v_key
  FROM unibud_private.session_context_signing_keys
  WHERE active
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_key IS NULL THEN
    RETURN NULL;
  END IF;

  v_expected := public.hmac(
    convert_to('v1:' || v_account_text || ':' || v_session_text || ':' ||
               v_expiry_text || ':' || v_nonce, 'UTF8'),
    v_key,
    'sha256'
  );
  v_supplied := decode(v_signature, 'hex');
  IF octet_length(v_supplied) <> 32 THEN
    RETURN NULL;
  END IF;

  FOR v_index IN 0..31 LOOP
    v_diff := v_diff | (get_byte(v_expected, v_index) # get_byte(v_supplied, v_index));
  END LOOP;
  IF v_diff <> 0 THEN
    RETURN NULL;
  END IF;

  -- A valid signature is insufficient if the exact persisted session is no
  -- longer live, belongs to another account, or the account is not active.
  IF NOT EXISTS (
    SELECT 1
    FROM public.account_sessions s
    JOIN public.accounts a ON a.id = s.account_id
    WHERE s.id = v_session
      AND s.account_id = v_account
      AND s.status = 'active'
      AND s.revoked_at IS NULL
      AND s.issued_at <= statement_timestamp()
      AND s.idle_expires_at > statement_timestamp()
      AND s.absolute_expires_at > statement_timestamp()
      AND a.status = 'active'
  ) THEN
    RETURN NULL;
  END IF;

  RETURN v_session;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$function$;

ALTER FUNCTION unibud_private.current_session_id() OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.current_session_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION unibud_private.current_session_id() TO unibud_ops_owner;

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
  ) THEN
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

CREATE OR REPLACE FUNCTION public.unibud_operator_record_access(
  p_permission TEXT,
  p_outcome TEXT,
  p_request_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID;
  v_session UUID;
BEGIN
  IF p_permission IS NULL
     OR p_permission NOT IN (
       'integrations.verification_delivery.read',
       'integrations.oracle_arc.read',
       'dependencies.read',
       'operations.audit.read',
       'operations.accounts.support_read'
     )
     OR p_outcome IS NULL
     OR p_outcome NOT IN ('allowed','denied','unauthenticated','error')
     OR p_request_id IS NULL THEN
    RAISE EXCEPTION 'Invalid operator audit event' USING ERRCODE = '22023';
  END IF;

  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF (v_actor IS NULL AND (p_outcome <> 'unauthenticated' OR v_session IS NOT NULL))
     OR (v_actor IS NOT NULL AND (p_outcome = 'unauthenticated' OR v_session IS NULL)) THEN
    RAISE EXCEPTION 'Audit actor/session context is invalid' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.unibud_operator_audit_events(
    actor_account_id, session_id, permission, outcome, request_id
  ) VALUES (v_actor, v_session, p_permission, p_outcome, p_request_id);
END
$function$;
ALTER FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_record_access(TEXT,TEXT,UUID) TO unibud_app;

COMMENT ON FUNCTION unibud_private.current_session_id() IS
'Returns only the exact session whose versioned HMAC claim, account claim, persisted ownership, active state and expiry all verify. GUCs alone are never authority.';
COMMENT ON COLUMN public.unibud_operator_audit_events.session_id IS
'Exact persisted session independently verified by current_session_id(); NULL only for explicitly unauthenticated events.';

COMMIT;
