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

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required by the Operations maintenance worker." >&2
  exit 127
fi

# Do not enable shell tracing: DATABASE_URL may contain authentication material.
export PGAPPNAME="unibud-operations-mfa-maintenance"

psql "$DATABASE_URL" \
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
