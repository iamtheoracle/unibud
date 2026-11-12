-- Verify bounded scheduler expiry of pending operator grant requests.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0450000-0000-4000-8000-000000000001','active'),
 ('f0450000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 'f0450000-0000-4000-8000-000000000011',
 'f0450000-0000-4000-8000-000000000001',
 decode(repeat('45',32),'hex'),
 clock_timestamp()-interval '2 hours',clock_timestamp()-interval '1 hour',
 clock_timestamp()+interval '1 day',clock_timestamp()+interval '2 days'
);
INSERT INTO public.unibud_operator_grant_requests(
 request_id,requested_action,target_account_id,requested_role,requested_permissions,
 requested_expires_at,state,requester_account_id,requester_session_id,reason_code,
 created_at,expires_at
) VALUES (
 'f0450000-0000-4000-8000-000000000021','grant',
 'f0450000-0000-4000-8000-000000000002','support_readonly',
 ARRAY['operations.audit.read']::text[],clock_timestamp()+interval '30 days',
 'pending','f0450000-0000-4000-8000-000000000001',
 'f0450000-0000-4000-8000-000000000011','staff_access',
 clock_timestamp()-interval '1 hour',clock_timestamp()-interval '1 second'
);

SET LOCAL ROLE unibud_ops_scheduler;
DO $worker$
DECLARE result RECORD;
BEGIN
 SELECT * INTO result
 FROM unibud_private.maintain_operations_mfa_ephemeral_state(10);
 IF result.expired_requests<1 THEN
   RAISE EXCEPTION 'Bounded maintenance did not count the expired grant request';
 END IF;
END
$worker$;
RESET ROLE;

DO $verify$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_grant_requests
   WHERE request_id='f0450000-0000-4000-8000-000000000021'
     AND state='expired' AND approver_account_id IS NULL
     AND decision_reason_code='request_expired' AND decided_at IS NOT NULL) THEN
   RAISE EXCEPTION 'Expired grant request was not transitioned correctly';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_audit_events
   WHERE request_id='f0450000-0000-4000-8000-000000000021'
     AND actor_account_id IS NULL AND session_id IS NULL
     AND permission='operations.grants.expire' AND outcome='allowed') THEN
   RAISE EXCEPTION 'System-attributed grant expiry audit event is missing';
 END IF;
END
$verify$;

ROLLBACK;
