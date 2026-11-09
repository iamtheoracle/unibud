-- Strengthen delegated profile membership ownership and single personal-profile invariant.
-- Apply after 0004_first_party_auth_procedures.sql.

BEGIN;

DO $drop_legacy$
DECLARE item RECORD;
BEGIN
  FOR item IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid='public.profile_memberships'::regclass
      AND contype='c'
      AND (
        pg_get_constraintdef(oid) ILIKE '%owner_account_id IS NULL%'
        OR pg_get_constraintdef(oid) ILIKE '%relationship = %owner%'
      )
  LOOP
    EXECUTE format('ALTER TABLE public.profile_memberships DROP CONSTRAINT %I',item.conname);
  END LOOP;
END;
$drop_legacy$;

ALTER TABLE public.profile_memberships
  ADD CONSTRAINT profile_memberships_owner_delegation_integrity CHECK (
    (
      relationship='owner'
      AND role='owner'
      AND can_switch_to_profile
      AND owner_account_id=account_id
      AND profile_owner_account_id=account_id
    )
    OR
    (
      relationship='delegated'
      AND owner_account_id IS NULL
      AND profile_owner_account_id IS NOT NULL
      AND profile_owner_account_id<>account_id
      AND granted_by_account_id IS NOT NULL
      AND granted_by_account_id=profile_owner_account_id
    )
  );

CREATE UNIQUE INDEX IF NOT EXISTS profiles_one_personal_per_account_idx
  ON public.profiles(owner_account_id)
  WHERE kind='personal' AND status<>'archived';

COMMENT ON COLUMN public.profile_memberships.owner_account_id IS
  'Owner account is set only on owner rows. Delegated rows use profile_owner_account_id, which is FK-bound to the exact profile; only that owner may issue the delegation.';

COMMIT;
