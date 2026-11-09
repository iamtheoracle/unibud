-- Profile editor and role-permission isolation.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('11000000-0000-4000-8000-000000000001','active'),
 ('11000000-0000-4000-8000-000000000002','active'),
 ('11000000-0000-4000-8000-000000000003','active'),
 ('11000000-0000-4000-8000-000000000004','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES
 ('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','page_community','scope-page','scope-page','Before Name','private'),
 ('21000000-0000-4000-8000-000000000002','11000000-0000-4000-8000-000000000001','creator','scope-creator','scope-creator','Creator','public');
INSERT INTO profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,
 relationship,role,status,can_switch_to_profile,granted_by_account_id
) VALUES
 ('31000000-0000-4000-8000-000000000001','21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','owner','owner','active',true,'11000000-0000-4000-8000-000000000001'),
 ('31000000-0000-4000-8000-000000000002','21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000002',NULL,'11000000-0000-4000-8000-000000000001','delegated','admin','active',true,'11000000-0000-4000-8000-000000000001'),
 ('31000000-0000-4000-8000-000000000003','21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000003',NULL,'11000000-0000-4000-8000-000000000001','delegated','editor','active',true,'11000000-0000-4000-8000-000000000001'),
 ('31000000-0000-4000-8000-000000000004','21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000004',NULL,'11000000-0000-4000-8000-000000000001','delegated','provider','active',true,'11000000-0000-4000-8000-000000000001'),
 ('31000000-0000-4000-8000-000000000005','21000000-0000-4000-8000-000000000002','11000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','owner','owner','active',true,'11000000-0000-4000-8000-000000000001');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-edit-key',decode(repeat('7a',32),'hex'));

-- The owner can update a page identity, while the personal profile remains separate.
WITH x AS (
 SELECT '11000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('7a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $owner_edit$
DECLARE v_name TEXT;
BEGIN
 SELECT display_name INTO v_name FROM public.profile_update_owned(
  '21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001',
  'Updated Page','updated.page','updated.page','public'
 );
 IF v_name<>'Updated Page' THEN RAISE EXCEPTION 'Owner profile edit did not persist'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000001','members.view') IS NOT TRUE THEN
  RAISE EXCEPTION 'Owner permission was not recognised';
 END IF;
END
$owner_edit$;
RESET ROLE;

-- Admin can manage identity/content but cannot manage billing or integrations.
WITH x AS (
 SELECT '11000000-0000-4000-8000-000000000002'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'dddddddd-dddd-4ddd-8ddd-dddddddddddd'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('7a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $admin$
BEGIN
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000002','profile.update_identity') IS NOT TRUE THEN RAISE EXCEPTION 'Admin identity permission missing'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000002','members.view') IS NOT TRUE THEN RAISE EXCEPTION 'Admin member view permission missing'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000002','manage_billing') IS NOT FALSE THEN RAISE EXCEPTION 'Admin inherited billing authority'; END IF;
END
$admin$;
RESET ROLE;

-- Editor can publish content but cannot alter profile identity or administer members.
WITH x AS (
 SELECT '11000000-0000-4000-8000-000000000003'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('7a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $editor$
BEGIN
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000003','content.publish') IS NOT TRUE THEN RAISE EXCEPTION 'Editor publish permission missing'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000003','profile.update_identity') IS NOT FALSE THEN RAISE EXCEPTION 'Editor unexpectedly received identity permission'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000003','members.view') IS NOT FALSE THEN RAISE EXCEPTION 'Editor unexpectedly received member permission'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000002','11000000-0000-4000-8000-000000000003','content.publish') IS NOT FALSE THEN RAISE EXCEPTION 'Editor permission crossed profile boundary'; END IF;
END
$editor$;
RESET ROLE;

-- A provider gets only the provider-specific permission, never page administration.
WITH x AS (
 SELECT '11000000-0000-4000-8000-000000000004'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'ffffffff-ffff-4fff-8fff-ffffffffffff'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('7a',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $provider$
BEGIN
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000004','service.manage_availability') IS NOT TRUE THEN RAISE EXCEPTION 'Provider permission missing'; END IF;
 IF public.profile_authorize_action('21000000-0000-4000-8000-000000000001','11000000-0000-4000-8000-000000000004','members.view') IS NOT FALSE THEN RAISE EXCEPTION 'Provider inherited member administration'; END IF;
END
$provider$;
RESET ROLE;
ROLLBACK;
