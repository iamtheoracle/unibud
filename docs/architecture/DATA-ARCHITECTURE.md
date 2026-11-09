# Data Architecture Principles

## Ownership

Every domain record must have an explicit owning domain, creator/owner identity, tenant or application scope where relevant, lifecycle state, and retention classification.

## Domain ownership

- Identity owns accounts, credentials, and authentication identities.
- Profiles own profile-specific content and management grants.
- Connect owns discovery relationships and connection preferences.
- Bud owns academic planning and learning records.
- Board owns campus maps, school resources, and campus-specific information within Bud's boundary.
- Flow owns financial product state and provider-linked financial records.
- Square owns general media and creator publishing records.
- The Quarter owns listings, carts, orders, fulfilment, refunds, and disputes.
- Wayward owns experiences, participation, schedules, and activity lifecycle.
- SouLync owns dating preferences and relationship interactions.
- Concierge owns conversation context and service workflow references, not the underlying financial or marketplace ledger.
- Operations owns staff assignments, fleet, dispatch, incidents, and delivery evidence.
- Oracle Arc owns its app registry, agent/tool configuration, evaluation traces, and explicitly permitted memory/file metadata.

## Isolation

Use explicit foreign keys and server-side authorisation. Database row-level security may add defence in depth but does not replace application policy. Database owners, superusers, and privileged service identities require careful treatment.

## Financial records

Financial ledger entries must be immutable or corrected through compensating entries. Store provider references, idempotency keys, status transitions, reconciliation evidence, and timestamps. Do not derive a balance from unverified UI state.

## Media and files

Store file metadata separately from object bytes. Enforce private-by-default access, signed/short-lived access where appropriate, content validation, malware scanning, retention, deletion workflows, and audit history.

## Events and audit

Use durable domain events for reliable cross-domain workflows. Events must be versioned, idempotent to consume, and contain only the data needed by subscribers. Keep security and consequential-action audit records protected from ordinary user modification.
