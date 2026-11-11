-- Verify the trusted scheduler execution role is non-login and function-only.
\\set ON_ERROR_STOP on
BEGIN;

DO $role_contract$
DECLARE
  v_login BOOLEAN;
  v_super BOOLEAN;
  v_createdb BOOLEAN;
  v_createrole BOOLEAN;
  v_bypassrls BOOLEAN;
BEGIN
  SELECT rolcanlogin,rolsuper,rolcreatedb,rolcreaterole,rolbypassrls
    INTO v_login,v_super,v_createdb,v_createrole,v_bypassrls
  FROM pg_catalog.pg_roles
  WHERE rolname='unibud_ops_scheduler';

  IF NOT FOUND OR v_login OR v_super OR v_createdb OR v_createrole OR v_bypassrls THEN
    RAISE EXCEPTION 'Maintenance scheduler role has unsafe role attributes';
  END IF;

  IF NOT has_function_privilege(
      'unibud_ops_scheduler',
      'unibud_private.maintain_operations_mfa_ephemeral_state(integer)',
      'EXECUTE'
    ) THEN
    RAISE EXCEPTION 'Scheduler role cannot execute the bounded maintenance procedure';
  END IF;

  IF has_function_privilege(
      'unibud_app',
      'unibud_private.maintain_operations_mfa_ephemeral_state(integer)',
      'EXECUTE'
    ) THEN
    RAISE EXCEPTION 'Application role can execute privileged maintenance';
  END IF;

  IF has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_security_requests','SELECT')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_step_up_sessions','SELECT')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_assertion_nonces','SELECT')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_api_rate_limits','SELECT')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_security_requests','DELETE')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_step_up_sessions','DELETE')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_assertion_nonces','DELETE')
     OR has_table_privilege('unibud_ops_scheduler',
      'public.unibud_operator_mfa_api_rate_limits','DELETE') THEN
    RAISE EXCEPTION 'Scheduler role has direct access to protected MFA tables';
  END IF;

  IF has_function_privilege(
      'unibud_ops_scheduler',
      'unibud_private.expire_operations_mfa_security_requests(integer)',
      'EXECUTE'
    ) THEN
    RAISE EXCEPTION 'Scheduler role can bypass the bounded maintenance entry point';
  END IF;
END
$role_contract$;

-- Prove the scheduler role can run the single approved entry point while
-- retaining no direct table access. The surrounding transaction is rolled back.
SET LOCAL ROLE unibud_ops_scheduler;
SELECT * FROM unibud_private.maintain_operations_mfa_ephemeral_state(1);
RESET ROLE;

-- The application role remains unable to invoke the maintenance procedure.
SET LOCAL ROLE unibud_app;
DO $app_denial$
BEGIN
  BEGIN
    PERFORM * FROM unibud_private.maintain_operations_mfa_ephemeral_state(1);
    RAISE EXCEPTION 'Application role executed privileged maintenance';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$app_denial$;
RESET ROLE;

ROLLBACK;
