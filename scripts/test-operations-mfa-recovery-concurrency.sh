#!/usr/bin/env bash
set -euo pipefail

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-unibud_test}"
export PGDATABASE="${PGDATABASE:-unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

ACCOUNT="f0270000-0000-4000-8000-000000000001"
SESSION="f0270000-0000-4000-8000-000000000011"
ASSERTION_NONCE="f0270000-0000-4000-8000-000000000032"
CONTEXT_NONCE="f0270000-0000-4000-8000-000000000031"
ISSUED="$(date +%s)"
EXPIRES="$((ISSUED + 60))"
CONTEXT_EXPIRES="$((ISSUED + 60))"
DIGEST="$(printf '%064d' 0 | tr '0' 'a')"

psql -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status) VALUES ('$ACCOUNT','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES ('$SESSION','$ACCOUNT',decode(repeat('a1',32),'hex'),
 clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');
INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by)
VALUES ('$ACCOUNT','integration_operator',ARRAY['integrations.verification_delivery.read']::text[],'$ACCOUNT');
INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES ('$ACCOUNT','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
 'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);
INSERT INTO public.unibud_operator_mfa_recovery_codes(account_id,code_digest)
VALUES ('$ACCOUNT',decode('$DIGEST','hex'));
UPDATE unibud_private.context_signing_keys SET active=false;
UPDATE unibud_private.session_context_signing_keys SET active=false;
UPDATE unibud_private.operations_mfa_assertion_signing_keys SET active=false;
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-mfa-recovery-race-account',decode(repeat('a2',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-mfa-recovery-race-session',decode(repeat('a3',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-mfa-recovery-race-assertion',decode(repeat('a4',32),'hex'));
SQL

run_attempt() {
  psql -v ON_ERROR_STOP=1 -At \
    -v account="$ACCOUNT" -v session="$SESSION" \
    -v context_nonce="$CONTEXT_NONCE" -v context_expiry="$CONTEXT_EXPIRES" \
    -v issued="$ISSUED" -v expires="$EXPIRES" \
    -v assertion_nonce="$ASSERTION_NONCE" -v digest="$DIGEST" <<'SQL'
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
   decode(repeat('a2',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('a3',32),'hex'),'sha256'),'hex'),true)
FROM claim;
SELECT pg_sleep(0.35);
SELECT public.unibud_operator_mfa_redeem_recovery_code_candidates(
 ARRAY[:'digest']::text[],:issued,:expires,:'assertion_nonce'::uuid,
 encode(public.hmac(
  convert_to('v1:'||:'account'||':'||:'session'||':recovery:'||
   :issued::text||':'||:expires::text||':'||:'assertion_nonce'||':-','UTF8'),
  decode(repeat('a4',32),'hex'),'sha256'),'hex')
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
  echo "Expected exactly one successful and one rejected concurrent recovery redemption."
  echo "--- first connection ---"
  cat "$first_output"
  echo "--- second connection ---"
  cat "$second_output"
  exit 1
fi

echo "MFA recovery concurrency invariant passed: one recovery code was redeemed once."
