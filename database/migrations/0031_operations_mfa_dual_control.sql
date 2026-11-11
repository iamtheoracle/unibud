-- Protected dual-control Operations MFA disable/reset requests.
-- Both actors are derived from independently verified account + exact-session context.
-- Approval is atomic, single-use and enforced in PostgreSQL.
BEGIN;

ALTER TABLE public.unibud_operator_grants
  DROP CONSTRAINT unibud_operator_grants_permissions_check;
ALTER TABLE public.unibud_operator_grants
  ADD CONSTRAINT unibud_operator_grants_permissions_check CHECK (
    cardinality(permissions) > 0
    AND permissions <@ ARRAY[
      'integrations.verification_delivery.read',
      'integrations.oracle_arc.read',
      'dependencies.read',
      'operations.audit.read',
      'operations.accounts.support_read',
      'operations.mfa.security.request',
      'operations.mfa.security.approve'
    ]::TEXT[]
  );

CREATE OR REPLACE FUNCTION public.unibud_operator_has_permission(p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID;
BEGIN
  v_actor := unibud_private.current_account_id();
  v_session := unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_permission IS NULL OR p_permission NOT IN (
    'integrations.verification_delivery.read','integrations.oracle_arc.read',
    'dependencies.read','operations.audit.read','operations.accounts.support_read',
    'operations.mfa.security.request','operations.mfa.security.approve'
  ) OR NOT unibud_private.current_session_has_mfa_step_up() THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.unibud_operator_grants g
    JOIN public.accounts a ON a.id=g.account_id
    WHERE g.account_id=v_actor AND a.status='active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND p_permission=ANY(g.permissions)
  );
