# Operations MFA: session-bound step-up protocol

**Status: MFA design checkpoint. The signed account+session trust boundary and its Operations-route integration are implemented in migration 0023 and the existing verification-delivery diagnostic route. Migration 0024 now adds protected assertion-nonce and exact-session step-up storage, one-time server-assertion consumption, monotonic TOTP-step advancement, and database permission enforcement requiring active MFA plus a live step-up. The server assertion-signing helper and unit tests are present. Enrollment, challenge, recovery and reauthentication routes/UI are not implemented; MFA is not operational end-to-end.**

## 1. Existing architecture inspected

The design must extend, not replace, the existing first-party identity stack:

- `SessionService` issues opaque 256-bit credentials; only SHA-256 credential digests are persisted.
- `SessionService.validate` resolves the cookie credential to a persisted session and account, checks account status, revocation, issue time, idle expiry and absolute expiry, and conditionally touches the session.
- Session rotation atomically revokes the old credential and persists its replacement while preserving the absolute expiry and active-profile context.
- Logout revokes one session; password recovery supports account-wide session revocation.
- Authentication and application database pools are separate role-bound pools. The auth runtime uses a dedicated LOGIN principal granted `unibud_auth`; application routes use a separate LOGIN principal granted `unibud_app`.
- Account-scoped application procedures use the existing short-lived HMAC-signed transaction context. PostgreSQL GUCs are transport only; the database verifies the HMAC using a private key inaccessible to the app database role.
- Migration 0022 creates protected Operations MFA credential and recovery-code tables owned by `unibud_ops_owner`; application roles have no direct table privileges and no MFA RPC exists yet.

## 2. Security invariants

1. Every Operations request begins by validating the actual HTTP-only session cookie through `SessionService.validate`. A client-provided account ID or session ID is never authoritative.
2. The account and session identifiers used by subsequent steps come only from the validated persisted session result.
3. An Operations permission is granted only when all three conditions hold at request time: the account is active and has the required unexpired/unrevoked Operations grant; an active MFA credential exists; and a valid, unexpired step-up record is bound to this exact still-active session.
4. A successful MFA challenge in one session never authorizes another session, profile, account, device cookie, or browser.
5. Session rotation, logout, account-wide revocation, account suspension, operator-grant revocation, MFA disablement, or security lockout invalidates further Operations use. Database authorization rechecks current state on every request.
6. TOTP time steps are accepted monotonically and atomically. A step can be consumed only once, including under concurrent requests.
7. Recovery codes are single-use. Only keyed digests are stored. A redeemed recovery code cannot be used again.
8. Pending enrollment does not confer Operations access. No access is granted until confirmation succeeds and recovery codes are committed.
9. No account/session ID, TOTP time step, verification result, recovery result, or expiry supplied by the browser is accepted as proof.
10. Plain caller-settable GUCs are never identity or MFA proof. All proof claims are server-signed and database-verified with keys unavailable to the browser and application database role.
11. All security state transitions and denials are auditable without recording raw passwords, session cookies, TOTP codes, recovery codes, authenticator seeds, or signing keys.

## 3. Trusted session context extension

The existing signed account context is account-bound; migration 0023 adds a separate versioned signed session claim rather than trusting a new untrusted `unibud.session_id` GUC. The database verifier checks both signatures and the exact live persisted session.

**Implemented in migrations 0023–0024 and server helpers:**

- Introduce a versioned context payload containing account UUID, persisted session UUID, expiry, nonce and protocol version.
- Sign the complete canonical payload with a dedicated server-held HMAC key; verify it in a private database function using a verifier key unavailable to `unibud_app`.
- Add a narrow database accessor for the verified session UUID. It returns NULL on missing, malformed, expired, replayed or invalidly signed context.
- Require the verified account from the existing `current_account_id()` accessor and the verified session from the new accessor to agree with a live row in `account_sessions`.
- Keep existing account-only context for non-Operations paths where appropriate. Operations procedures must require the session-bound version and fail closed if it is absent.
- Never trust a GUC simply because its name is internal; every value used for authorization must be included in and authenticated by the signed payload.

- Migration 0024 adds a private assertion verifier key table, protected one-time nonce ledger and exact-session step-up table.
- `unibud_operator_mfa_consume_step_up` verifies a short-lived signed `step_up` assertion, consumes its nonce, atomically advances the TOTP counter and creates a five-minute step-up for the exact session.
- `unibud_operator_has_permission` fails closed unless the exact session has an unexpired step-up and the account has an active, unlocked MFA credential. Until enrollment/challenge routes exist, Operations permissions are deliberately denied rather than falling back to session-only access.
- The database audit writer independently derives whether an event may be recorded as allowed; an app caller cannot forge an allowed outcome.
- A two-connection PostgreSQL concurrency script is wired into Foundation CI and requires exactly one of two simultaneous uses of the same assertion to succeed.

