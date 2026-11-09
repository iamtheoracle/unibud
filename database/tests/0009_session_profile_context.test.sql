-- Session rotation retains the session's currently selected profile context.
BEGIN;
INSERT INTO accounts(id,status) VALUES('10000000-0000-4000-8000-000000000001','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name)
VALUES('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
'personal','session-profile','session-profile','Session Profile');
INSERT INTO profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,
 relationship,role,status,can_switch_to_profile
) VALUES(
 '30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000001','owner','owner','active',true
);
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-session-key',decode(repeat('5a',32),'hex'));
SET LOCAL ROLE unibud_auth;
PERFORM public.auth_create_session(
 '40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',
 decode(repeat('a1',32),'hex'),now(),now()+interval '30 minutes',now()+interval '12 hours'
);
RESET ROLE;
WITH x AS (
 SELECT '10000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'abababab-abab-4bab-8bab-abababababab'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
set_config('unibud.context_nonce',n,true),
set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
decode(repeat('5a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $$
BEGIN
 IF NOT public.profile_set_active_context(
 '10000000-0000-4000-8000-000000000001',
 '40000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000001',
 '60000000-0000-4000-8000-000000000001'
 ) THEN RAISE EXCEPTION 'Active profile context was not set'; END IF;
END $$;
RESET ROLE;
SET LOCAL ROLE unibud_auth;
DO $$
DECLARE result RECORD;
BEGIN
 SELECT * INTO result FROM public.auth_rotate_session(
  decode(repeat('a1',32),'hex'),'40000000-0000-4000-8000-000000000002',
  decode(repeat('a2',32),'hex'),now()+interval '1 minute',
  now()+interval '31 minutes',now()+interval '12 hours'
 );
 IF result.session_id IS NULL THEN RAISE EXCEPTION 'Session rotation failed'; END IF;
 SELECT * INTO result FROM public.auth_lookup_session(decode(repeat('a2',32),'hex'));
 IF result.active_profile_id<>'20000000-0000-4000-8000-000000000001'
 OR result.profile_context_version<>'60000000-0000-4000-8000-000000000001' THEN
  RAISE EXCEPTION 'Profile context was not preserved during rotation';
 END IF;
END $$;
RESET ROLE;
ROLLBACK;
