-- PostgreSQL integration tests for protected Operations MFA persistence.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0220000-0000-4000-8000-000000000001','active'),
 ('f0220000-0000-4000-8000-000000000002','active');

SET LOCAL ROLE unibud_ops_owner;
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at
) VALUES (
 'f0220000-0000-4000-8000-000000000001',
 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'pending',clock_timestamp()+interval '10 minutes'
);
INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest)
VALUES (
 'f0220000-0000-4000-8000-000000000001',
 decode(repeat('ab',32),'hex')
);
RESET ROLE;

SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF has_table_privilege(current_user,'public.unibud_operator_mfa_credentials','SELECT')
    OR has_table_privilege(current_user,'public.unibud_operator_mfa_credentials','INSERT')
    OR has_table_privilege(current_user,'public.unibud_operator_mfa_credentials','UPDATE')
    OR has_table_privilege(current_user,'public.unibud_operator_mfa_recovery_codes','SELECT')
    OR has_table_privilege(current_user,'public.unibud_operator_mfa_recovery_codes','INSERT')
    OR has_table_privilege(current_user,'public.unibud_operator_mfa_recovery_codes','UPDATE') THEN
   RAISE EXCEPTION 'Application role has direct access to protected MFA storage';
 END IF;
 BEGIN
   EXECUTE 'SELECT count(*) FROM public.unibud_operator_mfa_credentials';
   RAISE EXCEPTION 'Application role read protected MFA credentials';
 EXCEPTION WHEN insufficient_privilege THEN
   NULL;
 END;
 BEGIN
   EXECUTE 'INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest) VALUES ($1,$2)'
     USING 'f0220000-0000-4000-8000-000000000001'::uuid,decode(repeat('cd',32),'hex');
   RAISE EXCEPTION 'Application role wrote protected recovery storage';
 EXCEPTION WHEN insufficient_privilege THEN
   NULL;
 END;
END
$test$;
RESET ROLE;

-- Structural constraints reject malformed digests and impossible state combinations.
SET LOCAL ROLE unibud_ops_owner;
DO $test$
BEGIN
 BEGIN
  INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest)
  VALUES ('f0220000-0000-4000-8000-000000000001',decode('abcd','hex'));
  RAISE EXCEPTION 'Malformed recovery digest was accepted';
 EXCEPTION WHEN check_violation THEN
  NULL;
 END;
 BEGIN
  INSERT INTO public.unibud_operator_mfa_credentials(
   account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at
  ) VALUES (
   'f0220000-0000-4000-8000-000000000002',
   'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
   'pending',clock_timestamp()+interval '10 minutes',clock_timestamp()
  );
  RAISE EXCEPTION 'Pending credential with confirmation timestamp was accepted';
 EXCEPTION WHEN check_violation THEN
  NULL;
 END;
END
$test$;
RESET ROLE;

ROLLBACK;
