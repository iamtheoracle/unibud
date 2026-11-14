-- Positive signed-session test for workforce duty assignment, employee submission and independent review.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0490000-0000-4000-8000-000000000001','active'),
 ('f0490000-0000-4000-8000-000000000002','active');

INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0490000-0000-4000-8000-000000000011',
  'f0490000-0000-4000-8000-000000000001',decode(repeat('51',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0490000-0000-4000-8000-000000000012',
  'f0490000-0000-4000-8000-000000000002',decode(repeat('52',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.authentication_identities(
 id,account_id,issuer,subject,method,identifier_ciphertext,
 identifier_lookup_digest,is_primary,status,verified_at
) VALUES (
 'f0490000-0000-4000-8000-000000000020',
 'f0490000-0000-4000-8000-000000000002',
 'urn:unibud:workforce','f0490000-0000-4000-8000-000000000021',
 'email',decode(repeat('ab',32),'hex'),decode(repeat('cd',32),'hex'),
 true,'active',clock_timestamp()
);

INSERT INTO public.unibud_workforce_accounts(
 workforce_id,account_id,username,workforce_role,status,activation_code_digest,
 activation_expires_at,activation_consumed_at,first_name,last_name,email_identity_id,
 email_verified_at,passcode_hash,passcode_changed_at,created_by_account_id,
 approved_by_account_id,mfa_enrolled_at,onboarding_completed_at
) VALUES (
 'f0490000-0000-4000-8000-000000000030',
 'f0490000-0000-4000-8000-000000000002',
 'ub-staff-0123456789abcdef','staff','active',decode(repeat('ef',32),'hex'),
 clock_timestamp()-interval '1 day',clock_timestamp()-interval '1 day',
 'Grace','Hopper','f0490000-0000-4000-8000-000000000020',
 clock_timestamp()-interval '1 day',
 'scrypt$ln=17,r=8,p=1$aaaaaaaaaaaaaaaaaaaaaa$bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
 clock_timestamp()-interval '1 day',
 'f0490000-0000-4000-8000-000000000001',
 'f0490000-0000-4000-8000-000000000001',
 clock_timestamp()-interval '1 day',clock_timestamp()-interval '1 day'
);

INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES
 ('f0490000-0000-4000-8000-000000000001','platform_admin',
  ARRAY['operations.workforce.read','operations.workforce.request','operations.workforce.approve']::TEXT[],
  'f0490000-0000-4000-8000-000000000001'),
 ('f0490000-0000-4000-8000-000000000002','workforce_self',
  ARRAY['operations.workforce.self_access']::TEXT[],
  'f0490000-0000-4000-8000-000000000001');

INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('f0490000-0000-4000-8000-000000000001',
  'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('f0490000-0000-4000-8000-000000000002',
  'v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-workforce-account-key',decode(repeat('61',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-workforce-session-key',decode(repeat('62',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-workforce-mfa-key',decode(repeat('63',32),'hex'));

-- Manager session: sign exact account/session context and complete MFA step-up.
WITH x AS (
 SELECT 'f0490000-0000-4000-8000-000000000001'::TEXT AS a,
        'f0490000-0000-4000-8000-000000000011'::TEXT AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS e,
        'f0490000-0000-4000-8000-000000000041'::TEXT AS n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('61',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('62',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $manager$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; assignment UUID;
BEGIN
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires:=issued+60;
 nonce:='f0490000-0000-4000-8000-000000000042';
 signature:=encode(public.hmac(
  convert_to('v1:f0490000-0000-4000-8000-000000000001:f0490000-0000-4000-8000-000000000011:step_up:'||
    issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':1001','UTF8'),
  decode(repeat('63',32),'hex'),'sha256'),'hex');
 IF NOT public.unibud_operator_mfa_consume_step_up(issued,expires,nonce,1001,signature) THEN
  RAISE EXCEPTION 'Manager MFA step-up was not accepted';
 END IF;
 assignment:=public.unibud_workforce_assign_duty(
  'f0490000-0000-4000-8000-000000000030','member_support.review',
  'Review member support case','Review the assigned member support case and document the verified outcome.',
  statement_timestamp()+interval '2 days','f0490000-0000-4000-8000-000000000051'
 );
 IF assignment IS NULL THEN RAISE EXCEPTION 'Authorised manager could not assign duty'; END IF;
 PERFORM set_config('test.workforce.assignment_id',assignment::TEXT,true);
END
$manager$;
RESET ROLE;

-- Employee session: the same session must complete each transition in order.
WITH x AS (
 SELECT 'f0490000-0000-4000-8000-000000000002'::TEXT AS a,
        'f0490000-0000-4000-8000-000000000012'::TEXT AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS e,
        'f0490000-0000-4000-8000-000000000061'::TEXT AS n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('61',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('62',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $employee$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; assignment UUID; count_duties INTEGER;
BEGIN
 assignment:=current_setting('test.workforce.assignment_id')::UUID;
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires:=issued+60;
 nonce:='f0490000-0000-4000-8000-000000000062';
 signature:=encode(public.hmac(
  convert_to('v1:f0490000-0000-4000-8000-000000000002:f0490000-0000-4000-8000-000000000012:step_up:'||
    issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':1001','UTF8'),
  decode(repeat('63',32),'hex'),'sha256'),'hex');
 IF NOT public.unibud_operator_mfa_consume_step_up(issued,expires,nonce,1001,signature) THEN
  RAISE EXCEPTION 'Employee MFA step-up was not accepted';
 END IF;
 SELECT count(*) INTO count_duties FROM public.unibud_workforce_list_my_duties(50)
  WHERE assignment_id=assignment AND status='assigned';
 IF count_duties<>1 THEN RAISE EXCEPTION 'Employee could not see their assigned duty'; END IF;
 IF NOT public.unibud_workforce_update_duty(assignment,'accepted',NULL,NULL,
   'f0490000-0000-4000-8000-000000000071') THEN
  RAISE EXCEPTION 'Employee could not accept assigned duty';
 END IF;
 IF NOT public.unibud_workforce_update_duty(assignment,'in_progress',NULL,NULL,
   'f0490000-0000-4000-8000-000000000072') THEN
  RAISE EXCEPTION 'Employee could not start accepted duty';
 END IF;
 IF NOT public.unibud_workforce_update_duty(assignment,'submitted',
   'Reviewed the assigned case and documented the verified result.',
   'internal-case-reference-42','f0490000-0000-4000-8000-000000000073') THEN
  RAISE EXCEPTION 'Employee could not submit completed work for review';
 END IF;
 IF public.unibud_workforce_review_duty(assignment,'approve','self_approved',
   'f0490000-0000-4000-8000-000000000074') THEN
  RAISE EXCEPTION 'Employee approved their own submitted work';
 END IF;
END
$employee$;
RESET ROLE;

-- A different manager session reviews the submitted work and owns the completion decision.
WITH x AS (
 SELECT 'f0490000-0000-4000-8000-000000000001'::TEXT AS a,
        'f0490000-0000-4000-8000-000000000011'::TEXT AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS e,
        'f0490000-0000-4000-8000-000000000081'::TEXT AS n
)
SELECT
 set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('61',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('62',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $review$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; assignment UUID;
BEGIN
 assignment:=current_setting('test.workforce.assignment_id')::UUID;
 issued:=floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires:=issued+60;
 nonce:='f0490000-0000-4000-8000-000000000082';
 signature:=encode(public.hmac(
  convert_to('v1:f0490000-0000-4000-8000-000000000001:f0490000-0000-4000-8000-000000000011:step_up:'||
    issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':1002','UTF8'),
  decode(repeat('63',32),'hex'),'sha256'),'hex');
 IF NOT public.unibud_operator_mfa_consume_step_up(issued,expires,nonce,1002,signature) THEN
  RAISE EXCEPTION 'Reviewer MFA step-up was not accepted';
 END IF;
 IF NOT public.unibud_workforce_review_duty(assignment,'approve','evidence_reviewed',
   'f0490000-0000-4000-8000-000000000091') THEN
  RAISE EXCEPTION 'Independent manager could not approve submitted duty';
 END IF;
END
$review$;
RESET ROLE;

DO $assert$
DECLARE v_status TEXT; v_completed TIMESTAMPTZ; v_reviewed UUID; v_events INTEGER;
BEGIN
 SELECT status,completed_at,reviewed_by_account_id
 INTO v_status,v_completed,v_reviewed
 FROM public.unibud_workforce_duty_assignments
 WHERE assignment_id=current_setting('test.workforce.assignment_id')::UUID;
 IF v_status<>'completed' OR v_completed IS NULL
    OR v_reviewed<>'f0490000-0000-4000-8000-000000000001'::UUID THEN
  RAISE EXCEPTION 'Duty completion was not recorded by the independent manager';
 END IF;
 SELECT count(*) INTO v_events FROM public.unibud_workforce_audit_events
 WHERE resource_type='workforce_duty'
   AND resource_id=current_setting('test.workforce.assignment_id')::UUID
   AND event_type IN ('duty.assigned','duty.accepted','duty.in_progress','duty.submitted','duty.completed');
 IF v_events<>5 THEN RAISE EXCEPTION 'Duty lifecycle audit is incomplete: % events',v_events; END IF;
END
$assert$;

ROLLBACK;
