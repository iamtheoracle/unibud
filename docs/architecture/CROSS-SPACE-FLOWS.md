# Cross-Space Flows and Shared Platform Systems

This document defines how UNIBUD spaces cooperate without collapsing into one generic feed or transferring ownership of one another's records.

## Core rule

A shared platform capability may be reused, but the domain that creates a record remains its authority. A common interface, search result, notification, assistant, or profile switcher must not silently change the record's owner, permissions, lifecycle, or retention policy.

## Shared platform capabilities

| Shared capability | Platform responsibility | Domain authority |
|---|---|---|
| Account and session | Authentication, recovery, device/session security | Identity |
| Profile switcher | Select the active personal, creator, or page/community identity | Profiles |
| Membership and grants | Issue, inspect, expire and revoke scoped access | Resource-owning domain |
| Discovery and search | Index permitted public/discoverable records and apply visibility filters | Each source domain |
| Social graph | Follow, connect, block, mute and relationship preferences | Connect, with domain-specific relationship rules |
| Messaging | Conversation transport, attachments, delivery/read state, safety controls | Conversation context and owning domain |
| Notifications | Preference-aware delivery, grouping, quiet hours and deep links | Event source plus notification service |
| Media | Upload, processing, playback, access checks, scanning and retention | Media service under source-domain policy |
| Trust and safety | Reports, blocks, moderation queues, appeals, risk signals and incident workflows | Trust & Safety with domain-specific moderators |
| Payments | Provider orchestration, payment state, refunds and reconciliation | Flow or The Quarter / booking domain as applicable |
| Audit and analytics | Protected audit trail and privacy-governed product metrics | Security/operations; domain event producers |
| Oracle Arc | Contextual assistance and approved tool execution | Oracle Arc policy plus owning domain confirmation |

## Cross-space journeys

### 1. Discovery to participation

1. A person, page, school, service, creator, opportunity or activity is published by its owning domain.
2. Search/discovery indexes only fields allowed by that record's visibility and consent settings.
3. A result opens the owning experience, not a generic copy of the record.
4. The user may follow, connect, join, request access, message, apply or book according to that domain's rules.
5. The owning domain checks permissions again when the action is submitted.

A result appearing in search is not permission to view private details or perform an action.

### 2. Connect to Wayward

- Connect may surface a Wayward experience, organiser, participant invitation or activity update.
- Wayward owns the activity, access mode, capacity, schedule, participant list, payment/ticket, chat context and lifecycle.
- Public/open, criteria-based, request-to-join, organiser approval, invite-only, capacity-limited and paid access remain distinct.
- A friend-created trip may be open to other participants without turning the trip into a forced match or requiring friendship.
- Changes to time, place, capacity, cost or cancellation notify affected participants and require the appropriate organiser/participant confirmation.
- Connect cannot override an organiser's access decision or mark a Wayward booking as confirmed.

### 3. Connect to The Quarter and service offers

- Connect can surface a provider, offer, cafeteria, delivery or domestic-service opportunity.
- The Quarter owns product/service listings, seller terms, order, payment, fulfilment, cancellation, refund and dispute records when the transaction is a marketplace transaction.
- A service arrangement owned by Concierge must still reference the provider and the relevant authoritative booking/order/payment records.
- Contextual buyer/provider chat may be pinned while an order is active and archived or retired after completion according to retention policy.
- Delivery status must come from an authorised fulfilment event, not a chat message or AI inference.

### 4. Bud, Board and academic media

- Bud owns learning plans, courses, assignments, tutoring and academic progress.
- Board is a campus map and school workspace inside Bud. It owns school-location and campus-resource records within its boundary.
- Official school notices, education news and campus happenings must carry source/type information so students can distinguish them.
- Academic videos, lectures, podcasts, seminars and saved course materials remain in Bud's academic context.
- Square owns general entertainment and creator media. A video may be linked from one space to another only when the owner and access policy permit it.
- Academic library saves retain source, owner, access rights and availability; a saved reference does not grant a right to redistribute copyrighted material.

### 5. Square, Riff and creator identity

- Creator profiles are distinct from personal profiles and page/community profiles.
- A creator may publish media in Square and participate in Riff without merging those identities or copying audience permissions.
- Riff owns its threads, replies, reactions and moderation state; Square owns its media publication and playback state.
- Cross-posting is an explicit user action and must preserve attribution, audience visibility and takedown/moderation propagation rules.
- Live sessions require clear host/moderator controls, participant safety tools and reporting.

