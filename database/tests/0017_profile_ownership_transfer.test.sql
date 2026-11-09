-- Two-party profile ownership transfer: consent, reauthentication boundary,
-- immutable audit, delegate revocation and preservation of both accounts.
BEGIN;
INSERT INTO public.accounts(id,status) VALUES
 ('17000000-0000-4000-8000-000000000001','active'),
 ('17000000-0000-4000-8000-000000000002','active'),
 ('17000000-0000-4000-8000-000000000003','active');

INSERT INTO public.authentication_identities(id,account_id,issuer,subject,method,
 identifier_ciphertext,identifier_lookup_digest,verified_at,status)
VALUES
 ('27000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','urn:unibud:first-party','owner-transfer-test-identity-0001','email',decode('01','hex'),decode(repeat('11',32),'hex'),clock_timestamp(),'active'),
 ('27000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000002','urn:unibud:first-party','recipient-transfer-test-identity-02','email',decode('02','hex'),decode(repeat('22',32),'hex'),clock_timestamp(),'active'),
 ('27000000-0000-4000-8000-000000000003','17000000-0000-4000-8000-000000000003','urn:unibud:first-party','delegate-transfer-test-identity-03','email',decode('03','hex'),decode(repeat('33',32),'hex'),clock_timestamp(),'active');

INSERT INTO public.profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES
 ('37000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','personal','transfer-owner','transfer-owner','Transfer Owner','private'),
 ('37000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000001','creator','transfer-creator','transfer-creator','Transfer Creator','public'),
 ('37000000-0000-4000-8000-000000000003','17000000-0000-4000-8000-000000000002','personal','transfer-recipient','transfer-recipient','Transfer Recipient','private'),
 ('37000000-0000-4000-8000-000000000004','17000000-0000-4000-8000-000000000003','personal','transfer-delegate','transfer-delegate','Transfer Delegate','private'),
 ('37000000-0000-4000-8000-000000000005','17000000-0000-4000-8000-000000000001','page_community','transfer-page','transfer-page','Transfer Page','public'),
 ('37000000-0000-4000-8000-000000000006','17000000-0000-4000-8000-000000000001','creator','archive-transfer','archive-transfer','Archive Transfer','public');

INSERT INTO public.profile_memberships(id,profile_id,account_id,owner_account_id,profile_owner_account_id,
 relationship,role,status,can_switch_to_profile,granted_by_account_id)
