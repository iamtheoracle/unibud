# UNIBUD OS — Identity & Access Domain Specification (IAD)

> **Revision:** v1.2 · **Date:** 2026-08-01
> **Parent:** UNIBUD OS Core Architecture v1.0 (frozen) · IACP v1.1
> **Status:** Active Revision — Domain Architecture Extension
> **Milestone:** 14.1

---

## 1. Purpose

The Identity & Access Domain (IAD) is the authoritative source for **who exists** on the platform, **who they are**, **what they can do**, and **how they prove it**. Every other domain depends on IAD for identity resolution, authorization decisions, tenant scoping, and session context.

IAD is not a feature — it is the trust foundation. No academic record, financial transaction, community post, or AI interaction is valid without an authenticated, authorized identity established through this domain.

---

## 2. Scope

### In Scope

| Concern | Ownership |
|---|---|
| User identity (students, staff, lecturers, admins, founders) | IAD |
| Authentication (email/password, OAuth, OTP, session management) | IAD (delegates mechanics to platform) |
| Authorization (RBAC, authority codes, RLS policy enforcement) | IAD |
| Tenant identity (institutions, campuses, organizations) | IAD |
| Role & permission assignment | IAD |
| Session lifecycle (creation, validation, expiration, revocation) | Platform-owned; IAD governs policy |
| Device trust & session binding | IAD |
| Identity verification (KYC, matriculation verification) | IAD (coordinates with Finance/Trust domains) |
| Consent management | IAD |
| API key & service account identity | IAD |

### Out of Scope (Owned by Platform)

| Concern | Owner | Rationale |
|---|---|---|
| Token issuance & cryptographic signing | Base44 platform | Cannot be reimplemented; platform owns JWT/session infrastructure |
| Password hashing & storage | Base44 platform | Platform auth backend |
| OAuth provider configuration | Base44 platform | Platform connector infrastructure |
| Email verification token generation | Base44 platform | `register` → `verifyOtp` flow is platform-native |
| Multi-factor authentication enforcement | Base44 platform | Not natively available (documented gap) |

IAD **governs policy** for all of the above but does not **reimplement** platform-owned mechanics. This is the Native Engineering Constitution (v1.0 §1.7).

---

## 3. Responsibilities

| # | Responsibility | Description |
|---|---|---|
| R1 | Identity Provisioning | Create, update, and deactivate user identities |
| R2 | Authentication Policy | Define which auth methods are permitted per role/tenant |
| R3 | Authorization Enforcement | Resolve permissions for every entity operation |
| R4 | Tenant Isolation | Enforce `institution_id` scoping via RLS |
| R5 | Role Management | Define, assign, and revoke roles |
| R6 | Session Governance | Define session policies (persistence, sensitive-action re-auth) |
| R7 | Verification | Verify identity claims (matriculation, email, KYC) |
| R8 | Consent Management | Record and enforce user consent |
| R9 | Audit | Log all identity and access events |
| R10 | Delegation | Delegate execution to specialist agents via Oracle |

---

## 4. Bounded Context

### Context Boundary

IAD is bounded by the question: **"Who is this, and what are they allowed to do?"**

- **Identity resolution** ends at the User entity + its verification status.
- **Authorization** ends at the permission decision (allow/deny) for a specific operation on a specific entity.
- **Tenant scoping** ends at `institution_id` resolution.

### What IAD Does NOT Decide

