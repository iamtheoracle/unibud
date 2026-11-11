#!/usr/bin/env bash
set -euo pipefail

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-unibud_test}"
export PGDATABASE="${PGDATABASE:-unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

REQUESTER="f0370000-0000-4000-8000-000000000001"
APPROVER="f0370000-0000-4000-8000-000000000002"
TARGET_A="f0370000-0000-4000-8000-000000000003"
TARGET_B="f0370000-0000-4000-8000-000000000004"
TARGET_C="f0370000-0000-4000-8000-000000000005"
REQUESTER_SESSION="f0370000-0000-4000-8000-000000000011"
APPROVER_SESSION="f0370000-0000-4000-8000-000000000012"
REQUEST_A="f0370000-0000-4000-8000-000000000021"
REQUEST_B="f0370000-0000-4000-8000-000000000022"
REQUEST_C="f0370000-0000-4000-8000-000000000023"
ISSUED="$(date +%s)"
REAUTH_EXPIRES="$((ISSUED + 120))"
CONTEXT_EXPIRES="$((ISSUED + 120))"
REQUESTER_CONTEXT_NONCE="f0370000-0000-4000-8000-000000000031"
APPROVER_CONTEXT_NONCE="f0370000-0000-4000-8000-000000000032"
REQUESTER_STEP_NONCE="f0370000-0000-4000-8000-000000000041"
APPROVER_STEP_NONCE="f0370000-0000-4000-8000-000000000042"

psql -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status) VALUES
 ('$REQUESTER','active'),('$APPROVER','active'),
 ('$TARGET_A','active'),('$TARGET_B','active'),('$TARGET_C','active');

INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('$REQUESTER_SESSION','$REQUESTER',decode(repeat('71',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('$APPROVER_SESSION','$APPROVER',decode(repeat('72',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('$REQUESTER','operations_admin',ARRAY['operations.mfa.security.request']::text[],'$REQUESTER'),
 ('$APPROVER','operations_admin',ARRAY['operations.mfa.security.approve']::text[],'$REQUESTER'),
 ('$TARGET_A','support_readonly',ARRAY['operations.accounts.support_read']::text[],'$REQUESTER'),
 ('$TARGET_B','support_readonly',ARRAY['operations.accounts.support_read']::text[],'$REQUESTER'),
 ('$TARGET_C','support_readonly',ARRAY['operations.accounts.support_read']::text[],'$REQUESTER');

INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('$REQUESTER','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('$APPROVER','v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('$TARGET_A','v1.'||repeat('G',16)||'.'||repeat('H',22)||'.'||repeat('I',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('$TARGET_B','v1.'||repeat('J',16)||'.'||repeat('K',22)||'.'||repeat('L',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('$TARGET_C','v1.'||repeat('M',16)||'.'||repeat('N',22)||'.'||repeat('O',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);

INSERT INTO public.unibud_operator_mfa_assertion_nonces(
 nonce,account_id,session_id,purpose,expires_at
) VALUES
 ('$REQUESTER_STEP_NONCE','$REQUESTER','$REQUESTER_SESSION','step_up',clock_timestamp()+interval '10 minutes'),
 ('$APPROVER_STEP_NONCE','$APPROVER','$APPROVER_SESSION','step_up',clock_timestamp()+interval '10 minutes');

INSERT INTO public.unibud_operator_mfa_step_up_sessions(session_id,account_id,verified_at,expires_at,assertion_nonce) VALUES
 ('$REQUESTER_SESSION','$REQUESTER',clock_timestamp(),clock_timestamp()+interval '10 minutes','$REQUESTER_STEP_NONCE'),
 ('$APPROVER_SESSION','$APPROVER',clock_timestamp(),clock_timestamp()+interval '10 minutes','$APPROVER_STEP_NONCE');

UPDATE unibud_private.context_signing_keys SET active=false;
UPDATE unibud_private.session_context_signing_keys SET active=false;
UPDATE unibud_private.operations_mfa_assertion_signing_keys SET active=false;
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
VALUES ('ci-dual-control-race-account',decode(repeat('71',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
VALUES ('ci-dual-control-race-session',decode(repeat('72',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
VALUES ('ci-dual-control-race-reauth',decode(repeat('73',32),'hex'));

INSERT INTO public.unibud_operator_mfa_security_requests(
 request_id,target_account_id,requested_action,requester_account_id,requester_session_id,
 reason_code,expires_at,created_at
) VALUES
 ('$REQUEST_A','$TARGET_A','reset','$REQUESTER','$REQUESTER_SESSION',
  'race_test',clock_timestamp()+interval '30 minutes',clock_timestamp()),
 ('$REQUEST_B','$TARGET_B','reset','$REQUESTER','$REQUESTER_SESSION',
  'race_test',clock_timestamp()+interval '30 minutes',clock_timestamp()),
 ('$REQUEST_C','$TARGET_C','reset','$REQUESTER','$REQUESTER_SESSION',
  'race_test',clock_timestamp()+interval '5 seconds',clock_timestamp());
SQL

run_decision() {
  local request_id="$1" decision="$2" nonce="$3"
  psql -v ON_ERROR_STOP=1 -At \
    -v account="$APPROVER" -v session="$APPROVER_SESSION" \
    -v context_nonce="$APPROVER_CONTEXT_NONCE" -v context_expiry="$CONTEXT_EXPIRES" \
    -v request_id="$request_id" -v decision="$decision" \
    -v issued="$ISSUED" -v expires="$REAUTH_EXPIRES" -v assertion_nonce="$nonce" <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_app;
WITH claim AS (
 SELECT :'account'::text a,:'session'::text s,:'context_expiry'::text e,:'context_nonce'::text n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('71',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('72',32),'hex'),'sha256'),'hex'),true)
FROM claim;
SELECT pg_sleep(0.35);
SELECT public.unibud_operator_mfa_decide_security_change(
 :'request_id'::uuid,:'decision','race_test',:issued,:expires,:'assertion_nonce'::uuid,
 encode(public.hmac(convert_to(
  'v1:'||:'account'||':'||:'session'||':password_reauth:'||
  :issued::text||':'||:expires::text||':'||:'assertion_nonce'||':-','UTF8'),
  decode(repeat('73',32),'hex'),'sha256'),'hex')
);
COMMIT;
SQL
}

run_cancel() {
  local request_id="$1"
  psql -v ON_ERROR_STOP=1 -At \
    -v account="$REQUESTER" -v session="$REQUESTER_SESSION" \
    -v context_nonce="$REQUESTER_CONTEXT_NONCE" -v context_expiry="$CONTEXT_EXPIRES" \
    -v request_id="$request_id" <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_app;
WITH claim AS (
 SELECT :'account'::text a,:'session'::text s,:'context_expiry'::text e,:'context_nonce'::text n
)
SELECT
 set_config('unibud.account_id',a,true),
 set_config('unibud.session_id',s,true),
 set_config('unibud.context_expiry',e,true),
 set_config('unibud.context_nonce',n,true),
 set_config('unibud.context_signature',
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('71',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('72',32),'hex'),'sha256'),'hex'),true)
FROM claim;
SELECT pg_sleep(0.35);
SELECT public.unibud_operator_mfa_cancel_security_change(:'request_id'::uuid,'race_cancel');
COMMIT;
SQL
}

run_expiry() {
  psql -v ON_ERROR_STOP=1 -At <<'SQL'
BEGIN;
SET LOCAL ROLE unibud_ops_owner;
SELECT unibud_private.expire_operations_mfa_security_requests(10);
COMMIT;
SQL
}

first_output="$(mktemp)"
second_output="$(mktemp)"
lock_output="$(mktemp)"
cleanup() { rm -f "$first_output" "$second_output" "$lock_output"; }
trap cleanup EXIT

# Race 1: two independent connections attempt approve and reject on one request.
run_decision "$REQUEST_A" approve f0370000-0000-4000-8000-000000000051 >"$first_output" &
first_pid=$!
run_decision "$REQUEST_A" reject f0370000-0000-4000-8000-000000000052 >"$second_output" &
second_pid=$!
wait "$first_pid"; wait "$second_pid"
wins="$(( $(grep -xc 't' "$first_output" || true) + $(grep -xc 't' "$second_output" || true) ))"
losses="$(( $(grep -xc 'f' "$first_output" || true) + $(grep -xc 'f' "$second_output" || true) ))"
[[ "$wins" -eq 1 && "$losses" -eq 1 ]] || {
 echo "Approve/reject race did not produce exactly one terminal winner."
 cat "$first_output" "$second_output"; exit 1;
}
psql -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_state text; v_events integer;
BEGIN
 SELECT state INTO v_state FROM public.unibud_operator_mfa_security_requests WHERE request_id='$REQUEST_A';
 SELECT count(*) INTO v_events FROM public.unibud_operator_mfa_events WHERE security_request_id='$REQUEST_A'
  AND event_type IN ('security_reset_approved','security_credential_disabled','security_reset_rejected');
 IF v_state NOT IN ('completed','rejected') OR v_events<>1 THEN
  RAISE EXCEPTION 'Approve/reject race left inconsistent terminal state or audit count';
 END IF;
END
\$check\$;
SQL

# Race 2: independent requester cancellation competes with approver approval.
: >"$first_output"; : >"$second_output"
run_decision "$REQUEST_B" approve f0370000-0000-4000-8000-000000000053 >"$first_output" &
first_pid=$!
run_cancel "$REQUEST_B" >"$second_output" &
second_pid=$!
wait "$first_pid"; wait "$second_pid"
wins="$(( $(grep -xc 't' "$first_output" || true) + $(grep -xc 't' "$second_output" || true) ))"
losses="$(( $(grep -xc 'f' "$first_output" || true) + $(grep -xc 'f' "$second_output" || true) ))"
[[ "$wins" -eq 1 && "$losses" -eq 1 ]] || {
 echo "Approve/cancel race did not produce exactly one terminal winner."
 cat "$first_output" "$second_output"; exit 1;
}
psql -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_state text; v_events integer;
BEGIN
 SELECT state INTO v_state FROM public.unibud_operator_mfa_security_requests WHERE request_id='$REQUEST_B';
 SELECT count(*) INTO v_events FROM public.unibud_operator_mfa_events WHERE security_request_id='$REQUEST_B'
  AND event_type IN ('security_reset_approved','security_credential_disabled','security_reset_cancelled');
 IF v_state NOT IN ('completed','cancelled') OR v_events<>1 THEN
  RAISE EXCEPTION 'Approve/cancel race left inconsistent terminal state or audit count';
 END IF;
END
\$check\$;
SQL

# Race 3: approval begins before expiry but waits on a row lock until after expiry.
# The post-lock wall-clock check must reject approval; the bounded expiry worker
# must skip the locked row and expire it on the next pass.
psql -v ON_ERROR_STOP=1 -At >"$lock_output" <<SQL &
BEGIN;
SELECT request_id FROM public.unibud_operator_mfa_security_requests
 WHERE request_id='$REQUEST_C' FOR UPDATE;
\\echo LOCKED
SELECT pg_sleep(8);
COMMIT;
SQL
lock_pid=$!
for _ in $(seq 1 100); do
  grep -q '^LOCKED$' "$lock_output" && break
  sleep 0.05
done
grep -q '^LOCKED$' "$lock_output" || { echo "Could not acquire expiry-race row lock"; exit 1; }

run_decision "$REQUEST_C" approve f0370000-0000-4000-8000-000000000054 >"$first_output" &
decision_pid=$!
sleep 6
skipped="$(run_expiry | tail -n 1 | tr -d '[:space:]')"
[[ "$skipped" == "0" ]] || { echo "Expiry worker did not safely skip the locked request (returned $skipped)"; exit 1; }
wait "$lock_pid"
wait "$decision_pid"
if ! grep -qx 'f' "$first_output"; then
 echo "Approval succeeded after the request expiry deadline."
 cat "$first_output"; exit 1;
fi
expired="$(run_expiry | tail -n 1 | tr -d '[:space:]')"
[[ "$expired" == "1" ]] || { echo "Expiry worker did not expire the unlocked due request (returned $expired)"; exit 1; }

psql -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_state text; v_events integer;
BEGIN
 SELECT state INTO v_state FROM public.unibud_operator_mfa_security_requests WHERE request_id='$REQUEST_C';
 SELECT count(*) INTO v_events FROM public.unibud_operator_mfa_events
  WHERE security_request_id='$REQUEST_C' AND event_type='security_reset_expired'
    AND actor_account_id IS NULL AND session_id IS NULL;
 IF v_state<>'expired' OR v_events<>1 THEN
  RAISE EXCEPTION 'Expiry race did not leave one system-attributed terminal audit';
 END IF;
END
\$check\$;
SQL

echo "PASS: dual-control approve/reject, approve/cancel and approval/expiry races used independent PostgreSQL connections; exactly one terminal transition and audit event won each race."