- Migration 0025 adds a password_reauth assertion purpose. PostgreSQL consumes it once, requires a current active Operations grant, and stores only an encrypted ten-minute pending TOTP envelope. An active credential or unexpired pending enrollment cannot be replaced through this procedure.
- The server-only encrypted-secret accessor returns ciphertext only to a validated, active operator session; it never returns a decrypted seed.
- The enrollment-start route validates the same-origin request and HTTP-only session, reauthenticates the current account password with the existing verifier/rate limiter, encrypts a new seed, and returns the provisioning URI with no-store headers. Pending enrollment is not MFA activation.

The app must create this context only after `SessionService.validate(cookie)` succeeds. It uses `validation.account.id` and `validation.session.id`; it must not reconstruct either value from request fields.

## 4. MFA state machine

### Enrollment

1. Require a validated active session, an active Operations grant, recent password reauthentication, and an explicit enrollment action.
2. Generate a new 160-bit TOTP seed server-side. Encrypt it with AES-256-GCM using the existing versioned envelope and account-bound associated data.
3. Store only the encrypted seed as a short-lived pending credential using a narrow procedure that derives account/session context from the verified signed session context.
4. Return the provisioning URI/QR payload once over TLS with no-store headers. Never log it, persist it in browser storage, or expose the decrypted seed again.
5. Require a fresh six-digit TOTP code. The server decrypts and verifies it; the database atomically consumes the matched step, activates the credential, records the initial monotonic step and stores keyed recovery-code digests in one transaction.
6. Display recovery codes once. Require an explicit acknowledgement before considering setup complete. Until activation and recovery-code persistence commit, Operations access remains denied.

Pending enrollment expires and can be replaced only through an audited, rate-limited flow. An expired pending seed is deleted by a controlled retention job.

### Step-up challenge

1. Validate the HTTP-only session cookie again. Require an active account and active Operations grant.
2. Retrieve the encrypted seed only through an account/session-bound procedure; decrypt and verify TOTP on the server.
3. On a valid code, the server creates a short-lived, single-use HMAC-signed verification assertion binding account, exact session, matched TOTP step, purpose, issue/expiry times and a random nonce.
4. A narrow database procedure verifies that assertion, checks that the session remains active and belongs to the verified account, checks the credential remains active and unlocked, atomically advances `last_accepted_totp_step`, consumes the assertion nonce, and creates/refreshes a short-lived step-up record for that exact session.
5. The assertion cannot be replayed. A repeated TOTP step, reused nonce, expired assertion, revoked session, mismatched account/session, inactive credential or locked account is rejected.
6. Each Operations permission check requires the verified account context, verified session context, active grant, active MFA credential and unexpired step-up record. No route may rely on a UI-only “MFA complete” flag.

The step-up duration must be short and centrally configured. The initial policy target is five minutes; the final value must be configurable server-side and documented. High-impact actions (grant changes, MFA disablement/recovery regeneration, sensitive exports) require fresh step-up and separate approval controls, not just a still-valid general step-up.

### Recovery

- Normalize a submitted recovery code on the server and derive its account-bound keyed digest.
- Redeem through one atomic database procedure that binds to the verified account and live session, marks exactly one unused digest redeemed, and creates a restricted one-time recovery step-up.
- Require immediate authenticator re-enrollment or recovery-code regeneration before ordinary Operations access resumes.
- Notify the account through configured verified channels and audit the event. Do not reveal whether a supplied code matched.
- Recovery-code regeneration requires recent password reauthentication, fresh MFA or the restricted recovery flow, and invalidates every previous recovery code.

### Disablement and reset

- Require recent password reauthentication, fresh MFA, and dual-control approval where policy requires.
- Revoke all step-up records for the account and invalidate all recovery codes in the same transaction as credential disablement.
- Do not let an operator disable their own MFA as a way around the requirement.
- Lost-device recovery must use a separately reviewed, audited owner/support recovery path; support staff cannot read or retrieve seeds or recovery codes.

## 5. Database procedure boundaries

All tables remain inaccessible directly to `unibud_app`, `unibud_auth`, and read-only roles.

The migration sequence should add only narrow SECURITY DEFINER procedures owned by `unibud_ops_owner` (or a separately justified NOLOGIN owner) with fixed safe search paths and explicit grants:

- Begin/replace pending enrollment for the account from verified session context.
- Read the encrypted pending/active seed only for the account in verified context.
- Record failed verification and enforce bounded attempts/lockout.
- Confirm enrollment with a signed server verification assertion; atomically activate, consume initial step and store recovery digests.
- Consume a signed TOTP assertion exactly once; atomically advance the accepted step and create the session step-up.
- Redeem one recovery digest exactly once and create a restricted recovery state.
- Check Operations permission plus active session, active MFA and valid session step-up as one authoritative decision.
- Revoke session step-up and invalidate account-wide step-ups on relevant security events.
- Append audit events with actor and session derived only from verified context.

