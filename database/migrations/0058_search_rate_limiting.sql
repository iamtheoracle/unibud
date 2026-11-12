-- Account-bound, atomic rate limiting for authenticated Search endpoints.
-- Bucket digests are HMACed in the trusted server; raw account identifiers are
-- never persisted in this table. Limits are fixed here, not caller-selectable.
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

CREATE OR REPLACE FUNCTION public.search_consume_rate_limit(p_bucket_digest BYTEA)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $function$
DECLARE
  v_now TIMESTAMPTZ := clock_timestamp();
  v_count INTEGER;
BEGIN
  IF p_bucket_digest IS NULL OR octet_length(p_bucket_digest) <> 32 THEN
    RAISE EXCEPTION 'Invalid search rate-limit bucket' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.search_rate_limit_buckets(
    bucket_digest, window_started_at, request_count, updated_at
  ) VALUES (
    p_bucket_digest, v_now, 1, v_now
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

  -- One account bucket per account; stale rows are bounded by this cleanup.
  DELETE FROM public.search_rate_limit_buckets
   WHERE updated_at < v_now - interval '1 day';

  RETURN v_count <= 60;
END;
$function$;

ALTER FUNCTION public.search_consume_rate_limit(BYTEA) OWNER TO unibud_profile_owner;
REVOKE ALL ON FUNCTION public.search_consume_rate_limit(BYTEA) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_consume_rate_limit(BYTEA) TO unibud_app;

COMMENT ON FUNCTION public.search_consume_rate_limit(BYTEA) IS
  'Atomically permits at most 60 authenticated Search requests per account per rolling fixed window; accepts only an opaque 32-byte HMAC digest.';

COMMIT;
