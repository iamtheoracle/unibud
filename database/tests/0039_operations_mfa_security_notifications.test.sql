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
SELECT set_config('unibud.account_id','f0390000-0000-4000-8000-000000000001',true),
       set_config('unibud.session_id','f0390000-0000-4000-8000-000000000011',true),
       set_config('unibud.context_expiry',floor(extract(epoch FROM clock_timestamp())+60)::bigint::text,true),
       set_config('unibud.context_nonce','f0390000-0000-4000-8000-000000000111',true),
       set_config('unibud.context_signature',encode(public.hmac(convert_to(
        'f0390000-0000-4000-8000-000000000001:'||
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text||
        ':f0390000-0000-4000-8000-000000000111','UTF8'),
        decode(repeat('d4',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_context_signature',encode(public.hmac(convert_to(
        'v1:f0390000-0000-4000-8000-000000000001:f0390000-0000-4000-8000-000000000011:'||
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text||
        ':f0390000-0000-4000-8000-000000000111','UTF8'),
        decode(repeat('d5',32),'hex'),'sha256'),'hex'),true);
SET LOCAL ROLE unibud_app;
DO $account_one$
DECLARE v_rows INTEGER; v_own UUID; v_other UUID;
BEGIN
 SELECT count(*) INTO v_rows FROM public.unibud_operator_mfa_list_notifications(50);
 IF v_rows<>2 THEN RAISE EXCEPTION 'Account 1 expected two notices, received %',v_rows; END IF;
 SELECT notification_id INTO v_own FROM public.unibud_operator_mfa_list_notifications(50)
  WHERE event_type='enrollment_confirmed';
 SELECT notification_id INTO v_other FROM public.unibud_operator_mfa_list_notifications(50)
  WHERE event_type='security_reset_requested';
 IF v_own IS NULL OR v_other IS NULL THEN RAISE EXCEPTION 'Expected own notifications are missing'; END IF;
 IF NOT public.unibud_operator_mfa_mark_notification_read(v_own) THEN
  RAISE EXCEPTION 'Account 1 could not mark its own notification read';
 END IF;
 PERFORM set_config('test.other_notification',(
  SELECT notification_id::text FROM public.unibud_operator_mfa_notifications
  WHERE account_id='f0390000-0000-4000-8000-000000000002'
    AND event_type='security_reset_requested'
 ),true);
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
SELECT set_config('unibud.account_id','f0390000-0000-4000-8000-000000000002',true),
       set_config('unibud.session_id','f0390000-0000-4000-8000-000000000012',true),
       set_config('unibud.context_expiry',floor(extract(epoch FROM clock_timestamp())+60)::bigint::text,true),
       set_config('unibud.context_nonce','f0390000-0000-4000-8000-000000000112',true),
       set_config('unibud.context_signature',encode(public.hmac(convert_to(
        'f0390000-0000-4000-8000-000000000002:'||
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text||
        ':f0390000-0000-4000-8000-000000000112','UTF8'),
        decode(repeat('d4',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_context_signature',encode(public.hmac(convert_to(
        'v1:f0390000-0000-4000-8000-000000000002:f0390000-0000-4000-8000-000000000012:'||
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text||
        ':f0390000-0000-4000-8000-000000000112','UTF8'),
        decode(repeat('d5',32),'hex'),'sha256'),'hex'),true);
SET LOCAL ROLE unibud_app;
DO $account_two$
DECLARE v_rows INTEGER;
BEGIN
 SELECT count(*) INTO v_rows FROM public.unibud_operator_mfa_list_notifications(50);
 IF v_rows<>2 THEN RAISE EXCEPTION 'Account 2 expected two notices, received %',v_rows; END IF;
 IF EXISTS (SELECT 1 FROM public.unibud_operator_mfa_list_notifications(50)
   WHERE event_type='enrollment_confirmed') THEN
  RAISE EXCEPTION 'Account 2 saw another account enrollment notice';
 END IF;
END
$account_two$;
RESET ROLE;

-- Account 3 (the independent approver) receives its own approval action notice.
SELECT set_config('unibud.account_id','f0390000-0000-4000-8000-000000000003',true),
       set_config('unibud.session_id','f0390000-0000-4000-8000-000000000013',true),
       set_config('unibud.context_expiry',floor(extract(epoch FROM clock_timestamp())+60)::bigint::text,true),
       set_config('unibud.context_nonce','f0390000-0000-4000-8000-000000000113',true),
       set_config('unibud.context_signature',encode(public.hmac(convert_to(
        'f0390000-0000-4000-8000-000000000003:'||
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text||
        ':f0390000-0000-4000-8000-000000000113','UTF8'),
        decode(repeat('d4',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_context_signature',encode(public.hmac(convert_to(
        'v1:f0390000-0000-4000-8000-000000000003:f0390000-0000-4000-8000-000000000013:'||
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text||
        ':f0390000-0000-4000-8000-000000000113','UTF8'),
        decode(repeat('d5',32),'hex'),'sha256'),'hex'),true);
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
