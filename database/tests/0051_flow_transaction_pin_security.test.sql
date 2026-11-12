-- Flow transaction PIN: Argon2id PHC storage, session ownership, lockout and recovery.
\set ON_ERROR_STOP on
BEGIN;

INSERT INTO public.accounts(id,status) VALUES
 ('f0510000-0000-4000-8000-000000000001','active'),
 ('f0510000-0000-4000-8000-000000000002','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('f0510000-0000-4000-8000-000000000011','f0510000-0000-4000-8000-000000000001',
  decode(repeat('81',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('f0510000-0000-4000-8000-000000000012','f0510000-0000-4000-8000-000000000002',
  decode(repeat('82',32),'hex'),clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-pin-ci-account',decode(repeat('84',32),'hex'),true);
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-pin-ci-session',decode(repeat('85',32),'hex'),true);

WITH ctx AS (
 SELECT 'f0510000-0000-4000-8000-000000000001'::TEXT AS account_id,
        'f0510000-0000-4000-8000-000000000011'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0510000-0000-4000-8000-000000000099'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('84',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('85',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $pin$
DECLARE
  v_hash TEXT:='$argon2id$v=19$m=65536,t=3,p=1$c29tZXNhbHQ$Y2hhbmdlZGlnaWVzdA';
  v_new_hash TEXT:='$argon2id$v=19$m=65536,t=3,p=1$bmV3c2FsdA$bmV3ZGlnaWVzdA';
  v_enrolled BOOLEAN;
  v_allowed BOOLEAN;
  v_returned_hash TEXT;
  v_locked TIMESTAMPTZ;
  v_attempts SMALLINT;
  v_count INTEGER;
  v_index INTEGER;
BEGIN
  v_enrolled:=public.flow_pin_enroll(v_hash);
  IF v_enrolled IS DISTINCT FROM true THEN RAISE EXCEPTION 'PIN enrollment failed'; END IF;
  IF public.flow_pin_enroll(v_hash) IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'PIN enrollment replaced an existing PIN';
  END IF;

  SELECT allowed,pin_hash_phc INTO v_allowed,v_returned_hash
    FROM public.flow_pin_begin_verification();
  IF v_allowed IS DISTINCT FROM true OR v_returned_hash IS DISTINCT FROM v_hash THEN
    RAISE EXCEPTION 'PIN verifier was not returned to the trusted server procedure';
  END IF;

  SELECT locked_until,failed_attempts INTO v_locked,v_attempts
    FROM public.flow_pin_record_failure();
  IF v_attempts<>1 OR v_locked IS NOT NULL THEN
    RAISE EXCEPTION 'First incorrect PIN did not increment failure counter';
  END IF;
  IF public.flow_pin_record_success() IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Correct PIN did not reset failure counter';
  END IF;

  FOR v_index IN 1..5 LOOP
    PERFORM public.flow_pin_record_failure();
  END LOOP;
  SELECT allowed,pin_hash_phc,locked_until
    INTO v_allowed,v_returned_hash,v_locked
    FROM public.flow_pin_begin_verification();
  IF v_allowed IS DISTINCT FROM false OR v_returned_hash IS NOT NULL OR v_locked IS NULL THEN
    RAISE EXCEPTION 'Five failed PIN attempts did not enforce account lockout';
  END IF;
  IF public.flow_pin_record_success() IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'A locked PIN credential was reset without recovery';
  END IF;

  IF public.flow_pin_recover(v_new_hash) IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Password-reauthenticated PIN recovery procedure failed';
  END IF;
  SELECT allowed,pin_hash_phc INTO v_allowed,v_returned_hash
    FROM public.flow_pin_begin_verification();
  IF v_allowed IS DISTINCT FROM true OR v_returned_hash IS DISTINCT FROM v_new_hash THEN
    RAISE EXCEPTION 'PIN recovery did not replace verifier and clear lockout';
  END IF;

  FOR v_index IN 1..4 LOOP
    PERFORM public.flow_pin_begin_verification();
  END LOOP;
  SELECT allowed INTO v_allowed FROM public.flow_pin_begin_verification();
  IF v_allowed IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'The fifth request inside the rate window should still be allowed';
  END IF;
  SELECT allowed INTO v_allowed FROM public.flow_pin_begin_verification();
  IF v_allowed IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Database-backed rate limiter allowed more than five PIN verification attempts';
  END IF;

  BEGIN
    EXECUTE 'SELECT pin_hash_phc FROM public.flow_transaction_credentials';
    RAISE EXCEPTION 'Application role can directly read stored PIN hashes';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  BEGIN
    PERFORM public.flow_consume_pin_rate_limit('pin_verify');
    RAISE EXCEPTION 'Application role can invoke the internal PIN rate-limit primitive directly';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END
$pin$;
RESET ROLE;

-- Switch the signed context to a different account. It must not see the first
-- account's credential or inherit its lockout/hash state.
WITH ctx AS (
 SELECT 'f0510000-0000-4000-8000-000000000002'::TEXT AS account_id,
        'f0510000-0000-4000-8000-000000000012'::TEXT AS session_id,
        floor(extract(epoch FROM clock_timestamp())+60)::BIGINT::TEXT AS expiry,
        'f0510000-0000-4000-8000-000000000098'::TEXT AS nonce
)
SELECT set_config('unibud.account_id',account_id,true),
       set_config('unibud.context_expiry',expiry,true),
       set_config('unibud.context_nonce',nonce,true),
       set_config('unibud.context_signature',
         encode(public.hmac(convert_to(account_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('84',32),'hex'),'sha256'),'hex'),true),
       set_config('unibud.session_id',session_id,true),
       set_config('unibud.session_context_signature',
         encode(public.hmac(convert_to('v1:'||account_id||':'||session_id||':'||expiry||':'||nonce,'UTF8'),
           decode(repeat('85',32),'hex'),'sha256'),'hex'),true)
FROM ctx;

SET LOCAL ROLE unibud_app;
DO $isolation$
DECLARE v_allowed BOOLEAN; v_hash TEXT;
BEGIN
  SELECT allowed,pin_hash_phc INTO v_allowed,v_hash
    FROM public.flow_pin_begin_verification();
  IF v_allowed IS DISTINCT FROM false OR v_hash IS NOT NULL THEN
    RAISE EXCEPTION 'A different account observed another account PIN credential';
  END IF;
END
$isolation$;
RESET ROLE;

ROLLBACK;
