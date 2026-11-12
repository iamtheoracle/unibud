-- PostgreSQL privilege and function-contract assertions for grant cancellation.
\set ON_ERROR_STOP on
BEGIN;
DO $assertions$
DECLARE v_oid OID; v_source TEXT; v_security_definer BOOLEAN; v_queue_source TEXT; v_rate_source TEXT;
BEGIN
  SELECT p.oid,p.prosrc,p.prosecdef INTO v_oid,v_source,v_security_definer
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='public' AND p.proname='unibud_operator_cancel_grant_change';
  IF v_oid IS NULL THEN RAISE EXCEPTION 'Grant cancellation function is missing'; END IF;
  IF NOT v_security_definer THEN RAISE EXCEPTION 'Grant cancellation must be SECURITY DEFINER'; END IF;
  IF NOT has_function_privilege('unibud_app',v_oid,'EXECUTE') THEN
    RAISE EXCEPTION 'Application role cannot execute grant cancellation function';
  END IF;
  IF has_table_privilege('unibud_app','public.unibud_operator_grant_requests','SELECT')
     OR has_table_privilege('unibud_app','public.unibud_operator_grants','UPDATE') THEN
    RAISE EXCEPTION 'Application role has direct grant table access';
  END IF;
  IF position('requester_session_id<>v_session' IN v_source)=0
     OR position('requester_account_id<>v_actor' IN v_source)=0
     OR position('consume_operations_password_reauth_assertion' IN v_source)=0
     OR position('unibud_operator_has_permission' IN v_source)=0
     OR position('grant_cancel' IN v_source)=0
     OR position('state=''cancelled''' IN v_source)=0 THEN
    RAISE EXCEPTION 'Cancellation function is missing requester/session/MFA/reauth/rate-limit/state checks';
  END IF;
  SELECT prosrc INTO v_queue_source FROM pg_proc
    WHERE oid='public.unibud_operator_list_grant_requests(uuid,integer,timestamp with time zone,uuid)'::regprocedure;
  SELECT prosrc INTO v_rate_source FROM pg_proc
    WHERE oid='public.unibud_operator_mfa_consume_api_rate_limit(text)'::regprocedure;
  IF position('requester_account_id=unibud_private.current_account_id()' IN v_queue_source)=0
     OR position('requester_session_id=unibud_private.current_session_id()' IN v_queue_source)=0
     OR position('operations.grants.request' IN v_queue_source)=0
     OR position('operations.grants.request' IN v_rate_source)=0 THEN
    RAISE EXCEPTION 'Requesters cannot read only their own same-session requests';
  END IF;
END
$assertions$;
ROLLBACK;