The database must verify HMAC signatures itself. The app role must not have SELECT/INSERT/UPDATE/DELETE on MFA or step-up tables, read access to signing keys, or EXECUTE on broad table-management procedures.

## 6. Password reauthentication

The current login service verifies passwords and creates a new session; that is not a substitute for reauthenticating the current session. Add a dedicated reauthentication service that:

- Verifies the current account's password using the existing credential verifier without creating or rotating a session.
- Binds the successful result to the validated current session, purpose and a very short expiry.
- Uses a server-signed assertion verified by the database for enrollment, disablement and recovery-code regeneration.
- Applies rate limiting and generic errors; never reveals whether the account or password exists.
- Requires the browser to submit the password over the existing same-origin, TLS-protected route; never store it in session storage or logs.

## 7. Required negative and concurrency tests

PostgreSQL 16 integration tests must run as the real `unibud_app` LOGIN role and prove:

- Direct SELECT/INSERT/UPDATE/DELETE on both MFA tables and all step-up tables is denied.
- Missing session context, account-only context, forged session GUC, forged account GUC, wrong HMAC, expired context and malformed claims all deny.
- A signed session context for account A cannot authorize account B or a session belonging to account B.
- A valid account context without a live, active, unexpired session cannot authorize Operations.
- A revoked, rotated, idle-expired or absolute-expired session loses Operations access immediately.
- A pending or expired enrollment cannot grant access.
- A TOTP step cannot be consumed twice, including two concurrent transactions.
- An assertion nonce cannot be replayed, including concurrent requests.
- Two concurrent redemptions of the same recovery code produce exactly one success.
- Recovery code for account A cannot be used by account B.
- An expired or revoked step-up record cannot authorize any Operations permission.
- Revoking an operator grant or disabling MFA immediately denies the next permission check.
- An ordinary profile role, institution delegate, tutor, student, creator, page administrator or other non-operator cannot gain Operations permission.
- Audit rows record only the database-verified account/session; unauthenticated events remain unattributed.
- Lockout, throttling and recovery state cannot be bypassed with alternate request routes.

Unit tests must cover TOTP vectors, time-window boundaries, encrypted-seed account binding and tamper rejection, assertion canonicalization/signature validation, key separation, recovery digest matching and generic failure behavior.

## 8. HTTP/API and UI requirements

- Use same-origin POST routes with CSRF/origin validation, secure HTTP-only session cookies, no-store responses and bounded request bodies.
- Never accept account ID, session ID, TOTP step, assertion expiry, lockout counter or permission list from the browser.
- Routes: enrollment start, enrollment confirm, MFA challenge, recovery-code redemption, recovery-code regeneration, MFA status and controlled disable/reset.
- MFA status reveals only the current session/account's own enrollment state; no cross-account lookup.
- Build accessible authenticator setup, code entry, one-time recovery display, recovery acknowledgement, retry/lockout, lost-device and support states.
- Do not show Operations screens or sensitive metadata before server-side permission and step-up checks succeed.
- Add end-to-end tests for enrollment, challenge, exact-session binding, session rotation, logout, recovery, lockout, revocation and denial.

## 9. Operational and release gates

- Provision distinct environment-specific keys for account context (`UNIBUD_DB_CONTEXT_HMAC_KEY`), session context (`UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY`), MFA assertion signing (`UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY`), TOTP seed encryption and recovery-code digests. No key is stored in source control, PostgreSQL data, browser code, logs or deployment artifacts.
- Document key ownership, rotation, backup, loss/recovery, versioned envelope migration and incident response.
- Review database owner role memberships and function EXECUTE grants.
- Run migrations and negative tests against disposable PostgreSQL 16 in CI; separately review production-like migration/rollback/recovery before rollout.
- Independently review the threat model and implementation. CI passing alone is not approval.
- Keep PR #15 draft/open until Issue #16 independent security review and all required MFA/Operations acceptance gates are satisfied. No production migration or deployment is authorised by this design.

## 10. Definition of done

MFA is enabled only when the database procedures, server routes, session-bound permission checks, reauthentication, lockout, recovery, audit, UI, concurrency/negative PostgreSQL tests, full end-to-end tests, operational key management, independent review and exact-head CI are complete. A crypto helper, storage schema, QR screen, or passing unit test alone is not MFA.


## Implementation checkpoint: enrollment confirmation — 2026-11-11

