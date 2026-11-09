-- Profile archive/restore, ownership, audit and remaining-identity safeguards.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('13000000-0000-4000-8000-000000000001','active'),
 ('13000000-0000-4000-8000-000000000002','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES
 ('23000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','personal','recover-person','recover-person','Recovery Person','private'),
 ('23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001','creator','recover-creator','recover-creator','Recovery Creator','public'),
 ('23000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000001','page_community','recover-page','recover-page','Recovery Page','private'),
 ('23000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000002','personal','recover-delegate','recover-delegate','Recovery Delegate','private');
INSERT INTO profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,
 relationship,role,status,can_switch_to_profile,granted_by_account_id
) VALUES
 ('33000000-0000-4000-8000-000000000001','23000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','owner','owner','active',true,'13000000-0000-4000-8000-000000000001'),
 ('33000000-0000-4000-8000-000000000002','23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','owner','owner','active',true,'13000000-0000-4000-8000-000000000001'),
 ('33000000-0000-4000-8000-000000000003','23000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','owner','owner','active',true,'13000000-0000-4000-8000-000000000001'),
 ('33000000-0000-4000-8000-000000000004','23000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000002',NULL,'13000000-0000-4000-8000-000000000001','delegated','editor','active',true,'13000000-0000-4000-8000-000000000001'),
 ('33000000-0000-4000-8000-000000000005','23000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000002','owner','owner','active',true,'13000000-0000-4000-8000-000000000002');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-recovery-key',decode(repeat('9c',32),'hex'));

WITH x AS (
 SELECT '13000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'dededede-dede-4ded-8ded-dededededede'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('9c',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $archive_restore$
DECLARE v_status TEXT; v_history_count INTEGER;
BEGIN
 IF public.profile_archive_owned('23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001') IS NOT TRUE THEN
  RAISE EXCEPTION 'Owner could not archive creator profile';
 END IF;
 SELECT status INTO v_status FROM profiles WHERE id='23000000-0000-4000-8000-000000000002';
 IF v_status<>'archived' THEN RAISE EXCEPTION 'Profile archive state did not persist'; END IF;
 IF public.profile_archive_owned('23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001') IS NOT TRUE THEN
  RAISE EXCEPTION 'Archive retry should be idempotent';
 END IF;
 IF public.profile_restore_owned('23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001') IS NOT TRUE THEN
  RAISE EXCEPTION 'Owner could not restore archived profile';
 END IF;
 SELECT status INTO v_status FROM profiles WHERE id='23000000-0000-4000-8000-000000000002';
 IF v_status<>'active' THEN RAISE EXCEPTION 'Profile restore state did not persist'; END IF;
 SELECT count(*) INTO v_history_count FROM public.profile_list_lifecycle_history(
  '23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001');
 IF v_history_count<>2 THEN RAISE EXCEPTION 'Expected append-only archive and restore history, got %',v_history_count; END IF;
 IF public.profile_archive_owned('23000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001') IS NOT TRUE THEN
  RAISE EXCEPTION 'Personal identity archive is expected to be rejected';
 END IF;
END
$archive_restore$;
RESET ROLE;

-- A delegate cannot archive the owner's page, even with an active admin-like grant.
WITH x AS (
 SELECT '13000000-0000-4000-8000-000000000002'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'efefefef-efef-4fef-8fef-efefefefefef'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('9c',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $delegate$
BEGIN
 BEGIN
  PERFORM public.profile_archive_owned('23000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000001');
  RAISE EXCEPTION 'Delegate unexpectedly archived an owner profile';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END
$delegate$;
RESET ROLE;
ROLLBACK;
