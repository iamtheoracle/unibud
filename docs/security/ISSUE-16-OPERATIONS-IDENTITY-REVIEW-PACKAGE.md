# Issue #16 — Operations identity security-review package

**Review status:** Prepared for independent review; not approved and not a production-security sign-off.  
**Scope:** PostgreSQL migrations 0020, 0021 and 0023; account/session signing helpers; Operations permission and audit RPCs.  
**Evidence baseline:** `foundation/workforce-identity-onboarding-v1` at `37e971b16147f8b45d03b8b044481b3982121446`; CI evidence separately linked below.

## 1. Threat model

### Protected assets
- Operator grant membership, role and permission arrays.
- Operator audit actor/session attribution and append-only event history.
- Persisted account/session state, including revocation and idle/absolute expiry.
- Account-context and session-context HMAC verifier secrets.
- Privileged Operations endpoints and the data returned by them.

### Principals and trust boundaries
- **Untrusted client:** may control request body, query, headers, cookies it can set, and arbitrary PostgreSQL custom GUC values available through an app SQL connection.
- **`unibud_app`:** runtime database role; may call explicitly granted RPCs and set transport GUCs, but must not choose an actor UUID, read verifier keys, or invoke private verifier functions.
- **Trusted server signer:** validates the opaque session against server-side session storage, then creates short-lived account and session HMAC assertions. This is a privileged trust boundary.
- **`unibud_ops_owner`:** NOLOGIN, NOINHERIT, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, BYPASSRLS function/table owner. Its BYPASSRLS attribute is intentional for tightly scoped SECURITY DEFINER operations and makes owner-role membership/credential isolation critical.
- **DBA / deployment principal:** provisions and rotates signing material and out-of-band operator grants. It is outside the app runtime trust boundary.

### Attacker capabilities assumed
A client or compromised ordinary app request may submit another account UUID, alter a request header/cookie, set arbitrary `unibud.*` GUC values in its own DB transaction, replay a captured assertion during its validity window, and invoke every function granted to `unibud_app`. It must not possess the trusted server signing keys, DB owner/DBA credentials, or a valid authenticated session belonging to another account.

### Security invariants
1. A caller-selected account UUID is never accepted as the Operations actor.
2. Account GUCs are transport only; PostgreSQL validates the account HMAC, expiry and nonce through `unibud_private.current_account_id()`.
3. Session GUCs are transport only; PostgreSQL independently validates a separate session HMAC and the exact persisted session row, account ownership, active/revoked state and both expiry bounds through `unibud_private.current_session_id()`.
4. Permission checks derive actor and session from the verified context and re-check active account, grant revocation and grant expiry at statement time.
5. Audit actor/session attribution is derived from the same verified context. Unauthenticated events must have NULL actor and session.
6. App role cannot execute private session verification directly or read account/session signing secrets.
7. Revocation denies the next authorization check; a correctly signed but revoked/expired persisted session is not revived by its signature.
8. Operator grant/audit tables are not directly readable or writable by the app role.

## 2. Database design and RLS/policy inventory

### RLS finding
Migrations 0020/0021/0023 do **not** create row-level security policies on `unibud_operator_grants` or `unibud_operator_audit_events`. Their isolation boundary is explicit table ACL revocation plus narrow SECURITY DEFINER RPCs, not per-row RLS. Do not describe this as RLS-protected.

Migration 0020 creates `unibud_ops_owner` with `BYPASSRLS` and assigns it ownership of the operator grant/audit tables. It revokes direct table access from `PUBLIC`, `unibud_app`, `unibud_readonly` and `unibud_auth`. The app must not become a member of the owner role. Migration 0023 removes `CREATE` on schema `public` from the owner role before the final SECURITY DEFINER function set is established.

The broader identity/RLS model is described in `docs/security/TRUSTED-DATABASE-ACCESS.md`; that document's older status paragraph says TypeScript signer/service wiring is absent, while current signer helper files now exist. Update that stale status after runtime wiring has been audited.

## 3. Role grants and function boundaries

