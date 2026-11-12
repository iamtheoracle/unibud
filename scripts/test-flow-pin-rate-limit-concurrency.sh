#!/usr/bin/env bash
set -euo pipefail

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-unibud_test}"
export PGDATABASE="${PGDATABASE:-unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

ACCOUNT="f0520000-0000-4000-8000-000000000001"
SESSION="f0520000-0000-4000-8000-000000000011"
EXPIRES="$(( $(date +%s) + 120 ))"

psql -q -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status) VALUES ('$ACCOUNT','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 '$SESSION','$ACCOUNT',decode(repeat('93',32),'hex'),
 clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);
INSERT INTO public.flow_transaction_credentials(account_id,pin_hash_phc)
VALUES('$ACCOUNT',chr(36)||'argon2id'||chr(36)||'v=19'||chr(36)||'m=65536,t=3,p=1'||chr(36)||'c2FsdA'||chr(36)||'dmVyaWZpZXI=');

UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-pin-race-account',decode(repeat('93',32),'hex'),true);
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-pin-race-session',decode(repeat('94',32),'hex'),true);
SQL

run_verify() {
  local nonce="$1"
  psql -q -At -v ON_ERROR_STOP=1 \
    -v account="$ACCOUNT" -v session="$SESSION" \
    -v context_nonce="$nonce" -v context_expiry="$EXPIRES" <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_flow_auth;
WITH claim AS (
 SELECT :'account'::text a,:'session'::text s,
        :'context_expiry'::text e,:'context_nonce'::text n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
   decode(repeat('93',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('94',32),'hex'),'sha256'),'hex'),true)
FROM claim \gset
SELECT allowed FROM public.flow_pin_begin_verification();
COMMIT;
SQL
}

tmpdir="$(mktemp -d)"
cleanup() { rm -rf "$tmpdir"; }
trap cleanup EXIT

pids=()
for i in $(seq 1 10); do
  nonce="$(printf 'f0520000-0000-4000-8000-%012x' "$i")"
  run_verify "$nonce" >"$tmpdir/$i.out" &
  pids+=("$!")
done
for pid in "${pids[@]}"; do wait "$pid"; done

allowed_count="$(grep -hxc 't' "$tmpdir"/*.out | awk '{sum += $1} END {print sum+0}')"
denied_count="$(grep -hxc 'f' "$tmpdir"/*.out | awk '{sum += $1} END {print sum+0}')"
if [[ "$allowed_count" -ne 5 || "$denied_count" -ne 5 ]]; then
  echo "Expected exactly five concurrent PIN verification attempts to be allowed and five denied."
  echo "Allowed: $allowed_count; denied: $denied_count"
  for output in "$tmpdir"/*.out; do echo "--- $output ---"; cat "$output"; done
  exit 1
fi

echo "Flow PIN rate-limit concurrency invariant passed: 10 concurrent database sessions yielded exactly 5 allowed attempts."
