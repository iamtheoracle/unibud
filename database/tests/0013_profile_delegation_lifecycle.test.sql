-- Owner-controlled delegation and invitation lifecycle boundaries.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('12000000-0000-4000-8000-000000000001','active'),
 ('12000000-0000-4000-8000-000000000002','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES
 ('22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','page_community','lifecycle-page','lifecycle-page','Lifecycle Page','private'),
 ('22000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000002','personal','lifecycle-person','lifecycle-person','Lifecycle Person','public');
INSERT INTO profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,
 relationship,role,status,can_switch_to_profile,granted_by_account_id
) VALUES
 ('32000000-0000-4000-8000-000000000001','22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','owner','owner','active',true,'12000000-0000-4000-8000-000000000001'),
 ('32000000-0000-4000-8000-000000000002','22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000002',NULL,'12000000-0000-4000-8000-000000000001','delegated','editor','active',true,'12000000-0000-4000-8000-000000000001');
INSERT INTO profile_invitations(id,profile_id,owner_account_id,invitee_account_id,role,status)
VALUES
 ('42000000-0000-4000-8000-000000000001','22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000002','viewer','pending'),
 ('42000000-0000-4000-8000-000000000002','22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000002','viewer','pending');
UPDATE profile_invitations SET expires_at=clock_timestamp()-interval '1 minute'
 WHERE id='42000000-0000-4000-8000-000000000002';
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-lifecycle-key',decode(repeat('8b',32),'hex'));

WITH x AS (
 SELECT '12000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'abababab-abab-4aba-8aba-abababababab'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('8b',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $lifecycle$
DECLARE v_role TEXT; v_status TEXT; v_result BOOLEAN;
BEGIN
 v_result:=public.profile_manage_delegated_access(
  '22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002','moderator','suspended');
 IF v_result IS NOT TRUE THEN RAISE EXCEPTION 'Owner could not change role and suspend delegate'; END IF;
 SELECT role,status INTO v_role,v_status FROM profile_memberships
  WHERE profile_id='22000000-0000-4000-8000-000000000001'
    AND account_id='12000000-0000-4000-8000-000000000002';
 IF v_role<>'moderator' OR v_status<>'suspended' THEN RAISE EXCEPTION 'Role/suspension state did not persist'; END IF;
 IF public.profile_authorize_action('22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000002','profile.read') IS NOT FALSE THEN
  RAISE EXCEPTION 'Suspended delegate retained access';
 END IF;
 IF public.profile_manage_delegated_access(
  '22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002','moderator','active') IS NOT TRUE THEN
  RAISE EXCEPTION 'Owner could not restore suspended delegate';
 END IF;
 IF public.profile_cancel_invitation('42000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001') IS NOT TRUE THEN
  RAISE EXCEPTION 'Owner could not cancel pending invitation';
 END IF;
 IF public.profile_cancel_invitation('42000000-0000-4000-8000-000000000002','12000000-0000-4000-8000-000000000001') IS NOT FALSE THEN
  RAISE EXCEPTION 'Expired invitation was incorrectly cancelled';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM profile_invitations WHERE id='42000000-0000-4000-8000-000000000002' AND status='expired') THEN
  RAISE EXCEPTION 'Expired invitation did not retain expired state';
 END IF;
END
$lifecycle$;
RESET ROLE;

-- A suspended delegate can be permanently revoked; revoked access is terminal.
WITH x AS (
 SELECT '12000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'bcbcbcbc-bcbc-4bcb-8bcb-bcbcbcbcbcbc'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('8b',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $revoke$
BEGIN
 IF public.profile_manage_delegated_access(
  '22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002','moderator','suspended') IS NOT TRUE THEN
  RAISE EXCEPTION 'Could not suspend delegate before revocation';
 END IF;
 IF public.profile_revoke_delegated_access(
  '22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002',clock_timestamp()) IS NOT TRUE THEN
  RAISE EXCEPTION 'Owner could not revoke suspended delegate';
 END IF;
 IF public.profile_manage_delegated_access(
  '22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002','admin','active') IS NOT FALSE THEN
  RAISE EXCEPTION 'Revoked membership was reactivated';
 END IF;
END
$revoke$;
RESET ROLE;
WITH x AS (
 SELECT '12000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'cdcdcdcd-cdcd-4cdc-8dcd-cdcdcdcdcdcd'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('8b',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $terminal$
BEGIN
 IF public.profile_manage_delegated_access(
  '22000000-0000-4000-8000-000000000001','12000000-0000-4000-8000-000000000001',
  '12000000-0000-4000-8000-000000000002','admin','active') IS NOT FALSE THEN
  RAISE EXCEPTION 'Revoked membership was reactivated';
 END IF;
END
$terminal$;
RESET ROLE;
ROLLBACK;
