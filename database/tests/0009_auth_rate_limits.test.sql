-- Atomic authentication rate-limit boundary tests.
BEGIN;
SET LOCAL ROLE unibud_auth;
DO $limits$
DECLARE
  digest_a BYTEA := decode(repeat('11',32),'hex');
  digest_b BYTEA := decode(repeat('22',32),'hex');
  start_at TIMESTAMPTZ := clock_timestamp();
  allowed BOOLEAN;
  attempt INTEGER;
BEGIN
  BEGIN
    PERFORM 1 FROM public.auth_rate_limit_buckets;
    RAISE EXCEPTION 'Auth runtime unexpectedly has direct rate bucket access';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;

  FOR attempt IN 1..5 LOOP
    allowed:=public.auth_consume_rate_limit('login',digest_a,start_at,900,5,1800);
    IF NOT allowed THEN RAISE EXCEPTION 'Allowed login attempt % was blocked',attempt; END IF;
  END LOOP;
  allowed:=public.auth_consume_rate_limit('login',digest_a,start_at,900,5,1800);
  IF allowed THEN RAISE EXCEPTION 'Sixth login attempt was not rate limited'; END IF;
  allowed:=public.auth_consume_rate_limit('login',digest_a,start_at+interval '1 minute',900,5,1800);
  IF allowed THEN RAISE EXCEPTION 'Blocked login bucket did not remain blocked'; END IF;

  -- A different keyed identifier and a different action have independent buckets.
  IF NOT public.auth_consume_rate_limit('login',digest_b,start_at,900,5,1800) THEN
    RAISE EXCEPTION 'Independent identifier bucket was incorrectly blocked';
  END IF;
  IF NOT public.auth_consume_rate_limit('recovery',digest_a,start_at,900,3,1800) THEN
    RAISE EXCEPTION 'Recovery action should have an independent bucket';
  END IF;

  -- After both the window and block expire, the bucket resets.
  IF NOT public.auth_consume_rate_limit('login',digest_a,start_at+interval '31 minutes',900,5,1800) THEN
    RAISE EXCEPTION 'Expired rate-limit bucket did not reset';
  END IF;
  IF public.auth_consume_rate_limit('login',NULL,start_at,900,5,1800) THEN
    RAISE EXCEPTION 'Null rate-limit digest was accepted';
  END IF;
END;
$limits$;
ROLLBACK;
