# PostgreSQL Ownership and Database Security Standard

**Status:** Architecture direction approved for planning; hosting vendor and deployment topology remain undecided.  
**Priority:** Critical — user safety and privacy.

## Ownership decision

UNIBUD will own and control its application data and PostgreSQL architecture. The database must be provisioned under a UNIBUD-controlled infrastructure account and organisation, with named accountable administrators, documented recovery access, and independent control of application credentials.

A managed PostgreSQL service is acceptable only when UNIBUD retains control of the cloud account, database administration, network policy, encryption configuration, backups, export, and deletion. The provider is an infrastructure processor, not the owner of UNIBUD application data or authorisation policy.

Self-hosting PostgreSQL on virtual machines or Kubernetes is not automatically safer. It creates responsibility for patching, high availability, monitoring, incident response, backup integrity, replication, and recovery. Choose self-managed operation only when the team can demonstrate these controls. Until then, a managed PostgreSQL instance inside UNIBUD-controlled infrastructure is the safer initial operating model.

## Non-negotiable controls

### Network and environment isolation
- No publicly reachable PostgreSQL listener.
- Private networking only; access through private application workloads or an audited administrative access path.
- Separate development, staging, and production projects/accounts or equivalent hard boundaries.
- Production database must never be used for development, demos, screenshots, or test fixtures.
- Restrict inbound rules to explicitly approved service identities and administration paths.

### Identity and privileges
- Separate database roles for migrations, each application service, read-only reporting, backup, and break-glass administration.
- No application runtime uses the database owner or superuser role.
- Least privilege by schema, table, sequence, and operation.
- Credentials are unique per environment and service, stored in a secrets manager, rotated, and never placed in client code or source control.
- Human administrative access uses MFA, named accounts, short-lived credentials where supported, and audit logging.
- Break-glass access is time-limited, reviewed, and alerted.

### Data protection
- Encrypt network connections and storage.
- Protect backups with encryption and access controls independent of the primary database.
- Evaluate customer-managed key support and key-recovery responsibilities before selecting infrastructure.
- Classify sensitive records; minimise collection and retention.
- Never log passwords, raw tokens, verification codes, full payment credentials, or unnecessary private records.
- Keep personal contact details private and separate from public profile data.

### Recovery and resilience
- Point-in-time recovery and automated backups with documented retention.
- At least one protected backup copy isolated from routine production credentials.
- Regular restore drills into a clean environment; verify data integrity and recovery time.
- Define and test recovery point objective (RPO) and recovery time objective (RTO) before production.
- Monitor replication lag, storage, connection saturation, failed backups, unusual access, and restore failures.
- Document incident containment, credential rotation, notification assessment, and recovery ownership.

### Application and domain isolation
- Use migrations reviewed in version control; no ad hoc production schema changes.
- Enforce foreign keys, unique constraints, check constraints, and transaction boundaries.
- Database row-level security may provide defence in depth, but must not replace server-side authorisation.
- Domain services receive only the data access they require.
- Education student/tutor/institution records remain private and separately permissioned.
- Flow ledger and payment records require a separate threat model, restricted roles, immutable audit evidence, idempotency, and reconciliation. A database commit is not proof of external settlement.

## Vendor and topology selection gate

Before provisioning production, compare providers and operating models against:
- data residency and cross-border processing requirements for launch markets;
- private networking and access controls;
- encryption and key management;
- point-in-time recovery, backup isolation, export and restore;
- high availability and incident transparency;
- audit logs and security monitoring;
- predictable cost, capacity limits and scaling;
- contractual privacy, processor terms, breach notification, deletion and exit rights;
- the team's actual ability to patch, monitor and respond 24/7.

Do not select a vendor based only on price or ease of setup. Do not put production personal data into a free tier or shared development database.

## Current implementation status

This is a security and ownership standard, not a claim that a database exists. No PostgreSQL instance, cloud account, encryption key, backup, network policy, production dataset, or database credential has been provisioned by this change.
