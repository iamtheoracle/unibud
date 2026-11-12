#!/usr/bin/env bash
set -euo pipefail

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-unibud_test}"
export PGDATABASE="${PGDATABASE:-unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

ACCOUNT="f0580000-0000-4000-8000-000000000001"
KEY_HEX="$(printf '95%.0s' {1..32})"
EXPIRES="$(( $(date +%s) + 120 ))"

psql -q -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status) VALUES ('$ACCOUNT','active');
UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES ('search-rate-race-context',decode('$KEY_HEX','hex'),true);
SQL

run_consume() {
  local function_name="$1"
  local nonce="$2"
  case "$function_name" in
    search) function_sql="public.search_consume_rate_limit()" ;;
    block) function_sql="public.account_block_consume_rate_limit()" ;;
    *) echo "Unsupported rate-limit function" >&2; return 2 ;;
  esac

  psql -q -At -v ON_ERROR_STOP=1 \
    -v account="$ACCOUNT" -v context_nonce="$nonce" -v context_expiry="$EXPIRES" \
    -v key_hex="$KEY_HEX" -v function_sql="$function_sql" <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_app;
WITH claim AS (
  SELECT :'account'::text AS account_id,
         :'context_expiry'::text AS expiry,
         :'context_nonce'::text AS nonce,
         decode(:'key_hex','hex') AS signing_key
)
SELECT
  set_config('unibud.account_id',account_id,true),
  set_config('unibud.context_expiry',expiry,true),
  set_config('unibud.context_nonce',nonce,true),
  set_config('unibud.context_signature',
    encode(public.hmac(convert_to(account_id || ':' || expiry || ':' || nonce,'UTF8'),
      signing_key,'sha256'),'hex'),true)
FROM claim \gset
SELECT :function_sql;
COMMIT;
SQL
}

run_race() {
  local action="$1"
  local attempts="$2"
  local expected_allowed="$3"
  local expected_denied="$4"
  local tmpdir
  tmpdir="$(mktemp -d)"
  local pids=()

  for i in $(seq 1 "$attempts"); do
    local nonce
    nonce="$(printf 'f0580000-0000-4000-8000-%012x' "$i")"
    run_consume "$action" "$nonce" >"$tmpdir/$i.out" &
    pids+=("$!")
  done
  local failed=0
  for pid in "${pids[@]}"; do
    wait "$pid" || failed=1
  done

  local allowed_count denied_count
  allowed_count="$(grep -hxc 't' "$tmpdir"/*.out | awk '{sum += $1} END {print sum+0}')"
  denied_count="$(grep -hxc 'f' "$tmpdir"/*.out | awk '{sum += $1} END {print sum+0}')"
  if [[ "$failed" -ne 0 || "$allowed_count" -ne "$expected_allowed" || "$denied_count" -ne "$expected_denied" ]]; then
    echo "Unexpected concurrent $action rate-limit result."
    echo "Expected allowed=$expected_allowed denied=$expected_denied; got allowed=$allowed_count denied=$denied_count"
    for output in "$tmpdir"/*.out; do echo "--- $output ---"; cat "$output"; done
    rm -rf "$tmpdir"
    exit 1
  fi
  rm -rf "$tmpdir"
  echo "Concurrent $action rate-limit invariant passed: $attempts sessions, $allowed_count allowed, $denied_count denied."
}

run_race search 64 60 4
run_race block 12 10 2
