# Database Backup, Restoration and Incident Recovery

## Status

This is the required operating procedure for the UNIBUD PostgreSQL system of record. It is a design/runbook, not evidence that backups, monitoring, replicas, or a production database currently exist. No hosting provider, recovery-point objective (RPO), recovery-time objective (RTO), or retention period has been approved yet.

## Recovery design requirements

- Backups must be encrypted in transit and at rest, with encryption keys controlled separately from the database.
- Keep automated backups and point-in-time recovery (PITR) where the selected PostgreSQL service supports it.
- Keep at least one logically or administratively isolated backup copy so a compromised production account cannot silently destroy every recovery copy.
- Separate production, staging, development and test environments, credentials, networks and backup destinations.
- Restrict backup read, restore, key-management and deletion privileges to named, MFA-protected operators. Require a second authorised reviewer for destructive production recovery actions.
- Define retention and deletion schedules by data class and applicable legal requirements. A backup is not a reason to retain data indefinitely.
- Never restore production data into development, CI, demo or automated-test environments. Test recovery into an isolated recovery environment with synthetic test records or a controlled production-recovery enclave with tightly limited access.

## Before an incident

1. Approve and document RPO, RTO, backup frequency, retention, regions and restore authority.
2. Enable database-native backups and PITR under the UNIBUD-controlled infrastructure account.
3. Store backup encryption keys and recovery credentials separately; document dual-control access.
4. Alert on backup failures, unexpected retention changes, suspicious exports, privilege changes and recovery-point gaps.
5. Record database version, extensions, schema migration version, network dependencies and secret-rotation procedure.
6. Test full restore and point-in-time restore on a schedule; record duration, data-loss window, validation evidence and corrective actions.
7. Keep a tested contact/escalation tree for database, infrastructure, security, privacy and domain owners.

## Incident recovery sequence

1. **Declare and contain:** identify the incident commander; preserve logs and evidence; isolate compromised credentials, workloads or network paths without destroying evidence.
2. **Assess scope:** determine whether the event is outage, corruption, accidental deletion, credential compromise, ransomware, unauthorised export or integrity compromise.
3. **Protect recovery assets:** verify backup integrity and access logs from a separate trusted control plane. Do not assume the newest backup is clean.
4. **Choose recovery point:** domain and security owners approve the recovery target based on the incident timeline, RPO, business impact and evidence of compromise.
5. **Restore in isolation:** restore to a clean, isolated environment using verified binaries, schema migrations and secrets. Do not reconnect applications until integrity checks pass.
6. **Validate:** verify database consistency, migration version, account ownership, grants, audit continuity, domain invariants, financial ledger reconciliation and application-level read/write controls.
7. **Rotate and revoke:** rotate affected credentials and encryption keys where required; revoke compromised sessions, service credentials, API keys and grants. Re-establish least privilege.
8. **Controlled return:** obtain explicit approval from security, database and affected domain owners before reopening traffic. Use staged traffic and heightened monitoring.
9. **Communicate and comply:** follow the incident communications plan and assess notification obligations with qualified privacy/legal personnel for affected jurisdictions.
10. **Learn:** preserve a timeline, impact assessment, root cause, decisions, evidence, recovery measurements and tracked remediation actions.

## Domain-specific validation

- **Identity:** account/authentication-identity mapping, verification state, active sessions, revocations, profile ownership and grants must be consistent.
- **Private conversations:** participant membership, message ordering, attachment permissions, deletion/retention state and block/report controls must remain intact.
- **Education:** institution, student, tutor and relationship records must retain separate scopes and authority.
- **Flow:** do not resume financial writes until ledger integrity, provider references, idempotency, reconciliation and pending transaction states are checked. Use compensating entries rather than rewriting settled history.
- **Operations:** staff assignments, dispatch approvals, fleet status and incident records must be checked before resuming physical operations.
- **Oracle Arc/SPARK:** verify app/user memory scope, consent state, tool grants and audit references before enabling retrieval or actions.

## Prohibited shortcuts

- No unverified backup restore directly into production.
- No use of development/test databases as a recovery staging area.
- No silent rollback of financial ledger history.
- No disabling audit or authorisation controls to make recovery faster.
- No resumption of payments, dispatch, private education access or AI tool execution before the relevant owner validates the recovered state.