### 6. SouLync and age boundaries

- SouLync is adults-only and has a separate dating profile and consent model.
- General Connect discovery must not expose SouLync preferences, likes, match state, private conversations or inferred dating activity.
- Age/eligibility checks must be enforced server-side before access, not by hiding a navigation item.
- Blocking/reporting and safety actions must prevent unwanted contact across relevant SouLync surfaces.
- Age-sensitive data is not used for unrelated recommendations or advertising without a separately lawful, explicit basis.

### 7. Flow and financial context

- Flow owns financial accounts, balances, ledger entries, cards, transfers, savings, school-fee plans and eligible credit records.
- Marketplace, Wayward ticketing and Concierge may request a payment through an approved payment interface, but may not read or mutate Flow's ledger directly.
- Payment intent, authorisation, capture, failure, reversal, refund and reconciliation are distinct states.
- A successful redirect, client callback or AI statement is not proof of settlement.
- Financial actions require idempotency, fraud controls, audit, reconciliation and applicable regulated partners/approvals.

### 8. Concierge orchestration

- Concierge conversation history belongs to Concierge; the actual booking/order/payment/fulfilment remains owned by its domain.
- Every proposed consequential action is presented with its material details and requires explicit confirmation from the authorised user.
- Confirmation creates a domain command with an idempotency key and scoped actor identity.
- Concierge reports success only after receiving and verifying the authoritative domain result.
- Packages track units, schedule, consumed/remaining quantity, provider, price, cancellation and renewal terms; they are not all generic subscriptions.
- Failure, partial fulfilment, rescheduling, refund and cancellation must be represented honestly in the conversation.

### 9. The Fixer and private support

- The Fixer has a private data boundary separate from public profiles, Connect discovery, advertising and general recommendation systems.
- Anonymous human support uses a protected relay identity; real identity is not disclosed by default.
- Continued contact after a temporary anonymous interaction requires mutual consent.
- Professional credentials, scope, availability, pricing, acceptance and session records are verified and access-controlled.
- Emergency guidance and confidentiality limits are clear; the service does not claim to replace emergency or clinical care.

### 10. UNIBUD Operations

- Consumer activity may create an operational request, but never directly grants a worker or agent permission to dispatch a vehicle, spend funds or make a safety decision.
- Operations verifies eligibility, people, vehicle documents, venue/supplier availability, insurance/permits, capacity and risk before assignment.
- Staff access is time-, role-, region- and task-scoped, audited and revocable.
- AI may draft plans or recommend resources; authorised humans approve dispatch, spend, refunds and safety-critical decisions.
- Incident handling, evidence retention, reconciliation and closure are explicit lifecycle stages.

## Event and integration rules

Every cross-domain event must include:
- event ID and schema version;
- event type and occurrence time;
- owning domain and record identifier;
- tenant/application scope where applicable;
- actor/service identity and correlation ID;
- minimal payload and classification;
- idempotency/deduplication strategy.

Consumers must tolerate duplicate delivery, retries, out-of-order events and unavailable downstream services. Use an outbox or equivalent durable publication mechanism for state changes that must be delivered. Do not use a client-side event or unverified webhook as authoritative proof of payment, booking, fulfilment or identity verification.

## Global requirements not to overlook

- Localisation: language, time zone, currency, address formats, units and region-specific availability.
- Accessibility: keyboard, screen reader, contrast, captions, transcripts, reduced motion and clear error recovery.
- Age and eligibility: server-enforced gates for adult-only, financial, professional and other restricted services.
- Safety: report, block, mute, appeals, moderator accountability, anti-spam, anti-fraud and incident response.
- Privacy: purpose limitation, consent, discoverability controls, retention, export, deletion and legal holds.
- Reliability: backups, restore tests, disaster recovery, graceful degradation, retries and operational ownership.
- Integrity: provenance, verification status, immutable financial history and auditable privileged actions.
- Governance: clear terms, provider/seller/organiser responsibilities, dispute paths and transparent user-facing status.
- Measurement: product analytics must be minimised, access-controlled and separated from protected audit records.

## Acceptance rule

A cross-space journey is not complete merely because a link opens. Test the full journey, including authorisation, source ownership, lifecycle transitions, notifications, failure/retry behaviour, cancellation/refund, privacy, audit and recovery. Record which service is authoritative at every step.
