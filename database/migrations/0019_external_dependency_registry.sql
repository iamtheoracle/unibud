-- External dependency registry: declared integration surfaces and account-scoped opaque references.
-- No provider is marked verified from configuration templates or documentation alone.
BEGIN;

CREATE TABLE public.external_dependency_integrations (
  integration_key TEXT PRIMARY KEY CHECK (integration_key ~ '^[a-z][a-z0-9_]{2,63}$'),
  domain_key TEXT NOT NULL CHECK (domain_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  integration_kind TEXT NOT NULL CHECK (integration_kind IN (
    'delivery_gateway','first_party_service','object_storage','event_delivery',
    'payment_processor','identity_processor','analytics','backup','support'
  )),
  provider_name TEXT,
  verification_state TEXT NOT NULL DEFAULT 'unknown' CHECK (verification_state IN (
    'unknown','provider_unresolved','not_configured','configured_unverified',
    'verified','degraded','disabled'
  )),
  evidence_source TEXT NOT NULL CHECK (evidence_source IN (
    'repository_declaration','runtime_attestation','provider_confirmation','operator_review'
  )),
  data_categories TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  supports_lookup BOOLEAN NOT NULL DEFAULT FALSE,
  supports_export BOOLEAN NOT NULL DEFAULT FALSE,
  supports_delete BOOLEAN NOT NULL DEFAULT FALSE,
  supports_deletion_receipt BOOLEAN NOT NULL DEFAULT FALSE,
  supports_backup_expiry BOOLEAN NOT NULL DEFAULT FALSE,
  last_verified_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK (
    verification_state <> 'verified'
    OR (last_verified_at IS NOT NULL AND provider_name IS NOT NULL
      AND evidence_source IN ('runtime_attestation','provider_confirmation','operator_review'))
  ),
  CHECK (
    NOT (supports_lookup OR supports_export OR supports_delete OR supports_deletion_receipt OR supports_backup_expiry)
    OR (verification_state = 'verified' AND last_verified_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.external_dependency_integrations IS
'Registry of integration surfaces evidenced in repository configuration. A declared interface is not proof of a configured or verified provider. No credentials or provider secrets belong here.';

INSERT INTO public.external_dependency_integrations (
  integration_key, domain_key, integration_kind, provider_name,
  verification_state, evidence_source, data_categories
) VALUES
  (
    'verification_delivery_gateway', 'identity_verification', 'delivery_gateway', NULL,
    'unknown', 'repository_declaration',
    ARRAY['recipient_identifier','one_time_verification_code','delivery_status']
  ),
  (
    'oracle_arc', 'ai_assistance', 'first_party_service', 'Oracle Arc',
    'unknown', 'repository_declaration',
    ARRAY['prompt_context','authorised_tool_results']
  )
ON CONFLICT (integration_key) DO NOTHING;

CREATE TABLE public.account_external_dependency_refs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  integration_key TEXT NOT NULL REFERENCES public.external_dependency_integrations(integration_key) ON DELETE RESTRICT,
  domain_key TEXT NOT NULL CHECK (domain_key ~ '^[a-z][a-z0-9_]{1,63}$'),
  relationship_kind TEXT NOT NULL CHECK (relationship_kind IN (
    'owner','participant','controller','processor_copy','shared_participant'
  )),
  reference_digest BYTEA NOT NULL CHECK (octet_length(reference_digest) = 32),
  digest_key_version TEXT NOT NULL CHECK (length(digest_key_version) BETWEEN 1 AND 64),
  evidence_state TEXT NOT NULL DEFAULT 'unverified' CHECK (evidence_state IN (
    'unverified','observed','provider_confirmed','stale','unavailable'
  )),
  disposition_state TEXT NOT NULL DEFAULT 'unknown' CHECK (disposition_state IN (
    'unknown','retained','exportable','deletion_requested','deleted_confirmed',
    'retention_expired','transferred'
  )),
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  last_verified_at TIMESTAMPTZ,
  UNIQUE (account_id, integration_key, domain_key, reference_digest),
  CHECK (
    evidence_state <> 'provider_confirmed' OR last_verified_at IS NOT NULL
  ),
  CHECK (
    disposition_state <> 'deleted_confirmed'
    OR (evidence_state = 'provider_confirmed' AND last_verified_at IS NOT NULL)
  )
);

COMMENT ON TABLE public.account_external_dependency_refs IS
'Account-scoped external dependency references. reference_digest must be a keyed HMAC-SHA256 digest created by a trusted backend; raw provider identifiers, tokens, payloads and secrets must never be stored here.';

ALTER TABLE public.account_external_dependency_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_external_dependency_refs FORCE ROW LEVEL SECURITY;
CREATE POLICY account_external_dependency_refs_isolation
  ON public.account_external_dependency_refs
  USING (account_id = unibud_private.current_account_id())
  WITH CHECK (account_id = unibud_private.current_account_id());

ALTER TABLE public.external_dependency_integrations OWNER TO unibud_profile_owner;
ALTER TABLE public.account_external_dependency_refs OWNER TO unibud_profile_owner;
REVOKE ALL ON public.external_dependency_integrations FROM PUBLIC, unibud_app, unibud_readonly;
REVOKE ALL ON public.account_external_dependency_refs FROM PUBLIC, unibud_app, unibud_readonly;
GRANT SELECT ON public.external_dependency_integrations TO unibud_profile_owner;
GRANT SELECT ON public.account_external_dependency_refs TO unibud_profile_owner;

CREATE INDEX account_external_dependency_refs_account_domain_idx
  ON public.account_external_dependency_refs(account_id, domain_key, disposition_state);
CREATE INDEX account_external_dependency_refs_integration_idx
  ON public.account_external_dependency_refs(account_id, integration_key, evidence_state);

CREATE OR REPLACE FUNCTION public.account_external_dependency_discovery(p_account_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account UUID;
  v_counts JSONB;
  v_by_domain JSONB;
  v_integrations JSONB;
BEGIN
  v_account := unibud_private.current_account_id();
  IF v_account IS NULL OR p_account_id IS DISTINCT FROM v_account THEN
    RAISE EXCEPTION 'External dependency discovery denied' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.accounts a WHERE a.id = v_account) THEN
    RAISE EXCEPTION 'External dependency discovery unavailable' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
    'linkedReferences', count(*),
    'unverifiedReferences', count(*) FILTER (WHERE evidence_state <> 'provider_confirmed'),
    'unknownDispositionReferences', count(*) FILTER (WHERE disposition_state = 'unknown'),
    'unavailableReferences', count(*) FILTER (WHERE evidence_state = 'unavailable'),
    'staleReferences', count(*) FILTER (WHERE evidence_state = 'stale'),
    'sharedReferences', count(*) FILTER (WHERE relationship_kind IN ('participant','shared_participant'))
  )
  INTO v_counts
  FROM public.account_external_dependency_refs
  WHERE account_id = v_account;

  SELECT COALESCE(jsonb_object_agg(domain_key, reference_count), '{}'::jsonb)
  INTO v_by_domain
  FROM (
    SELECT domain_key, count(*) AS reference_count
    FROM public.account_external_dependency_refs
    WHERE account_id = v_account
    GROUP BY domain_key
  ) domains;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'integrationKey', integration_key,
    'domain', domain_key,
    'kind', integration_kind,
    'provider', provider_name,
    'verificationState', verification_state,
    'evidenceSource', evidence_source,
    'dataCategories', to_jsonb(data_categories),
    'capabilities', jsonb_build_object(
      'lookup', supports_lookup,
      'export', supports_export,
      'delete', supports_delete,
      'deletionReceipt', supports_deletion_receipt,
      'backupExpiry', supports_backup_expiry
    ),
    'lastVerifiedAt', last_verified_at
  ) ORDER BY integration_key), '[]'::jsonb)
  INTO v_integrations
  FROM public.external_dependency_integrations;

  RETURN jsonb_build_object(
    'version', 'external-dependency-registry-1',
    'accountId', v_account,
    'generatedAt', statement_timestamp(),
    'counts', v_counts,
    'countsByDomain', v_by_domain,
    'integrations', v_integrations,
    'coverage', jsonb_build_object(
      'accountReferencesAreOpaqueDigests', TRUE,
      'rawProviderIdentifiersExposed', FALSE,
      'providerVerificationRequired', TRUE,
      'unknownExternalDependenciesBlockClosure', TRUE
    ),
    'policy', jsonb_build_object(
      'status', 'not_approved',
      'missingPolicyDomains', jsonb_build_array('external_dependencies','provider_retention','provider_export','provider_deletion','backup_expiry'),
      'canClose', FALSE
    )
  );
END;
$function$;

ALTER FUNCTION public.account_external_dependency_discovery(UUID) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.account_external_dependency_discovery(UUID) FROM PUBLIC, unibud_readonly;
GRANT EXECUTE ON FUNCTION public.account_external_dependency_discovery(UUID) TO unibud_app;

COMMENT ON FUNCTION public.account_external_dependency_discovery(UUID) IS
'Returns account-scoped aggregate counts and a non-secret integration catalogue. Requires signed account context. It does not query providers, verify deletion, or authorise account closure.';

COMMIT;
