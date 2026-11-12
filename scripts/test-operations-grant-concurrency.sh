#!/usr/bin/env bash
set -euo pipefail

export PGHOST="${PGHOST:-localhost}"
export PGPORT="${PGPORT:-5432}"
export PGUSER="${PGUSER:-unibud_test}"
export PGDATABASE="${PGDATABASE:-unibud_test}"
: "${PGPASSWORD:?PGPASSWORD must be set for the disposable PostgreSQL test database}"

REQUESTER="f0480000-0000-4000-8000-000000000001"
APPROVER="f0480000-0000-4000-8000-000000000002"
TARGET_A="f0480000-0000-4000-8000-000000000003"
TARGET_B="f0480000-0000-4000-8000-000000000004"
TARGET_C="f0480000-0000-4000-8000-000000000005"
TARGET_D="f0480000-0000-4000-8000-000000000006"
REQUESTER_SESSION="f0480000-0000-4000-8000-000000000011"
APPROVER_SESSION="f0480000-0000-4000-8000-000000000012"
REQUEST_A="f0480000-0000-4000-8000-000000000021"
REQUEST_B="f0480000-0000-4000-8000-000000000022"
REQUEST_C="f0480000-0000-4000-8000-000000000023"
REQUEST_D="f0480000-0000-4000-8000-000000000024"
ISSUED="$(date +%s)"
REAUTH_EXPIRES="$((ISSUED + 120))"
CONTEXT_EXPIRES="$((ISSUED + 120))"
REQUESTER_CONTEXT_NONCE="f0480000-0000-4000-8000-000000000031"
APPROVER_CONTEXT_NONCE="f0480000-0000-4000-8000-000000000032"
REQUESTER_STEP_NONCE="f0480000-0000-4000-8000-000000000041"
APPROVER_STEP_NONCE="f0480000-0000-4000-8000-000000000042"

psql -q -v ON_ERROR_STOP=1 <<SQL
INSERT INTO public.accounts(id,status) VALUES
 ('$REQUESTER','active'),('$APPROVER','active'),
 ('$TARGET_A','active'),('$TARGET_B','active'),
 ('$TARGET_C','active'),('$TARGET_D','active');

