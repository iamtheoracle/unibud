-- Separate user-authentication security procedures from the general application role.
-- unibud_auth is a NOLOGIN group role used only by the dedicated auth database pool.
BEGIN;

DO $role$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='unibud_auth') THEN
    RAISE EXCEPTION 'Required unibud_auth security role is missing';
  END IF;
END
$role$;

GRANT USAGE ON SCHEMA public TO unibud_auth;

REVOKE ALL ON FUNCTION public.flow_pin_enroll(TEXT,BIGINT,UUID,TEXT),
  public.flow_pin_begin_verification(),
  public.flow_pin_record_failure(),
  public.flow_pin_record_success(),
  public.flow_pin_recover(TEXT,BIGINT,UUID,TEXT)
  FROM PUBLIC,unibud_app;
GRANT EXECUTE ON FUNCTION public.flow_pin_enroll(TEXT,BIGINT,UUID,TEXT),
  public.flow_pin_begin_verification(),
  public.flow_pin_record_failure(),
  public.flow_pin_record_success(),
  public.flow_pin_recover(TEXT,BIGINT,UUID,TEXT)
  TO unibud_auth;

REVOKE ALL ON FUNCTION public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ),
  public.flow_webauthn_get_registration_challenge(UUID),
  public.flow_webauthn_fail_registration_challenge(UUID),
  public.flow_webauthn_list_credentials(),
  public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT)
  FROM PUBLIC,unibud_app;
GRANT EXECUTE ON FUNCTION public.flow_webauthn_create_registration_challenge(BYTEA,TIMESTAMPTZ),
  public.flow_webauthn_get_registration_challenge(UUID),
  public.flow_webauthn_fail_registration_challenge(UUID),
  public.flow_webauthn_list_credentials(),
  public.flow_webauthn_register_credential(UUID,BYTEA,BYTEA,BIGINT,TEXT[],BYTEA,BIGINT,UUID,TEXT)
  TO unibud_auth;

REVOKE ALL ON FUNCTION public.flow_get_payment_intent_confirmation_details(UUID),
  public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ),
  public.flow_get_authorization_challenge(UUID),
  public.flow_fail_authorization_challenge(UUID),
  public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT),
  public.flow_cancel_payment_intent(UUID)
  FROM PUBLIC,unibud_app;
GRANT EXECUTE ON FUNCTION public.flow_get_payment_intent_confirmation_details(UUID),
  public.flow_create_authorization_challenge(UUID,TEXT,BYTEA,TIMESTAMPTZ),
  public.flow_get_authorization_challenge(UUID),
  public.flow_fail_authorization_challenge(UUID),
  public.flow_authorize_payment_intent(UUID,BYTEA,BIGINT,UUID,TEXT,BYTEA,BIGINT),
  public.flow_cancel_payment_intent(UUID)
  TO unibud_auth;

REVOKE ALL ON public.flow_customer_accounts,
  public.flow_transaction_credentials,
  public.flow_biometric_credentials,
  public.flow_webauthn_registration_challenges,
  public.flow_authorization_challenges,
  public.flow_transaction_rate_limits,
  public.flow_step_up_assertions
  FROM PUBLIC,unibud_app,unibud_auth,unibud_readonly,unibud_migrator;

COMMENT ON ROLE unibud_auth IS
'NOLOGIN least-privilege authentication service role. May execute first-party identity/session procedures and Flow PIN/WebAuthn/transaction-authorization procedures only. Has no direct Flow financial table access, ledger posting, provider dispatch or settlement authority.';

COMMIT;
