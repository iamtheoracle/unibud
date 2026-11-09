-- First-party authentication procedure integration tests.
-- Run only against disposable PostgreSQL with synthetic values.
BEGIN;
SET LOCAL ROLE unibud_auth;
DO $auth$
DECLARE
  account_a UUID := '10000000-0000-4000-8000-000000000001';
  identity_a UUID := '20000000-0000-4000-8000-000000000001';
  challenge_verify UUID := '30000000-0000-4000-8000-000000000001';
  challenge_reset UUID := '30000000-0000-4000-8000-000000000002';
  session_a UUID := '40000000-0000-4000-8000-000000000001';
  session_b UUID := '40000000-0000-4000-8000-000000000002';
  hash_a TEXT := 'scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  hash_b TEXT := 'scrypt$ln=17,r=8,p=1$BBBBBBBBBBBBBBBBBBBBBB$BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
  lookup RECORD;
  session_row RECORD;
  rotated RECORD;
  now_at TIMESTAMPTZ := clock_timestamp();
  digest_key BYTEA := decode(repeat('77',32),'hex');
  challenge_digest BYTEA;
  reset_digest BYTEA;
  result TEXT;
BEGIN
  -- Auth runtime has no direct table access; it can call only reviewed procedures.
  BEGIN
    PERFORM 1 FROM public.accounts;
    RAISE EXCEPTION 'Auth runtime unexpectedly has direct account table access';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  PERFORM * FROM public.auth_create_pending_account(
    account_a, identity_a, 'synthetic-subject-00000001', 'email',
    decode(repeat('33',48),'hex'), decode(repeat('44',32),'hex'), hash_a
  );

  SELECT * INTO lookup FROM public.auth_lookup_identity('email',decode(repeat('44',32),'hex'));
  IF lookup.account_id <> account_a OR lookup.identity_id <> identity_a
     OR lookup.credential_hash <> hash_a OR lookup.account_status <> 'pending_verification' THEN
    RAISE EXCEPTION 'Auth identity lookup returned incorrect account data';
  END IF;

  challenge_digest := public.hmac(
    convert_to('challenge: ' || challenge_verify::TEXT || ':email_verification:123456','UTF8'),
    digest_key,'sha256'
  );
  PERFORM public.auth_create_verification_challenge(
    challenge_verify,account_a,identity_a,'email','email_verification',
    decode(repeat('55',32),'hex'),challenge_digest,now_at,now_at+interval '5 minutes',5
  );
  result := public.auth_verify_challenge(challenge_verify,challenge_digest,now_at+interval '1 second');
  IF result <> 'verified' THEN RAISE EXCEPTION 'Valid email verification was not accepted'; END IF;

  SELECT * INTO lookup FROM public.auth_lookup_identity('email',decode(repeat('44',32),'hex'));
  IF lookup.account_status <> 'active' OR lookup.verified_at IS NULL THEN
    RAISE EXCEPTION 'Verified identity did not activate its account';
  END IF;

  PERFORM public.auth_create_session(
    session_a,account_a,decode(repeat('aa',32),'hex'),
    now_at+interval '2 seconds',now_at+interval '32 minutes',now_at+interval '12 hours'
  );
  SELECT * INTO session_row FROM public.auth_lookup_session(decode(repeat('aa',32),'hex'));
  IF session_row.account_id <> account_a OR session_row.session_status <> 'active' THEN
    RAISE EXCEPTION 'Session issuance or lookup failed';
  END IF;

  SELECT * INTO rotated FROM public.auth_rotate_session(
    decode(repeat('aa',32),'hex'),session_b,decode(repeat('bb',32),'hex'),
    now_at+interval '3 seconds',now_at+interval '33 minutes',now_at+interval '12 hours'
  );
  IF rotated.account_id <> account_a OR rotated.session_id <> session_b THEN
    RAISE EXCEPTION 'Session rotation did not return the new session';
  END IF;
  SELECT * INTO session_row FROM public.auth_lookup_session(decode(repeat('aa',32),'hex'));
  IF session_row.session_status <> 'revoked' THEN
    RAISE EXCEPTION 'Old session was not revoked during rotation';
  END IF;

  reset_digest := public.hmac(
    convert_to('challenge: ' || challenge_reset::TEXT || ':password_reset:654321','UTF8'),
    digest_key,'sha256'
  );
  PERFORM public.auth_create_verification_challenge(
    challenge_reset,account_a,identity_a,'email','password_reset',
    decode(repeat('66',32),'hex'),reset_digest,now_at,now_at+interval '5 minutes',5
  );
  result := public.auth_verify_challenge(challenge_reset,reset_digest,now_at+interval '4 seconds');
  IF result <> 'verified' THEN RAISE EXCEPTION 'Valid password reset challenge was not accepted'; END IF;
  IF NOT public.auth_reset_password(challenge_reset,hash_b,now_at+interval '5 seconds') THEN
    RAISE EXCEPTION 'Verified password reset was not completed';
  END IF;

  SELECT * INTO session_row FROM public.auth_lookup_session(decode(repeat('bb',32),'hex'));
  IF session_row.session_status <> 'revoked' THEN
    RAISE EXCEPTION 'Password reset did not revoke existing sessions';
  END IF;
END;
$auth$;
ROLLBACK;