VALUES
 ('47000000-0000-4000-8000-000000000001','37000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','owner','owner','active',true,'17000000-0000-4000-8000-000000000001'),
 ('47000000-0000-4000-8000-000000000002','37000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','owner','owner','active',true,'17000000-0000-4000-8000-000000000001'),
 ('47000000-0000-4000-8000-000000000003','37000000-0000-4000-8000-000000000003','17000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000002','owner','owner','active',true,'17000000-0000-4000-8000-000000000002'),
 ('47000000-0000-4000-8000-000000000004','37000000-0000-4000-8000-000000000004','17000000-0000-4000-8000-000000000003','17000000-0000-4000-8000-000000000003','17000000-0000-4000-8000-000000000003','owner','owner','active',true,'17000000-0000-4000-8000-000000000003'),
 ('47000000-0000-4000-8000-000000000005','37000000-0000-4000-8000-000000000005','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','owner','owner','active',true,'17000000-0000-4000-8000-000000000001'),
 ('47000000-0000-4000-8000-000000000006','37000000-0000-4000-8000-000000000005','17000000-0000-4000-8000-000000000003',NULL,'17000000-0000-4000-8000-000000000001','delegated','admin','active',false,'17000000-0000-4000-8000-000000000001'),
 ('47000000-0000-4000-8000-000000000007','37000000-0000-4000-8000-000000000006','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001','owner','owner','active',true,'17000000-0000-4000-8000-000000000001');

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-transfer-key',decode(repeat('bc',32),'hex'));
WITH x AS (
 SELECT '17000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'babababa-baba-4bab-8bab-babababababa'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('bc',32),'hex'),'sha256'),'hex'),true) FROM x;

DO $preflight$
DECLARE v JSONB;
BEGIN
 v:=public.profile_ownership_transfer_preflight('37000000-0000-4000-8000-000000000005','17000000-0000-4000-8000-000000000001');
 IF (v->>'canTransfer')::boolean IS NOT FALSE OR (v->>'activeDelegatedRelationships')::integer<>1 THEN
  RAISE EXCEPTION 'Active delegated access must block transfer: %',v;
 END IF;
 BEGIN
  PERFORM * FROM public.profile_ownership_transfer_request(gen_random_uuid(),
   '37000000-0000-4000-8000-000000000005','17000000-0000-4000-8000-000000000001',
   'transfer-recipient',clock_timestamp()+interval '1 day');
  RAISE EXCEPTION 'Transfer unexpectedly allowed while delegate remains active';
 EXCEPTION WHEN check_violation THEN
  IF SQLERRM NOT LIKE 'Resolve delegated access%' THEN RAISE; END IF;
 END;
END
$preflight$;

-- Revoke the delegate before requesting transfer; old delegation is never carried over.
UPDATE public.profile_memberships SET status='revoked',revoked_at=clock_timestamp()
WHERE id='47000000-0000-4000-8000-000000000006';

-- An archive after a request cancels consent for that profile.
DO $archive_cancel$
DECLARE v_status TEXT;
BEGIN
 PERFORM * FROM public.profile_ownership_transfer_request('57000000-0000-4000-8000-000000000002',
  '37000000-0000-4000-8000-000000000006','17000000-0000-4000-8000-000000000001',
  'transfer-recipient',clock_timestamp()+interval '1 day');
 PERFORM public.profile_archive_owned('37000000-0000-4000-8000-000000000006','17000000-0000-4000-8000-000000000001');
 SELECT status INTO v_status FROM public.profile_ownership_transfers WHERE id='57000000-0000-4000-8000-000000000002';
 IF v_status<>'cancelled' THEN RAISE EXCEPTION 'Archiving did not cancel outstanding transfer consent'; END IF;
END
$archive_cancel$;

DO $request$
DECLARE v_id UUID; v_handle TEXT;
BEGIN
 SELECT transfer_id,recipient_handle INTO v_id,v_handle
 FROM public.profile_ownership_transfer_request('57000000-0000-4000-8000-000000000001',
  '37000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000001',
  ' @Transfer-Recipient ',clock_timestamp()+interval '1 day');
 IF v_id<>'57000000-0000-4000-8000-000000000001' OR v_handle<>'transfer-recipient' THEN
  RAISE EXCEPTION 'Unexpected transfer request result';
 END IF;
END
$request$;

-- The intended recipient alone can inspect and accept the request.
WITH x AS (
 SELECT '17000000-0000-4000-8000-000000000002'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'cacacaca-caca-4cac-8cac-cacacacacaca'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('bc',32),'hex'),'sha256'),'hex'),true) FROM x;

DO $accept$
DECLARE v_count INTEGER;
BEGIN
 SELECT count(*) INTO v_count FROM public.profile_ownership_transfer_list_incoming('17000000-0000-4000-8000-000000000002')
 WHERE transfer_id='57000000-0000-4000-8000-000000000001';
 IF v_count<>1 THEN RAISE EXCEPTION 'Recipient transfer inbox did not expose the pending request'; END IF;
 IF NOT public.profile_ownership_transfer_respond('57000000-0000-4000-8000-000000000001',
  '17000000-0000-4000-8000-000000000002',true) THEN RAISE EXCEPTION 'Recipient acceptance failed'; END IF;
END
$accept$;

