-- General application role must not authorize Flow transactions.
\set ON_ERROR_STOP on
BEGIN;

DO $privileges$
BEGIN
  IF has_function_privilege(
    'unibud_app',
    'public.flow_pin_begin_verification()',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'unibud_app can read the Flow PIN verifier';
  END IF;
  IF has_function_privilege(
    'unibud_app',
    'public.flow_webauthn_list_credentials()',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'unibud_app can enumerate Flow biometric credentials';
  END IF;
  IF has_function_privilege(
    'unibud_app',
    'public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'unibud_app can authorize Flow payment intents';
  END IF;
  IF has_function_privilege(
    'unibud_app',
    'public.flow_cancel_payment_intent(uuid)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'unibud_app can invoke privileged Flow lifecycle controls';
  END IF;

  IF NOT has_function_privilege(
    'unibud_auth',
    'public.flow_pin_begin_verification()',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Dedicated auth role cannot verify Flow PIN';
  END IF;
  IF NOT has_function_privilege(
    'unibud_auth',
    'public.flow_webauthn_list_credentials()',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Dedicated auth role cannot verify Flow WebAuthn';
  END IF;
  IF NOT has_function_privilege(
    'unibud_auth',
    'public.flow_authorize_payment_intent(uuid,bytea,bigint,uuid,text,bytea,bigint)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'Dedicated auth role cannot authorize a user-confirmed Flow intent';
  END IF;

  IF has_table_privilege('unibud_auth','public.flow_transaction_credentials','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_biometric_credentials','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_authorization_challenges','SELECT')
     OR has_table_privilege('unibud_auth','public.flow_transaction_rate_limits','SELECT') THEN
    RAISE EXCEPTION 'Dedicated auth role has direct access to sensitive Flow tables';
  END IF;
END
$privileges$;

ROLLBACK;
