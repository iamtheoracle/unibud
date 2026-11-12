-- Verify transactional MFA security notifications and strict account scoping.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0390000-0000-4000-8000-000000000001','active'),
 ('f0390000-0000-4000-8000-000000000002','active'),
 ('f0390000-0000-4000-8000-000000000003','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0390000-0000-4000-8000-000000000011','f0390000-0000-4000-8000-000000000001',decode(repeat('d1',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0390000-0000-4000-8000-000000000012','f0390000-0000-4000-8000-000000000002',decode(repeat('d2',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0390000-0000-4000-8000-000000000013','f0390000-0000-4000-8000-000000000003',decode(repeat('d3',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES('ci-mfa-notify-account',decode(repeat('d4',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES('ci-mfa-notify-session',decode(repeat('d5',32),'hex'));

-- These events are written by the privileged database audit owner. The trigger
-- must enqueue notices for the actor, target and both sides of dual control.
SET LOCAL ROLE unibud_ops_owner;
INSERT INTO public.unibud_operator_mfa_security_requests(
 request_id,target_account_id,requested_action,state,requester_account_id,
 requester_session_id,reason_code,created_at,expires_at,decided_at
) VALUES(
 'f0390000-0000-4000-8000-000000000202',
 'f0390000-0000-4000-8000-000000000002',
 'reset','expired',
 'f0390000-0000-4000-8000-000000000001',
 'f0390000-0000-4000-8000-000000000011',
 'expired_test',clock_timestamp()-interval '1 hour',
 clock_timestamp()-interval '30 minutes',
 clock_timestamp()-interval '30 minutes'
);
-- The request/approval events below share request 201. The requester
-- must exist so the notification trigger can resolve and notify that account.
INSERT INTO public.unibud_operator_mfa_security_requests(
 request_id,target_account_id,requested_action,state,requester_account_id,
 requester_session_id,reason_code,created_at,expires_at
) VALUES(
 'f0390000-0000-4000-8000-000000000201',
 'f0390000-0000-4000-8000-000000000002',
 'reset','pending',
 'f0390000-0000-4000-8000-000000000001',
 'f0390000-0000-4000-8000-000000000011',
 'approval_test',clock_timestamp()-interval '1 minute',
 clock_timestamp()+interval '30 minutes'
);
INSERT INTO public.unibud_operator_mfa_events(
 event_id,actor_account_id,target_account_id,security_request_id,event_type
) VALUES(
 'f0390000-0000-4000-8000-000000000104',
 NULL,'f0390000-0000-4000-8000-000000000002',
 'f0390000-0000-4000-8000-000000000202','security_reset_expired'
);
INSERT INTO public.unibud_operator_mfa_events(
 event_id,actor_account_id,event_type
) VALUES(
 'f0390000-0000-4000-8000-000000000101',
 'f0390000-0000-4000-8000-000000000001','enrollment_confirmed'
);
INSERT INTO public.unibud_operator_mfa_events(
 event_id,actor_account_id,target_account_id,security_request_id,event_type
) VALUES
 ('f0390000-0000-4000-8000-000000000102',
  'f0390000-0000-4000-8000-000000000001',
  'f0390000-0000-4000-8000-000000000002',
  'f0390000-0000-4000-8000-000000000201','security_reset_requested'),
 ('f0390000-0000-4000-8000-000000000103',
  'f0390000-0000-4000-8000-000000000003',
  'f0390000-0000-4000-8000-000000000002',
  'f0390000-0000-4000-8000-000000000201','security_reset_approved');
RESET ROLE;

DO $privileges$
BEGIN
 IF has_table_privilege('unibud_app','public.unibud_operator_mfa_notifications','SELECT')
    OR has_table_privilege('unibud_app','public.unibud_operator_mfa_notifications','INSERT')
    OR has_table_privilege('unibud_app','public.unibud_operator_mfa_notifications','UPDATE')
    OR has_table_privilege('unibud_app','public.unibud_operator_mfa_notifications','DELETE')
    OR has_table_privilege('unibud_readonly','public.unibud_operator_mfa_notifications','SELECT')
    OR has_table_privilege('unibud_auth','public.unibud_operator_mfa_notifications','SELECT') THEN
   RAISE EXCEPTION 'Application, readonly or auth roles have direct notification-table access';
 END IF;
 IF NOT has_function_privilege('unibud_app',
    'public.unibud_operator_mfa_list_notifications(integer)','EXECUTE')
    OR NOT has_function_privilege('unibud_app',
    'public.unibud_operator_mfa_mark_notification_read(uuid)','EXECUTE') THEN
   RAISE EXCEPTION 'Application role lacks the account-bound notification API';
 END IF;
END
$privileges$;

-- Account 1 sees only its enrollment and request notices.
WITH x AS (
 SELECT 'f0390000-0000-4000-8000-000000000001'::text a,
        'f0390000-0000-4000-8000-000000000011'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0390000-0000-4000-8000-000000000111'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d4',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d5',32),'hex'),'sha256'),'hex'),true)
FROM x;
-- Capture the other account's notification identifier as the privileged test
-- harness before switching to the application role. The app must not read this table.
SELECT set_config('test.other_notification',(
 SELECT notification_id::text FROM public.unibud_operator_mfa_notifications
 WHERE account_id='f0390000-0000-4000-8000-000000000002'
   AND event_type='security_reset_requested'
),true);
SET LOCAL ROLE unibud_app;
DO $account_one$
DECLARE v_rows INTEGER; v_own UUID; v_other UUID;
BEGIN
 IF NOT public.unibud_operator_mfa_consume_api_rate_limit('notification_read') THEN
  RAISE EXCEPTION 'Account-bound notification read throttle incorrectly requires Operations MFA step-up';
 END IF;
 SELECT count(*) INTO v_rows FROM public.unibud_operator_mfa_list_notifications(50);
 IF v_rows<>4 THEN RAISE EXCEPTION 'Account 1 expected enrollment, request, decision and expiry notices, received %',v_rows; END IF;
 SELECT notification_id INTO v_own FROM public.unibud_operator_mfa_list_notifications(50)
  WHERE event_type='enrollment_confirmed';
 SELECT notification_id INTO v_other FROM public.unibud_operator_mfa_list_notifications(50)
  WHERE event_type='security_reset_requested';
 IF v_own IS NULL OR v_other IS NULL THEN RAISE EXCEPTION 'Expected own notifications are missing'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_mfa_list_notifications(50)
   WHERE event_type='security_reset_approved') THEN
  RAISE EXCEPTION 'Requester did not receive the independent approval notice';
 END IF;
 IF NOT public.unibud_operator_mfa_mark_notification_read(v_own) THEN
  RAISE EXCEPTION 'Account 1 could not mark its own notification read';
 END IF;
 IF public.unibud_operator_mfa_mark_notification_read(current_setting('test.other_notification')::UUID) THEN
  RAISE EXCEPTION 'Account 1 marked account 2 notification read';
 END IF;
 IF (SELECT count(*) FROM public.unibud_operator_mfa_list_notifications(50)
     WHERE event_type='enrollment_confirmed' AND read_at IS NOT NULL)<>1 THEN
  RAISE EXCEPTION 'Read state did not persist for the owning account';
 END IF;
END
$account_one$;
RESET ROLE;

-- Account 2 sees the two target-side dual-control notices and not account 1's.
WITH x AS (
 SELECT 'f0390000-0000-4000-8000-000000000002'::text a,
        'f0390000-0000-4000-8000-000000000012'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0390000-0000-4000-8000-000000000112'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d4',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d5',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $account_two$
DECLARE v_rows INTEGER;
BEGIN
 SELECT count(*) INTO v_rows FROM public.unibud_operator_mfa_list_notifications(50);
 IF v_rows<>3 THEN RAISE EXCEPTION 'Account 2 expected request, approval and expiry notices, received %',v_rows; END IF;
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_list_notifications(50)
   WHERE event_type='enrollment_confirmed') THEN
  RAISE EXCEPTION 'Account 2 saw another account enrollment notice';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_mfa_list_notifications(50)
   WHERE event_type='security_reset_expired') THEN
  RAISE EXCEPTION 'Target did not receive the expiry notice';
 END IF;
END
$account_two$;
RESET ROLE;

-- Account 3 (the independent approver) receives its own approval action notice.
WITH x AS (
 SELECT 'f0390000-0000-4000-8000-000000000003'::text a,
        'f0390000-0000-4000-8000-000000000013'::text s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text e,
        'f0390000-0000-4000-8000-000000000113'::text n
)
SELECT set_config('unibud.account_id',a,true),set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('d4',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('d5',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $account_three$
DECLARE v_rows INTEGER;
BEGIN
 SELECT count(*) INTO v_rows FROM public.unibud_operator_mfa_list_notifications(50);
 IF v_rows<>1 OR NOT EXISTS(SELECT 1 FROM public.unibud_operator_mfa_list_notifications(50)
   WHERE event_type='security_reset_approved') THEN
  RAISE EXCEPTION 'Approver did not receive its own approval notice';
 END IF;
END
$account_three$;
RESET ROLE;

ROLLBACK;
