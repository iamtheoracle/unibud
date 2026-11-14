-- PostgreSQL integration tests for workforce invitation, activation, email and MFA lifecycle.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0480000-0000-4000-8000-000000000001','active'),
 ('f0480000-0000-4000-8000-000000000002','active'),
 ('f0480000-0000-4000-8000-000000000003','pending_verification');

DO $test$
BEGIN
  IF NOT unibud_private.operations_grant_permissions_valid(
    'workforce_self',ARRAY['operations.workforce.self_access']::TEXT[]
  ) THEN RAISE EXCEPTION 'Narrow workforce self-access grant was rejected'; END IF;
  IF unibud_private.operations_grant_permissions_valid(
    'workforce_self',ARRAY['operations.grants.approve']::TEXT[]
  ) THEN RAISE EXCEPTION 'Workforce self-access role can grant privileged permissions'; END IF;
  IF unibud_private.operations_grant_permissions_valid(
    'support_readonly',ARRAY['operations.workforce.approve']::TEXT[]
  ) THEN RAISE EXCEPTION 'Read-only support role can approve workforce access'; END IF;
END
$test$;

INSERT INTO public.unibud_workforce_accounts(
  workforce_id,account_id,username,workforce_role,status,
  activation_code_digest,activation_expires_at,created_by_account_id,approved_by_account_id
) VALUES (
  'f0480000-0000-4000-8000-000000000010',
  'f0480000-0000-4000-8000-000000000003',
  'ub-staff-0123456789abcdef','staff','invited',
  public.hmac(convert_to('v1:ub-staff-0123456789abcdef:123456','UTF8'),
    decode(repeat('aa',32),'hex'),'sha256'),
  clock_timestamp()+interval '15 minutes',
  'f0480000-0000-4000-8000-000000000001',
  'f0480000-0000-4000-8000-000000000002'
);

-- A wrong code increments the bounded attempt counter without disclosing the username.
SELECT * FROM public.unibud_workforce_activate(
  'ub-staff-0123456789abcdef',
  public.hmac(convert_to('wrong-code','UTF8'),decode(repeat('aa',32),'hex'),'sha256'),
  'Ada','Lovelace','f0480000-0000-4000-8000-000000000020',
  decode(repeat('ab',32),'hex'),decode(repeat('cd',32),'hex'),
  'scrypt$ln=17,r=8,p=1$aaaaaaaaaaaaaaaaaaaaaa$bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
);
DO $test$
BEGIN
  IF (SELECT activation_attempts FROM public.unibud_workforce_accounts
      WHERE username='ub-staff-0123456789abcdef')<>1 THEN
    RAISE EXCEPTION 'Invalid activation attempt was not counted';
  END IF;
END
$test$;

-- The valid activation code is consumed once and binds names, email identity and passcode verifier.
SELECT * FROM public.unibud_workforce_activate(
  'ub-staff-0123456789abcdef',
  public.hmac(convert_to('v1:ub-staff-0123456789abcdef:123456','UTF8'),
    decode(repeat('aa',32),'hex'),'sha256'),
  'Ada','Lovelace','f0480000-0000-4000-8000-000000000020',
  decode(repeat('ab',32),'hex'),decode(repeat('cd',32),'hex'),
  'scrypt$ln=17,r=8,p=1$aaaaaaaaaaaaaaaaaaaaaa$bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
);

DO $test$
DECLARE v_status TEXT; v_identity UUID;
BEGIN
  SELECT status,email_identity_id INTO v_status,v_identity
  FROM public.unibud_workforce_accounts WHERE username='ub-staff-0123456789abcdef';
  IF v_status<>'email_verification_pending' OR v_identity IS NULL THEN
    RAISE EXCEPTION 'Activation did not enter email verification state';
  END IF;
  IF (SELECT count(*) FROM public.authentication_identities
      WHERE id=v_identity AND method='email' AND verified_at IS NULL)<>1 THEN
    RAISE EXCEPTION 'Workforce email identity was not created as unverified';
  END IF;
  IF (SELECT count(*) FROM public.unibud_workforce_activate(
      'ub-staff-0123456789abcdef',
      public.hmac(convert_to('v1:ub-staff-0123456789abcdef:123456','UTF8'),
        decode(repeat('aa',32),'hex'),'sha256'),
      'Ada','Lovelace','f0480000-0000-4000-8000-000000000021',
      decode(repeat('ef',32),'hex'),decode(repeat('12',32),'hex'),
      'scrypt$ln=17,r=8,p=1$aaaaaaaaaaaaaaaaaaaaaa$bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
  ))<>0 THEN RAISE EXCEPTION 'Activation code was reusable'; END IF;
