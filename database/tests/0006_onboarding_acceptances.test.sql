BEGIN;
INSERT INTO accounts(id,status) VALUES
('10000000-0000-4000-8000-000000000001','active'),
('10000000-0000-4000-8000-000000000002','active');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-onboarding-key',decode(repeat('5a',32),'hex'));
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
INSERT INTO account_policy_acceptances(id,account_id,policy_type,policy_version)
VALUES('50000000-0000-4000-8000-000000000001',
'10000000-0000-4000-8000-000000000001','terms','2026-11-v1');
DO $$
BEGIN
 IF (SELECT count(*) FROM account_policy_acceptances)<>1 THEN
  RAISE EXCEPTION 'Account acceptance not visible to owner';
 END IF;
 BEGIN
  UPDATE account_policy_acceptances SET policy_version='tampered';
  RAISE EXCEPTION 'App role unexpectedly updated acceptance';
 EXCEPTION WHEN insufficient_privilege THEN NULL;
 END;
END $$;
RESET ROLE;
ROLLBACK;
