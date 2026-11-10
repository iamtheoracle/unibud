-- Session-derived Operations authorization, isolation and revocation.
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('20000000-0000-4000-8000-000000000001','active'),
 ('20000000-0000-4000-8000-000000000002','active');

INSERT INTO public.account_sessions(
 id,account_id,credential_digest,status,issued_at,idle_expires_at,absolute_expires_at
) VALUES
 ('30000000-0000-4000-8000-000000000001',
  '20000000-0000-4000-8000-000000000001',decode(repeat('11',32),'hex'),
  'active',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '12 hours'),
 ('30000000-0000-4000-8000-000000000002',
  '20000000-0000-4000-8000-000000000002',decode(repeat('22',32),'hex'),
  'active',clock_timestamp(),clock_timestamp()+interval '1 hour',clock_timestamp()+interval '12 hours');

INSERT INTO public.operations_role_assignments(
 id,account_id,role_key,permissions,granted_by_service,reason_code
) VALUES (
 '40000000-0000-4000-8000-000000000001',
 '20000000-0000-4000-8000-000000000001',
 'integration_operator',
 ARRAY['operations.integrations.read']::text[],
 'ci_provisioning','test_assignment'
);

DO $test$
DECLARE allowed BOOLEAN;
BEGIN
 allowed := public.operations_authorize_session(
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'operations.integrations.read','ci-allowed'
 );
 IF allowed IS NOT TRUE THEN RAISE EXCEPTION 'Explicit active Operations assignment was not accepted'; END IF;

 allowed := public.operations_authorize_session(
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'operations.audit.read','ci-ungranted'
 );
 IF allowed IS NOT FALSE THEN RAISE EXCEPTION 'Unassigned permission was not denied'; END IF;

 allowed := public.operations_authorize_session(
  '20000000-0000-4000-8000-000000000002',
  '30000000-0000-4000-8000-000000000002',
  'operations.integrations.read','ci-other-account'
 );
 IF allowed IS NOT FALSE THEN RAISE EXCEPTION 'Unassigned second account was not authorized'; END IF;

 IF (SELECT count(*) FROM public.security_audit_events
     WHERE application_id='operations' AND action LIKE 'operations.authorization.%') <> 3
 THEN RAISE EXCEPTION 'Allowed and denied authorization decisions were not audited'; END IF;

 UPDATE public.account_sessions SET status='revoked',revoked_at=clock_timestamp()
 WHERE id='30000000-0000-4000-8000-000000000001';

 allowed := public.operations_authorize_session(
  '20000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'operations.integrations.read','ci-revoked-session'
 );
 IF allowed IS NOT FALSE THEN RAISE EXCEPTION 'Revoked session retained Operations access'; END IF;

 IF has_table_privilege('unibud_app','public.operations_role_assignments','SELECT')
   OR has_table_privilege('unibud_app','public.operations_role_assignments','INSERT')
 THEN RAISE EXCEPTION 'Application role can directly inspect or grant Operations roles'; END IF;

 IF has_function_privilege('unibud_app','public.operations_revoke_account_roles(uuid,text)','EXECUTE')
 THEN RAISE EXCEPTION 'Application role can invoke privileged Operations revocation control'; END IF;
END
$test$;

ROLLBACK;
