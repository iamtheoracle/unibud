-- External dependency registry: opaque references, signed account scope and fail-closed policy.
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('19000000-0000-4000-8000-000000000001','active'),
 ('19000000-0000-4000-8000-000000000002','active');

INSERT INTO public.account_external_dependency_refs(
  id,account_id,integration_key,domain_key,relationship_kind,
  reference_digest,digest_key_version,evidence_state,disposition_state,last_verified_at
) VALUES
 (
  '29000000-0000-4000-8000-000000000001',
  '19000000-0000-4000-8000-000000000001',
  'verification_delivery_gateway','identity_verification','owner',
  decode(repeat('a1',32),'hex'),'test-v1','observed','unknown',NULL
 ),
 (
  '29000000-0000-4000-8000-000000000002',
  '19000000-0000-4000-8000-000000000002',
  'oracle_arc','ai_assistance','processor_copy',
  decode(repeat('b2',32),'hex'),'test-v1','unverified','unknown',NULL
 );

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-external-dependency-key',decode(repeat('b9',32),'hex'));

WITH x AS (
 SELECT '19000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'b9b9b9b9-b9b9-49b9-89b9-b9b9b9b9b9b9'::text n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('b9',32),'hex'),'sha256'),'hex'),true)
FROM x;

DO $test$
DECLARE v JSONB;
BEGIN
 v := public.account_external_dependency_discovery('19000000-0000-4000-8000-000000000001');

 IF (v#>>'{counts,linkedReferences}')::integer <> 1
   OR (v#>>'{counts,unverifiedReferences}')::integer <> 1
   OR (v#>>'{counts,unknownDispositionReferences}')::integer <> 1
 THEN
   RAISE EXCEPTION 'External dependency aggregate counts mismatch: %',v->'counts';
 END IF;

 IF (v#>>'{countsByDomain,identity_verification}')::integer <> 1 THEN
   RAISE EXCEPTION 'External dependency domain aggregation mismatch: %',v->'countsByDomain';
 END IF;

 IF (v#>>'{coverage,rawProviderIdentifiersExposed}')::boolean IS NOT FALSE
   OR (v#>>'{coverage,unknownExternalDependenciesBlockClosure}')::boolean IS NOT TRUE
 THEN
   RAISE EXCEPTION 'External dependency disclosure boundary is unsafe';
 END IF;

 IF v#>>'{policy,status}' <> 'not_approved'
   OR (v#>>'{policy,canClose}')::boolean IS NOT FALSE
 THEN
   RAISE EXCEPTION 'Unapproved external dependency policy did not block closure';
 END IF;

 IF EXISTS (
   SELECT 1 FROM jsonb_array_elements(v->'integrations') item
   WHERE item->>'verificationState' = 'verified'
      OR (item#>>'{capabilities,delete}')::boolean IS TRUE
 )
 THEN
   RAISE EXCEPTION 'Repository declarations must not imply provider verification or deletion capability';
 END IF;

 IF has_table_privilege('unibud_app','public.account_external_dependency_refs','SELECT')
   OR has_table_privilege('unibud_app','public.account_external_dependency_refs','INSERT')
 THEN
   RAISE EXCEPTION 'Application role must not directly read or write opaque external references';
 END IF;

 BEGIN
   UPDATE public.external_dependency_integrations
   SET supports_delete = TRUE
   WHERE integration_key = 'verification_delivery_gateway';
   RAISE EXCEPTION 'Unverified provider unexpectedly gained deletion capability';
 EXCEPTION WHEN check_violation THEN NULL;
 END;

 IF v::text LIKE '%' || encode(decode(repeat('a1',32),'hex'),'hex') || '%' THEN
   RAISE EXCEPTION 'Opaque external reference digest leaked into discovery response';
 END IF;

 BEGIN
   PERFORM public.account_external_dependency_discovery('19000000-0000-4000-8000-000000000002');
   RAISE EXCEPTION 'Cross-account external dependency discovery unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;

ROLLBACK;
