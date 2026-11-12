# Signing-key rotation runbook

## Scope and trust boundaries

Migration 0040 adds a controlled two-key verification overlap for three independent trust domains:

| Purpose | Database verification table | Application signing secret |
|---|---|---|
| Account transaction context | `unibud_private.context_signing_keys` | `UNIBUD_DB_CONTEXT_HMAC_KEY` |
| Exact persisted-session context | `unibud_private.session_context_signing_keys` | `UNIBUD_DB_SESSION_CONTEXT_HMAC_KEY` |
| Operations MFA assertions (step-up, enrollment, recovery and password reauthentication) | `unibud_private.operations_mfa_assertion_signing_keys` | `UNIBUD_OPERATIONS_MFA_ASSERTION_HMAC_KEY` |

These keys must be independently generated and must never be reused across purposes. Each key must contain at least 32 cryptographically random bytes. The database stores verifier material; the application signs assertions from its secret-manager binding. No production key or secret is supplied by this migration.

During rotation, each verifier evaluates every active candidate and accumulates fixed-length HMAC comparisons without returning on the first match. A maximum of two active keys per purpose is enforced under a transaction-scoped advisory lock. Zero active keys fails closed; more than two cannot be activated.

## Controlled rotation

Rotate one trust domain at a time. Do not rotate all three together unless an approved incident-response procedure requires it.

1. **Inventory and prepare.** Identify the current active key ID and the exact application deployments using the corresponding secret-manager binding. Confirm that the deployment can update the secret without exposing it in logs, shell history, build output or process arguments.
2. **Generate a new key.** Generate at least 32 bytes from a cryptographically secure random source. Create a distinct secret-manager version. Never generate a key in a migration, commit it to Git, reuse another purpose's key, or paste it into an issue or chat.
3. **Provision database verification.** Through an authorised DBA session and the approved secret-management procedure, insert the new key with a unique key ID and `active=true`. Leave the old key active. The overlap trigger runs with the provisioning role's privileges and requires that role to have the necessary `SELECT`, `INSERT` and `UPDATE` access to the private key table; do not grant those privileges to application roles. The trigger permits two active keys and rejects a third. Do not select or print the stored `secret` column during operational checks.
4. **Switch the application signer.** Update the corresponding application secret binding to the new value and roll out every server instance. Existing application code reads the configured environment value when it creates the HMAC; the database now accepts signatures from either active key while old instances drain.
5. **Verify both sides.** Confirm that new requests signed by the new key succeed, existing requests from still-running old instances continue to succeed, and invalid signatures fail closed. Check authentication/session/MFA error rates and the application deployment inventory. Do not infer successful rotation solely from the presence of a new database row.
6. **Allow the overlap to expire.** After every instance is confirmed to use the new signer, wait at least the maximum signed-claim lifetime (120 seconds) plus the environment's maximum clock skew and request/deployment drain allowance. The five-minute Operations MFA step-up record is a database state, not a reusable signed assertion; its expiry does not require retaining the old assertion key.
7. **Retire the old key.** Set only the old key row's `active` flag to false. Keep the new key active. Verify that new signatures still succeed and signatures made with the retired key now fail. Preserve a change record containing key IDs, operator, timestamps and verification evidence, never secret values.
8. **Close out.** Reconcile the secret-manager version, deployment inventory, database active-key count and change record. Repeat independently for the next trust domain.

## Rollback and incident handling

- If the new signer rollout fails before the old key is retired, roll application instances back to the old secret while both keys remain active. Diagnose before proceeding.
- If the old key has already been retired and rollback is approved, reactivate it only if it is not suspected compromised and the overlap limit permits it. The trigger serializes activation and rejects a third active key.
- If a key is suspected compromised, do not reactivate it as a convenience rollback. Follow incident response, rotate the affected trust domain, review sessions/assertions and audit evidence, and assess whether affected sessions must be revoked.
- Do not delete or overwrite keys as part of routine rotation. Destruction of retired key material from the database and backups requires a separately approved retention/incident procedure.

## Verification and limitations

- `database/tests/0040_signing_key_rotation_overlap.test.sql` verifies old and new account/session/MFA signatures during overlap, the two-key limit, retired-key rejection, invalid signatures, and conversion of every existing Operations MFA assertion verifier to the shared overlap verifier.
- `database/tests/0002_identity_access_control.test.sql` remains the baseline identity/RLS test and is run against the original identity migrations; it does not assert the later rotation policy. The two-key overlap and third-key rejection are covered by test 0040 after migration 0040.
- Foundation CI applies migration 0040 and runs its PostgreSQL 16 integration test.
- This migration changes database verification only. It does not provision production keys, update secret-manager values, rotate deployed application instances, revoke sessions, or perform a live production rotation.
- Rotation is not complete until the application signer rollout and post-retirement rejection checks are observed in the target environment. CI is not evidence of production key rotation.

## Operations MFA TOTP seed-encryption key rotation

The application supports a separate, versioned AES-256-GCM keyring for encrypted TOTP seeds. This is distinct from the three database-verified HMAC signing-key domains above and must never reuse their keys.

- Legacy ciphertext remains in the existing `v1.<iv>.<tag>.<ciphertext>` envelope and is decrypted only with `UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY`.
- When `UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEYRING_JSON` is configured, new ciphertext uses `v2.<key-id>.<iv>.<tag>.<ciphertext>`. The account and key ID are authenticated as AES-GCM additional data.
- The keyring JSON has the shape `{"activeKeyId":"new-id","keys":[{"id":"old-id","keyHex":"<64 hex chars>"},{"id":"new-id","keyHex":"<64 hex chars>"}]}`. It accepts one or two unique key IDs, each with exactly 32 bytes of key material, and requires the active ID to exist in the keyring.
- The legacy environment key remains required while any v1 ciphertext exists. Do not remove or replace it until a separately controlled inventory/re-encryption exercise proves no v1 records remain and the old key is no longer needed for recovery.

### Rotation procedure

1. Generate a new independent 32-byte key in the approved secret manager. Never place key material in Git, tickets, logs or chat.
2. Bind the new key as the active key in the JSON keyring. During overlap, retain the previous v2 key in the keyring and retain the original v1 key in `UNIBUD_OPERATIONS_MFA_SEED_ENCRYPTION_KEY`.
3. Deploy the configuration to one environment at a time. New TOTP enrollment/resumption writes v2 envelopes; reads continue to accept legacy v1 and either configured v2 key.
4. Verify new enrollments can be decrypted by the deployed application and existing v1 enrollments remain usable. Do not disable or reset member MFA as a rotation shortcut.
5. Retire a previous v2 key only after inventory proves no active ciphertext references its key ID. Removing a key while ciphertext still references it causes fail-closed decryption errors.
6. Retain the legacy v1 key until a separately approved re-encryption and backup-retention procedure has completed. No automatic database re-encryption is performed by this code.

### Verification and limitations

- `apps/web/test/operations-mfa-core.test.ts` covers legacy v1 reads, v2 active-key writes, old/new key overlap, unknown/retired key rejection, key-ID validation and environment keyring parsing.
- This is application-level rotation support, not a production secret-manager integration or a completed live rotation.
- The recovery-code HMAC key has no versioned digest/key-ID format yet. Do not rotate `UNIBUD_OPERATIONS_MFA_RECOVERY_HMAC_KEY` until a separate backwards-compatible digest migration is implemented and verified.
- Production key provisioning, secret-manager access policy, deployment rollout, backup recovery and independent security review remain required.