### `unibud_ops_owner`
- Created NOLOGIN, NOINHERIT, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, BYPASSRLS.
- Owns `unibud_operator_grants`, `unibud_operator_audit_events`, and the SECURITY DEFINER Operations functions.
- Receives SELECT on `accounts` (0020); later SELECT on `account_sessions` and `unibud_private.session_context_signing_keys` (0023).
- Receives USAGE on `unibud_private` and EXECUTE on `unibud_private.current_account_id()`.
- Migration 0023 revokes CREATE on `public`; tests assert the owner cannot create public objects.
- Must never be used as an application login or inherited by runtime principals.

### `unibud_app`
- Migration 0020's unsafe signatures accepting caller-supplied actor UUIDs are revoked and dropped by 0021:
  - `public.unibud_operator_has_permission(UUID,TEXT)`
  - `public.unibud_operator_record_access(UUID,TEXT,TEXT,UUID)`
- Migration 0021 grants only the actor-derived signatures:
  - `public.unibud_operator_has_permission(TEXT)`
  - `public.unibud_operator_record_access(TEXT,TEXT,UUID)`
- Migration 0023 hardens both functions to require a valid exact session context and reasserts the narrow EXECUTE grants.
- No direct SELECT/INSERT/UPDATE/DELETE grants are given to `unibud_app` on the operator grants/audit tables or signing-key tables.
- No EXECUTE grant is given to `unibud_app` on `unibud_private.current_session_id()`.

### Private key table
- `unibud_private.session_context_signing_keys` is revoked from PUBLIC, `unibud_app`, `unibud_readonly` and `unibud_migrator`.
- Only `unibud_ops_owner` receives SELECT for the verifier.
- Account and session contexts use separate HMAC keys. Key provisioning is not performed by these migrations.

### SECURITY DEFINER/search_path
- `public.unibud_operator_has_permission(TEXT)` and `public.unibud_operator_record_access(TEXT,TEXT,UUID)` are SECURITY DEFINER, owned by `unibud_ops_owner`, with fixed `search_path = pg_catalog, public, unibud_private`.
- `unibud_private.current_session_id()` is SECURITY DEFINER, owned by `unibud_ops_owner`, with the same fixed search path and no PUBLIC/app EXECUTE grant.
- Migration 0023 revokes CREATE on public from the function owner; the PostgreSQL test checks this privilege boundary.
- Independent reviewer must inspect every object referenced by these functions, ownership, default privileges, extension function resolution and the complete role membership graph, not only the declarations listed here.

## 4. PostgreSQL acceptance tests and CI evidence

### Test 0021 — `database/tests/0021_non_forgeable_operations_actor.test.sql`
Verified by CI invocation under the PostgreSQL 16 migration/RLS isolation job:
- Seeds two accounts, one persisted session, one operator grant, and separate account/session signing keys.
- Uses `SET LOCAL ROLE unibud_app` for runtime-boundary assertions.
- Lines 62–80: proves the old UUID-selectable permission and audit function signatures no longer resolve.
- Lines 87–101: changes the account GUC to another account and proves permission is denied and actor-attributed audit insertion is rejected.
- Lines 121–139: checks audit attribution records the signed authenticated actor for a denied event and NULL for unauthenticated access.
- Lines 141–171: revokes the operator grant and proves the next signed-context permission check denies access.

### Test 0023 — `database/tests/0023_operations_session_context_verifier.test.sql`
Verified by CI invocation under the PostgreSQL 16 migration/RLS isolation job:
- Establishes independent signed account and exact-session claims.
- Lines 61–75: proves `unibud_app` cannot execute `unibud_private.current_session_id()` or read either signing-key table.
- Lines 81–98: checks the audit actor/session pair equals the verified persisted account/session.
- Lines 100–117: changes only the session GUC; permission is denied and the forged session is not attributed.
- Lines 120–140: rejects a correctly signed account/session pair where the persisted session belongs to a different account.
- Lines 143–169: rejects an expired but correctly signed session.
- Lines 172–204: rejects a revoked persisted session even when the HMAC claim is valid.
- Lines 207–217: rejects account-only proof without session proof.
- Lines 220–244: requires unauthenticated audit records to have NULL actor and session.