INSERT INTO public.account_sessions(
 id,account_id,credential_digest,issued_at,last_seen_at,idle_expires_at,absolute_expires_at
) VALUES
 ('$REQUESTER_SESSION','$REQUESTER',decode(repeat('48',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day'),
 ('$APPROVER_SESSION','$APPROVER',decode(repeat('49',32),'hex'),
  clock_timestamp()-interval '1 minute',clock_timestamp(),
  clock_timestamp()+interval '1 hour',clock_timestamp()+interval '1 day');

INSERT INTO public.unibud_operator_grants(account_id,operator_role,permissions,granted_by) VALUES
 ('$REQUESTER','platform_admin',ARRAY['operations.grants.request']::text[],'$REQUESTER'),
 ('$APPROVER','platform_admin',ARRAY['operations.grants.approve']::text[],'$REQUESTER');

INSERT INTO public.unibud_operator_mfa_credentials(
 account_id,encrypted_totp_secret,state,enrollment_expires_at,confirmed_at,last_accepted_totp_step
) VALUES
 ('$REQUESTER','v1.'||repeat('A',16)||'.'||repeat('B',22)||'.'||repeat('C',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000),
 ('$APPROVER','v1.'||repeat('D',16)||'.'||repeat('E',22)||'.'||repeat('F',27),
  'active',clock_timestamp()+interval '1 day',clock_timestamp(),1000);

INSERT INTO public.unibud_operator_mfa_assertion_nonces(nonce,account_id,session_id,purpose,expires_at) VALUES
 ('$REQUESTER_STEP_NONCE','$REQUESTER','$REQUESTER_SESSION','step_up',clock_timestamp()+interval '30 minutes'),
 ('$APPROVER_STEP_NONCE','$APPROVER','$APPROVER_SESSION','step_up',clock_timestamp()+interval '30 minutes');

INSERT INTO public.unibud_operator_mfa_step_up_sessions(
 session_id,account_id,verified_at,expires_at,assertion_nonce
) VALUES
 ('$REQUESTER_SESSION','$REQUESTER',clock_timestamp(),clock_timestamp()+interval '30 minutes','$REQUESTER_STEP_NONCE'),
 ('$APPROVER_SESSION','$APPROVER',clock_timestamp(),clock_timestamp()+interval '30 minutes','$APPROVER_STEP_NONCE');

UPDATE unibud_private.context_signing_keys SET active=false;
UPDATE unibud_private.session_context_signing_keys SET active=false;
UPDATE unibud_private.operations_mfa_assertion_signing_keys SET active=false;
INSERT INTO unibud_private.context_signing_keys(key_id,secret)
 VALUES ('ci-grant-race-account',decode(repeat('81',32),'hex'));
INSERT INTO unibud_private.session_context_signing_keys(key_id,secret)
 VALUES ('ci-grant-race-session',decode(repeat('82',32),'hex'));
INSERT INTO unibud_private.operations_mfa_assertion_signing_keys(key_id,secret)
 VALUES ('ci-grant-race-reauth',decode(repeat('83',32),'hex'));

INSERT INTO public.unibud_operator_grant_requests(
 request_id,requested_action,target_account_id,requested_role,requested_permissions,
 requested_expires_at,state,requester_account_id,requester_session_id,reason_code,
 created_at,expires_at
) VALUES
 ('$REQUEST_A','grant','$TARGET_A','support_readonly',ARRAY['operations.audit.read']::text[],
  clock_timestamp()+interval '30 days','pending','$REQUESTER','$REQUESTER_SESSION','race_test',
  clock_timestamp(),clock_timestamp()+interval '30 minutes'),
 ('$REQUEST_B','grant','$TARGET_B','support_readonly',ARRAY['operations.audit.read']::text[],
  clock_timestamp()+interval '30 days','pending','$REQUESTER','$REQUESTER_SESSION','race_test',
  clock_timestamp(),clock_timestamp()+interval '30 minutes'),
 ('$REQUEST_C','grant','$TARGET_C','support_readonly',ARRAY['operations.audit.read']::text[],
  clock_timestamp()+interval '30 days','pending','$REQUESTER','$REQUESTER_SESSION','race_test',
  clock_timestamp(),clock_timestamp()+interval '5 seconds'),
 ('$REQUEST_D','grant','$TARGET_D','support_readonly',ARRAY['operations.audit.read']::text[],
  clock_timestamp()+interval '30 days','pending','$REQUESTER','$REQUESTER_SESSION','race_test',
  clock_timestamp(),clock_timestamp()+interval '30 minutes');
SQL

run_decision() {
  local request_id="$1" decision="$2" nonce="$3"
  psql -q -v ON_ERROR_STOP=1 -At \
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
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('81',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('82',32),'hex'),'sha256'),'hex'),true)
FROM claim;
SELECT pg_sleep(0.35);
SELECT public.unibud_operator_decide_grant_change(
 :'request_id'::uuid,:'decision','race_test',:issued,:expires,:'assertion_nonce'::uuid,
 encode(public.hmac(convert_to(
  'v1:'||:'account'||':'||:'session'||':password_reauth:'||
  :issued::text||':'||:expires::text||':'||:'assertion_nonce'||':-','UTF8'),
  decode(repeat('83',32),'hex'),'sha256'),'hex')
);
COMMIT;
SQL
}

run_cancel() {
  local request_id="$1" nonce="$2"
  psql -q -v ON_ERROR_STOP=1 -At \
    -v account="$REQUESTER" -v session="$REQUESTER_SESSION" \
    -v context_nonce="$REQUESTER_CONTEXT_NONCE" -v context_expiry="$CONTEXT_EXPIRES" \
    -v request_id="$request_id" -v issued="$ISSUED" -v expires="$REAUTH_EXPIRES" \
    -v assertion_nonce="$nonce" <<'SQL'
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
  encode(public.hmac(convert_to(a||':'||e||':'||n,'UTF8'),decode(repeat('81',32),'hex'),'sha256'),'hex'),true),
 set_config('unibud.session_context_signature',
  encode(public.hmac(convert_to('v1:'||a||':'||s||':'||e||':'||n,'UTF8'),
   decode(repeat('82',32),'hex'),'sha256'),'hex'),true)
FROM claim;
SELECT pg_sleep(0.35);
SELECT public.unibud_operator_cancel_grant_change(
 :'request_id'::uuid,'race_cancel',:issued,:expires,:'assertion_nonce'::uuid,
 encode(public.hmac(convert_to(
  'v1:'||:'account'||':'||:'session'||':password_reauth:'||
  :issued::text||':'||:expires::text||':'||:'assertion_nonce'||':-','UTF8'),
  decode(repeat('83',32),'hex'),'sha256'),'hex')
);
COMMIT;
SQL
}

