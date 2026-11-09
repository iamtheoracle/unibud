-- Identity-based page invitations: exact-handle resolution, pending state,
-- recipient-only inbox and acceptance before profile switching.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('10000000-0000-4000-8000-000000000001','active'),
 ('10000000-0000-4000-8000-000000000002','active'),
 ('10000000-0000-4000-8000-000000000003','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','personal','owner-one','owner-one','Owner One','public'),
 ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','personal','invitee-two','invitee-two','Invitee Two','public'),
 ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','personal','private-three','private-three','Private Three','private'),
 ('20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','page_community','owner-page','owner-page','Owner Page','public');
INSERT INTO profile_memberships(
 id,profile_id,account_id,owner_account_id,profile_owner_account_id,relationship,role,status,can_switch_to_profile,granted_by_account_id
) VALUES
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner','owner','active',true,'10000000-0000-4000-8000-000000000001'),
 ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','owner','owner','active',true,'10000000-0000-4000-8000-000000000002'),
 ('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','owner','owner','active',true,'10000000-0000-4000-8000-000000000003'),
 ('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','owner','owner','active',true,'10000000-0000-4000-8000-000000000001');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-invitation-key',decode(repeat('6b',32),'hex'));

-- Owner issues an invitation by the recipient's personal-profile handle.
WITH x AS (
 SELECT '10000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('6b',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $invite$
DECLARE v_id UUID;
BEGIN
 SELECT invitation_id INTO v_id FROM public.profile_invite_by_handle(
  '60000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000004',
  '10000000-0000-4000-8000-000000000001','@invitee-two','editor',true
 );
 IF v_id IS NULL THEN RAISE EXCEPTION 'Invitation by handle was not created'; END IF;
 IF EXISTS(SELECT 1 FROM profile_memberships WHERE profile_id='20000000-0000-4000-8000-000000000004' AND account_id='10000000-0000-4000-8000-000000000002') THEN
  RAISE EXCEPTION 'Invitation activated membership before recipient acceptance';
 END IF;
 BEGIN
  PERFORM * FROM public.profile_invite_by_handle(
   '60000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000004',
   '10000000-0000-4000-8000-000000000001','private-three','editor',true
  );
  RAISE EXCEPTION 'Private identity was discoverable through handle invitation';
 EXCEPTION WHEN no_data_found THEN NULL;
 END;
END
$invite$;
RESET ROLE;

-- Recipient alone can see and accept their invitation.
WITH x AS (
 SELECT '10000000-0000-4000-8000-000000000002'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('6b',32),'hex'),'sha256'),'hex'),true) FROM x;
SET LOCAL ROLE unibud_app;
DO $accept$
DECLARE v_invitation UUID; v_count INTEGER;
BEGIN
 SELECT id INTO v_invitation FROM public.profile_list_incoming_invitations('10000000-0000-4000-8000-000000000002');
 IF v_invitation IS NULL THEN RAISE EXCEPTION 'Recipient inbox did not return invitation'; END IF;
 IF public.profile_respond_to_invitation(v_invitation,'10000000-0000-4000-8000-000000000002',true) IS NOT TRUE THEN
  RAISE EXCEPTION 'Recipient could not accept invitation';
 END IF;
 SELECT count(*) INTO v_count FROM profile_memberships
 WHERE profile_id='20000000-0000-4000-8000-000000000004'
 AND account_id='10000000-0000-4000-8000-000000000002'
 AND relationship='delegated' AND status='active' AND role='editor' AND can_switch_to_profile;
 IF v_count<>1 THEN RAISE EXCEPTION 'Acceptance did not create scoped active membership'; END IF;
END
$accept$;
RESET ROLE;
ROLLBACK;
