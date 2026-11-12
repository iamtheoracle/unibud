-- Account-bound, atomic rate limiting for authenticated Search endpoints.
-- The database derives the opaque bucket from its verified signed account
-- context and private signing key; callers cannot select another bucket.
BEGIN;

CREATE TABLE public.search_rate_limit_buckets (
  bucket_digest BYTEA PRIMARY KEY CHECK (octet_length(bucket_digest) = 32),
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 0),
  updated_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX search_rate_limit_updated_idx
  ON public.search_rate_limit_buckets(updated_at);

REVOKE ALL ON public.search_rate_limit_buckets
  FROM PUBLIC, unibud_app, unibud_readonly;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.search_rate_limit_buckets
  TO unibud_profile_owner;
GRANT SELECT ON unibud_private.context_signing_keys TO unibud_profile_owner;

CREATE OR REPLACE FUNCTION public.search_consume_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account_id UUID := unibud_private.current_account_id();
  v_key BYTEA;
  v_digest BYTEA;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_count INTEGER;
BEGIN
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Verified account context required' USING ERRCODE = '42501';
  END IF;

  SELECT secret INTO v_key
    FROM unibud_private.context_signing_keys
   WHERE active
   ORDER BY created_at DESC
   LIMIT 1;
  IF v_key IS NULL OR octet_length(v_key) < 32 THEN
    RAISE EXCEPTION 'Search rate-limit key unavailable' USING ERRCODE = '55000';
  END IF;

  v_digest := public.hmac(
    convert_to('unibud-search-rate-limit:v1:' || v_account_id::TEXT, 'UTF8'),
    v_key,
    'sha256'
  );

  INSERT INTO public.search_rate_limit_buckets(
    bucket_digest, window_started_at, request_count, updated_at
  ) VALUES (
    v_digest, v_now, 1, v_now
  )
  ON CONFLICT (bucket_digest) DO UPDATE
    SET window_started_at = CASE
          WHEN search_rate_limit_buckets.window_started_at + interval '1 minute' <= v_now
          THEN v_now ELSE search_rate_limit_buckets.window_started_at END,
        request_count = CASE
          WHEN search_rate_limit_buckets.window_started_at + interval '1 minute' <= v_now
          THEN 1 ELSE search_rate_limit_buckets.request_count + 1 END,
        updated_at = v_now
  RETURNING request_count INTO v_count;

  DELETE FROM public.search_rate_limit_buckets
   WHERE updated_at < v_now - interval '1 day';

  RETURN v_count <= 60;
END;
$function$;

ALTER FUNCTION public.search_consume_rate_limit() OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.search_consume_rate_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_consume_rate_limit() TO unibud_app;

CREATE OR REPLACE FUNCTION public.account_block_consume_rate_limit()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, unibud_private
AS $function$
DECLARE
  v_account_id UUID := unibud_private.current_account_id();
  v_key BYTEA;
  v_digest BYTEA;
  v_now TIMESTAMPTZ := clock_timestamp();
  v_count INTEGER;
BEGIN
  IF v_account_id IS NULL THEN
    RAISE EXCEPTION 'Verified account context required' USING ERRCODE = '42501';
  END IF;

  SELECT secret INTO v_key
    FROM unibud_private.context_signing_keys
   WHERE active
   ORDER BY created_at DESC
   LIMIT 1;
  IF v_key IS NULL OR octet_length(v_key) < 32 THEN
    RAISE EXCEPTION 'Account action rate-limit key unavailable' USING ERRCODE = '55000';
  END IF;

  v_digest := public.hmac(
    convert_to('unibud-account-block-rate-limit:v1:' || v_account_id::TEXT, 'UTF8'),
    v_key,
    'sha256'
  );

  INSERT INTO public.search_rate_limit_buckets(
    bucket_digest, window_started_at, request_count, updated_at
  ) VALUES (
    v_digest, v_now, 1, v_now
  )
  ON CONFLICT (bucket_digest) DO UPDATE
    SET window_started_at = CASE
          WHEN search_rate_limit_buckets.window_started_at + interval '1 minute' <= v_now
          THEN v_now ELSE search_rate_limit_buckets.window_started_at END,
        request_count = CASE
          WHEN search_rate_limit_buckets.window_started_at + interval '1 minute' <= v_now
          THEN 1 ELSE search_rate_limit_buckets.request_count + 1 END,
        updated_at = v_now
  RETURNING request_count INTO v_count;

  DELETE FROM public.search_rate_limit_buckets
   WHERE updated_at < v_now - interval '1 day';

  RETURN v_count <= 10;
END;
$function$;

ALTER FUNCTION public.account_block_consume_rate_limit() OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.account_block_consume_rate_limit() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.account_block_consume_rate_limit() TO unibud_app;

COMMENT ON FUNCTION public.account_block_consume_rate_limit() IS
  'Atomically permits at most 10 block/unblock operations per verified account per one-minute window using a separate opaque HMAC bucket.';

COMMENT ON FUNCTION public.search_consume_rate_limit() IS
  'Atomically permits at most 60 authenticated Search requests per verified account per one-minute window. The database derives an opaque HMAC bucket from signed transaction context; callers cannot select buckets.';

COMMIT;