Migration 0026 now implements the enrollment-confirmation database boundary. The procedure derives account and exact session from the verified transaction context, verifies a purpose-bound HMAC assertion, requires an active Operations grant and live pending credential, validates a bounded set of distinct recovery digests, then atomically activates the credential, records the initial TOTP step, consumes the assertion nonce and stores recovery digests. The app role receives EXECUTE only and cannot read or mutate the protected credential/recovery tables.

The server route validates the same-origin request and persisted HTTP-only session, decrypts the encrypted seed server-side, verifies the six-digit TOTP, signs the accepted step for the exact session and displays recovery codes only once after commit. Ten failed attempts trigger a 15-minute lockout. The encrypted-secret accessor denies locked credentials, and a trigger prevents replacement enrollment from clearing a live lockout.

This is only enrollment activation. The route does not issue a step-up session. Until the separate challenge route consumes a signed `step_up` assertion and creates the exact-session five-minute step-up, every Operations permission remains denied. Recovery redemption/regeneration, disable/reset, UI, notifications, audit lifecycle, concurrency/E2E proof, key provisioning/rotation and independent security review remain release blockers.


## Implementation checkpoint: TOTP challenge and exact-session step-up — 2026-11-11

Added a same-origin challenge route that revalidates the persisted HTTP-only session, reads the encrypted TOTP envelope through the protected accessor, verifies the six-digit code on the server and signs the matched step for the validated account and exact session. Migration 0024 verifies and consumes that assertion once, atomically advances the monotonic TOTP step and creates a five-minute step-up bound to that exact session. Invalid codes increment the protected failure counter; migration 0026 locks after ten failures for 15 minutes. The route does not accept caller-supplied account/session IDs or TOTP steps and sends no-store responses.

The challenge route is implemented but exact-head CI and browser E2E remain pending. The complete MFA lifecycle still needs recovery-code redemption/regeneration, disable/reset, status/UI and recovery acknowledgement, dedicated audit/notification events, session lifecycle invalidation, concurrent recovery tests, operational key provisioning/rotation and independent security review.


## Implementation checkpoint: recovery and lifecycle audit — 2026-11-11

Migration 0027 adds a protected append-only MFA event table and an account/session-derived credential-change audit trigger. It records enrollment start/confirmation, challenge failure/success, lockout and credential removal without storing secrets, codes, passwords, tokens or request bodies. Application roles have no direct access; update/delete are rejected.

The recovery procedure verifies a signed `recovery` assertion with no TOTP-step claim, consumes one unused account-bound recovery digest exactly once, deletes all session step-up records and removes the old credential and recovery set. It deliberately grants no step-up. The new same-origin recovery route requires the current validated session and directs the operator to password-reauthenticated enrollment. The recovery migration and PostgreSQL integration test are wired into Foundation CI; exact-head CI and browser E2E remain pending.

Recovery-code regeneration, disable/reset, status/UI, acknowledgement, notification delivery, session lifecycle invalidation, concurrent redemption proof, key provisioning/rotation, recovery drills and independent security review remain release blockers.


## Implementation checkpoint: status, pending resume and UI — 2026-11-11

Migration 0028 adds a no-identity-argument status function deriving account and exact session from verified transaction context. It reports only the current operator's own credential state, lockout and current-session step-up. PostgreSQL tests cover a second session not inheriting step-up and a non-operator receiving no Operations state.

Migration 0029 adds a pending-only encrypted-secret accessor. It verifies and consumes a short-lived password_reauth assertion for the current account/session and returns ciphertext only for a live, unlocked pending enrollment. The resume route also reauthenticates the account password before reconstructing the provisioning URI, allowing recovery from a closed setup screen without making active credentials readable through this path.

An authenticated /operations/security/mfa interface now connects status, enrollment start/resume, confirmation, recovery-code acknowledgement, challenge and recovery redemption. It keeps secrets in component memory only. QR generation and MFA browser E2E are still outstanding; manual setup is clearly marked as a temporary fallback. Recovery-code regeneration, controlled disable/reset, notifications, lifecycle invalidation, key management and independent review remain release blockers.


## Implementation checkpoint: recovery-code regeneration — 2026-11-11

Migration 0030 adds an atomic recovery-code replacement procedure. It requires a server-signed password_reauth assertion bound to the current account/session and the database-verified five-minute step-up for that exact session. It consumes the nonce, deletes the previous recovery digest set, stores a validated set of distinct new digests and records a protected audit event in one transaction. The route reauthenticates the current password and returns plaintext codes once only after commit. The UI exposes regeneration only when current status reports a step-up; PostgreSQL independently checks expiry.

Exact-head CI and browser E2E for this addition remain pending. Controlled disable/reset requires dual control; no self-service disable path is provided. QR, notifications, lifecycle invalidation, operational key management and independent review remain release blockers.