END
$test$;

-- Email verification unlocks only the MFA-enrollment stage, never the dashboard.
UPDATE public.authentication_identities
SET verified_at=clock_timestamp(),updated_at=clock_timestamp()
WHERE id='f0480000-0000-4000-8000-000000000020';
UPDATE public.accounts SET status='active'
WHERE id='f0480000-0000-4000-8000-000000000003';

DO $test$
BEGIN
  IF (SELECT status FROM public.unibud_workforce_accounts
      WHERE account_id='f0480000-0000-4000-8000-000000000003')<>'mfa_enrollment_required' THEN
    RAISE EXCEPTION 'Email verification bypassed mandatory MFA enrollment';
  END IF;
END
$test$;

INSERT INTO public.unibud_operator_grants(
  account_id,operator_role,permissions,granted_by,expires_at
) VALUES (
  'f0480000-0000-4000-8000-000000000003','workforce_self',
  ARRAY['operations.workforce.self_access']::TEXT[],
  'f0480000-0000-4000-8000-000000000002',
  clock_timestamp()+interval '90 days'
);

INSERT INTO public.unibud_operator_mfa_credentials(
  account_id,encrypted_totp_secret,state,enrollment_expires_at
) VALUES (
  'f0480000-0000-4000-8000-000000000003','v1.'||repeat('A',64),
  'pending',clock_timestamp()+interval '10 minutes'
);
UPDATE public.unibud_operator_mfa_credentials
SET state='active',confirmed_at=clock_timestamp(),last_accepted_totp_step=100
WHERE account_id='f0480000-0000-4000-8000-000000000003';

DO $test$
BEGIN
  IF (SELECT status FROM public.unibud_workforce_accounts
      WHERE account_id='f0480000-0000-4000-8000-000000000003')<>'active' THEN
    RAISE EXCEPTION 'MFA confirmation did not complete workforce onboarding';
  END IF;
  IF (SELECT count(*) FROM public.unibud_operator_grants
      WHERE account_id='f0480000-0000-4000-8000-000000000003'
        AND operator_role='workforce_self'
        AND permissions=ARRAY['operations.workforce.self_access']::TEXT[])<>1 THEN
    RAISE EXCEPTION 'Workforce received more than the narrow self-access grant';
  END IF;
END
$test$;

SELECT public.unibud_workforce_record_login(
  decode(repeat('ef',32),'hex'),'ub-staff-0123456789abcdef','success',
  'f0480000-0000-4000-8000-000000000099'
);
DO $test$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.unibud_workforce_audit_events
    WHERE request_id='f0480000-0000-4000-8000-000000000099'
      AND event_type='workforce.login.success'
      AND subject_account_id='f0480000-0000-4000-8000-000000000003'
      AND actor_account_id IS NULL AND actor_session_id IS NULL) THEN
    RAISE EXCEPTION 'Pre-session workforce login audit is missing or forged';
  END IF;
END
$test$;

DO $test$
BEGIN
  BEGIN
    UPDATE public.unibud_workforce_audit_events
      SET outcome='denied'
      WHERE request_id='f0480000-0000-4000-8000-000000000099';
    RAISE EXCEPTION 'Workforce audit rows were mutable';
  EXCEPTION WHEN object_not_in_prerequisite_state THEN NULL;
  END;
  IF has_table_privilege('unibud_app','public.unibud_workforce_accounts','SELECT')
     OR has_table_privilege('unibud_auth','public.unibud_workforce_accounts','SELECT') THEN
    RAISE EXCEPTION 'Runtime role has direct workforce table access';
  END IF;
  IF NOT has_function_privilege('unibud_auth',
      'public.unibud_workforce_activate(text,bytea,text,text,uuid,bytea,bytea,text)','EXECUTE')
     OR NOT has_function_privilege('unibud_auth',
      'public.unibud_workforce_lookup_login(text)','EXECUTE') THEN
    RAISE EXCEPTION 'Dedicated authentication role lacks the narrow workforce auth procedures';
  END IF;
  IF has_function_privilege('unibud_app',
      'public.unibud_workforce_activate(text,bytea,text,text,uuid,bytea,bytea,text)','EXECUTE') THEN
    RAISE EXCEPTION 'Application role can bypass workforce authentication boundary';
  END IF;
  IF public.unibud_workforce_request_invitation('staff','test_reason') IS NOT NULL THEN
    RAISE EXCEPTION 'Unauthenticated caller created a workforce invitation request';
  END IF;
END
$test$;

ROLLBACK;
