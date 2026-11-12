-- Transactional grant notification fan-out and privilege boundary.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0470000-0000-4000-8000-000000000001','active'),
 ('f0470000-0000-4000-8000-000000000002','active'),
 ('f0470000-0000-4000-8000-000000000003','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0470000-0000-4000-8000-000000000011','f0470000-0000-4000-8000-000000000001',
  decode(repeat('47',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0470000-0000-4000-8000-000000000012','f0470000-0000-4000-8000-000000000002',
  decode(repeat('48',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.unibud_operator_grant_requests(
 request_id,requested_action,target_account_id,requested_role,requested_permissions,
 requested_expires_at,state,requester_account_id,requester_session_id,reason_code,
 created_at,expires_at
) VALUES (
 'f0470000-0000-4000-8000-000000000021','grant','f0470000-0000-4000-8000-000000000003',
 'support_readonly',ARRAY['operations.audit.read']::text[],
 clock_timestamp()+interval '30 days','pending','f0470000-0000-4000-8000-000000000001',
 'f0470000-0000-4000-8000-000000000011','notification_test',
 clock_timestamp(),clock_timestamp()+interval '30 minutes'
);

DO $submitted$
DECLARE v_count INTEGER;
BEGIN
 SELECT count(*) INTO v_count FROM public.unibud_operator_grant_notifications
 WHERE request_id='f0470000-0000-4000-8000-000000000021'
   AND event_type='request_submitted'
   AND account_id IN ('f0470000-0000-4000-8000-000000000001','f0470000-0000-4000-8000-000000000003');
 IF v_count<>2 THEN RAISE EXCEPTION 'Submitted request did not notify requester and target exactly once'; END IF;
END
$submitted$;

UPDATE public.unibud_operator_grant_requests
 SET state='rejected',approver_account_id='f0470000-0000-4000-8000-000000000002',
     approver_session_id='f0470000-0000-4000-8000-000000000012',
     decided_at=clock_timestamp(),decision_reason_code='not_approved'
 WHERE request_id='f0470000-0000-4000-8000-000000000021';

DO $decided$
DECLARE v_count INTEGER;
BEGIN
 SELECT count(*) INTO v_count FROM public.unibud_operator_grant_notifications
 WHERE request_id='f0470000-0000-4000-8000-000000000021'
   AND event_type='request_rejected'
   AND account_id IN (
    'f0470000-0000-4000-8000-000000000001',
    'f0470000-0000-4000-8000-000000000002',
    'f0470000-0000-4000-8000-000000000003'
   );
 IF v_count<>3 THEN RAISE EXCEPTION 'Rejected request did not notify requester, target and approver exactly once'; END IF;
 IF has_table_privilege('unibud_app','public.unibud_operator_grant_notifications','SELECT')
    OR has_table_privilege('unibud_app','public.unibud_operator_grant_notifications','UPDATE') THEN
  RAISE EXCEPTION 'Application role gained direct grant notification table access';
 END IF;
 IF has_function_privilege('unibud_app',
   'public.unibud_operator_list_grant_notifications(integer)','EXECUTE') IS NOT TRUE
   OR has_function_privilege('unibud_app',
   'public.unibud_operator_mark_grant_notification_read(uuid)','EXECUTE') IS NOT TRUE THEN
  RAISE EXCEPTION 'Application role notification function access is missing';
 END IF;
END
$decided$;

ROLLBACK;
