-- Oracle Arc application identity, signed-request replay protection, quotas and audit.
-- This migration belongs to Oracle Arc's independent PostgreSQL database.
BEGIN;

DO $roles$
BEGIN
  CREATE ROLE oracle_arc_owner NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$roles$;
DO $roles$
BEGIN
  CREATE ROLE oracle_arc_runtime NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$roles$;
DO $roles$
BEGIN
  CREATE ROLE oracle_arc_maintenance NOLOGIN;
EXCEPTION WHEN duplicate_object THEN NULL;
END
$roles$;

CREATE SCHEMA IF NOT EXISTS oracle_arc AUTHORIZATION oracle_arc_owner;
REVOKE ALL ON SCHEMA oracle_arc FROM PUBLIC;
GRANT USAGE ON SCHEMA oracle_arc TO oracle_arc_runtime,oracle_arc_maintenance;

CREATE TABLE oracle_arc.application_clients (
  app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z][a-z0-9-]{1,62}$'),
  display_name TEXT NOT NULL CHECK (length(display_name) BETWEEN 2 AND 120),
  environment TEXT NOT NULL CHECK (environment IN ('development','staging','production')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','revoked')),
  scopes TEXT[] NOT NULL
    CHECK (cardinality(scopes) BETWEEN 1 AND 32)
    CHECK (array_to_string(scopes, ',') ~ '^[a-z][a-z0-9_.-]{1,63}(,[a-z][a-z0-9_.-]{1,63})*$'),
  requests_per_minute INTEGER NOT NULL DEFAULT 60 CHECK (requests_per_minute BETWEEN 1 AND 6000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE TABLE oracle_arc.application_credentials (
  credential_id UUID PRIMARY KEY,
  app_id UUID NOT NULL REFERENCES oracle_arc.application_clients(app_id) ON DELETE CASCADE,
  public_key BYTEA NOT NULL CHECK (octet_length(public_key) = 32),
  scopes TEXT[] NOT NULL
    CHECK (cardinality(scopes) BETWEEN 1 AND 32)
    CHECK (array_to_string(scopes, ',') ~ '^[a-z][a-z0-9_.-]{1,63}(,[a-z][a-z0-9_.-]{1,63})*$'),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  key_version INTEGER NOT NULL DEFAULT 1 CHECK (key_version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  CHECK ((status = 'active' AND revoked_at IS NULL) OR status = 'revoked')
);
CREATE INDEX application_credentials_app_status_idx
  ON oracle_arc.application_credentials(app_id,status);

CREATE TABLE oracle_arc.request_nonces (
  app_id UUID NOT NULL REFERENCES oracle_arc.application_clients(app_id) ON DELETE CASCADE,
  nonce TEXT NOT NULL CHECK (length(nonce) BETWEEN 22 AND 86),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(app_id,nonce)
);
CREATE INDEX request_nonces_expiry_idx ON oracle_arc.request_nonces(expires_at);

CREATE TABLE oracle_arc.rate_limit_buckets (
  app_id UUID NOT NULL REFERENCES oracle_arc.application_clients(app_id) ON DELETE CASCADE,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0),
  PRIMARY KEY(app_id,window_started_at)
);

CREATE TABLE oracle_arc.audit_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID REFERENCES oracle_arc.application_clients(app_id) ON DELETE RESTRICT,
  event_type TEXT NOT NULL CHECK (event_type ~ '^[a-z][a-z0-9_.-]{1,95}$'),
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','denied','rejected')),
  request_id UUID NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (octet_length(event_data::text) <= 4096),
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX audit_events_app_created_idx
  ON oracle_arc.audit_events(app_id,created_at DESC);

ALTER TABLE oracle_arc.application_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.application_clients FORCE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.application_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.application_credentials FORCE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.request_nonces ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.request_nonces FORCE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.rate_limit_buckets FORCE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_arc.audit_events FORCE ROW LEVEL SECURITY;

CREATE POLICY application_clients_owner_all ON oracle_arc.application_clients
  TO oracle_arc_owner USING (true) WITH CHECK (true);
CREATE POLICY application_credentials_owner_all ON oracle_arc.application_credentials
  TO oracle_arc_owner USING (true) WITH CHECK (true);
CREATE POLICY request_nonces_owner_all ON oracle_arc.request_nonces
  TO oracle_arc_owner USING (true) WITH CHECK (true);
CREATE POLICY rate_limit_buckets_owner_all ON oracle_arc.rate_limit_buckets
  TO oracle_arc_owner USING (true) WITH CHECK (true);
CREATE POLICY audit_events_owner_all ON oracle_arc.audit_events
  TO oracle_arc_owner USING (true) WITH CHECK (true);

ALTER TABLE oracle_arc.application_clients OWNER TO oracle_arc_owner;
ALTER TABLE oracle_arc.application_credentials OWNER TO oracle_arc_owner;
ALTER TABLE oracle_arc.request_nonces OWNER TO oracle_arc_owner;
ALTER TABLE oracle_arc.rate_limit_buckets OWNER TO oracle_arc_owner;
ALTER TABLE oracle_arc.audit_events OWNER TO oracle_arc_owner;

CREATE FUNCTION oracle_arc.authenticate_application(
  p_credential_id UUID,
  p_environment TEXT
) RETURNS TABLE(
  app_id UUID,
  slug TEXT,
  display_name TEXT,
  environment TEXT,
  scopes TEXT[],
  requests_per_minute INTEGER,
  public_key BYTEA
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, oracle_arc
AS $function$
  SELECT a.app_id,a.slug,a.display_name,a.environment,
    ARRAY(
      SELECT granted.scope
      FROM (
        SELECT unnest(a.scopes) AS scope
        INTERSECT
        SELECT unnest(c.scopes) AS scope
      ) AS granted
      ORDER BY granted.scope
    ),
    a.requests_per_minute,c.public_key
  FROM oracle_arc.application_credentials AS c
  JOIN oracle_arc.application_clients AS a ON a.app_id=c.app_id
  WHERE c.credential_id=p_credential_id
    AND c.status='active'
    AND c.revoked_at IS NULL
    AND (c.expires_at IS NULL OR c.expires_at>statement_timestamp())
    AND a.status='active'
    AND a.environment=p_environment;
$function$;
ALTER FUNCTION oracle_arc.authenticate_application(UUID,TEXT) OWNER TO oracle_arc_owner;

CREATE FUNCTION oracle_arc.consume_request_nonce(
  p_app_id UUID,
  p_nonce TEXT,
  p_expires_at TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, oracle_arc
AS $function$
DECLARE v_inserted BOOLEAN;
BEGIN
  IF p_app_id IS NULL OR p_nonce IS NULL OR length(p_nonce)<22 OR length(p_nonce)>86
     OR p_expires_at IS NULL OR p_expires_at<=clock_timestamp()
     OR p_expires_at>clock_timestamp()+interval '6 minutes' THEN
    RETURN FALSE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM oracle_arc.application_clients a
    WHERE a.app_id=p_app_id AND a.status='active'
  ) THEN
    RETURN FALSE;
  END IF;
  INSERT INTO oracle_arc.request_nonces(app_id,nonce,expires_at)
  VALUES(p_app_id,p_nonce,p_expires_at)
  ON CONFLICT(app_id,nonce) DO NOTHING
  RETURNING TRUE INTO v_inserted;
  RETURN COALESCE(v_inserted,FALSE);
END
$function$;
ALTER FUNCTION oracle_arc.consume_request_nonce(UUID,TEXT,TIMESTAMPTZ) OWNER TO oracle_arc_owner;

CREATE FUNCTION oracle_arc.consume_app_rate_limit(p_app_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, oracle_arc
AS $function$
DECLARE
  v_limit INTEGER;
  v_count INTEGER;
BEGIN
  SELECT a.requests_per_minute INTO v_limit
  FROM oracle_arc.application_clients a
  WHERE a.app_id=p_app_id AND a.status='active';
  IF NOT FOUND THEN RETURN FALSE; END IF;

  INSERT INTO oracle_arc.rate_limit_buckets(app_id,window_started_at,request_count)
  VALUES(p_app_id,date_trunc('minute',clock_timestamp()),1)
  ON CONFLICT(app_id,window_started_at) DO UPDATE
    SET request_count=LEAST(oracle_arc.rate_limit_buckets.request_count+1,6001)
  RETURNING request_count INTO v_count;
  RETURN v_count<=v_limit;
END
$function$;
ALTER FUNCTION oracle_arc.consume_app_rate_limit(UUID) OWNER TO oracle_arc_owner;

CREATE FUNCTION oracle_arc.record_app_event(
  p_app_id UUID,
  p_event_type TEXT,
  p_outcome TEXT,
  p_request_id UUID,
  p_event_data JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, oracle_arc
AS $function$
BEGIN
  IF p_event_type IS NULL OR p_event_type !~ '^[a-z][a-z0-9_.-]{1,95}$'
     OR p_outcome IS NULL OR p_outcome NOT IN ('allowed','denied','rejected')
     OR p_request_id IS NULL OR p_event_data IS NULL
     OR octet_length(p_event_data::text)>4096 THEN
    RAISE EXCEPTION 'Invalid Oracle Arc audit event' USING ERRCODE='22023';
  END IF;
  IF p_app_id IS NOT NULL AND NOT EXISTS(
    SELECT 1 FROM oracle_arc.application_clients a WHERE a.app_id=p_app_id
  ) THEN
    RAISE EXCEPTION 'Unknown Oracle Arc application' USING ERRCODE='22023';
  END IF;
  INSERT INTO oracle_arc.audit_events(app_id,event_type,outcome,request_id,event_data)
  VALUES(p_app_id,p_event_type,p_outcome,p_request_id,p_event_data);
END
$function$;
ALTER FUNCTION oracle_arc.record_app_event(UUID,TEXT,TEXT,UUID,JSONB) OWNER TO oracle_arc_owner;

CREATE FUNCTION oracle_arc.purge_expired_runtime_state(p_limit INTEGER)
RETURNS TABLE(nonces_deleted INTEGER,buckets_deleted INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, oracle_arc
AS $function$
DECLARE
  v_nonces INTEGER;
  v_buckets INTEGER;
BEGIN
  IF p_limit IS NULL OR p_limit<1 OR p_limit>1000 THEN
    RAISE EXCEPTION 'Maintenance batch must be between 1 and 1000' USING ERRCODE='22023';
  END IF;

  WITH expired AS (
    SELECT ctid FROM oracle_arc.request_nonces
    WHERE expires_at<=clock_timestamp()
    ORDER BY expires_at
    LIMIT p_limit
  )
  DELETE FROM oracle_arc.request_nonces AS target
  USING expired
  WHERE target.ctid=expired.ctid;
  GET DIAGNOSTICS v_nonces=ROW_COUNT;

  WITH expired AS (
    SELECT ctid FROM oracle_arc.rate_limit_buckets
    WHERE window_started_at<date_trunc('minute',clock_timestamp())-interval '24 hours'
    ORDER BY window_started_at
    LIMIT p_limit
  )
  DELETE FROM oracle_arc.rate_limit_buckets AS target
  USING expired
  WHERE target.ctid=expired.ctid;
  GET DIAGNOSTICS v_buckets=ROW_COUNT;

  RETURN QUERY SELECT v_nonces,v_buckets;
END
$function$;
ALTER FUNCTION oracle_arc.purge_expired_runtime_state(INTEGER) OWNER TO oracle_arc_owner;

CREATE FUNCTION oracle_arc.reject_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, oracle_arc
AS $function$
BEGIN
  RAISE EXCEPTION 'Oracle Arc audit events are immutable' USING ERRCODE='55000';
END
$function$;
ALTER FUNCTION oracle_arc.reject_audit_mutation() OWNER TO oracle_arc_owner;
CREATE TRIGGER audit_events_immutable
  BEFORE UPDATE OR DELETE ON oracle_arc.audit_events
  FOR EACH ROW EXECUTE FUNCTION oracle_arc.reject_audit_mutation();

REVOKE ALL ON ALL TABLES IN SCHEMA oracle_arc FROM PUBLIC, oracle_arc_runtime, oracle_arc_maintenance;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA oracle_arc FROM PUBLIC, oracle_arc_runtime, oracle_arc_maintenance;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA oracle_arc FROM PUBLIC;
GRANT EXECUTE ON FUNCTION oracle_arc.authenticate_application(UUID,TEXT) TO oracle_arc_runtime;
GRANT EXECUTE ON FUNCTION oracle_arc.consume_request_nonce(UUID,TEXT,TIMESTAMPTZ) TO oracle_arc_runtime;
GRANT EXECUTE ON FUNCTION oracle_arc.consume_app_rate_limit(UUID) TO oracle_arc_runtime;
GRANT EXECUTE ON FUNCTION oracle_arc.record_app_event(UUID,TEXT,TEXT,UUID,JSONB) TO oracle_arc_runtime;
GRANT EXECUTE ON FUNCTION oracle_arc.purge_expired_runtime_state(INTEGER) TO oracle_arc_maintenance;

COMMIT;