run_expiry() {
  psql -q -v ON_ERROR_STOP=1 -At -c "
    BEGIN;
    SET LOCAL ROLE unibud_ops_owner;
    SELECT expired_requests FROM unibud_private.maintain_operations_mfa_ephemeral_state(10);
    COMMIT;"
}

first_output="$(mktemp)"
second_output="$(mktemp)"
lock_output="$(mktemp)"
cleanup() { rm -f "$first_output" "$second_output" "$lock_output"; }
trap cleanup EXIT

# Race 1: two independent connections compete to approve and reject one request.
run_decision "$REQUEST_A" approve f0480000-0000-4000-8000-000000000051 >"$first_output" &
first_pid=$!
run_decision "$REQUEST_A" reject f0480000-0000-4000-8000-000000000052 >"$second_output" &
second_pid=$!
wait "$first_pid"; wait "$second_pid"
wins="$(( $(grep -xc 't' "$first_output" || true) + $(grep -xc 't' "$second_output" || true) ))"
losses="$(( $(grep -xc 'f' "$first_output" || true) + $(grep -xc 'f' "$second_output" || true) ))"
[[ "$wins" -eq 1 && "$losses" -eq 1 ]] || {
 echo "Grant approve/reject race did not produce exactly one terminal winner."
 cat "$first_output" "$second_output"; exit 1;
}
psql -q -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_state text; v_events integer; v_grants integer;
BEGIN
 SELECT state INTO v_state FROM public.unibud_operator_grant_requests WHERE request_id='$REQUEST_A';
 SELECT count(*) INTO v_events FROM public.unibud_operator_audit_events
  WHERE request_id='$REQUEST_A' AND permission='operations.grants.approve' AND outcome='allowed';
 SELECT count(*) INTO v_grants FROM public.unibud_operator_grants
  WHERE account_id='$TARGET_A' AND revoked_at IS NULL;
 IF v_state NOT IN ('approved','rejected') OR v_events<>1
    OR v_grants<>(CASE WHEN v_state='approved' THEN 1 ELSE 0 END) THEN
  RAISE EXCEPTION 'Grant approve/reject race left inconsistent state, grant or audit count';
 END IF;
END
\$check\$;
SQL

# Race 2: requester cancellation competes with an independent approver decision.
: >"$first_output"; : >"$second_output"
run_decision "$REQUEST_B" approve f0480000-0000-4000-8000-000000000053 >"$first_output" &
first_pid=$!
run_cancel "$REQUEST_B" f0480000-0000-4000-8000-000000000054 >"$second_output" &
second_pid=$!
wait "$first_pid"; wait "$second_pid"
wins="$(( $(grep -xc 't' "$first_output" || true) + $(grep -xc 't' "$second_output" || true) ))"
losses="$(( $(grep -xc 'f' "$first_output" || true) + $(grep -xc 'f' "$second_output" || true) ))"
[[ "$wins" -eq 1 && "$losses" -eq 1 ]] || {
 echo "Grant approve/cancel race did not produce exactly one terminal winner."
 cat "$first_output" "$second_output"; exit 1;
}
psql -q -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_state text; v_events integer; v_grants integer;
BEGIN
 SELECT state INTO v_state FROM public.unibud_operator_grant_requests WHERE request_id='$REQUEST_B';
 SELECT count(*) INTO v_events FROM public.unibud_operator_audit_events
  WHERE request_id='$REQUEST_B' AND outcome='allowed'
    AND permission IN ('operations.grants.approve','operations.grants.request');
 SELECT count(*) INTO v_grants FROM public.unibud_operator_grants
  WHERE account_id='$TARGET_B' AND revoked_at IS NULL;
 IF v_state NOT IN ('approved','cancelled') OR v_events<>1
    OR v_grants<>(CASE WHEN v_state='approved' THEN 1 ELSE 0 END) THEN
  RAISE EXCEPTION 'Grant approve/cancel race left inconsistent state, grant or audit count';
 END IF;
END
\$check\$;
SQL

