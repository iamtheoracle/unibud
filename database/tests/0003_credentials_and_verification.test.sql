-- Synthetic account-isolation tests for credential and verification persistence.
BEGIN;
INSERT INTO accounts(id,status) VALUES
 ('10000000-0000-4000-8000-000000000001','active'),
 ('10000000-0000-4000-8000-000000000002','active');
INSERT INTO password_credentials(id,account_id,credential_hash)
VALUES ('70000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000001',
 'scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
INSERT INTO verification_challenges(
 id,account_id,channel,purpose,target_digest,code_digest,expires_at
) VALUES (
 '80000000-0000-4000-8000-000000000001',
 '10000000-0000-4000-8000-000000000001',
 'email','email_verification',decode(repeat('11',32),'hex'),
 decode(repeat('22',32),'hex'),now()+interval '5 minutes'
);
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-credential-test-key',decode(repeat('5a',32),'hex'));
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
DO $isolation$
BEGIN
 IF (SELECT count(*) FROM password_credentials) <> 1 THEN
   RAISE EXCEPTION 'Password credential RLS failed';
 END IF;
 IF (SELECT count(*) FROM verification_challenges) <> 1 THEN
   RAISE EXCEPTION 'Verification challenge RLS failed';
 END IF;
 PERFORM set_config('unibud.account_id','10000000-0000-4000-8000-000000000002',true);
 IF (SELECT count(*) FROM password_credentials) <> 0
    OR (SELECT count(*) FROM verification_challenges) <> 0 THEN
   RAISE EXCEPTION 'Forged context exposed credential or verification records';
 END IF;
END;
$isolation$;
RESET ROLE;
ROLLBACK;
