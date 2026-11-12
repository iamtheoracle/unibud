#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKER="$ROOT/scripts/run-operations-mfa-maintenance.sh"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT
FAKE_BIN="$TEMP_DIR/bin"
mkdir -p "$FAKE_BIN"

cat >"$FAKE_BIN/psql" <<'PSQL'
#!/usr/bin/env bash
set -euo pipefail
[[ -z "${DATABASE_URL+x}" ]] || { echo "DATABASE_URL leaked to psql process" >&2; exit 90; }
[[ "${PGHOST:-}" == "db.example.test" ]]
[[ "${PGPORT:-}" == "5433" ]]
[[ "${PGUSER:-}" == "worker+ops" ]]
[[ "${PGPASSWORD:-}" == "p@ss/word" ]]
[[ "${PGDATABASE:-}" == "unibud_ops" ]]
[[ "${PGSSLMODE:-}" == "verify-full" ]]
[[ "${PGCONNECT_TIMEOUT:-}" == "10" ]]
[[ "${PGAPPNAME:-}" == "unibud-operations-mfa-maintenance" ]]
[[ " $* " != *"p@ss/word"* ]]
[[ " $* " == *"--set=batch_size=17"* ]]
printf 'invoked\n' >>"$TEST_PSQL_MARKER"
exit "${TEST_PSQL_EXIT:-0}"
PSQL
chmod +x "$FAKE_BIN/psql"

cat >"$FAKE_BIN/timeout" <<'TIMEOUT'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$@" >"$TEST_TIMEOUT_CAPTURE"
[[ "${1:-}" == "--signal=TERM" ]]
[[ "${2:-}" == "--kill-after=5s" ]]
[[ "${3:-}" == "45s" ]]
if [[ -n "${TEST_TIMEOUT_EXIT:-}" ]]; then
  exit "$TEST_TIMEOUT_EXIT"
fi
shift 3
exec "$@"
TIMEOUT
chmod +x "$FAKE_BIN/timeout"

export PATH="$FAKE_BIN:$PATH"
export TEST_PSQL_MARKER="$TEMP_DIR/psql.marker"
export TEST_TIMEOUT_CAPTURE="$TEMP_DIR/timeout.args"
export DATABASE_URL='postgresql://worker%2Bops:p%40ss%2Fword@db.example.test:5433/unibud_ops?sslmode=verify-full'
export PGSSLMODE=verify-full
export BATCH_SIZE=17

# Successful invocation: URI parsing, credential isolation, libpq environment,
# bounded timeout arguments and the configured batch size reach the worker.
bash "$WORKER"
grep -qx 'invoked' "$TEST_PSQL_MARKER"
mapfile -t timeout_args <"$TEST_TIMEOUT_CAPTURE"
[[ "${timeout_args[0]}" == "--signal=TERM" ]]
[[ "${timeout_args[1]}" == "--kill-after=5s" ]]
[[ "${timeout_args[2]}" == "45s" ]]
grep -qx 'psql' <(printf '%s\n' "${timeout_args[@]}")

# The worker must propagate database failures rather than reporting success.
: >"$TEST_PSQL_MARKER"
set +e
TEST_PSQL_EXIT=23 bash "$WORKER"
status=$?
set -e
[[ "$status" -eq 23 ]]
grep -qx 'invoked' "$TEST_PSQL_MARKER"

# The outer hard deadline's timeout status must also reach the scheduler.
set +e
TEST_TIMEOUT_EXIT=124 bash "$WORKER"
status=$?
set -e
[[ "$status" -eq 124 ]]

# Invalid batch sizes and TLS downgrade attempts must fail before psql starts.
: >"$TEST_PSQL_MARKER"
set +e
BATCH_SIZE=1001 bash "$WORKER" >/dev/null 2>&1
status=$?
set -e
[[ "$status" -eq 2 && ! -s "$TEST_PSQL_MARKER" ]]

set +e
PGSSLMODE=disable bash "$WORKER" >/dev/null 2>&1
status=$?
set -e
[[ "$status" -eq 2 && ! -s "$TEST_PSQL_MARKER" ]]

# Reject unsupported URI parameters instead of silently changing connection policy.
set +e
DATABASE_URL='postgresql://worker:secret@db.example.test/unibud_ops?sslmode=verify-full&application_name=untrusted' \
  bash "$WORKER" >/dev/null 2>&1
status=$?
set -e
[[ "$status" -eq 2 && ! -s "$TEST_PSQL_MARKER" ]]

echo "PASS: maintenance worker URI handling, credential isolation, TLS policy, bounded timeout arguments, batch validation and failure propagation."
