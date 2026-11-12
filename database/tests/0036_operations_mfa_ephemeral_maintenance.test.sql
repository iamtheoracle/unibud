-- PostgreSQL authorization and retention tests for Operations MFA ephemeral maintenance.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0360000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0360000-0000-4000-8000-000000000011','f0360000-0000-4000-8000-000000000001',decode(repeat('61',32),'hex'),clock_timestamp()-interval '2 days',clock_timestamp(),clock_timestamp()+interval '1 day',clock_timestamp()+interval '2 days'),
 ('f0360000-0000-4000-8000-000000000012','f0360000-0000-4000-8000-000000000001',decode(repeat('62',32),'hex'),clock_timestamp()-interval '2 days',clock_timestamp(),clock_timestamp()+interval '1 day',clock_timestamp()+interval '2 days');

INSERT INTO public.unibud_operator_mfa_assertion_nonces(
 nonce,account_id,session_id,purpose,expires_at
) VALUES
 ('f0360000-0000-4000-8000-000000000021','f0360000-0000-4000-8000-000000000001','f0360000-0000-4000-8000-000000000011','step_up',clock_timestamp()-interval '25 hours'),
 ('f0360000-0000-4000-8000-000000000022','f0360000-0000-4000-8000-000000000001','f0360000-0000-4000-8000-000000000012','step_up',clock_timestamp()+interval '1 minute');

INSERT INTO public.unibud_operator_mfa_step_up_sessions(
 session_id,account_id,verified_at,expires_at,assertion_nonce
) VALUES
 ('f0360000-0000-4000-8000-000000000011','f0360000-0000-4000-8000-000000000001',clock_timestamp()-interval '10 minutes',clock_timestamp()-interval '5 minutes','f0360000-0000-4000-8000-000000000021'),
 ('f0360000-0000-4000-8000-000000000012','f0360000-0000-4000-8000-000000000001',clock_timestamp(),clock_timestamp()+interval '5 minutes','f0360000-0000-4000-8000-000000000022');

INSERT INTO public.unibud_operator_mfa_api_rate_limits(
 account_id,action,window_started_at,request_count,updated_at
) VALUES
 ('f0360000-0000-4000-8000-000000000001','request_read',clock_timestamp()-interval '2 days',3,clock_timestamp()-interval '25 hours'),
 ('f0360000-0000-4000-8000-000000000001','request_create',clock_timestamp(),1,clock_timestamp());

SET LOCAL ROLE unibud_app;
DO $app_denial$
BEGIN
  BEGIN
    PERFORM * FROM unibud_private.maintain_operations_mfa_ephemeral_state(10);
    RAISE EXCEPTION 'Application role executed privileged maintenance worker';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$app_denial$;
RESET ROLE;

SET LOCAL ROLE unibud_ops_owner;
DO $maintenance$
DECLARE result RECORD;
BEGIN
  SELECT * INTO result
  FROM unibud_private.maintain_operations_mfa_ephemeral_state(10);
  IF result.expired_requests<>0
     OR result.expired_step_up_sessions<>1
     OR result.expired_assertion_nonces<>1
     OR result.stale_rate_limit_buckets<>1 THEN
    RAISE EXCEPTION 'Unexpected maintenance counts: %',row_to_json(result);
  END IF;
END
$maintenance$;
RESET ROLE;

DO $retention$
BEGIN
  IF EXISTS(SELECT 1 FROM public.unibud_operator_mfa_step_up_sessions
    WHERE session_id='f0360000-0000-4000-8000-000000000011') THEN
    RAISE EXCEPTION 'Expired step-up session was retained';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_mfa_step_up_sessions
    WHERE session_id='f0360000-0000-4000-8000-000000000012') THEN
    RAISE EXCEPTION 'Unexpired step-up session was removed';
  END IF;
  IF EXISTS(SELECT 1 FROM public.unibud_operator_mfa_assertion_nonces
    WHERE nonce='f0360000-0000-4000-8000-000000000021') THEN
    RAISE EXCEPTION 'Old expired assertion nonce was retained';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_mfa_assertion_nonces
    WHERE nonce='f0360000-0000-4000-8000-000000000022') THEN
    RAISE EXCEPTION 'Unexpired assertion nonce was removed';
  END IF;
  IF EXISTS(SELECT 1 FROM public.unibud_operator_mfa_api_rate_limits
    WHERE action='request_read') THEN
    RAISE EXCEPTION 'Stale rate-limit bucket was retained';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_mfa_api_rate_limits
    WHERE action='request_create') THEN
    RAISE EXCEPTION 'Recent rate-limit bucket was removed';
  END IF;
END
$retention$;

-- Bounded batches must reject zero and values above the hard ceiling.
DO $bounds$
BEGIN
  BEGIN
    PERFORM * FROM unibud_private.maintain_operations_mfa_ephemeral_state(0);
    RAISE EXCEPTION 'Zero batch size was accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
  BEGIN
    PERFORM * FROM unibud_private.maintain_operations_mfa_ephemeral_state(1001);
    RAISE EXCEPTION 'Oversized batch was accepted';
  EXCEPTION WHEN invalid_parameter_value THEN NULL;
  END;
END
$bounds$;

ROLLBACK;
