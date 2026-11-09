# Profile role and permission boundaries

This policy applies only to access to one exact creator or page/community profile. A profile role is not a global account role, a staff identity, or a service-provider credential.

## Permission model

| Relationship / role | Profile read | Edit profile identity | Create/update/publish content | Moderate content | View members | Invite/revoke members | Billing / integrations |
|---|---:|---:|---:|---:|---:|---:|---:|
| Owner | Yes | Yes | Yes | Yes | Yes | Yes | Owner-controlled; separately confirmed |
| Admin | Yes | No | Yes | Yes | Yes | No | No |
| Moderator | Yes | No | No | Yes | Yes | No | No |
| Editor | Yes | No | Yes | No | No | No | No |
| Member | Yes | No | No | No | No | No | No |
| Viewer | Yes | No | No | No | No | No | No |
| Seller / provider / professional / student / staff / operator label | Profile read only | No | No | No | No | No | No |

The owner retains control of profile identity, handle, visibility, member invitations and revocation. Delegated administrators can manage permitted profile content, but cannot take ownership, change the owner's personal identity, invite/revoke members, access billing or integrations, or enter unrelated profiles.

## Specialised identities are separate

A seller, provider, professional, student, staff or operator label on a profile membership does not create the corresponding specialised identity or resource grant. Those capabilities require a separate domain identity and explicit resource-scoped grant:

- Marketplace seller permissions belong to a seller identity and the relevant seller/listing resource.
- Provider permissions belong to a provider identity and the relevant service/booking resource.
- Tutor, student and institution permissions belong to private education-domain identities and assigned records.
- Staff and operator permissions require a verified worker identity, role, assignment, region and explicit operations grant. A consumer profile membership never creates staff authority.

No role grants billing, financial approvals, dispatch, integrations or exports by implication. Those require separate, purpose-specific policy and, where relevant, explicit human confirmation.

## Enforcement

- The database permission matrix is the source of truth for profile-scoped delegated permissions.
- Every check binds the authenticated account, exact profile ID, active account, active profile and active membership.
- Unknown permissions, missing membership, suspended/revoked membership, another account's profile, and cross-profile attempts are denied.
- UI availability is only a hint. Every server action must call the authoritative permission check at its own boundary.
- Profile identity updates use a separate owner-only database procedure. Personal account identity and security details are not editable through creator/page profile editing.
- Permission changes and consequential actions must be auditable. Do not place sensitive payloads or credentials in audit metadata.

## Delivery status

The first permission matrix and owner-only creator/page identity editor are implemented in migration 0012_profile_editing_and_role_permissions.sql, the authenticated profile API, service/repository layers and profile manager. PostgreSQL 16 tests cover owner edits, admin/moderator/editor boundaries, specialised-role isolation and cross-profile denial. The migration, PostgreSQL 16 isolation tests, typecheck, unit tests, lint, browser workflows and production build passed CI at commit 89c67dd0da82eff50256b73521e004cdbc1d3201. This does not mean every future Connect, marketplace, education or operations endpoint has been wired to this policy.


## Additional fail-closed hardening

Migration `0013_fail_closed_profile_permission_checks.sql` validates permission names inside PostgreSQL before evaluating either owner or delegated membership. Unknown and NULL permission values are denied even for owners. This is intentional: compile-time TypeScript unions do not constrain runtime inputs, and a future caller must not accidentally turn an arbitrary permission string into authority. The PostgreSQL 16 profile-role test asserts both owner and editor denial for unknown permissions.
