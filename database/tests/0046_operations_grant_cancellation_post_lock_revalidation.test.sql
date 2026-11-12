-- Verify grant cancellation revalidates wall-clock security state after row-lock acquisition.
\set ON_ERROR_STOP on
BEGIN;

DO $contract$
DECLARE
  v_definition TEXT;
  v_lock_position INTEGER;
  v_clock_position INTEGER;
  v_session_position INTEGER;
  v_assertion_position INTEGER;
BEGIN
  SELECT pg_get_functiondef(
    'public.unibud_operator_cancel_grant_change(uuid,text,bigint,bigint,uuid,text)'::regprocedure
  ) INTO v_definition;

  v_lock_position:=strpos(v_definition,'FOR UPDATE');
  v_clock_position:=strpos(v_definition,'v_now:=clock_timestamp()');
  v_session_position:=strpos(v_definition,'su.expires_at>v_now');
  v_assertion_position:=strpos(v_definition,'to_timestamp(p_assertion_expires_at)<=v_now');

  IF v_lock_position=0 OR v_clock_position<=v_lock_position
     OR v_session_position<=v_clock_position
     OR v_assertion_position<=v_clock_position THEN
    RAISE EXCEPTION 'Grant cancellation does not revalidate security state after its row lock';
  END IF;

  IF NOT EXISTS(
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname='unibud_operator_cancel_grant_change'
      AND p.prosecdef
      AND pg_get_userbyid(p.proowner)='unibud_ops_owner'
  ) THEN
    RAISE EXCEPTION 'Grant cancellation must remain SECURITY DEFINER owned by unibud_ops_owner';
  END IF;

  IF has_function_privilege('unibud_app',
    'public.unibud_operator_cancel_grant_change(uuid,text,bigint,bigint,uuid,text)','EXECUTE') IS NOT TRUE
     OR has_table_privilege('unibud_app','public.unibud_operator_grant_requests','SELECT') IS TRUE
     OR has_table_privilege('unibud_app','public.unibud_operator_grant_requests','UPDATE') IS TRUE THEN
    RAISE EXCEPTION 'Grant cancellation privilege boundary changed';
  END IF;
END
$contract$;

ROLLBACK;
