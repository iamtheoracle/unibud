# Profile Architecture

## Profile families

### Personal
Represents an individual. Includes identity, avatar, display name, username, biography, profile visibility, posts, followers/following, and highlights.

### Creator
Represents a publishing identity. Prioritises creator identity, published work, featured content, audience, links, creator tools, insights, and eligible monetisation.

### Page and community
Represents an institution, organisation, brand, business, or community. Supports its own identity, information, posts and announcements, followers or members, events, rules, administrators, moderators, and membership controls.

## Account ownership and switching

One account may own a personal profile, one or more creator profiles, and manage multiple pages or communities. Switching profile context must be explicit and understandable.

## Permission rules

- Profile ownership and delegated management are separate grants.
- Page administrators do not gain access to the owner's personal account, private messages, or unrelated profiles.
- Staff roles are separate from consumer profile roles.
- Sensitive profile actions are audited.
- Public visibility, discoverability, and contact permissions are independently configurable where appropriate.

## Additional specialised identities

Seller, school, service provider, professional, and staff identities may be specialised profile capabilities. They must not be collapsed into one overloaded personal profile or silently inherit permissions.
