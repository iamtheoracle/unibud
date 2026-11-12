-- Isolate Flow financial confirmation from generic identity authentication.
-- Flow authorization routes use a dedicated login principal granted unibud_flow_auth.
-- The generic app role can prepare an intent and read only its lifecycle state.
BEGIN;

DO $role$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='unibud_flow_auth') THEN
    CREATE ROLE unibud_flow_auth NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS;
  END IF;
END
$role$;

GRANT USAGE ON SCHEMA public TO unibud_flow_auth;

-- Generic identity authentication and general application services must not
-- enumerate PIN verifiers, WebAuthn credentials or authorize/cancel intents.
REVOKE ALL ON FUNCTION public.flow_pin_enroll(TEXT,BIGINT,UUID,TEXT),
  public.flow_pin_begin_verification(),
  public.flow_pin_record_failure(),
  public.flow_pin_record_success(),
  public.flow_pin_recover(TEXT,BIGINT,UUID,TEXT),
  public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ),
  public.flow_webauthn_get_registration_challenge(UUID),
  public.flow_webauthn_fail_registration_challenge(UUID),
  public.flow_webauthn_list_credentials(),
  public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT),
  public.flow_get_payment_intent_confirmation_details(UUID),
  public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ),
  public.flow_get_authorization_challenge(UUID),
  public.flow_fail_authorization_challenge(UUID),
  public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT),
  public.flow_cancel_payment_intent(UUID)
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly;
GRANT EXECUTE ON FUNCTION public.flow_pin_enroll(TEXT,BIGINT,UUID,TEXT),
  public.flow_pin_begin_verification(),
  public.flow_pin_record_failure(),
  public.flow_pin_record_success(),
  public.flow_pin_recover(TEXT,BIGINT,UUID,TEXT),
  public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ),
  public.flow_webauthn_get_registration_challenge(UUID),
  public.flow_webauthn_fail_registration_challenge(UUID),
  public.flow_webauthn_list_credentials(),
  public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT),
  public.flow_get_payment_intent_confirmation_details(UUID),
  public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ),
  public.flow_get_authorization_challenge(UUID),
  public.flow_fail_authorization_challenge(UUID),
  public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT),
  public.flow_cancel_payment_intent(UUID)
  TO unibud_flow_auth;

-- Remove broad read access to Flow account mappings, financial intents and
-- settlement mirror records. Future customer read models must be narrow,
-- account/session-bound procedures, not direct app-role table access.
REVOKE SELECT ON public.flow_customer_accounts,public.flow_payment_intents,
  public.flow_journal_entries,public.flow_journal_postings
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator,unibud_flow_auth;

CREATE FUNCTION public.flow_get_payment_intent_status(p_payment_intent_id UUID)
RETURNS TABLE(payment_intent_id UUID,status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public,unibud_private
AS $function$
DECLARE
  v_account UUID:=unibud_private.current_account_id();
  v_session UUID:=unibud_private.current_session_id();
  v_request UUID:=gen_random_uuid();
BEGIN
  IF v_account IS NULL OR v_session IS NULL OR p_payment_intent_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT i.payment_intent_id,i.status
    FROM public.flow_payment_intents i
   WHERE i.account_id=v_account
     AND i.payment_intent_id=p_payment_intent_id;

  IF FOUND THEN
    INSERT INTO public.security_audit_events(
      id,actor_account_id,application_id,action,outcome,resource_type,resource_id,
      request_id,session_reference,event_data
    ) VALUES(
      gen_random_uuid(),v_account,'flow','flow.payment_intent.status.read','success',
      'flow_payment_intent',p_payment_intent_id,v_request::TEXT,v_session::TEXT,'{}'::jsonb
    );
  END IF;
END;
$function$;

ALTER FUNCTION public.flow_get_payment_intent_status(UUID) OWNER TO unibud_flow_owner;
REVOKE ALL ON FUNCTION public.flow_get_payment_intent_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.flow_get_payment_intent_status(UUID) TO unibud_app;

COMMENT ON ROLE unibud_flow_auth IS
'NOLOGIN dedicated Flow transaction-security service role. May execute account/session-bound PIN, WebAuthn, confirmation, authorization and cancellation procedures only. No direct table access, payment-intent creation, ledger posting, provider dispatch or settlement.';
COMMENT ON FUNCTION public.flow_get_payment_intent_status(UUID) IS
'Returns only the owner-scoped lifecycle state of a newly created instruction. Does not reveal recipient, amount, currency, fee, account references or ledger data.';

COMMIT;