- Whether a student is *enrolled* in a course (Academic Domain decides; IAD only confirms the student identity is valid).
- Whether a user has *financial* clearance (Finance Domain decides; IAD provides the identity).
- Whether content is *appropriate* (Community Domain's Guardian decides; IAD provides the actor identity for moderation).

### Cross-Context Contracts

Other domains consume IAD through:

| Contract | Mechanism |
|---|---|
| `{{user.id}}` | RLS template variable — resolved by IAD on every entity operation |
| `{{user.data.institution_id}}` | RLS tenant scope — resolved by IAD |
| `{{user.role}}` | RLS role condition — resolved by IAD |
| `base44.auth.me()` | SDK call — returns current authenticated identity |
| `base44.auth.isAuthenticated()` | SDK call — returns session validity |

---

## 5. Domain Principles

1. **Identity is singular.** One User = one identity. No duplicate accounts per person.
2. **Tenant isolation is non-negotiable.** Every tenant-scoped entity enforces `institution_id` in RLS.
3. **Authorization is explicit.** No entity operation is allowed without a matching RLS rule. Open creates/reads are a vulnerability, not a feature.
4. **Sensitive actions require re-authentication.** Session persistence never bypasses security for financial, permission, or destructive operations.
5. **Verification is progressive.** Identity starts unverified and accumulates trust (email → matriculation → KYC).
6. **Consent is explicit and revocable.** Every data use that requires consent has a `ConsentLink` record keyed by `{{user.id}}`.
7. **Oracle is invisible.** No identity operation exposes Oracle. All governance flows through Bud.
8. **Platform-native.** Auth mechanics are delegated to Base44. IAD governs policy, not plumbing.

---

## 6. Canonical Entities

All entities are JSON schemas in `base44/entities/`. Built-in attributes (never declared): `id`, `created_date`, `updated_date`, `created_by_id`.

### 6.1 User (Built-in, Platform-Owned)

| Field | Type | Notes |
|---|---|---|
| `id` | string | Primary key |
| `email` | string | Unique, platform-managed |
| `full_name` | string | Display name |
| `role` | enum | `admin` \| `user` (customizable; IAD extends with `Operator`, `Lecturer`, etc.) |
| `created_date` | datetime | Platform-managed |

**Cannot be created via SDK.** Users join via `base44.users.inviteUser(email, role)`.

### 6.2 Institution

| Field | Type | Notes |
|---|---|---|
| `name` | string | University name |
| `type` | enum | university, polytechnic, college, institute |
| `logo_url` | string | Tenant branding |
| `branding` | object | Color scheme, custom assets |
| `status` | enum | active, suspended, archived |

**RLS:** Admin-only create/update/delete. Public read (for directory).

### 6.3 StudentIdentifier

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Links to User |
| `matriculation_number` | string | Institution-assigned ID |
| `student_id` | string | Alternative ID |
| `verified` | boolean | Matriculation verification status |

**RLS:** Owner-only + admin.

### 6.4 Role

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., `student`, `lecturer`, `registrar` |
| `permissions` | array | Permission codes |
| `institution_id` | string | Tenant scope |
| `is_system` | boolean | Built-in vs custom |

### 6.5 OperatorRole

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g., `admissions_operator`, `finance_operator` |
| `scope` | string | Institution or platform-wide |
| `permissions` | array | Operator-specific permissions |

### 6.6 OperatorAssignment

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Assigned operator |
| `role_id` | string | OperatorRole reference |
| `institution_id` | string | Tenant scope |
| `status` | enum | active, revoked |

### 6.7 VerificationRequest

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Identity being verified |
| `type` | enum | matriculation, email, kyc, staff |
| `status` | enum | pending, approved, rejected |
| `evidence_url` | string | Uploaded proof |
| `reviewer_id` | string | Admin who reviewed |
| `reviewed_at` | datetime | |

### 6.8 ConsentLink

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | `{{user.id}}` — consent owner |
| `scope` | string | What consent covers |
| `granted` | boolean | Consent state |
| `granted_at` | datetime | |
| `expires_at` | datetime | Optional expiry |
| `revoked_at` | datetime | If revoked |

### 6.9 Device

| Field | Type | Notes |
|---|---|---|
| `user_id` | string | Owner |
| `device_name` | string | User-agent / model |
| `device_fingerprint` | string | Unique device hash |
| `trusted` | boolean | Trusted device flag |
| `last_seen` | datetime | |

### 6.10 ApiKey

| Field | Type | Notes |
|---|---|---|
| `name` | string | Descriptive label |
| `key_hash` | string | Hashed key (never plaintext) |
| `scopes` | array | Permission scopes |
| `created_by_id` | string | Owner |
| `status` | enum | active, revoked |
| `expires_at` | datetime | |

### 6.11 SecurityEvent

| Field | Type | Notes |
|---|---|---|
| `type` | string | login_failed, suspicious_activity, breach |
| `severity` | enum | info, warning, critical |
| `user_id` | string | Related user (if any) |
| `metadata` | object | Structured context |

### 6.12 AuditLog

| Field | Type | Notes |
|---|---|---|
| `actor_id` | string | Who performed the action |
| `action` | string | What was done |
| `detail` | string | Human-readable summary |
| `meta` | object | Structured context |
| `entity_type` | string | Affected entity |
| `entity_id` | string | Affected record |

---

## 7. Value Objects

Value objects are not persisted independently — they are embedded in entities or used transiently.

| Value Object | Type | Description |
|---|---|---|
| `EmailAddress` | string | Validated email format |
| `PermissionCode` | string | e.g., `academic.read`, `finance.write` |
| `AuthorityCode` | string | Hash-verified executive token (A0–A4) |
| `TenantId` | string | `institution_id` reference |
| `SessionContext` | object | `{ userId, role, institutionId, deviceFingerprint }` |
| `VerificationLevel` | enum | `unverified`, `email_verified`, `matriculation_verified`, `kyc_verified` |
| `AuthMethod` | enum | `password`, `google`, `otp` |

---

## 8. Aggregates

### Aggregate 1: User Identity

**Root:** `User`
**Members:** `StudentIdentifier`, `VerificationRequest`, `ConsentLink`, `Device`

**Invariants:**
- One User has at most one active `StudentIdentifier` per institution.
- Verification level monotonically increases (never downgrades without admin action).
- Consent must be granted before any data use that requires it.

**Consistency:** All members are loaded/updated through the User root. RLS enforces ownership (`created_by_id: "{{user.id}}"`).

### Aggregate 2: Tenant

**Root:** `Institution`
**Members:** `Role`, `OperatorRole`, `OperatorAssignment`

**Invariants:**
- Roles are scoped to one institution (or platform-wide if `institution_id` is null).
- Operator assignments reference a valid, active OperatorRole.

### Aggregate 3: Access Credential

**Root:** `ApiKey` (or platform-managed session token)
**Members:** `SecurityEvent` (related)

**Invariants:**
- Keys are hashed, never stored plaintext.
- Revocation is immediate and permanent.

---

## 9. Domain Services

Domain services contain business logic that doesn't belong to a single entity.

| Service | Implementation | Responsibility |
|---|---|---|
| `IdentityService` | `base44.auth.*` SDK | Authenticate, resolve current user, update profile |
| `AuthorizationService` | RLS engine (platform) | Evaluate permission for entity operations |
| `TenantService` | `src/lib/institution/` | Resolve institution context, manage tenant scoping |
| `VerificationService` | `src/lib/identity/` | Submit, review, and record identity verifications |
| `ConsentService` | `ConsentLink` entity | Record, check, and revoke consent |
| `RoleService` | `Role` / `OperatorRole` entities | Assign and revoke roles |
| `AuditService` | `logExecutiveAction` function | Log identity and access events |

---

## 10. Application Services

Application services orchestrate domain services for use-case flows.

| Service | Flow |
|---|---|
| `RegistrationFlow` | `register` → OTP → `verifyOtp` → `setToken` → redirect |
| `LoginFlow` | `loginViaEmailPassword` / `loginWithProvider` → redirect |
| `PasswordResetFlow` | `resetPasswordRequest` → email → `resetPassword` → redirect |
| `OnboardingFlow` | Welcome → Register → MeetBud → ModeSelector → OnboardingConversation → Security → Preparing → OracleAuthRouter |
| `VerificationFlow` | Submit evidence → admin review → approve/reject → update verification level |
| `RoleAssignmentFlow` | Admin invites (`inviteUser`) → user accepts → role assigned |
| `OperatorAssignmentFlow` | Admin assigns OperatorRole → OperatorAssignment created → operator sees tasks |
| `SensitiveActionGuard` | Re-authentication gate for financial/permission/destructive actions |

---

## 11. Commands

Commands are write operations that change state.

| Command | Auth Requirement | Effect |
|---|---|---|
| `RegisterUser` | Public | Creates unverified User, sends OTP |
| `VerifyOtp` | Unauthenticated (OTP proof) | Activates User session |
| `LoginViaPassword` | Public | Authenticates, sets session |
| `LoginViaProvider` | OAuth flow | Authenticates, sets session |
| `Logout` | Authenticated | Destroys session |
| `UpdateProfile` | Owner | Updates `full_name`, custom data |
| `InviteUser` | Admin | Sends invitation email |
| `AssignRole` | Admin + authority code | Changes User.role |
| `AssignOperatorRole` | Admin + authority code | Creates OperatorAssignment |
| `SubmitVerification` | Owner | Creates VerificationRequest |
| `ReviewVerification` | Admin | Approves/rejects VerificationRequest |
| `GrantConsent` | Owner | Creates/updates ConsentLink |
| `RevokeConsent` | Owner | Marks ConsentLink revoked |
| `TrustDevice` | Owner | Sets Device.trusted = true |
| `RevokeDevice` | Owner | Sets Device.trusted = false |
| `CreateApiKey` | Admin | Creates hashed ApiKey |
| `RevokeApiKey` | Admin | Sets ApiKey.status = revoked |
| `DeleteAccount` | Owner + re-auth | Permanently removes User data |

---

## 12. Queries

Queries are read operations that do not change state.

| Query | Access | Returns |
|---|---|---|
| `GetCurrentUser` | Authenticated | `base44.auth.me()` result |
| `IsAuthenticated` | Public | Boolean |
| `GetUserById` | Admin | User record |
| `ListUsers` | Admin | Paginated users |
| `GetInstitution` | Public | Institution record |
| `ListInstitutions` | Public | Directory |
| `GetStudentIdentifier` | Owner/Admin | StudentIdentifier |
| `ListVerificationRequests` | Admin | Pending requests |
| `GetConsentStatus` | Owner/Admin | Consent state |
| `ListDevices` | Owner | Trusted/untrusted devices |
| `ListSecurityEvents` | Admin | Security log |
| `ListAuditLogs` | Admin | Audit trail |
| `ListApiKeys` | Admin | API keys (hashed) |
| `CheckPermission` | System | Permission decision for entity operation |

---

## 13. Events

Events are published through entity realtime subscriptions.

| Event | Trigger | Consumers |
|---|---|---|
| `UserRegistered` | `register()` completes | Welcome flow, Bud greeting |
| `UserVerified` | OTP verified | Onboarding continues |
| `ProfileUpdated` | `updateMe()` | Cache invalidation |
| `RoleAssigned` | Admin assigns role | OracleAuthRouter re-routes |
| `OperatorAssigned` | OperatorAssignment created | Operator portal access granted |
| `VerificationSubmitted` | VerificationRequest created | Admin notification |
| `VerificationApproved` | Admin approves | StudentIdentifier verified, Bud congratulates |
| `VerificationRejected` | Admin rejects | User notified with reason |
| `ConsentGranted` | ConsentLink updated | Data use enabled |
| `ConsentRevoked` | ConsentLink revoked | Data use disabled, retention enforced |
| `DeviceTrusted` / `DeviceRevoked` | Device updated | Session policy adjusted |
| `SecurityEventRaised` | SecurityEvent created | Sentinel agent, Oracle alert |
| `ApiKeyRevoked` | ApiKey.status = revoked | Immediate access termination |
| `AccountDeleted` | deleteAccount completes | Data cascade, audit retention |
| `LoginFailed` | Auth error | SecurityEvent, rate limiting |

### Event Format

```js
{
  id: "evt_...",
  type: "UserVerified",
  data: { user_id, verified_at },
  created_date: "2026-..."
}
```

---

## 14. APIs

### Platform-Native SDK (Primary)

```js
base44.auth.me()
base44.auth.isAuthenticated()
base44.auth.updateMe(data)
base44.auth.logout(redirectUrl?)
base44.auth.redirectToLogin(nextUrl?)
base44.auth.register({ email, password })
base44.auth.verifyOtp({ email, otpCode })
base44.auth.resendOtp(email)
base44.auth.resetPasswordRequest(email)
base44.auth.resetPassword({ resetToken, newPassword })
base44.auth.loginViaEmailPassword(email, password)
base44.auth.loginWithProvider(provider, fromUrl)

base44.users.inviteUser(email, role)
```

### Backend Functions

| Function | Purpose |
|---|---|
| `verifyAuthorityCode` | Hash-verify executive authority codes (A0–A4) |
| `logExecutiveAction` | Record identity/authority actions to AuditLog |
| `validatePlatformAccess` | Validate access for gated routes |
| `deleteAccount` | Permanently remove user and cascaded data |

### Entity SDK

```js
base44.entities.User.list()
base44.entities.Institution.list()
base44.entities.StudentIdentifier.filter({ user_id })
base44.entities.Role.filter({ institution_id })
base44.entities.VerificationRequest.filter({ status: "pending" })
base44.entities.ConsentLink.filter({ user_id })
base44.entities.Device.filter({ user_id })
base44.entities.AuditLog.filter({ actor_id })
base44.entities.SecurityEvent.list("-created_date", 50)
base44.entities.ApiKey.filter({ created_by_id })
```

---

## 15. Permissions

### RLS Patterns

| Pattern | Rule | Usage |
|---|---|---|
| **Ownership** | `created_by_id: "{{user.id}}"` | User-owned records (devices, consent, identifiers) |
| **Role-based** | `user_condition: { role: "admin" }` | Admin-only operations |
| **Tenant** | `data.institution_id: "{{user.data.institution_id}}"` | Institution scoping |
| **User-scoped** | `data.user_id: "{{user.id}}"` | Personal data |

### Authority Code Tiers

| Tier | Level | Scope |
|---|---|---|
| A0 | Founder | Full platform control |
| A1 | Executive | Platform-wide governance |
| A2 | Administrative | Institution-wide management |
| A3 | Operational | Department/feature management |
| A4 | Supervisory | Read-only oversight |

**Verification:** Hash-based, deduplication, replay protection via `verifyAuthorityCode`.

### Sensitive Action Matrix

| Action | Required Verification |
|---|---|
| Change password | Re-authentication (current password) |
| Financial operations | Re-auth or authority code |
| Role/permission changes | Authority code + re-auth |
| Account deletion | Re-auth + explicit confirmation |
| Security settings | Re-auth |
| Data export (sensitive) | Re-auth |

---

## 16. Workflows

| Workflow | Trigger | Effect |
|---|---|---|
| `Welcome New Student` | `UserRegistered` + `UserVerified` | Bud sends greeting, onboarding continues |
| `app_user_auth` trigger | User signup/login | OracleAuthRouter routes to correct portal |

---

## 17. AI Interactions

### Bud

Bud is the **only** AI users interact with for identity actions. Users never directly manage roles or permissions — they ask Bud, who routes through Oracle.

| Intent | Bud Action | Authority Required |
|---|---|---|
| "Change my password" | Guides to `/forgot-password` or re-auth flow | None (self-service) |
| "Who can access my data?" | Explains RLS scoping | None |
| "I want to verify my student ID" | Routes to VerificationRequest flow | None |
| "Grant consent for X" | Creates ConsentLink | None (owner) |
| "Add an operator" | Routes to admin → AssignOperatorRole | A2+ authority code |
| "What's my verification level?" | Reads VerificationRequest status | None (self-query) |

### Oracle

Oracle validates all authority code usage for role/permission changes. `verifyAuthorityCode` is called before any A0–A4 action. `logExecutiveAction` records the event.

### Sentinel Agent

Monitors `SecurityEvent` entries. Escalates critical events (breach, suspicious activity) to Oracle and Founder.

---

## 18. Integration Points

| Integration | Direction | Mechanism |
|---|---|---|
| Google OAuth (login) | Inbound | `loginWithProvider("google")` |
| Google Calendar (identity-linked) | Bidirectional | `googleCalendarSync` function + connector |
| Stripe (identity for payments) | Outbound | User identity resolved at checkout |
| Institution data sync | Bidirectional | `universityConnectSync` / `universityConnectBgSync` |
| Email delivery | Outbound | `SendEmail` (registered users only) |
| Student search | Inbound | `studentSearch` function |

---

## 19. Security Requirements

1. **No plaintext credentials.** Passwords hashed by platform; API keys hashed before storage.
2. **Re-authentication for sensitive actions.** Session persistence never bypasses security gates.
3. **Authority codes are hash-verified and replay-protected.** `verifyAuthorityCode` enforces this.
4. **All identity events are auditable.** `AuditLog` records every role change, verification, consent grant/revoke, and authority code usage.
5. **Tenant isolation is enforced at the RLS layer**, not application code. No entity operation can bypass RLS.
6. **Security events are monitored** by Sentinel agent and surface on Oracle Security Center.
7. **Device trust is opt-in.** "Keep me signed in" never auto-enables; trusted devices are explicitly marked by the user.
8. **Account deletion is permanent and cascading.** `deleteAccount` function removes user data across all entities (respecting audit retention).

---

## 20. Privacy Requirements

1. **Student-centric model.** No parent/guardian portals. Students own their data.
2. **Matriculation privacy.** `src/lib/matriculationPrivacy.js` governs academic record visibility — matriculation numbers are not exposed to peers.
3. **Consent is explicit and revocable.** `ConsentLink` keyed by `{{user.id}}`. No data use without consent record.
4. **Presence privacy.** "Offline" status hides user from peer presence reads (Presence entity RLS).
5. **Data retention.** Deleted information is not retained beyond policy. `BudMemory` has retention policies.
6. **No PII in analytics.** `base44.analytics.track()` uses event names + minimal properties, no PII.

---

## 21. Audit Requirements

| Event | Logged To | Retention |
|---|---|---|
| Authority code usage | `AuditLog` via `logExecutiveAction` | Permanent |
| Role assignment/revoke | `AuditLog` | Permanent |
| Verification approval/rejection | `AuditLog` + `VerificationRequest` | Permanent |
| Consent grant/revoke | `AuditLog` + `ConsentLink` | Per policy |
| API key creation/revocation | `AuditLog` | Permanent |
| Security events | `SecurityEvent` | Permanent |
| Account deletion | `AuditLog` | Permanent (entity data removed, audit retained) |
| Login failures | `SecurityEvent` | Per policy |

---

## 22. Data Ownership

| Entity | Owner | Tenant-Scoped? |
|---|---|---|
| `User` | Platform (built-in) | No (global) |
| `Institution` | Platform | N/A (is the tenant) |
| `StudentIdentifier` | User | No (personal) |
| `Role` | Institution or Platform | Yes |
| `OperatorRole` | Institution or Platform | Yes |
| `OperatorAssignment` | Institution | Yes |
| `VerificationRequest` | User | No (personal) |
| `ConsentLink` | User | No (personal) |
| `Device` | User | No (personal) |
| `ApiKey` | User (creator) | No (personal) |
| `SecurityEvent` | Platform | No (global, admin-only) |
| `AuditLog` | Platform | No (global, admin-only) |

---

## 23. Lifecycle

### User Lifecycle

```
Invited/Registered → Unverified → Email Verified → Onboarded → Active
                                                              ↓
                                                    Suspended (admin action)
                                                              ↓
                                                    Reactivated
                                                              ↓
                                                    Deleted (permanent)
```

### Institution Lifecycle

```
Provisioned → Onboarding → Active → Suspended → Archived
```

### Verification Lifecycle

```
Pending → Under Review → Approved / Rejected
```

### Consent Lifecycle

```
Granted → Active → Revoked (by user) / Expired (by time)
```

### API Key Lifecycle

```
Created → Active → Revoked (permanent)
```

---

## 24. Extension Points

| Extension | Mechanism |
|---|---|
| Custom roles | `Role` entity (admin-managed) |
| Custom operator roles | `OperatorRole` entity |
| New auth providers | Platform connectors (OAuth) |
| New verification types | `VerificationRequest.type` enum extension |
| New consent scopes | `ConsentLink.scope` (free-form) |
| New authority codes | Oracle governance (A0–A4 tiers, IACP Part VI) |
| New security event types | `SecurityEvent.type` extension |
| New audit actions | `AuditLog.action` extension |

---

## 25. Conformance Requirements

Any implementation claiming conformance to this specification must:

- [ ] Enforce RLS on every identity-related entity (no open writes)
- [ ] Route all authority code usage through `verifyAuthorityCode`
- [ ] Log all executive actions to `AuditLog`
- [ ] Require re-authentication for sensitive actions
- [ ] Enforce tenant isolation via `institution_id` where applicable
- [ ] Never store plaintext credentials
- [ ] Provide consent management keyed by `{{user.id}}`
- [ ] Support progressive verification (email → matriculation → KYC)
- [ ] Never expose Oracle's command identifier publicly
- [ ] Never bypass the platform auth backend (no custom JWT/session logic)
- [ ] Audit all role/permission changes
- [ ] Support account deletion with cascading data removal

---

## Implementation Mapping

| Spec Concept | v1.0 Implementation |
|---|---|
| User identity | Built-in `User` entity + `base44.auth.*` |
| Tenant | `Institution` entity |
| Student identifier | `StudentIdentifier` entity |
| Roles | `User.role` + `Role` + `OperatorRole` + `OperatorAssignment` |
| Verification | `VerificationRequest` entity + `src/lib/identity/` |
| Consent | `ConsentLink` entity |
| Devices | `Device` entity |
| API keys | `ApiKey` entity |
| Authority codes | `verifyAuthorityCode` function + `src/lib/oracle/authorityCodes.js` |
| Audit | `AuditLog` entity + `logExecutiveAction` function |
| Security | `SecurityEvent` entity + `/security` SecurityCenter |
| Auth flows | `src/pages/Login.jsx`, `Register.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx` |
| Role routing | `src/pages/auth/OracleAuthRouter.jsx` |
| Access guard | `src/components/auth/OracleWorkspaceGuard.jsx` + `src/components/ProtectedRoute.jsx` |
| Matriculation privacy | `src/lib/matriculationPrivacy.js` |
| Institution management | `src/pages/institution/InstitutionPortal.jsx` (14 sections) |
| User governance | Oracle `UserGovernance` section |
| Audit center | Oracle `AuditCenter` section |
| Security center | Oracle `OracleSecurity` + `/security` SecurityCenter |

---

## Known Limitations (Platform-Dependent)

These are documented gaps — not IAD failures, but platform constraints:

1. **Biometric login** (Face ID / Touch ID) — not natively available
2. **Multi-Factor Authentication (MFA)** — not natively available
3. **Trusted-device management** — `Device` entity exists; full trust management is platform-dependent
4. **User-controlled "keep me signed in"** — platform manages sessions
5. **Email change/verification flow** — cannot be implemented natively on current Auth schema

These are **deferred until the platform supports them**. The UI reserves the controls; they are non-functional until then.

---

## Revision History

| Version | Date | Change |
|---|---|---|
| v1.2 | 2026-08-01 | Added Identity & Access Domain Specification (IAD) — Domain Architecture Extension to frozen v1.0 |

---

*UNIBUD OS — Identity & Access Domain Specification (IAD) v1.2*
*Extends frozen v1.0 master architecture. Single source of truth for identity, authentication, authorization, and tenant isolation.*