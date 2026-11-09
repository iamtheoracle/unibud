-- Database-backed atomic rate limiting for authentication and verification.
BEGIN;
CREATE TABLE public.auth_rate_limit_buckets (
 bucket_digest BYTEA PRIMARY KEY CHECK(octet_length(bucket_digest)=32),
 window_started_at TIMESTAMPTZ NOT NULL,
 request_count INTEGER NOT NULL CHECK(request_count>=0),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX auth_rate_limit_updated_idx ON public.auth_rate_limit_buckets(updated_at);
REVOKE ALL ON public.auth_rate_limit_buckets FROM PUBLIC,unibud_app,unibud_readonly,unibud_auth;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.auth_rate_limit_buckets TO unibud_auth_owner;

CREATE OR REPLACE FUNCTION public.auth_consume_rate_limit(
 p_bucket_digest BYTEA,p_limit INTEGER,p_window_seconds INTEGER,p_now TIMESTAMPTZ
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE current_count INTEGER;
BEGIN
 IF p_bucket_digest IS NULL OR octet_length(p_bucket_digest)<>32
 OR p_limit<1 OR p_limit>1000 OR p_window_seconds<1 OR p_window_seconds>86400
 THEN RAISE EXCEPTION 'Invalid rate limit request'; END IF;

 INSERT INTO public.auth_rate_limit_buckets(bucket_digest,window_started_at,request_count,updated_at)
 VALUES(p_bucket_digest,p_now,1,p_now)
 ON CONFLICT(bucket_digest) DO UPDATE SET
  window_started_at=CASE
   WHEN auth_rate_limit_buckets.window_started_at + (p_window_seconds * interval '1 second')<=p_now
   THEN p_now ELSE auth_rate_limit_buckets.window_started_at END,
  request_count=CASE
   WHEN auth_rate_limit_buckets.window_started_at + (p_window_seconds * interval '1 second')<=p_now
   THEN 1 ELSE auth_rate_limit_buckets.request_count+1 END,
  updated_at=p_now
 RETURNING request_count INTO current_count;
 RETURN current_count<=p_limit;
END;
$function$;

ALTER FUNCTION public.auth_consume_rate_limit(BYTEA,INTEGER,INTEGER,TIMESTAMPTZ) OWNER TO unibud_auth_owner;
REVOKE ALL ON FUNCTION public.auth_consume_rate_limit(BYTEA,INTEGER,INTEGER,TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_consume_rate_limit(BYTEA,INTEGER,INTEGER,TIMESTAMPTZ) TO unibud_auth;
COMMIT;
