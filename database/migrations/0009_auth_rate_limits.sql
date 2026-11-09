-- Database-backed identifier/challenge rate limiting.
-- Buckets contain only keyed digests, never raw identifiers or IP addresses.

BEGIN;

CREATE TABLE public.auth_rate_limit_buckets (
  action TEXT NOT NULL CHECK (action IN ('register','login','recovery','verification')),
  key_digest BYTEA NOT NULL CHECK (octet_length(key_digest)=32),
  window_started_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL CHECK (attempts>=0),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY(action,key_digest)
);

GRANT SELECT,INSERT,UPDATE ON public.auth_rate_limit_buckets TO unibud_auth_owner;

CREATE OR REPLACE FUNCTION public.auth_consume_rate_limit(
  p_action TEXT,
  p_key_digest BYTEA,
  p_now TIMESTAMPTZ,
  p_window_seconds INTEGER,
  p_max_attempts INTEGER,
  p_block_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=pg_catalog,public
AS $function$
DECLARE bucket public.auth_rate_limit_buckets%ROWTYPE;
BEGIN
  IF p_action IS NULL OR p_action NOT IN ('register','login','recovery','verification')
     OR p_key_digest IS NULL OR octet_length(p_key_digest)<>32
     OR p_now IS NULL
     OR p_window_seconds IS NULL OR p_window_seconds NOT BETWEEN 60 AND 86400
     OR p_max_attempts IS NULL OR p_max_attempts NOT BETWEEN 1 AND 100
     OR p_block_seconds IS NULL OR p_block_seconds NOT BETWEEN 60 AND 86400 THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.auth_rate_limit_buckets(
    action,key_digest,window_started_at,attempts,blocked_until,updated_at
  ) VALUES(p_action,p_key_digest,p_now,1,NULL,p_now)
  ON CONFLICT(action,key_digest) DO UPDATE
  SET window_started_at=CASE
        WHEN public.auth_rate_limit_buckets.window_started_at
          + make_interval(secs=>p_window_seconds) <= p_now THEN p_now
        ELSE public.auth_rate_limit_buckets.window_started_at
      END,
      attempts=CASE
        WHEN public.auth_rate_limit_buckets.window_started_at
          + make_interval(secs=>p_window_seconds) <= p_now THEN 1
        ELSE public.auth_rate_limit_buckets.attempts+1
      END,
      blocked_until=CASE
        WHEN public.auth_rate_limit_buckets.blocked_until IS NOT NULL
          AND public.auth_rate_limit_buckets.blocked_until > p_now
          THEN public.auth_rate_limit_buckets.blocked_until
        WHEN public.auth_rate_limit_buckets.window_started_at
          + make_interval(secs=>p_window_seconds) <= p_now THEN NULL
        WHEN public.auth_rate_limit_buckets.attempts+1 > p_max_attempts
          THEN p_now + make_interval(secs=>p_block_seconds)
        ELSE NULL
      END,
      updated_at=p_now
  RETURNING * INTO bucket;

  RETURN (bucket.blocked_until IS NULL OR bucket.blocked_until <= p_now)
    AND bucket.attempts <= p_max_attempts;
END;
$function$;

GRANT CREATE ON SCHEMA public TO unibud_auth_owner;
ALTER FUNCTION public.auth_consume_rate_limit(TEXT,BYTEA,TIMESTAMPTZ,INTEGER,INTEGER,INTEGER)
  OWNER TO unibud_auth_owner;
REVOKE CREATE ON SCHEMA public FROM unibud_auth_owner;
REVOKE ALL ON FUNCTION public.auth_consume_rate_limit(TEXT,BYTEA,TIMESTAMPTZ,INTEGER,INTEGER,INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.auth_consume_rate_limit(TEXT,BYTEA,TIMESTAMPTZ,INTEGER,INTEGER,INTEGER) TO unibud_auth;

COMMIT;
