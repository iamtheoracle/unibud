-- PostgreSQL integration tests for one-time exact-session Operations MFA step-up.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0240000-0000-4000-8000-000000000001','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0240000-0000-4000-8000-000000000011',
  'f0240000-0000-4000-8000-000000000001',decode(repeat('31',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0240000-0000-4000-8000-000000000012',
  'f0240000-0000-4000-8000-000000000001',decode(repeat('32',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('f0240000-0000-4000-8000-000000000001','integration_operator',
 ARRAY['integrations.verification_delivery.read']::text[],
 'f0240000-0000-4000-8000-000000000001');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES (
 'f0240000-0000-4000-8000-000000000001',
 'v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000
);

INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-account-context-key',decode(repeat('41',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-session-context-key',decode(repeat('42',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-mfa-assertion-key',decode(repeat('43',32),'hex'));

-- Install independently signed account/session context for session 11.
WITH x AS (
 SELECT 'f0240000-0000-4000-8000-000000000001'::text AS a,
        'f0240000-0000-4000-8000-000000000011'::text AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
        'f0240000-0000-4000-8000-000000000021'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('41',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('42',32),'hex'),'sha256'),'hex'),true)
FROM x;

SET LOCAL ROLE unibud_app;
DO $test$
DECLARE issued BIGINT; expires BIGINT; nonce UUID; signature TEXT; accepted BOOLEAN;
BEGIN
 IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
  RAISE EXCEPTION 'Operations access was allowed before session MFA step-up';
 END IF;
 -- A caller cannot forge an "allowed" audit outcome before completing MFA.
 PERFORM public.unibud_operator_record_access(
  'integrations.verification_delivery.read','allowed',
  'f0240000-0000-4000-8000-000000000032'
 );
 issued := floor(extract(epoch FROM clock_timestamp()))::BIGINT;
 expires := issued + 60;
 nonce := 'f0240000-0000-4000-8000-000000000031';
 signature := encode(public.hmac(
  convert_to('v1:f0240000-0000-4000-8000-000000000001:f0240000-0000-4000-8000-000000000011:step_up:'||
   issued::TEXT||':'||expires::TEXT||':'||nonce::TEXT||':1001','UTF8'),
  decode(repeat('43',32),'hex'),'sha256'),'hex');
 accepted := public.unibud_operator_mfa_consume_step_up(issued,expires,nonce,1001,signature);
 IF accepted IS DISTINCT FROM TRUE THEN
  RAISE EXCEPTION 'Valid signed MFA step-up assertion was not consumed';
 END IF;
 IF NOT public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
  RAISE EXCEPTION 'Exact-session step-up did not enable permitted Operations access';
 END IF;
 PERFORM public.unibud_operator_record_access(
  'integrations.verification_delivery.read','allowed',
  'f0240000-0000-4000-8000-000000000033'
 );
 IF public.unibud_operator_mfa_consume_step_up(issued,expires,nonce,1001,signature) THEN
  RAISE EXCEPTION 'Replayed assertion/TOTP step was accepted';
 END IF;
END
$test$;

-- Database-derived audit outcomes cannot be caller-forged.
DO $test$
DECLARE before_outcome TEXT; after_outcome TEXT;
BEGIN
 SELECT outcome INTO before_outcome FROM public.unibud_operator_audit_events
 WHERE request_id='f0240000-0000-4000-8000-000000000032';
 SELECT outcome INTO after_outcome FROM public.unibud_operator_audit_events
 WHERE request_id='f0240000-0000-4000-8000-000000000033';
 IF before_outcome IS DISTINCT FROM 'denied' OR after_outcome IS DISTINCT FROM 'allowed' THEN
  RAISE EXCEPTION 'Operations audit outcome did not match database authorization';
 END IF;
END
$test$;

-- App role cannot inspect step-up state or the assertion verifier key.
DO $test$
BEGIN
 IF has_table_privilege(current_user,'public.unibud_operator_mfa_step_up_sessions','SELECT')
    OR has_table_privilege(current_user,'public.unibud_operator_mfa_assertion_nonces','SELECT')
    OR has_table_privilege(current_user,'unibud_private.operations_mfa_assertion_signing_keys','SELECT') THEN
  RAISE EXCEPTION 'Application role can directly inspect protected MFA state';
 END IF;
END
$test$;
RESET ROLE;

-- A different active session for the same account does not inherit step-up.
WITH x AS (
 SELECT 'f0240000-0000-4000-8000-000000000001'::text AS a,
        'f0240000-0000-4000-8000-000000000012'::text AS s,
        floor(extract(epoch FROM clock_timestamp())+60)::bigint::text AS e,
        'f0240000-0000-4000-8000-000000000022'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('41',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),decode(repeat('42',32),'hex'),'sha256'),'hex'),true)
FROM x;
SET LOCAL ROLE unibud_app;
DO $test$
BEGIN
 IF public.unibud_operator_has_permission('integrations.verification_delivery.read') THEN
  RAISE EXCEPTION 'Another session inherited the first session MFA step-up';
 END IF;
END
$test$;
RESET ROLE;

ROLLBACK;
