# Profile Experience Model

UNIBUD has three distinct public profile families. They share account ownership and the profile-switching foundation, but they must not share one overloaded page layout.

## Personal profile

Purpose: represent an individual.

Primary experience:
- Personal identity and profile information
- Connections and relationship context
- Personal posts and highlights
- Visibility, discoverability and contact controls

The personal profile remains separate from creator publishing tools and page administration. A delegated page administrator must never receive access to the owner's personal profile or private account data.

## Creator profile

Purpose: represent a publishing identity and body of work.

Primary experience:
- Creator identity and biography
- Publishing and published content
- Featured work and portfolio
- Audience and creator links

Management experience:
- Insights and performance information
- Eligible monetisation capabilities when separately approved and available
- Profile visibility and safety controls

A creator profile is not merely a creator tab inside the personal profile. One account may own multiple creator identities.

## Page / community profile

Purpose: represent an organisation, institution, brand, business, or community.

Primary experience:
- Page identity and information
- Posts and announcements
- Followers or members
- Events and activities
- Community rules

Management experience:
- Administrators and moderators
- Membership and moderation controls
- Visibility and safety controls

Page membership and administration are scoped to the exact page/community. They do not grant access to the owner's personal profile, unrelated creator profiles, private messages, or account security.

## Shared account shell

One account can own its personal profile, multiple creator profiles, and multiple page/community profiles, and can hold separately accepted delegated access to other pages. The switcher identifies the profile family and active context clearly. Switching context does not itself authorise an action.

## Implementation and security rules

- Profile-family descriptors control presentation and navigation only.
- The server re-evaluates every read and mutation against the authenticated account, exact profile, active membership, profile status and required permission.
- Monetisation, insights, moderation and administrator controls remain unavailable until their owning domain and permissions are implemented.
- Personal identity editing and account-security settings remain separate.
- Seller, provider, school, tutor, student and staff identities remain specialised domain identities or grants, not new public profile families.
- Archive, restore, recovery and ownership transfer are separate lifecycle operations and must be implemented with explicit safeguards and audit records.

## Delivery state

The shared TypeScript presentation contract and focused contract tests define the family-specific navigation and purpose. This is not a claim that publishing, analytics, monetisation, membership, moderation or profile lifecycle workflows are complete.
