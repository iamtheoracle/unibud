-- Profile delegation isolation: owner, delegate, unrelated account.
BEGIN;
INSERT INTO accounts(id,status) VALUES
('10000000-0000-4000-8000-000000000001','active'),
('10000000-0000-4000-8000-000000000002','active'),
('10000000-0000-4000-8000-000000000003','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name)
VALUES('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
'page_community','owner-page','owner-page','Owner Page');
INSERT INTO profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,relationship,role,status,can_switch_to_profile,granted_by_account_id
) VALUES
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
'10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner','owner','active',true,'10000000-0000-4000-8000-000000000001'),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',
'10000000-0000-4000-8000-000000000002',NULL,'10000000-0000-4000-8000-000000000001','delegated','editor','active',true,'10000000-0000-4000-8000-000000000001');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-delegation-key',decode(repeat('5a',32),'hex'));

-- Owner sees both membership rows.
WITH x AS (
 SELECT '10000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
set_config('unibud.context_nonce',n,true),
set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
decode(repeat('5a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $$
BEGIN
 IF (SELECT count(*) FROM profile_memberships WHERE profile_id='20000000-0000-4000-8000-000000000001')<>2 THEN
  RAISE EXCEPTION 'Owner membership visibility failed';
 END IF;
END $$;
RESET ROLE;

-- Delegate sees only its own membership and the delegated profile.
WITH x AS (
 SELECT '10000000-0000-4000-8000-000000000002'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
set_config('unibud.context_nonce',n,true),
set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
decode(repeat('5a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $$
BEGIN
 IF (SELECT count(*) FROM profile_memberships WHERE profile_id='20000000-0000-4000-8000-000000000001')<>1
 OR EXISTS(SELECT 1 FROM profile_memberships WHERE account_id='10000000-0000-4000-8000-000000000001')
 OR (SELECT count(*) FROM profiles WHERE id='20000000-0000-4000-8000-000000000001')<>1 THEN
  RAISE EXCEPTION 'Delegate membership or profile isolation failed';
 END IF;
END $$;
RESET ROLE;

-- Unrelated account sees neither profile nor membership.
WITH x AS (
 SELECT '10000000-0000-4000-8000-000000000003'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'ffffffff-ffff-4fff-8fff-ffffffffffff'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
set_config('unibud.context_nonce',n,true),
set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
decode(repeat('5a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $$
BEGIN
 IF (SELECT count(*) FROM profile_memberships WHERE profile_id='20000000-0000-4000-8000-000000000001')<>0
 OR (SELECT count(*) FROM profiles WHERE id='20000000-0000-4000-8000-000000000001')<>0 THEN
  RAISE EXCEPTION 'Unrelated account accessed profile data';
 END IF;
END $$;
RESET ROLE;
ROLLBACK;
