# Profile archive, restoration and account recovery

## Profile state and ownership

Archiving is a reversible visibility/lifecycle state, not deletion, transfer, relinquishment, or loss of legal ownership. Archived profiles retain their stable profile ID, reserved handle, content records, owner relationship, and audit history. Archived profiles are excluded from ordinary active-profile discovery and switching.

Only the authenticated account that owns a Creator or Page/Community profile can archive or restore it. Delegated administrators, moderators, editors, and members cannot perform owner lifecycle actions. The personal profile is not archivable through this flow.

Ownership is immutable in the current implementation. A future transfer must be a separate, explicit workflow with verified consent from the current owner and recipient, eligibility checks, conflict handling, a complete grant/session review, and durable audit history. No archive, restore, account closure, or administrator role can imply transfer.

## Access preservation

The database serializes profile lifecycle operations per account. It rejects an archive that would leave no active owned profile or remove the active personal identity. When an active profile is archived, only sessions currently using that profile context have the profile context cleared; the account session itself remains active.

Restoration is owner-only and idempotent for an already active profile. It does not automatically reinstate delegated access that was suspended or revoked independently.

## Notifications and audit

Archive and restore each create an append-only security audit event and a durable in-app notification in the same database transaction as the profile state change. The owner can view the notification inbox and mark notifications read. Notification details are intentionally limited to profile identity/status context and must not contain credentials, private message content, or sensitive payloads.

## Account closure

Account closure must not orphan owned profiles or active delegated relationships. A closure preflight reports active and archived owned profiles plus active/suspended delegated relationships. The database currently blocks account closure while any owned profile remains (including archived profiles) or any delegated relationship remains active/suspended.

This is intentionally fail-closed. A supported transfer/release and retention process must be designed and approved before closure can proceed. There is no implicit deletion or automatic transfer in this milestone.

## Permanent deletion and retention

Permanent profile deletion is not implemented. It must not be represented as archive, and must not be added until legal retention, user notice, content ownership, dependent records, audit retention, and recovery windows are specified and tested.

## Verification

Migration 0016 adds PostgreSQL guards, notification storage and authenticated procedures. Service and PostgreSQL tests cover owner scoping, closure preflight, immutable ownership, and blocked closure. Browser coverage stubs the notification boundary so profile workflows remain deterministic.
