-- Public discovery, account blocking, RLS and audit lifecycle tests.
-- Synthetic records only; run against disposable PostgreSQL.
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('51000000-0000-4000-8000-000000000001','active'),
 ('51000000-0000-4000-8000-000000000002','active'),
 ('51000000-0000-4000-8000-000000000003','active'),
 ('51000000-0000-4000-8000-000000000004','active'),
 ('51000000-0000-4000-8000-000000000005','active');

INSERT INTO public.profiles(
 id,owner_account_id,kind,handle,handle_normalized,display_name,visibility
) VALUES
 ('52000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000001','personal','discover-a','discover-a','Discover A','public'),
 ('52000000-0000-4000-8000-000000000002','51000000-0000-4000-8000-000000000002','personal','discover-b','discover-b','Discover B','public'),
 ('52000000-0000-4000-8000-000000000003','51000000-0000-4000-8000-000000000003','personal','discover-c','discover-c','Discover C','public'),
 ('52000000-0000-4000-8000-000000000004','51000000-0000-4000-8000-000000000004','personal','discover-d','discover-d','Discover D','public'),
 ('52000000-0000-4000-8000-000000000005','51000000-0000-4000-8000-000000000005','personal','discover-e','discover-e','Discover E','private');


INSERT INTO public.account_discovery_eligibility(
 account_id,status,cohort_key,verified_at,expires_at
) VALUES
 ('51000000-0000-4000-8000-000000000001','verified','cohort-a',clock_timestamp(),clock_timestamp()+interval '30 days'),
 ('51000000-0000-4000-8000-000000000002','verified','cohort-a',clock_timestamp(),clock_timestamp()+interval '30 days'),
 ('51000000-0000-4000-8000-000000000004','verified','cohort-b',clock_timestamp(),clock_timestamp()+interval '30 days'),
 ('51000000-0000-4000-8000-000000000005','verified','cohort-a',clock_timestamp(),clock_timestamp()+interval '30 days');

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES ('ci-search-block-key',decode(repeat('6b',32),'hex'),true);

-- Establish account A context from the CI-only signing key.
WITH context AS (
 SELECT
  '51000000-0000-4000-8000-000000000001'::TEXT AS account_id,
  floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
    decode(repeat('6b',32),'hex'),'sha256'),'hex'),true)
FROM context;

SET LOCAL ROLE unibud_app;
DO $test$
DECLARE visible_b INTEGER;
DECLARE visible_c INTEGER;
DECLARE visible_d INTEGER;
DECLARE visible_e INTEGER;
DECLARE audit_count INTEGER;
BEGIN
 SELECT count(*) INTO visible_b FROM public.profiles WHERE handle_normalized='discover-b';
 SELECT count(*) INTO visible_c FROM public.profiles WHERE handle_normalized='discover-c';
 SELECT count(*) INTO visible_d FROM public.profiles WHERE handle_normalized='discover-d';
 SELECT count(*) INTO visible_e FROM public.profiles WHERE handle_normalized='discover-e';
 IF visible_b <> 1 OR visible_c <> 0 OR visible_d <> 0 OR visible_e <> 0 THEN
  RAISE EXCEPTION 'Discovery must require public visibility and a verified matching cohort; B %, unknown C %, other cohort D %, private E %',visible_b,visible_c,visible_d,visible_e;
 END IF;

 IF public.account_block_handle('discover-b') IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'Account A could not block public account B';
 END IF;

 SELECT count(*) INTO visible_b FROM public.profiles WHERE handle_normalized='discover-b';
 IF visible_b <> 0 THEN
  RAISE EXCEPTION 'Blocked account remained discoverable to blocker';
 END IF;

 SELECT count(*) INTO audit_count FROM public.security_audit_events
  WHERE actor_account_id='51000000-0000-4000-8000-000000000001'
    AND action='account.block.create' AND outcome='success';
 IF audit_count <> 1 THEN
  RAISE EXCEPTION 'Block creation was not audited exactly once';
 END IF;

 BEGIN
  INSERT INTO public.account_blocks(blocker_account_id,blocked_account_id)
  VALUES ('51000000-0000-4000-8000-000000000001','51000000-0000-4000-8000-000000000003');
  RAISE EXCEPTION 'Application role unexpectedly inserted a block directly';
 EXCEPTION WHEN insufficient_privilege THEN
  NULL;
 END;
END;
$test$;
RESET ROLE;

-- An account without verified age eligibility cannot discover even verified public profiles.
WITH context AS (
 SELECT
  '51000000-0000-4000-8000-000000000003'::TEXT AS account_id,
  floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
  'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
    decode(repeat('6b',32),'hex'),'sha256'),'hex'),true)
FROM context;

SET LOCAL ROLE unibud_app;
DO $unknown_viewer$
DECLARE visible_a INTEGER;
BEGIN
 SELECT count(*) INTO visible_a FROM public.profiles WHERE handle_normalized='discover-a';
 IF visible_a <> 0 THEN
  RAISE EXCEPTION 'Viewer without verified age cohort discovered another account';
 END IF;
 BEGIN
  PERFORM 1 FROM public.account_discovery_eligibility;
  RAISE EXCEPTION 'Application role unexpectedly read age-assurance cohort records';
 EXCEPTION WHEN insufficient_privilege THEN
  NULL;
 END;
END;
$unknown_viewer$;
RESET ROLE;

-- Account B must also be unable to discover A because A blocked B.
WITH context AS (
 SELECT
  '51000000-0000-4000-8000-000000000002'::TEXT AS account_id,
  floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
    decode(repeat('6b',32),'hex'),'sha256'),'hex'),true)
FROM context;

SET LOCAL ROLE unibud_app;
DO $reverse$
DECLARE visible_a INTEGER;
DECLARE incoming_block_rows INTEGER;
BEGIN
 SELECT count(*) INTO visible_a FROM public.profiles WHERE handle_normalized='discover-a';
 IF visible_a <> 0 THEN
  RAISE EXCEPTION 'Block target could still discover blocker';
 END IF;
 SELECT count(*) INTO incoming_block_rows FROM public.account_blocks
  WHERE blocker_account_id='51000000-0000-4000-8000-000000000001'
    AND blocked_account_id='51000000-0000-4000-8000-000000000002';
 IF incoming_block_rows <> 0 THEN
  RAISE EXCEPTION 'Block target can enumerate incoming block records';
 END IF;
END;
$reverse$;
RESET ROLE;

-- Account A can revoke its own block through the narrow procedure; audit is append-only.
WITH context AS (
 SELECT
  '51000000-0000-4000-8000-000000000001'::TEXT AS account_id,
  floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
    decode(repeat('6b',32),'hex'),'sha256'),'hex'),true)
FROM context;

SET LOCAL ROLE unibud_app;
DO $unblock$
DECLARE visible_b INTEGER;
DECLARE audit_count INTEGER;
BEGIN
 IF public.account_unblock_handle('discover-b') IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'Account A could not revoke its block';
 END IF;
 SELECT count(*) INTO visible_b FROM public.profiles WHERE handle_normalized='discover-b';
 IF visible_b <> 1 THEN
  RAISE EXCEPTION 'Unblocked public account did not return to discovery';
 END IF;
 SELECT count(*) INTO audit_count FROM public.security_audit_events
  WHERE actor_account_id='51000000-0000-4000-8000-000000000001'
    AND action IN ('account.block.create','account.block.revoke')
    AND outcome='success';
 IF audit_count <> 2 THEN
  RAISE EXCEPTION 'Block lifecycle audit history is incomplete';
 END IF;
END;
$unblock$;
RESET ROLE;

ROLLBACK;
