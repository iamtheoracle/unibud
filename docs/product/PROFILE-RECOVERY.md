# Profile archive, restoration and account recovery

## Profile state and ownership

Archiving is a reversible visibility/lifecycle state, not deletion, transfer, relinquishment, or loss of legal ownership. Archived profiles retain their stable profile ID, reserved handle, content records, owner relationship, and audit history. Archived profiles are excluded from ordinary active-profile discovery and switching.

Only the authenticated account that owns a Creator or Page/Community profile can archive or restore it. Delegated administrators, moderators, editors, and members cannot perform owner lifecycle actions. The personal profile is not archivable through this flow.

Ownership cannot be changed directly. A verified two-party transfer is implemented as a separate, explicit workflow with consent from the current owner and recipient, eligibility checks, grant/session review, and durable audit history. No archive, restore, account closure, or administrator role can imply transfer.

## Access preservation

The database serializes profile lifecycle operations per account. It rejects an archive that would leave no active owned profile or remove the active personal identity. When an active profile is archived, only sessions currently using that profile context have the profile context cleared; the account session itself remains active.

Restoration is owner-only and idempotent for an already active profile. Archiving suspends all active delegated memberships; restoration leaves those memberships suspended. The owner must explicitly review and reactivate or revoke each delegate after restoring the profile. Each delegate suspended by archiving receives an in-app notice; restoring the profile does not silently restore their access.

## Notifications and audit

Archive and restore each create an append-only security audit event and a durable in-app notification in the same database transaction as the profile state change. The owner can view the notification inbox and mark notifications read. Notification details are intentionally limited to profile identity/status context and must not contain credentials, private message content, or sensitive payloads.

## Account closure

Account closure must not orphan owned profiles or active delegated relationships. A closure preflight reports active and archived owned profiles plus active/suspended delegated relationships. The database currently blocks account closure while any owned profile remains (including archived profiles) or any delegated relationship remains active/suspended.

This is intentionally fail-closed. A supported transfer/release and retention process must be designed and approved before closure can proceed. There is no implicit deletion or automatic transfer in this milestone.

## Verified ownership transfer

Creator and Page/Community profiles may be transferred only through a separate two-party workflow. Personal profiles are never transferable because they are the account's personal identity.

1. The current owner reauthenticates with the password attached to their own verified email/phone identity and requests transfer to a recipient's active UNIBUD personal-profile handle.
2. The database verifies the recipient account is active and has an active verified authentication identity and personal profile.
3. Transfer is blocked while active/suspended delegates, pending invitations, another open transfer, or the owner's last active owned profile/personal identity would be affected.
4. The recipient independently reauthenticates with their own account password and accepts or declines. Acceptance alone does not change ownership.
5. The current owner reauthenticates again and explicitly finalizes. The database rechecks both accounts, both personal identities, profile status, owner membership, delegated access, and expiry inside one transaction.
6. Finalization changes the canonical profile owner and owner membership atomically, updates historical revoked membership ownership references, cancels pending invitations, revokes profile-scoped resource grants, clears active session profile contexts, and writes append-only audit events plus notifications for both parties.

Requests expire after seven days; expiry is terminal, audited and notified to both parties. Suspending/restricting either participant account, or archiving/restricting the profile, automatically cancels open transfer consent and notifies both parties. The owner may cancel an open request. Declined, cancelled, expired, and completed requests are terminal. A new transfer requires a new request and fresh consent. The profile ID, handle, identity, and profile-linked content remain attached to the transferred profile; no account credentials or personal profile data are transferred. This foundation transfers profile ownership and profile-scoped access only. It does not move account-level identity, payments, bookings, contracts, merchant/provider accounts, or other account-owned records; any future feature with those obligations must extend transfer preflight and finalization before those profiles become transferable. While a transfer is open, database triggers serialize invitation and delegated-membership changes against the profile row and block new pending invitations or active/suspended delegated access. Delegated access is never carried across ownership transfer.

The current implementation uses fresh password reauthentication for each sensitive step; raw passwords are never persisted by the transfer workflow. Authentication rate limits apply through the existing login verification path. Expired requests, loss of the last verified sign-in identity, participant-account suspension/restriction, and profile archive/restriction are terminal and audited, with durable notifications to both parties. While a transfer is open, database triggers serialize invitation and delegated-membership changes against the profile row and block new pending invitations or active/suspended delegated access. Passkey-based step-up and a broader security-review workflow remain future work and must not be implied as implemented.

## Permanent deletion and retention

Permanent profile deletion is not implemented. It must not be represented as archive, and must not be added until legal retention, user notice, content ownership, dependent records, audit retention, and recovery windows are specified and tested.

## Verification

Migrations 0015–0017 add PostgreSQL lifecycle procedures, notifications, ownership immutability, database-enforced lifecycle state transitions, automatic cancellation of open transfers when a profile becomes inactive, account-closure guards, and two-party ownership transfer. Transfer requires fresh password reauthentication by both parties and owner reauthentication again at finalization. Service, PostgreSQL and browser tests cover transfer eligibility, consent, ownership mutation, stale-grant revocation, session-context clearing, audit history and account-access safeguards. CI verification is being run against the current foundation branch; no production deployment is implied.
