-- Flow authorization is isolated from generic application and identity roles.
\set ON_ERROR_STOP on
BEGIN;

DO $privileges$
BEGIN
  IF NOT EXISTS(
    SELECT 1 FROM pg_roles
     WHERE rolname='unibud_flow_auth' AND NOT rolcanlogin
       AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcreatedb AND NOT rolcreaterole
  ) THEN
    RAISE EXCEPTION 'unibud_flow_auth is not a restricted NOLOGIN role';
  END IF;

  IF pg_has_role('unibud_app','unibud_flow_auth','MEMBER')
     OR pg_has_role('unibud_auth','unibud_flow_auth','MEMBER')
     OR pg_has_role('unibud_flow_auth','unibud_flow_owner','MEMBER') THEN
    RAISE EXCEPTION 'Generic roles inherit Flow authorization or Flow runtime inherits table-owner privileges';
  END IF;

  IF has_function_privilege('unibud_app','public.flow_pin_begin_verification()','EXECUTE')
     OR has_function_privilege('unibud_auth','public.flow_pin_begin_verification()','EXECUTE')
     OR has_function_privilege('unibud_app','public.flow_webauthn_list_credentials()','EXECUTE')
     OR has_function_privilege('unibud_auth','public.flow_webauthn_list_credentials()','EXECUTE')
     OR has_function_privilege('unibud_app','public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)','EXECUTE')
     OR has_function_privilege('unibud_auth','public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)','EXECUTE')
     OR has_function_privilege('unibud_app','public.flow_cancel_payment_intent(uuid)','EXECUTE')
     OR has_function_privilege('unibud_auth','public.flow_cancel_payment_intent(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'Generic app/auth role retains privileged Flow execution';
  END IF;

  IF NOT has_function_privilege('unibud_flow_auth','public.flow_pin_begin_verification()','EXECUTE')
     OR NOT has_function_privilege('unibud_flow_auth','public.flow_webauthn_list_credentials()','EXECUTE')
     OR NOT has_function_privilege('unibud_flow_auth','public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)','EXECUTE')
     OR NOT has_function_privilege('unibud_flow_auth','public.flow_cancel_payment_intent(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'Dedicated Flow auth role is missing a required user-confirmation procedure';
  END IF;

  IF NOT has_function_privilege('unibud_flow_auth','public.flow_create_payment_intent(uuid,bytea,bytea,bytea,numeric,text,numeric,text)','EXECUTE')
     OR NOT has_function_privilege('unibud_app','public.flow_create_payment_intent(uuid,bytea,bytea,bytea,numeric,text,numeric,text)','EXECUTE')
     OR NOT has_function_privilege('unibud_app','public.flow_get_payment_intent_status(uuid)','EXECUTE') THEN
    RAISE EXCEPTION 'Flow or app role cannot create a scoped instruction and the app role cannot read only its lifecycle status';
  END IF;

  IF has_any_column_privilege('unibud_app','public.flow_customer_accounts','SELECT')
     OR has_any_column_privilege('unibud_auth','public.flow_customer_accounts','SELECT')
     OR has_any_column_privilege('unibud_flow_auth','public.flow_customer_accounts','SELECT')
     OR has_any_column_privilege('unibud_readonly','public.flow_customer_accounts','SELECT')
     OR has_any_column_privilege('unibud_app','public.flow_payment_intents','SELECT')
     OR has_any_column_privilege('unibud_auth','public.flow_payment_intents','SELECT')
     OR has_any_column_privilege('unibud_flow_auth','public.flow_payment_intents','SELECT')
     OR has_any_column_privilege('unibud_readonly','public.flow_payment_intents','SELECT')
     OR has_table_privilege('unibud_app','public.flow_journal_entries','SELECT')
     OR has_table_privilege('unibud_app','public.flow_journal_postings','SELECT')
     OR has_table_privilege('unibud_readonly','public.flow_journal_entries','SELECT')
     OR has_table_privilege('unibud_readonly','public.flow_journal_postings','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_journal_entries','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_journal_postings','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_journal_entries','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_journal_postings','SELECT') THEN
    RAISE EXCEPTION 'Generic app/auth runtime role retains direct financial table read access';
  END IF;

  IF has_table_privilege('unibud_flow_auth','public.flow_transaction_credentials','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_biometric_credentials','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_authorization_challenges','SELECT')
     OR has_table_privilege('unibud_flow_auth','public.flow_transaction_rate_limits','SELECT') THEN
    RAISE EXCEPTION 'Flow auth role has direct credential or challenge table access';
  END IF;
END
$privileges$;

ROLLBACK;
