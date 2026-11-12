-- Search privacy baseline and account-level blocking.
-- Search exposes only public active profiles and excludes blocks in both directions.
-- Blocks are account-level, immutable in identity and revocable through narrow procedures.
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

ALTER TABLE public.account_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_blocks FORCE ROW LEVEL SECURITY;
CREATE POLICY account_blocks_participant_read ON public.account_blocks
  FOR SELECT
  USING (
    blocker_account_id = unibud_private.current_account_id()
    OR blocked_account_id = unibud_private.current_account_id()
  );

REVOKE ALL ON public.account_blocks FROM PUBLIC, unibud_app, unibud_readonly;
GRANT SELECT ON public.account_blocks TO unibud_app;
GRANT SELECT, INSERT, UPDATE ON public.account_blocks TO unibud_profile_owner;

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
     OR NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.id=v_actor AND a.status='active') THEN
    RETURN FALSE;
  END IF;

  SELECT p.owner_account_id INTO v_target
  FROM public.profiles p
  JOIN public.accounts target ON target.id=p.owner_account_id AND target.status='active'
  WHERE p.handle_normalized=v_handle AND p.status='active'
  LIMIT 1;

  IF v_target IS NULL OR v_target=v_actor THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.account_blocks(blocker_account_id,blocked_account_id,status,created_at,revoked_at)
  VALUES (v_actor,v_target,'active',clock_timestamp(),NULL)
  ON CONFLICT (blocker_account_id,blocked_account_id)
  DO UPDATE SET status='active',created_at=clock_timestamp(),revoked_at=NULL;
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
  WHERE p.handle_normalized=v_handle
  LIMIT 1;

  IF v_target IS NULL OR v_target=v_actor THEN
    RETURN FALSE;
  END IF;

  UPDATE public.account_blocks
  SET status='revoked',revoked_at=clock_timestamp()
  WHERE blocker_account_id=v_actor AND blocked_account_id=v_target AND status='active';
  RETURN FOUND;
END;
$function$;

ALTER FUNCTION public.account_block_handle(TEXT) OWNER TO unibud_profile_owner;
ALTER FUNCTION public.account_unblock_handle(TEXT) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.account_block_handle(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.account_unblock_handle(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_block_handle(TEXT) TO unibud_app;
GRANT EXECUTE ON FUNCTION public.account_unblock_handle(TEXT) TO unibud_app;

-- Public-profile discovery is an explicit opt-in through profile visibility.
-- It does not expose private/limited profiles or profiles blocked in either direction.
CREATE POLICY profiles_public_discovery ON public.profiles
  FOR SELECT
  USING (
    status='active'
    AND visibility='public'
    AND owner_account_id <> unibud_private.current_account_id()
    AND NOT EXISTS (
      SELECT 1 FROM public.account_blocks b
      WHERE b.status='active'
        AND (
          (b.blocker_account_id=unibud_private.current_account_id()
            AND b.blocked_account_id=profiles.owner_account_id)
          OR
          (b.blocker_account_id=profiles.owner_account_id
            AND b.blocked_account_id=unibud_private.current_account_id())
        )
    )
  );

COMMENT ON TABLE public.account_blocks IS
  'Account-level block relationships. Search and messaging must enforce both directions before returning records or permitting interaction.';
COMMENT ON FUNCTION public.account_block_handle(TEXT) IS
  'Creates or reactivates an account-level block by public handle using only the verified transaction account context; never accepts account IDs from clients.';
COMMENT ON FUNCTION public.account_unblock_handle(TEXT) IS
  'Revokes an existing account-level block by current profile handle; block history is retained.';

COMMIT;
