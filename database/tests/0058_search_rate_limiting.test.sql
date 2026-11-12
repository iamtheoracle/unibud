-- Authenticated Search rate-limit tests. Synthetic identities only.
BEGIN;

INSERT INTO public.accounts(id,status)
VALUES ('53000000-0000-4000-8000-000000000001','active');

UPDATE unibud_private.context_signing_keys SET active = false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES ('ci-search-rate-key',decode(repeat('6c',32),'hex'),true);

WITH context AS (
  SELECT
    '53000000-0000-4000-8000-000000000001'::TEXT AS account_id,
    floor(extract(epoch FROM clock_timestamp()) + 60)::BIGINT::TEXT AS expiry,
    'ffffffff-ffff-4fff-8fff-ffffffffffff'::TEXT AS nonce
)
SELECT
  set_config('unibud.account_id',account_id,true),
  set_config('unibud.context_expiry',expiry,true),
  set_config('unibud.context_nonce',nonce,true),
  set_config('unibud.context_signature',
    encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
      decode(repeat('6c',32),'hex'),'sha256'),'hex'),true)
FROM context;

SET LOCAL ROLE unibud_app;
DO $rate$
DECLARE
  v_digest BYTEA := decode(repeat('7d',32),'hex');
  i INTEGER;
  allowed BOOLEAN;
BEGIN
  FOR i IN 1..60 LOOP
    SELECT public.search_consume_rate_limit(v_digest) INTO allowed;
    IF allowed IS DISTINCT FROM TRUE THEN
      RAISE EXCEPTION 'Search request % was denied before the configured limit',i;
    END IF;
  END LOOP;

  SELECT public.search_consume_rate_limit(v_digest) INTO allowed;
  IF allowed IS DISTINCT FROM FALSE THEN
    RAISE EXCEPTION 'Search request beyond the configured limit was allowed';
  END IF;

  BEGIN
    INSERT INTO public.search_rate_limit_buckets(
      bucket_digest,window_started_at,request_count,updated_at
    ) VALUES (decode(repeat('8e',32),'hex'),clock_timestamp(),1,clock_timestamp());
    RAISE EXCEPTION 'Application role unexpectedly wrote rate-limit buckets directly';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$rate$;
RESET ROLE;

ROLLBACK;
