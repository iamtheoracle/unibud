-- Profile ownership, delegation and session switching tests.
-- All fixtures are synthetic and transactionally rolled back.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('10000000-0000-4000-8000-000000000001','active'),
 ('10000000-0000-4000-8000-000000000002','active');
INSERT INTO account_sessions(
 id,account_id,credential_digest,issued_at,idle_expires_at,absolute_expires_at
) VALUES
 ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',decode(repeat('a1',32),'hex'),now(),now()+interval '30 minutes',now()+interval '12 hours'),
 ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',decode(repeat('b1',32),'hex'),now(),now()+interval '30 minutes',now()+interval '12 hours');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-profile-test-key',decode(repeat('5a',32),'hex'));

-- Account A creates its personal profile through the owner-checked procedure.
WITH context AS (
 SELECT '10000000-0000-4000-8000-000000000001'::TEXT AS account_id,
 floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',encode(public.hmac(
  convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
  decode(repeat('5a',32),'hex'),'sha256'),'hex'),true)
FROM context;
SET LOCAL ROLE unibud_app;
DO $create_a$
BEGIN
 PERFORM * FROM public.profile_create_owned(
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'personal','owner-a','owner-a','Owner A','private'
 );
 BEGIN
   PERFORM * FROM public.profile_create_owned(
    '20000000-0000-4000-8000-000000000099',
    '30000000-0000-4000-8000-000000000099',
    '10000000-0000-4000-8000-000000000002',
    'personal','forged-b','forged-b','Forged B','private'
   );
   RAISE EXCEPTION 'Account A created a profile for account B';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END;
$create_a$;
RESET ROLE;

-- Account B creates two profiles and delegates one to A.
WITH context AS (
 SELECT '10000000-0000-4000-8000-000000000002'::TEXT AS account_id,
 floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',encode(public.hmac(
  convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
  decode(repeat('5a',32),'hex'),'sha256'),'hex'),true)
FROM context;
SET LOCAL ROLE unibud_app;
DO $create_b$
BEGIN
 PERFORM * FROM public.profile_create_owned(
  '20000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  'page_community','owner-b','owner-b','Owner B','private'
 );
 PERFORM * FROM public.profile_create_owned(
  '20000000-0000-4000-8000-000000000003',
  '30000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000002',
  'creator','owner-b-two','owner-b-two','Owner B Two','private'
 );
 PERFORM public.profile_grant_delegated_access(
  '20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  'editor',TRUE
 );
END;
$create_b$;
RESET ROLE;

-- A sees its own profile and the explicitly delegated B profile, not B's other profile.
WITH context AS (
 SELECT '10000000-0000-4000-8000-000000000001'::TEXT AS account_id,
 floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',encode(public.hmac(
  convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
  decode(repeat('5a',32),'hex'),'sha256'),'hex'),true)
FROM context;
SET LOCAL ROLE unibud_app;
DO $account_a$
BEGIN
 IF (SELECT count(*) FROM profiles) <> 2 THEN
   RAISE EXCEPTION 'Account A must see exactly its own and delegated profiles';
 END IF;
 IF (SELECT count(*) FROM profile_memberships) <> 2 THEN
   RAISE EXCEPTION 'Account A must see its owner and delegated membership rows only';
 END IF;
 IF NOT public.profile_set_active_context(
   '10000000-0000-4000-8000-000000000001',
   '40000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000002',
   '50000000-0000-4000-8000-000000000001'
 ) THEN RAISE EXCEPTION 'Delegated profile switch was denied'; END IF;
 IF public.profile_set_active_context(
   '10000000-0000-4000-8000-000000000001',
   '40000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000003',
   '50000000-0000-4000-8000-000000000002'
 ) THEN RAISE EXCEPTION 'Undelegated profile switch was allowed'; END IF;
 IF (SELECT active_profile_id FROM account_sessions WHERE id='40000000-0000-4000-8000-000000000001')
    <> '20000000-0000-4000-8000-000000000002' THEN
   RAISE EXCEPTION 'Active profile context was not persisted on the session';
 END IF;
 BEGIN
   INSERT INTO profile_memberships(
    id,profile_id,account_id,owner_account_id,profile_owner_account_id,
    relationship,role,status,can_switch_to_profile,granted_by_account_id
   ) VALUES (
    '30000000-0000-4000-8000-000000000099',
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    NULL,'10000000-0000-4000-8000-000000000002',
    'delegated','admin','active',TRUE,'10000000-0000-4000-8000-000000000001'
   );
   RAISE EXCEPTION 'Delegate self-grant was accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
 BEGIN
   UPDATE account_sessions SET active_profile_id='20000000-0000-4000-8000-000000000003'
   WHERE id='40000000-0000-4000-8000-000000000001';
   RAISE EXCEPTION 'Direct session profile mutation was accepted';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END;
$account_a$;
RESET ROLE;

-- Profile owner B can see and revoke its delegated membership.
WITH context AS (
 SELECT '10000000-0000-4000-8000-000000000002'::TEXT AS account_id,
 floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',encode(public.hmac(
  convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
  decode(repeat('5a',32),'hex'),'sha256'),'hex'),true)
FROM context;
SET LOCAL ROLE unibud_app;
DO $owner_b$
BEGIN
 IF (SELECT count(*) FROM profile_memberships WHERE profile_id='20000000-0000-4000-8000-000000000002') <> 2 THEN
   RAISE EXCEPTION 'Profile owner cannot see all delegated membership rows';
 END IF;
 IF NOT public.profile_revoke_delegated_access(
  '20000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  clock_timestamp()
 ) THEN RAISE EXCEPTION 'Profile owner could not revoke delegation'; END IF;
END;
$owner_b$;
RESET ROLE;

-- Revocation removes delegated visibility and profile switching for A.
WITH context AS (
 SELECT '10000000-0000-4000-8000-000000000001'::TEXT AS account_id,
 floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::TEXT AS nonce
)
SELECT
 set_config('unibud.account_id',account_id,true),
 set_config('unibud.context_expiry',expiry,true),
 set_config('unibud.context_nonce',nonce,true),
 set_config('unibud.context_signature',encode(public.hmac(
  convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
  decode(repeat('5a',32),'hex'),'sha256'),'hex'),true)
FROM context;
SET LOCAL ROLE unibud_app;
DO $revoked_a$
BEGIN
 IF (SELECT count(*) FROM profiles) <> 1 THEN
   RAISE EXCEPTION 'Revoked delegate still sees owner profile';
 END IF;
 IF public.profile_set_active_context(
   '10000000-0000-4000-8000-000000000001',
   '40000000-0000-4000-8000-000000000001',
   '20000000-0000-4000-8000-000000000002',
   '50000000-0000-4000-8000-000000000003'
 ) THEN RAISE EXCEPTION 'Revoked delegate could still switch profile'; END IF;
END;
$revoked_a$;
RESET ROLE;
ROLLBACK;
