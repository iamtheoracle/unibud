-- Flow authorization is isolated from generic application and identity roles.
\set ON_ERROR_STOP on
BEGIN;

DO $privileges$
DECLARE
  v_flag RECORD;
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM pg_roles
     WHERE rolname='unibud_flow_auth' AND NOT rolcanlogin
       AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcreatedb AND NOT rolcreaterole
  ) THEN
    RAISE EXCEPTION 'unibud_flow_auth is not a restricted NOLOGIN role';
  END IF;

  FOREACH v_flag IN ARRAY ARRAY[
    ROW('unibud_app','public.flow_pin_begin_verification()')::RECORD,
    ROW('unibud_auth','public.flow_pin_begin_verification()')::RECORD,
    ROW('unibud_app','public.flow_webauthn_list_credentials()')::RECORD,
    ROW('unibud_auth','public.flow_webauthn_list_credentials()')::RECORD,
    ROW('unibud_app','public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)')::RECORD,
    ROW('unibud_auth','public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)')::RECORD,
    ROW('unibud_app','public.flow_cancel_payment_intent(uuid)')::RECORD,
    ROW('unibud_auth','public.flow_cancel_payment_intent(uuid)')::RECORD
  ] LOOP
    IF has_function_privilege(v_flag.f1::TEXT,v_flag.f2::TEXT,'EXECUTE') THEN
      RAISE EXCEPTION 'Generic role % retains privileged Flow execution on %',v_flag.f1,v_flag.f2;
    END IF;
  END LOOP;

  IF NOT has_function_privilege('unibud_flow_auth','public.flow_pin_begin_verification()','EXECUTE')
     OR NOT has_function_privilege('unibud_flow_auth','public.flow_webauthn_list_credentials()','EXECUTE')
     OR NOT has_function_privilege('unibud_flow_auth','public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)','EXECUTE')
     OR NOT has_function_privilege('unibud_flow_auth','public.flow_cancel_payment_intent(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'Dedicated Flow auth role is missing a required user-confirmation procedure';
  END IF;

  IF has_function_privilege('unibud_flow_auth','public.flow_create_payment_intent(uuid,bytea,bytea,bytea,numeric,text,numeric,text)','EXECUTE') THEN
    RAISE EXCEPTION 'Flow auth role can create payment intents outside the general instruction boundary';
  END IF;
  IF NOT has_function_privilege('unibud_app','public.flow_create_payment_intent(uuid,bytea,bytea,bytea,numeric,text,numeric,text)','EXECUTE')
     OR NOT has_function_privilege('unibud_app','public.flow_get_payment_intent_status(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'General app role cannot create an instruction and read only its status';
  END IF;

  IF has_table_privilege('unibud_app','public.flow_payment_intents','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_payment_intents','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_payment_intents','SELECT')
     OR has_table_privilege('unibud_app','public.flow_journal_entries','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_journal_entries','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_journal_entries','SELECT') THEN
    RAISE EXCEPTION 'A generic or Flow auth runtime role has direct financial table read access';
  END IF;

  IF has_table_privilege('unibud_flow_auth','public.flow_transaction_credentials','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_biometric_credentials','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_authorization_challenges','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_transaction_rate_limits','SELECT') THEN
    RAISE EXCEPTION 'Flow auth role has direct sensitive credential or challenge table access';
  END IF;
END
$privileges$;

ROLLBACK;
