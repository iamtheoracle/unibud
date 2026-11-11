#!/usr/bin/env bash
set -euo pipefail

: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGUSER:=unibud_test}"
: "${PGDATABASE:=unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

ACCOUNT="f0250000-0000-4000-8000-000000000001"
SESSION="f0250000-0000-4000-8000-000000000011"
ASSERTION_NONCE="f0250000-0000-4000-8000-000000000031"
CONTEXT_NONCE="f0250000-0000-4000-8000-000000000021"
ISSUED="$(date +%s)"
EXPIRES="$((ISSUED + 60))"
CONTEXT_EXPIRES="$((ISSUED + 60))"
STEP=1001

psql -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status)
VALUES ('$ACCOUNT','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 '$SESSION','$ACCOUNT',decode(repeat('61',32),'hex'),
 clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES (
 '$ACCOUNT','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000
);
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-mfa-concurrency-account',decode(repeat('51',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-mfa-concurrency-session',decode(repeat('52',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-mfa-concurrency-assertion',decode(repeat('53',32),'hex'));
SQL

run_attempt() {
  psql -v ON_ERROR_STOP=1 -At \
    -v account="$ACCOUNT" \
    -v session="$SESSION" \
    -v context_nonce="$CONTEXT_NONCE" \
    -v context_expiry="$CONTEXT_EXPIRES" \
    -v issued="$ISSUED" \
    -v expires="$EXPIRES" \
    -v assertion_nonce="$ASSERTION_NONCE" \
    -v step="$STEP" <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_app;
WITH claim AS (
 SELECT :'account'::text AS a, :'session'::text AS s,
        :'context_expiry'::text AS e, :'context_nonce'::text AS n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),
   decode(repeat('51',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('52',32),'hex'),'sha256'),'hex'),true)
FROM claim;
SELECT pg_sleep(0.35);
SELECT public.unibud_operator_mfa_consume_step_up(
 :issued,:expires,:'assertion_nonce'::uuid,:step,
 encode(public.hmac(
  convert_to('v1:'||:'account'||':'||:'session'||':step_up:'||
   :issued::text||':'||:expires::text||':'||:'assertion_nonce'||':'||:step::text,'UTF8'),
  decode(repeat('53',32),'hex'),'sha256'),'hex')
);
COMMIT;
SQL
}

first_output="$(mktemp)"
second_output="$(mktemp)"
cleanup() { rm -f "$first_output" "$second_output"; }
trap cleanup EXIT

run_attempt >"$first_output" &
first_pid=$!
run_attempt >"$second_output" &
second_pid=$!
wait "$first_pid"
wait "$second_pid"

accepted_count="$(( $(grep -xc 't' "$first_output" || true) + $(grep -xc 't' "$second_output" || true) ))"
rejected_count="$(( $(grep -xc 'f' "$first_output" || true) + $(grep -xc 'f' "$second_output" || true) ))"

if [[ "$accepted_count" -ne 1 || "$rejected_count" -ne 1 ]]; then
  echo "Expected exactly one successful and one rejected concurrent MFA assertion."
  echo "--- first connection ---"
  cat "$first_output"
  echo "--- second connection ---"
  cat "$second_output"
  exit 1
fi

echo "MFA concurrency invariant passed: one exact-session TOTP assertion was consumed once."