END
$function$;
ALTER FUNCTION public.unibud_operator_has_permission(TEXT) OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_has_permission(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_has_permission(TEXT) TO unibud_app;

ALTER TABLE public.unibud_operator_mfa_events
  DROP CONSTRAINT unibud_operator_mfa_events_event_type_check;
ALTER TABLE public.unibud_operator_mfa_events
  ADD CONSTRAINT unibud_operator_mfa_events_event_type_check CHECK (event_type IN (
    'enrollment_started','enrollment_confirmed','challenge_failed',
    'challenge_succeeded','locked_out','recovery_code_redeemed',
    'recovery_codes_regenerated','credential_removed',
    'security_reset_requested','security_reset_approved',
    'security_reset_rejected','security_credential_disabled'
  ));
ALTER TABLE public.unibud_operator_mfa_events
  ADD COLUMN target_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  ADD COLUMN security_request_id UUID,
  ADD COLUMN reason_code TEXT CHECK (reason_code IS NULL OR reason_code ~ '^[a-z][a-z0-9_]{2,47}$');

CREATE TABLE public.unibud_operator_mfa_security_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  requested_action TEXT NOT NULL CHECK (requested_action IN ('disable','reset')),
  state TEXT NOT NULL DEFAULT 'pending'
    CHECK (state IN ('pending','completed','rejected','cancelled','expired')),
  requester_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  requester_session_id UUID NOT NULL REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  approver_account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT,
  approver_session_id UUID REFERENCES public.account_sessions(id) ON DELETE RESTRICT,
  reason_code TEXT NOT NULL CHECK (reason_code ~ '^[a-z][a-z0-9_]{2,47}$'),
  policy_version SMALLINT NOT NULL DEFAULT 1 CHECK (policy_version=1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()+interval '30 minutes',
  decided_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  CHECK (expires_at>created_at),
  CHECK (
    (state='pending' AND approver_account_id IS NULL AND approver_session_id IS NULL
      AND decided_at IS NULL AND completed_at IS NULL)
    OR
    (state='completed' AND approver_account_id IS NOT NULL AND approver_session_id IS NOT NULL
      AND decided_at IS NOT NULL AND completed_at IS NOT NULL)
    OR
    (state IN ('rejected','cancelled','expired') AND decided_at IS NOT NULL
      AND completed_at IS NULL)
  ),
  CHECK (requester_account_id<>approver_account_id),
  CHECK (target_account_id<>approver_account_id)
);
CREATE UNIQUE INDEX unibud_operator_mfa_one_pending_security_request_idx
  ON public.unibud_operator_mfa_security_requests(target_account_id)
  WHERE state='pending';
CREATE INDEX unibud_operator_mfa_security_requests_pending_idx
  ON public.unibud_operator_mfa_security_requests(expires_at,created_at)
  WHERE state='pending';
ALTER TABLE public.unibud_operator_mfa_security_requests OWNER TO unibud_ops_owner;
REVOKE ALL ON public.unibud_operator_mfa_security_requests
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;

CREATE FUNCTION unibud_private.consume_operations_password_reauth_assertion(
  p_issued_at BIGINT,p_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID; v_session UUID; v_key BYTEA; v_expected BYTEA;
  v_supplied BYTEA; v_diff INTEGER:=0; v_i INTEGER; v_now BIGINT;
BEGIN
  v_account:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  v_now:=floor(extract(epoch FROM statement_timestamp()))::BIGINT;
  IF v_account IS NULL OR v_session IS NULL OR p_issued_at IS NULL
     OR p_expires_at IS NULL OR p_nonce IS NULL OR p_signature IS NULL
     OR length(p_signature)<>64 OR p_signature~'[^0-9a-f]'
     OR p_issued_at>v_now+5 OR p_expires_at<v_now
     OR p_expires_at<=p_issued_at OR p_expires_at-p_issued_at>120 THEN
    RETURN FALSE;
  END IF;
  SELECT secret INTO v_key FROM unibud_private.operations_mfa_assertion_signing_keys
    WHERE active ORDER BY created_at DESC LIMIT 1;
  IF v_key IS NULL THEN RETURN FALSE; END IF;
  v_expected:=public.hmac(convert_to(
    'v1:'||v_account::TEXT||':'||v_session::TEXT||':password_reauth:'||
    p_issued_at::TEXT||':'||p_expires_at::TEXT||':'||p_nonce::TEXT||':-','UTF8'),
    v_key,'sha256');
  v_supplied:=decode(p_signature,'hex');
  IF octet_length(v_supplied)<>32 THEN RETURN FALSE; END IF;
  FOR v_i IN 0..31 LOOP
    v_diff:=v_diff|(get_byte(v_expected,v_i)#get_byte(v_supplied,v_i));
  END LOOP;
  IF v_diff<>0 THEN RETURN FALSE; END IF;
  INSERT INTO public.unibud_operator_mfa_assertion_nonces(
    nonce,account_id,session_id,purpose,expires_at
  ) VALUES(p_nonce,v_account,v_session,'password_reauth',to_timestamp(p_expires_at));
  RETURN TRUE;
EXCEPTION WHEN unique_violation THEN RETURN FALSE;
END
$function$;
ALTER FUNCTION unibud_private.consume_operations_password_reauth_assertion(BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION unibud_private.consume_operations_password_reauth_assertion(BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;
GRANT EXECUTE ON FUNCTION unibud_private.consume_operations_password_reauth_assertion(BIGINT,BIGINT,UUID,TEXT)
  TO unibud_ops_owner;

CREATE FUNCTION public.unibud_operator_mfa_request_security_change(
  p_target_account_id UUID,p_action TEXT,p_reason_code TEXT,
  p_issued_at BIGINT,p_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE v_actor UUID; v_session UUID; v_request UUID;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_target_account_id IS NULL
     OR p_action NOT IN ('disable','reset')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.mfa.security.request')
     OR NOT unibud_private.consume_operations_password_reauth_assertion(
       p_issued_at,p_expires_at,p_nonce,p_signature
     ) THEN RETURN NULL; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.accounts a
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    WHERE a.id=p_target_account_id AND a.status='active'
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND cardinality(g.permissions)>0
      AND c.state='active'
      AND (c.locked_until IS NULL OR c.locked_until<=statement_timestamp())
  ) THEN RETURN NULL; END IF;
  INSERT INTO public.unibud_operator_mfa_security_requests(
    target_account_id,requested_action,requester_account_id,requester_session_id,
    reason_code,expires_at
  ) VALUES (
    p_target_account_id,p_action,v_actor,v_session,p_reason_code,
    clock_timestamp()+interval '30 minutes'
  ) RETURNING request_id INTO v_request;
  INSERT INTO public.unibud_operator_mfa_events(
    actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
  ) VALUES(v_actor,v_session,'security_reset_requested',p_target_account_id,v_request,p_reason_code);
  RETURN v_request;
EXCEPTION WHEN unique_violation THEN RETURN NULL;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_request_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_request_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_request_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

CREATE FUNCTION public.unibud_operator_mfa_decide_security_change(
  p_request_id UUID,p_decision TEXT,p_reason_code TEXT,
  p_issued_at BIGINT,p_expires_at BIGINT,p_nonce UUID,p_signature TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID; v_session UUID; v_request public.unibud_operator_mfa_security_requests%ROWTYPE;
BEGIN
  v_actor:=unibud_private.current_account_id();
  v_session:=unibud_private.current_session_id();
  IF v_actor IS NULL OR v_session IS NULL OR p_request_id IS NULL
     OR p_decision NOT IN ('approve','reject')
     OR p_reason_code IS NULL OR p_reason_code !~ '^[a-z][a-z0-9_]{2,47}$'
     OR NOT public.unibud_operator_has_permission('operations.mfa.security.approve')
     OR NOT unibud_private.consume_operations_password_reauth_assertion(
       p_issued_at,p_expires_at,p_nonce,p_signature
     ) THEN RETURN FALSE; END IF;

  SELECT * INTO v_request FROM public.unibud_operator_mfa_security_requests
    WHERE request_id=p_request_id FOR UPDATE;
  IF NOT FOUND OR v_request.state<>'pending'
     OR v_request.expires_at<=statement_timestamp()
     OR v_request.requester_account_id=v_actor
     OR v_request.target_account_id=v_actor THEN RETURN FALSE; END IF;

  -- Revalidate the requester's original account, grant, MFA credential and exact
  -- persisted session. The requester need not remain logged in at approval time.
  IF NOT EXISTS (
    SELECT 1 FROM public.accounts a
    JOIN public.account_sessions s ON s.account_id=a.id
    JOIN public.unibud_operator_grants g ON g.account_id=a.id
    JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
    WHERE a.id=v_request.requester_account_id AND a.status='active'
      AND s.id=v_request.requester_session_id AND s.status='active'
      AND s.revoked_at IS NULL AND s.issued_at<=statement_timestamp()
      AND s.idle_expires_at>statement_timestamp()
      AND s.absolute_expires_at>statement_timestamp()
      AND g.revoked_at IS NULL
      AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
      AND 'operations.mfa.security.request'=ANY(g.permissions)
      AND c.state='active'
      AND (c.locked_until IS NULL OR c.locked_until<=statement_timestamp())
  ) THEN RETURN FALSE; END IF;

  IF p_decision='approve' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.accounts a
      JOIN public.unibud_operator_grants g ON g.account_id=a.id
      JOIN public.unibud_operator_mfa_credentials c ON c.account_id=a.id
      WHERE a.id=v_request.target_account_id AND a.status='active'
        AND g.revoked_at IS NULL
        AND (g.expires_at IS NULL OR g.expires_at>statement_timestamp())
        AND cardinality(g.permissions)>0
        AND c.state='active'
        AND (c.locked_until IS NULL OR c.locked_until<=statement_timestamp())
    ) THEN RETURN FALSE; END IF;
    UPDATE public.unibud_operator_mfa_security_requests
      SET state='completed',approver_account_id=v_actor,approver_session_id=v_session,
          decided_at=clock_timestamp(),completed_at=clock_timestamp()
      WHERE request_id=p_request_id;
    DELETE FROM public.unibud_operator_mfa_step_up_sessions
      WHERE account_id=v_request.target_account_id;
    DELETE FROM public.unibud_operator_mfa_recovery_codes
      WHERE account_id=v_request.target_account_id;
    DELETE FROM public.unibud_operator_mfa_credentials
      WHERE account_id=v_request.target_account_id;
    INSERT INTO public.unibud_operator_mfa_events(
      actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
    ) VALUES(v_actor,v_session,
      CASE WHEN v_request.requested_action='disable'
        THEN 'security_credential_disabled' ELSE 'security_reset_approved' END,
      v_request.target_account_id,p_request_id,p_reason_code);
  ELSE
    UPDATE public.unibud_operator_mfa_security_requests
      SET state='rejected',approver_account_id=v_actor,approver_session_id=v_session,
          decided_at=clock_timestamp()
      WHERE request_id=p_request_id;
    INSERT INTO public.unibud_operator_mfa_events(
      actor_account_id,session_id,event_type,target_account_id,security_request_id,reason_code
    ) VALUES(v_actor,v_session,'security_reset_rejected',
      v_request.target_account_id,p_request_id,p_reason_code);
  END IF;
  RETURN TRUE;
END
$function$;
ALTER FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  OWNER TO unibud_ops_owner;
REVOKE ALL ON FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT)
  TO unibud_app;

COMMENT ON TABLE public.unibud_operator_mfa_security_requests IS
'Protected, expiring dual-control MFA disable/reset requests. Application roles have no direct table access; every decision is performed through a verified exact-session database procedure.';
COMMENT ON FUNCTION public.unibud_operator_mfa_decide_security_change(UUID,TEXT,TEXT,BIGINT,BIGINT,UUID,TEXT) IS
'Approves or rejects one pending request atomically. Requester and target cannot approve; approver requires its own live exact-session MFA step-up, password reauthentication and approval grant.';

COMMIT;