# Race 3: cancellation passes its initial checks, waits on the request row, and
# must fail when the exact-session MFA step-up expires before lock acquisition.
psql -q -v ON_ERROR_STOP=1 -c "
 UPDATE public.unibud_operator_mfa_step_up_sessions
 SET expires_at=clock_timestamp()+interval '4 seconds'
 WHERE account_id='$REQUESTER' AND session_id='$REQUESTER_SESSION';"
psql -q -v ON_ERROR_STOP=1 -At >"$lock_output" <<SQL &
BEGIN;
SELECT request_id FROM public.unibud_operator_grant_requests
 WHERE request_id='$REQUEST_D' FOR UPDATE;
\\echo LOCKED
SELECT pg_sleep(7);
COMMIT;
SQL
lock_pid=$!
for _ in $(seq 1 100); do
 grep -q '^LOCKED$' "$lock_output" && break
 sleep 0.05
done
grep -q '^LOCKED$' "$lock_output" || { echo "Could not acquire grant cancellation row lock"; exit 1; }
run_cancel "$REQUEST_D" f0480000-0000-4000-8000-000000000055 >"$first_output" &
cancel_pid=$!
sleep 5
wait "$lock_pid"
wait "$cancel_pid"
if ! grep -qx 'f' "$first_output"; then
 echo "Grant cancellation succeeded after its exact-session MFA step-up expired."
 cat "$first_output"; exit 1;
fi
psql -q -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.unibud_operator_grant_requests
   WHERE request_id='$REQUEST_D' AND state='pending') THEN
  RAISE EXCEPTION 'Expired-step-up cancellation changed the pending request';
 END IF;
END
\$check\$;
SQL

# Race 4: approval waits past request expiry; the bounded worker must skip the
# locked row, then expire and audit it after the lock is released.
psql -q -v ON_ERROR_STOP=1 -At >"$lock_output" <<SQL &
BEGIN;
SELECT request_id FROM public.unibud_operator_grant_requests
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
grep -q '^LOCKED$' "$lock_output" || { echo "Could not acquire grant expiry row lock"; exit 1; }
run_decision "$REQUEST_C" approve f0480000-0000-4000-8000-000000000056 >"$first_output" &
decision_pid=$!
sleep 6
skipped="$(run_expiry | tail -n 1 | tr -d '[:space:]')"
[[ "$skipped" == "0" ]] || { echo "Grant expiry worker did not skip the locked request (returned $skipped)"; exit 1; }
wait "$lock_pid"
wait "$decision_pid"
if ! grep -qx 'f' "$first_output"; then
 echo "Grant approval succeeded after the request expiry deadline."
 cat "$first_output"; exit 1;
fi
expired="$(run_expiry | tail -n 1 | tr -d '[:space:]')"
[[ "$expired" == "1" ]] || { echo "Grant expiry worker did not expire the unlocked due request (returned $expired)"; exit 1; }

psql -q -v ON_ERROR_STOP=1 <<SQL
DO \$check\$
DECLARE v_state text; v_events integer; v_grants integer; v_notifications integer;
BEGIN
 SELECT state INTO v_state FROM public.unibud_operator_grant_requests WHERE request_id='$REQUEST_C';
 SELECT count(*) INTO v_events FROM public.unibud_operator_audit_events
  WHERE request_id='$REQUEST_C' AND permission='operations.grants.expire'
    AND outcome='allowed' AND actor_account_id IS NULL AND session_id IS NULL;
 SELECT count(*) INTO v_grants FROM public.unibud_operator_grants
  WHERE account_id='$TARGET_C' AND revoked_at IS NULL;
 SELECT count(*) INTO v_notifications FROM public.unibud_operator_grant_notifications
  WHERE request_id='$REQUEST_C' AND event_type='request_expired'
    AND account_id IN ('$REQUESTER','$TARGET_C');
 IF v_state<>'expired' OR v_events<>1 OR v_grants<>0 OR v_notifications<>2 THEN
  RAISE EXCEPTION 'Grant expiry race left inconsistent state, grant, system audit or requester/target notification count';
 END IF;
END
\$check\$;
SQL

echo "PASS: grant approve/reject, approve/cancel, cancellation/MFA-step-up-expiry and approval/bounded-expiry races used independent PostgreSQL connections; exactly one terminal transition and audit event won each race."
