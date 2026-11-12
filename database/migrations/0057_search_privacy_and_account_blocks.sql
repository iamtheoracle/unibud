-- Search privacy, age-safe discovery and account-level blocks.
-- Discovery is fail-closed until a trusted age-assurance integration provisions
-- current matching cohorts. No client or general app-role write path exists.
BEGIN;

CREATE TABLE public.account_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  blocked_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  revoked_at TIMESTAMPTZ,
  CONSTRAINT account_blocks_not_self CHECK (blocker_account_id <> blocked_account_id),
  CONSTRAINT account_blocks_status_timestamp CHECK (
    (status = 'active' AND revoked_at IS NULL) OR
    (status = 'revoked' AND revoked_at IS NOT NULL)
  ),
  CONSTRAINT account_blocks_pair_unique UNIQUE (blocker_account_id, blocked_account_id)
);

CREATE INDEX account_blocks_blocker_active_idx
  ON public.account_blocks(blocker_account_id, blocked_account_id)
  WHERE status = 'active';
CREATE INDEX account_blocks_blocked_active_idx
  ON public.account_blocks(blocked_account_id, blocker_account_id)
  WHERE status = 'active';

CREATE TABLE public.account_discovery_eligibility (
  account_id UUID PRIMARY KEY REFERENCES public.accounts(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('pending','verified','restricted','expired')),
  cohort_key TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT account_discovery_eligibility_verified_fields CHECK (
    (
      status = 'verified'
      AND cohort_key IS NOT NULL
      AND cohort_key ~ '^[a-z0-9:_-]{1,64}$'
      AND verified_at IS NOT NULL
      AND expires_at IS NOT NULL
      AND expires_at > verified_at
    )
    OR
    (
      status <> 'verified'
      AND cohort_key IS NULL
      AND verified_at IS NULL
      AND expires_at IS NULL
    )
  )
);

ALTER TABLE public.account_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_blocks FORCE ROW LEVEL SECURITY;
CREATE POLICY account_blocks_participant_read ON public.account_blocks
  FOR SELECT
  USING (
    blocker_account_id = unibud_private.current_account_id()
    OR blocked_account_id = unibud_private.current_account_id()
  );

ALTER TABLE public.account_discovery_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_discovery_eligibility FORCE ROW LEVEL SECURITY;
CREATE POLICY account_discovery_eligibility_self_read
  ON public.account_discovery_eligibility
  FOR SELECT
  USING (account_id = unibud_private.current_account_id());

REVOKE ALL ON public.account_blocks FROM PUBLIC, unibud_app, unibud_readonly;
GRANT SELECT ON public.account_blocks TO unibud_app;
GRANT SELECT, INSERT, UPDATE ON public.account_blocks TO unibud_profile_owner;
GRANT INSERT ON public.security_audit_events TO unibud_profile_owner;

REVOKE ALL ON public.account_discovery_eligibility FROM PUBLIC, unibud_app, unibud_readonly;
GRANT SELECT ON public.account_discovery_eligibility TO unibud_profile_owner;

