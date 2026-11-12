#!/usr/bin/env bash
set -euo pipefail

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-unibud_test}"
export PGDATABASE="${PGDATABASE:-unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

ACCOUNT="f0500000-0000-4000-8000-000000000001"
SESSION="f0500000-0000-4000-8000-000000000011"
FLOW_ACCOUNT="f0500000-0000-4000-8000-000000000021"
NONCE_A="f0500000-0000-4000-8000-000000000031"
NONCE_B="f0500000-0000-4000-8000-000000000032"
EXPIRES="$(( $(date +%s) + 120 ))"
IDEMPOTENCY_DIGEST=""

psql -q -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status) VALUES ('$ACCOUNT','active');
INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES (
 '$SESSION','$ACCOUNT',decode(repeat('91',32),'hex'),
 clock_timestamp()-interval '1 minute',clock_timestamp(),
 clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'
);
INSERT INTO public.flow_customer_accounts(
 flow_account_id,account_id,moneylead_customer_ref_ciphertext,moneylead_customer_ref_digest,
 moneylead_account_ref_ciphertext,moneylead_account_ref_digest,status
) VALUES (
 '$FLOW_ACCOUNT','$ACCOUNT',decode('01','hex'),digest('moneylead-customer-50','sha256'),
 decode('02','hex'),digest('moneylead-account-50','sha256'),'active'
);
UPDATE unibud_private.context_signing_keys SET active=false WHERE active;
UPDATE unibud_private.session_context_signing_keys SET active=false WHERE active;
INSERT INTO unibud_private.context_signing_keys(key_id,secret,active)
VALUES('flow-idempotency-race-account',decode(repeat('91',32),'hex'),true);
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret,active)
VALUES('flow-idempotency-race-session',decode(repeat('92',32),'hex'),true);
SQL

run_create() {
  local nonce="$1"
  psql -q -At -v ON_ERROR_STOP=1 \
    -v account="$ACCOUNT" -v session="$SESSION" \
    -v flow_account="$FLOW_ACCOUNT" -v context_nonce="$nonce" \
    -v context_expiry="$EXPIRES" <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_app;
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
   decode(repeat('91',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('92',32),'hex'),'sha256'),'hex'),true)
FROM claim \gset
SELECT pg_sleep(0.35);
SELECT public.flow_create_payment_intent(
 :'flow_account'::uuid,
 digest('flow-idempotency-concurrency-key','sha256'),
 decode(repeat('aa',32),'hex'),
 digest('flow-recipient-concurrency','sha256'),
 500.00,'NGN',5.00,'member_transfer'
);
COMMIT;
SQL
}

first_output="$(mktemp)"
second_output="$(mktemp)"
cleanup() { rm -f "$first_output" "$second_output"; }
trap cleanup EXIT

run_create "$NONCE_A" >"$first_output" &
first_pid=$!
run_create "$NONCE_B" >"$second_output" &
second_pid=$!
wait "$first_pid"
wait "$second_pid"

first_id="$(grep -Eo '^[0-9a-f-]{36}$' "$first_output" | tail -n 1 || true)"
second_id="$(grep -Eo '^[0-9a-f-]{36}$' "$second_output" | tail -n 1 || true)"
if [[ -z "$first_id" || -z "$second_id" || "$first_id" != "$second_id" ]]; then
  echo "Concurrent idempotent Flow submissions did not return one shared payment intent."
  echo "--- first connection ---"; cat "$first_output"
  echo "--- second connection ---"; cat "$second_output"
  exit 1
fi

psql -q -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_count integer;
BEGIN
 SELECT count(*) INTO v_count FROM public.flow_payment_intents
  WHERE account_id='$ACCOUNT'
    AND idempotency_key_digest=digest('flow-idempotency-concurrency-key','sha256');
 IF v_count<>1 THEN
  RAISE EXCEPTION 'Expected one persisted intent after concurrent duplicate submissions; found %',v_count;
 END IF;
END
\$check\$;
SQL

echo "Flow idempotency concurrency invariant passed: two sessions created one payment intent."
