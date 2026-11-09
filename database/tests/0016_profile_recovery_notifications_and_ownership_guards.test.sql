-- Durable owner notifications, immutable ownership and fail-closed account closure.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('16000000-0000-4000-8000-000000000001','active'),
 ('16000000-0000-4000-8000-000000000002','active');
INSERT INTO profiles(id,owner_account_id,kind,handle,handle_normalized,display_name,visibility)
VALUES('26000000-0000-4000-8000-000000000001','16000000-0000-4000-8000-000000000001',
 'personal','guard-person','guard-person','Guard Person','private');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-profile-guard-key',decode(repeat('ad',32),'hex'));
WITH x AS (
 SELECT '16000000-0000-4000-8000-000000000001'::text a,
 floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
 'abababab-abab-4bab-8bab-abababababab'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('ad',32),'hex'),'sha256'),'hex'),true) FROM x;

SET LOCAL ROLE unibud_app;
DO $closure$
DECLARE v JSONB;
BEGIN
 v:=public.account_profile_closure_preflight('16000000-0000-4000-8000-000000000001');
 IF (v->>'canClose')::boolean IS NOT FALSE OR (v->>'ownedProfiles')::integer<>1 THEN
  RAISE EXCEPTION 'Closure preflight did not identify owned personal profile: %',v;
 END IF;
 BEGIN
  UPDATE public.accounts SET status='closed',closed_at=clock_timestamp()
   WHERE id='16000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Account closure unexpectedly succeeded with an owned profile';
 EXCEPTION WHEN check_violation THEN
  IF SQLERRM NOT LIKE 'Account closure blocked:%' THEN RAISE; END IF;
 END;
END
$closure$;
RESET ROLE;

-- Profile owner principal bypasses RLS but cannot silently change legal ownership.
SET LOCAL ROLE unibud_profile_owner;
DO $ownership$
BEGIN
 BEGIN
  UPDATE public.profiles SET owner_account_id='16000000-0000-4000-8000-000000000002'
   WHERE id='26000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Profile ownership unexpectedly changed';
 EXCEPTION WHEN SQLSTATE '55000' THEN NULL;
 END;
END
$ownership$;
RESET ROLE;
ROLLBACK;