-- Owner must explicitly reauthenticate at the API boundary before this final RPC.
WITH x AS (
 SELECT '17000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'dadadada-dada-4dad-8dad-dadadadadada'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('bc',32),'hex'),'sha256'),'hex'),true) FROM x;

INSERT INTO public.account_sessions(id,account_id,credential_digest,status,issued_at,last_seen_at,
 idle_expires_at,absolute_expires_at,active_profile_id,profile_context_version)
VALUES('67000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000001',decode(repeat('44',32),'hex'),
 'active',clock_timestamp(),clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day',
 '37000000-0000-4000-8000-000000000002','77000000-0000-4000-8000-000000000001');

INSERT INTO public.resource_grants(id,subject_account_id,application_id,resource_type,resource_id,role,actions,issuer_account_id)
VALUES('87000000-0000-4000-8000-000000000001','17000000-0000-4000-8000-000000000003','unibud','profile',
 '37000000-0000-4000-8000-000000000002','admin',ARRAY['read','update'],'17000000-0000-4000-8000-000000000001');

DO $complete$
DECLARE v_owner UUID; v_status TEXT; v_revoked TIMESTAMPTZ; v_context UUID; v_audit INTEGER; v_notifications INTEGER;
BEGIN
 IF NOT public.profile_ownership_transfer_complete('57000000-0000-4000-8000-000000000001',
  '17000000-0000-4000-8000-000000000001') THEN RAISE EXCEPTION 'Owner finalization failed'; END IF;
 SELECT owner_account_id INTO v_owner FROM public.profiles WHERE id='37000000-0000-4000-8000-000000000002';
 IF v_owner<>'17000000-0000-4000-8000-000000000002' THEN RAISE EXCEPTION 'Profile owner was not transferred'; END IF;
 IF EXISTS(SELECT 1 FROM public.profile_memberships WHERE profile_id='37000000-0000-4000-8000-000000000002'
  AND account_id='17000000-0000-4000-8000-000000000001' AND relationship='owner' AND status='active') THEN
  RAISE EXCEPTION 'Former owner retained owner membership';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.profile_memberships WHERE profile_id='37000000-0000-4000-8000-000000000002'
  AND account_id='17000000-0000-4000-8000-000000000002' AND relationship='owner' AND status='active') THEN
  RAISE EXCEPTION 'Recipient owner membership was not created';
 END IF;
 SELECT active_profile_id INTO v_context FROM public.account_sessions WHERE id='67000000-0000-4000-8000-000000000001';
 IF v_context IS NOT NULL THEN RAISE EXCEPTION 'Old profile session context was not cleared'; END IF;
 SELECT revoked_at INTO v_revoked FROM public.resource_grants WHERE id='87000000-0000-4000-8000-000000000001';
 IF v_revoked IS NULL THEN RAISE EXCEPTION 'Stale scoped grant was not revoked'; END IF;
 SELECT status INTO v_status FROM public.profile_ownership_transfers WHERE id='57000000-0000-4000-8000-000000000001';
 IF v_status<>'completed' THEN RAISE EXCEPTION 'Transfer status not completed'; END IF;
 SELECT count(*) INTO v_audit FROM public.security_audit_events WHERE resource_id='37000000-0000-4000-8000-000000000002'
  AND action LIKE 'profile.ownership_transfer.%';
 IF v_audit<>3 THEN RAISE EXCEPTION 'Expected request, recipient response and completion audit events, got %',v_audit; END IF;
 SELECT count(*) INTO v_notifications FROM public.profile_lifecycle_notifications
  WHERE profile_id='37000000-0000-4000-8000-000000000002';
 IF v_notifications<4 THEN RAISE EXCEPTION 'Expected request, acceptance and both completion notifications, got %',v_notifications; END IF;
END
$complete$;
-- The new owner can review the append-only ownership transfer audit history.
WITH x AS (
 SELECT '17000000-0000-4000-8000-000000000002'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'eaeaeaea-eaea-4aea-8aea-eaeaeaeaeaea'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('bc',32),'hex'),'sha256'),'hex'),true) FROM x;
DO $history$
DECLARE v_count INTEGER;
BEGIN
 SELECT count(*) INTO v_count FROM public.profile_list_lifecycle_history(
  '37000000-0000-4000-8000-000000000002','17000000-0000-4000-8000-000000000002')
 WHERE action LIKE 'profile.ownership_transfer.%';
 IF v_count<>3 THEN RAISE EXCEPTION 'New owner could not review complete transfer audit history: %',v_count; END IF;
END
$history$;
ROLLBACK;
