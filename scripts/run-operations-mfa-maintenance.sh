#!/usr/bin/env bash
set -euo pipefail

# This script is intended for a separately configured trusted scheduler.
# It never provisions credentials, creates grants, or configures a schedule.
: "${DATABASE_URL:?DATABASE_URL must be supplied by the trusted runtime secret manager}"

BATCH_SIZE="${BATCH_SIZE:-200}"
if [[ ! "$BATCH_SIZE" =~ ^[0-9]+$ ]] || (( BATCH_SIZE < 1 || BATCH_SIZE > 1000 )); then
  echo "BATCH_SIZE must be an integer between 1 and 1000." >&2
  exit 2
fi

for dependency in psql python3; do
  if ! command -v "$dependency" >/dev/null 2>&1; then
    echo "$dependency is required by the Operations maintenance worker." >&2
    exit 127
  fi
done

# Require certificate-verified TLS by default. Local disposable CI may opt out
# explicitly; production schedulers must not set that test-only override.
PGSSLMODE="${PGSSLMODE:-verify-full}"
if [[ "$PGSSLMODE" != "verify-full" && "${UNIBUD_ALLOW_INSECURE_LOCAL_TEST:-false}" != "true" ]]; then
  echo "PGSSLMODE must be verify-full outside an explicitly marked local test." >&2
  exit 2
fi

# Parse the secret URI into libpq environment variables. The URI is read from
# the process environment, never passed as a command-line argument or written
# to disk. Only the standard PostgreSQL URI fields and sslmode are accepted.
mapfile -d '' -t _PG_CONNECTION < <(python3 - <<'PY'
import os
import sys
from urllib.parse import parse_qs, unquote, urlsplit

raw = os.environ.get("DATABASE_URL", "")
try:
    parsed = urlsplit(raw)
    if parsed.scheme not in ("postgres", "postgresql"):
        raise ValueError("DATABASE_URL must use postgres:// or postgresql://")
    if not parsed.hostname or not parsed.path or parsed.path == "/":
        raise ValueError("DATABASE_URL must include a host and database name")
    query = parse_qs(parsed.query, keep_blank_values=True)
    if set(query) - {"sslmode"} or any(len(v) != 1 for v in query.values()):
        raise ValueError("DATABASE_URL supports only one optional sslmode parameter")
    values = [
        parsed.hostname,
        str(parsed.port or 5432),
        unquote(parsed.username or ""),
        unquote(parsed.password or ""),
        unquote(parsed.path[1:]),
        query.get("sslmode", [""])[0],
    ]
    for value in values:
        sys.stdout.buffer.write(value.encode() + b"\0")
except Exception as exc:
    print(f"Invalid DATABASE_URL: {exc}", file=sys.stderr)
    sys.exit(2)
PY
)
if (( ${#_PG_CONNECTION[@]} != 6 )); then
  echo "Could not safely parse DATABASE_URL." >&2
  exit 2
fi

_PG_URI_SSLMODE="${_PG_CONNECTION[5]}"
if [[ -n "$_PG_URI_SSLMODE" && "$_PG_URI_SSLMODE" != "$PGSSLMODE" ]]; then
  echo "DATABASE_URL sslmode conflicts with the required PGSSLMODE." >&2
  exit 2
fi

export PGHOST="${_PG_CONNECTION[0]}"
export PGPORT="${_PG_CONNECTION[1]}"
export PGUSER="${_PG_CONNECTION[2]}"
export PGPASSWORD="${_PG_CONNECTION[3]}"
export PGDATABASE="${_PG_CONNECTION[4]}"
export PGSSLMODE
export PGAPPNAME="unibud-operations-mfa-maintenance"
unset DATABASE_URL _PG_CONNECTION _PG_URI_SSLMODE

# Do not enable shell tracing: connection credentials are held in environment
# variables for libpq and are not exposed as psql command-line arguments.
psql \
  --no-psqlrc \
  --no-password \
  --set=ON_ERROR_STOP=1 \
  --set=batch_size="$BATCH_SIZE" \
  --quiet \
  --tuples-only \
  --no-align <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_ops_scheduler;
SET LOCAL statement_timeout='30s';
SET LOCAL lock_timeout='3s';
SET LOCAL idle_in_transaction_session_timeout='10s';
SET LOCAL application_name='unibud-operations-mfa-maintenance';

SELECT format(
  'operations_mfa_maintenance status=success expired_requests=%s expired_step_up_sessions=%s expired_assertion_nonces=%s stale_rate_limit_buckets=%s',
  expired_requests,
  expired_step_up_sessions,
  expired_assertion_nonces,
  stale_rate_limit_buckets
)
FROM unibud_private.maintain_operations_mfa_ephemeral_state(:'batch_size'::integer);

COMMIT;
SQL