CREATE OR REPLACE FUNCTION public.account_discovery_allowed(p_target_account_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
  SELECT EXISTS (
    SELECT 1
      FROM public.account_discovery_eligibility viewer
      JOIN public.account_discovery_eligibility target
        ON target.cohort_key = viewer.cohort_key
     WHERE viewer.account_id = unibud_private.current_account_id()
       AND viewer.status = 'verified'
       AND viewer.verified_at <= statement_timestamp()
       AND viewer.expires_at > statement_timestamp()
       AND target.account_id = p_target_account_id
       AND target.status = 'verified'
       AND target.verified_at <= statement_timestamp()
       AND target.expires_at > statement_timestamp()
  )
$function$;

ALTER FUNCTION public.account_discovery_allowed(UUID) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.account_discovery_allowed(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_discovery_allowed(UUID) TO unibud_app;

CREATE OR REPLACE FUNCTION public.account_block_handle(p_handle TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID := unibud_private.current_account_id();
  v_target UUID;
  v_handle TEXT := lower(btrim(p_handle));
BEGIN
  IF v_actor IS NULL OR v_handle IS NULL
     OR v_handle !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$'
     OR NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = v_actor AND a.status = 'active') THEN
    RETURN FALSE;
  END IF;

  SELECT p.owner_account_id INTO v_target
    FROM public.profiles p
    JOIN public.accounts target ON target.id = p.owner_account_id AND target.status = 'active'
   WHERE p.handle_normalized = v_handle AND p.status = 'active'
   LIMIT 1;

  IF v_target IS NULL OR v_target = v_actor THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.account_blocks(blocker_account_id, blocked_account_id, status, created_at, revoked_at)
  VALUES (v_actor, v_target, 'active', clock_timestamp(), NULL)
  ON CONFLICT (blocker_account_id, blocked_account_id)
  DO UPDATE SET status = 'active', created_at = clock_timestamp(), revoked_at = NULL;

  INSERT INTO public.security_audit_events(
    id, actor_account_id, application_id, action, outcome,
    resource_type, resource_id, request_id, event_data
  ) VALUES (
    gen_random_uuid(), v_actor, 'connect', 'account.block.create', 'success',
    'account', v_target, gen_random_uuid()::TEXT, '{}'::jsonb
  );
  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.account_unblock_handle(p_handle TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_actor UUID := unibud_private.current_account_id();
  v_target UUID;
  v_handle TEXT := lower(btrim(p_handle));
BEGIN
  IF v_actor IS NULL OR v_handle IS NULL
     OR v_handle !~ '^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$' THEN
    RETURN FALSE;
  END IF;

  SELECT p.owner_account_id INTO v_target
    FROM public.profiles p
   WHERE p.handle_normalized = v_handle
   LIMIT 1;

  IF v_target IS NULL OR v_target = v_actor THEN
    RETURN FALSE;
  END IF;

  UPDATE public.account_blocks
     SET status = 'revoked', revoked_at = clock_timestamp()
   WHERE blocker_account_id = v_actor
     AND blocked_account_id = v_target
     AND status = 'active';

  IF FOUND THEN
    INSERT INTO public.security_audit_events(
      id, actor_account_id, application_id, action, outcome,
      resource_type, resource_id, request_id, event_data
    ) VALUES (
      gen_random_uuid(), v_actor, 'connect', 'account.block.revoke', 'success',
      'account', v_target, gen_random_uuid()::TEXT, '{}'::jsonb
    );
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$function$;

ALTER FUNCTION public.account_block_handle(TEXT) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.account_unblock_handle(TEXT) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.account_block_handle(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.account_unblock_handle(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_block_handle(TEXT) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.account_unblock_handle(TEXT) TO unibud_app;

-- Only public, active profiles from the same current verified cohort are
-- discoverable. Block relationships in either direction override visibility.
CREATE POLICY profiles_public_discovery ON public.profiles
  FOR SELECT
  USING (
    status = 'active'
    AND visibility = 'public'
    AND owner_account_id <> unibud_private.current_account_id()
    AND public.account_discovery_allowed(owner_account_id)
    AND NOT EXISTS (
      SELECT 1
        FROM public.account_blocks b
       WHERE b.status = 'active'
         AND (
           (b.blocker_account_id = unibud_private.current_account_id()
             AND b.blocked_account_id = profiles.owner_account_id)
           OR
           (b.blocker_account_id = profiles.owner_account_id
             AND b.blocked_account_id = unibud_private.current_account_id())
         )
    )
  );

COMMENT ON TABLE public.account_blocks IS
  'Account-level block relationships. Search and messaging must enforce both directions before returning records or permitting interaction.';
COMMENT ON TABLE public.account_discovery_eligibility IS
  'Minimal age-assurance cohort gate for discovery. No client write path exists; unknown, expired or unverified accounts are undiscoverable.';
COMMENT ON FUNCTION public.account_discovery_allowed(UUID) IS
  'Allows discovery only when viewer and target have current verified matching cohorts from an approved age-assurance source.';
COMMENT ON FUNCTION public.account_block_handle(TEXT) IS
  'Creates or reactivates an account-level block by handle using only verified transaction account context; never accepts account IDs from clients.';
COMMENT ON FUNCTION public.account_unblock_handle(TEXT) IS
  'Revokes an existing account-level block by current profile handle; block history is retained.';

COMMIT;
