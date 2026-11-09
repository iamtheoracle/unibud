-- Account-scoped dependency counts, credential redaction and cross-account denial.
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('18000000-0000-4000-8000-000000000001','active'),
 ('18000000-0000-4000-8000-000000000002','active');

INSERT INTO public.profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES
 ('28000000-0000-4000-8000-000000000001','18000000-0000-4000-8000-000000000001','personal','dep-a','dep-a','Dependency A','private'),
 ('28000000-0000-4000-8000-000000000002','18000000-0000-4000-8000-000000000002','personal','dep-b','dep-b','Dependency B','private');

INSERT INTO public.authentication_identities(id,account_id,issuer,subject,method)
VALUES ('38000000-0000-4000-8000-000000000001','18000000-0000-4000-8000-000000000001','test','dep-a','email');

INSERT INTO public.password_credentials(id,account_id,credential_hash)
VALUES (
 '39000000-0000-4000-8000-000000000001',
 '18000000-0000-4000-8000-000000000001',
 'scrypt$ln=17,r=8,p=1$' || repeat('A',22) || '$' || repeat('A',86)
);

INSERT INTO public.profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,
 relationship,role,status,can_switch_to_profile,granted_by_account_id
) VALUES (
 '48000000-0000-4000-8000-000000000001',
 '28000000-0000-4000-8000-000000000001',
 '18000000-0000-4000-8000-000000000001',
 '18000000-0000-4000-8000-000000000001',
 '18000000-0000-4000-8000-000000000001',
 'owner','owner','active',true,'18000000-0000-4000-8000-000000000001'
);

INSERT INTO public.resource_grants(
 id,subject_account_id,application_id,resource_type,resource_id,role,actions,issuer_account_id
) VALUES (
 '58000000-0000-4000-8000-000000000001',
 '18000000-0000-4000-8000-000000000001',
 'unibud','profile','28000000-0000-4000-8000-000000000001',
 'viewer',ARRAY['read'],'18000000-0000-4000-8000-000000000001'
);

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-dependency-discovery-key',decode(repeat('b8',32),'hex'));

WITH x AS (
 SELECT '18000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'b8b8b8b8-b8b8-48b8-88b8-b8b8b8b8b8b8'::text n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('b8',32),'hex'),'sha256'),'hex'),true)
FROM x;

DO $test$
DECLARE v JSONB;
BEGIN
 v := public.account_dependency_discovery('18000000-0000-4000-8000-000000000001');
 IF (v#>>'{counts,account}')::integer <> 1
   OR (v#>>'{counts,authenticationIdentities}')::integer <> 1
   OR (v#>>'{counts,passwordCredentials}')::integer <> 1
   OR (v#>>'{counts,verificationChallenges}')::integer <> 0
   OR (v#>>'{counts,ownedProfiles}')::integer <> 1
   OR (v#>>'{counts,ownedMemberships}')::integer <> 1
   OR (v#>>'{counts,subjectGrants}')::integer <> 1
 THEN
   RAISE EXCEPTION 'Dependency counts mismatch: %',v->'counts';
 END IF;

 IF jsonb_array_length(v->'foreignKeys') = 0 THEN
   RAISE EXCEPTION 'Expected FK topology to be discovered';
 END IF;

 IF v#>>'{policy,status}' <> 'not_approved'
   OR (v#>>'{policy,canClose}')::boolean IS NOT FALSE
 THEN
   RAISE EXCEPTION 'Missing retention policy did not block closure';
 END IF;

 IF v::text LIKE '%scrypt$ln=17,r=8,p=1%' THEN
   RAISE EXCEPTION 'Credential verifier leaked into dependency discovery';
 END IF;

 BEGIN
   PERFORM public.account_dependency_discovery('18000000-0000-4000-8000-000000000002');
   RAISE EXCEPTION 'Cross-account dependency discovery unexpectedly succeeded';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$test$;

ROLLBACK;
