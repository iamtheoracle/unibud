-- Authenticated, account-scoped dependency discovery for closure readiness.
-- Counts only; no row contents, identifiers, credentials or event payloads leave PostgreSQL.
BEGIN;

GRANT SELECT ON
  public.accounts,
  public.authentication_identities,
  public.password_credentials,
  public.verification_challenges,
  public.account_sessions,
  public.profiles,
  public.profile_memberships,
  public.resource_grants,
  public.security_audit_events,
  public.profile_invitations,
  public.profile_lifecycle_notifications,
  public.profile_ownership_transfers
TO unibud_profile_owner;

CREATE OR REPLACE FUNCTION public.account_dependency_discovery(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_counts JSONB;
  v_foreign_keys JSONB;
  v_shared JSONB;
BEGIN
  v_account := unibud_private.current_account_id();
  IF v_account IS NULL OR p_account_id IS DISTINCT FROM v_account THEN
    RAISE EXCEPTION 'Account dependency discovery denied' USING ERRCODE='42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.id=v_account) THEN
    RAISE EXCEPTION 'Account dependency discovery unavailable' USING ERRCODE='42501';
  END IF;

  SELECT jsonb_build_object(
    'account', (SELECT count(*) FROM public.accounts WHERE id=v_account),
    'authenticationIdentities', (SELECT count(*) FROM public.authentication_identities WHERE account_id=v_account),
    'passwordCredentials', (SELECT count(*) FROM public.password_credentials WHERE account_id=v_account),
    'verificationChallenges', (SELECT count(*) FROM public.verification_challenges WHERE account_id=v_account),
    'sessions', (SELECT count(*) FROM public.account_sessions WHERE account_id=v_account),
    'ownedProfiles', (SELECT count(*) FROM public.profiles WHERE owner_account_id=v_account),
    'activeOwnedProfiles', (SELECT count(*) FROM public.profiles WHERE owner_account_id=v_account AND status='active'),
    'archivedOwnedProfiles', (SELECT count(*) FROM public.profiles WHERE owner_account_id=v_account AND status='archived'),
    'restrictedOwnedProfiles', (SELECT count(*) FROM public.profiles WHERE owner_account_id=v_account AND status='restricted'),
    'ownedMemberships', (SELECT count(*) FROM public.profile_memberships WHERE account_id=v_account AND relationship='owner'),
    'delegatedMemberships', (SELECT count(*) FROM public.profile_memberships WHERE account_id=v_account AND relationship='delegated'),
    'delegatedToOwnedProfiles', (SELECT count(*) FROM public.profile_memberships WHERE profile_owner_account_id=v_account AND relationship='delegated'),
    'subjectGrants', (SELECT count(*) FROM public.resource_grants WHERE subject_account_id=v_account),
    'issuedGrants', (SELECT count(*) FROM public.resource_grants WHERE issuer_account_id=v_account),
    'incomingInvitations', (SELECT count(*) FROM public.profile_invitations WHERE invitee_account_id=v_account),
    'outgoingInvitations', (SELECT count(*) FROM public.profile_invitations WHERE owner_account_id=v_account),
    'lifecycleNotifications', (SELECT count(*) FROM public.profile_lifecycle_notifications WHERE account_id=v_account),
    'outgoingOwnershipTransfers', (SELECT count(*) FROM public.profile_ownership_transfers WHERE current_owner_account_id=v_account),
    'incomingOwnershipTransfers', (SELECT count(*) FROM public.profile_ownership_transfers WHERE recipient_account_id=v_account),
    'auditEventsAsActor', (SELECT count(*) FROM public.security_audit_events WHERE actor_account_id=v_account)
  ) INTO v_counts;

  -- FK topology is schema metadata, not another account's data. Restrict it to
  -- the exact account/profile tables covered by this migration.
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'constraint', c.conname,
    'fromTable', src.relname,
    'toTable', dst.relname,
    'definition', pg_get_constraintdef(c.oid)
  ) ORDER BY src.relname,c.conname),'[]'::jsonb)
  INTO v_foreign_keys
  FROM pg_constraint c
  JOIN pg_class src ON src.oid=c.conrelid
  JOIN pg_namespace src_ns ON src_ns.oid=src.relnamespace
  JOIN pg_class dst ON dst.oid=c.confrelid
  JOIN pg_namespace dst_ns ON dst_ns.oid=dst.relnamespace
  WHERE c.contype='f'
    AND src_ns.nspname='public' AND dst_ns.nspname='public'
    AND src.relname IN (
      'accounts','authentication_identities','account_sessions','profiles',
      'profile_memberships','resource_grants','security_audit_events',
      'profile_invitations','profile_lifecycle_notifications','profile_ownership_transfers'
    )
    AND dst.relname IN (
      'accounts','authentication_identities','account_sessions','profiles',
      'profile_memberships','resource_grants','security_audit_events',
      'profile_invitations','profile_lifecycle_notifications','profile_ownership_transfers'
    );

  SELECT jsonb_build_object(
    'delegatedMembershipsGrantedToOthers',
      (SELECT count(*) FROM public.profile_memberships
       WHERE profile_owner_account_id=v_account AND relationship='delegated'),
    'delegatedMembershipsHeldByThisAccount',
      (SELECT count(*) FROM public.profile_memberships
       WHERE account_id=v_account AND relationship='delegated'),
    'pendingInvitationsSent',
      (SELECT count(*) FROM public.profile_invitations
       WHERE owner_account_id=v_account AND status='pending' AND expires_at>statement_timestamp()),
    'pendingInvitationsReceived',
      (SELECT count(*) FROM public.profile_invitations
       WHERE invitee_account_id=v_account AND status='pending' AND expires_at>statement_timestamp()),
    'openTransfersSent',
      (SELECT count(*) FROM public.profile_ownership_transfers
       WHERE current_owner_account_id=v_account AND status IN('pending_recipient','recipient_accepted')),
    'openTransfersReceived',
      (SELECT count(*) FROM public.profile_ownership_transfers
       WHERE recipient_account_id=v_account AND status IN('pending_recipient','recipient_accepted'))
  ) INTO v_shared;

  RETURN jsonb_build_object(
    'version','account-dependency-discovery-1',
    'accountId',v_account,
    'generatedAt',statement_timestamp(),
    'counts',v_counts,
    'sharedOwnership',v_shared,
    'foreignKeys',v_foreign_keys,
    'coverage',jsonb_build_object(
      'registeredTables',jsonb_build_array(
        'accounts','authentication_identities','account_sessions','profiles',
        'profile_memberships','resource_grants','security_audit_events',
        'profile_invitations','profile_lifecycle_notifications','profile_ownership_transfers'
      ),
      'notImplementedDomains',jsonb_build_array(
        'messaging','media','commerce_and_services','education','subscriptions_and_operations'
      ),
      'unknownExternalDependenciesBlockClosure',true
    ),
    'policy',jsonb_build_object(
      'status','not_approved',
      'missingPolicyDomains',jsonb_build_array(
        'identity','sessions','profiles','delegation_and_grants','profile_lifecycle',
        'messaging','media','commerce_and_services','education','subscriptions_and_operations'
      ),
      'canClose',false
    )
  );
END;
$function$;

ALTER FUNCTION public.account_dependency_discovery(UUID) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.account_dependency_discovery(UUID) FROM PUBLIC,unibud_readonly;
GRANT EXECUTE ON FUNCTION public.account_dependency_discovery(UUID) TO unibud_app;

COMMENT ON FUNCTION public.account_dependency_discovery(UUID) IS
'Returns aggregate counts and FK topology only for the account proven by signed transaction context. Never returns row contents. Unknown domains and missing policy remain closure blockers.';

COMMIT;