### Exact CI run
- <https://github.com/iamtheoracle/unibud/actions/runs/43693815591> — Foundation checks, including PostgreSQL 16 migration and RLS isolation; both jobs passed on PR #32 head `3464cde5ca5081fcc7dc4bef9e85a0854f0070dc`.
- The successful job log explicitly invokes `psql -v ON_ERROR_STOP=1` on both `database/tests/0021_non_forgeable_operations_actor.test.sql` and `database/tests/0023_operations_session_context_verifier.test.sql`. Since any SQL error aborts the job and the job concluded success, both scripts completed successfully in that run.
- This is CI execution evidence, not a production database test or independent security approval.

## 5. Known gaps / independent review checklist

1. **Server request provenance:** DB tests prove GUC forgery resistance. Independently verify every Operations route obtains account/session only from the validated opaque cookie/session resolver; client body, query, headers and alternate cookies must not select a signing identity. Add route-level negative tests for forged account/session fields and cookie/header confusion.
2. **Signer isolation:** `account-context-core.ts` reads `UNIBUD_DB_CONTEXT_HMAC_KEY`; `session-context-core.ts` reads that plus `UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY`. Production secret-manager bindings, access policies, deployment wiring and runtime rotation evidence are not established by CI.
3. **Database key provisioning:** migration 0023 creates the verifier table and grants the verifier owner SELECT; it does not insert production secrets. Verify DBA-only provisioning, backups, access logging and secret/database key correspondence without selecting or printing secret values.
4. **Rotation:** migration 0040 and `docs/security/SIGNING-KEY-ROTATION.md` describe two-key overlap. The runbook explicitly states live production rotation is not proven. Confirm the exact 0023 key table has the expected migration-0040 overlap constraints and tests on the target branch.
5. **Owner role:** `unibud_ops_owner` has BYPASSRLS. Verify no LOGIN, membership, SET ROLE path, inherited grant, connection string or application credential can assume it. Review all functions it owns and their fixed search paths.
6. **RLS boundary:** no RLS policies protect the two operator tables in migrations 0020–0023. Confirm direct ACLs remain revoked after all later migrations/default privileges and that no alternate view, sequence, trigger or function exposes the underlying rows.
7. **Audit semantics:** test coverage demonstrates actor/session provenance for selected allowed/denied/unauthenticated paths. Independently review exception/error paths, transaction rollback semantics, duplicate request IDs, event immutability, retention and export.
8. **Complete permission matrix:** verify every Operations endpoint and permission string against the authoritative registry, including MFA step-up, rate limits, dual control, immediate grant/session revocation and least-privilege read scopes.
9. **Adversarial coverage:** add/verify request-level attempts via body, query, headers, cookies, reused signatures, replay across transactions, stale nonce, key retirement, concurrent revocation, pool connection reuse and SQL injection boundaries.
10. **Stale documentation:** reconcile `docs/security/TRUSTED-DATABASE-ACCESS.md` status text with the present TypeScript helper files, while preserving the still-pending production provisioning/wiring claims.

## 6. Reviewer decision template

Independent reviewer should record:
- Reviewed commit SHA and exact files/lines.
- Threat model assumptions accepted or rejected.
- Role membership and ACL query evidence.
- SECURITY DEFINER owner/search_path/EXECUTE evidence.
- RLS policy inventory and explicit non-RLS ACL boundary.
- PostgreSQL 16 test run IDs and negative-test outcomes.
- Route-level forged-input test results.
- Production key provisioning/rotation evidence (or explicit deferral).
- Findings by severity, remediation commit(s), and retest evidence.
- Final decision: approved / approved with conditions / rejected.

**Disposition now:** implementation and selected database negative tests are present and passed in CI; production operational security and independent review remain unverified. Do not close Issue #16, approve PR #15, merge PR #32, or deploy based on this package alone.
