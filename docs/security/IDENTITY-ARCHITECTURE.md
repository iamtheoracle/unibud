# Identity, Registration and Session Architecture

## Product requirement

UNIBUD uses its own first-party onboarding and account experience. Do not add Google or Apple sign-up buttons or make either identity provider a prerequisite for registration. The first screen should feel familiar, direct and welcoming, with a clear path to create an account or sign in. Keep onboarding focused; collect optional profile details later when they are needed.

## Identity boundaries

Keep these concepts separate:

- **Account:** the person’s platform-level identity, credentials, status, recovery and security settings.
- **Authentication identity:** a verified email address, phone number, passkey or other explicitly enabled credential bound to the account.
- **Profile:** a public or limited identity such as personal, creator, or page/community.
- **Membership/grant:** permission to act in a school, page, seller, provider, community, or other resource.
- **Staff identity:** a workforce identity with separately approved internal permissions.
- **Service identity:** a non-human workload identity with narrow service-to-service grants.
- **Agent identity:** an Oracle Arc agent identity with registered version, assigned duty and explicit tool grants.

A profile is not a login credential. Owning a page does not create another account. A page administrator does not inherit the owner’s personal account access.

## Registration journey

1. User chooses Create account or Sign in.
2. Registration collects only required credentials and account details.
3. The system verifies the selected email or phone channel before treating it as verified.
4. User chooses a unique username; uniqueness is enforced server-side and handles reserved names and case normalisation.
5. User accepts current terms and privacy notices with version and timestamp recorded.
6. Age and country/region are collected when required to determine eligibility, product availability and legal safeguards.
7. The account is created in a limited state until required verification and risk checks are complete.
8. Profile setup is a distinct step and may be deferred; users are not forced to create creator or page profiles.
9. User lands in the main UNIBUD experience with a concise explanation of how to find their spaces.

The exact credential and verification provider is an architecture decision still to be made. Do not silently bind the platform to a social sign-in provider.

## Authentication and session controls

- Passwords, if enabled, must use a modern adaptive password hash with unique salts; never store or log plaintext credentials.
- Prefer phishing-resistant passkeys as an optional later capability, not a forced dependency.
- Verification codes are short-lived, single-use, rate-limited and stored safely.
- Recovery must resist account enumeration and abuse.
- Sessions use secure, HTTP-only, same-site cookies for browser flows; rotate session identifiers after authentication and privilege changes.
- Support session revocation, logout, device/session review and suspicious-login controls.
- Apply rate limits, abuse detection, credential-stuffing protection and step-up verification for sensitive actions.
- Authentication success does not grant resource access; every request still needs authorisation.

## Authorisation model

Use deny-by-default, resource-scoped grants. An action is allowed only when the authenticated actor, active application, resource, action and current grant all match. Enforce checks on the server and at the data boundary. UI visibility is not authorisation.

Separate:
- account owner privileges;
- personal profile ownership;
- creator profile ownership and collaborators;
- page/community owners, admins and moderators;
- school/institution roles;
- seller/provider/professional roles;
- UNIBUD staff roles;
- service and agent identities.

Grants must support scope, role, issuer, effective time, expiry where relevant, revocation, and audit history.

## Privacy and data lifecycle

- Keep private by default until a user deliberately publishes or shares.
- Make discoverability, contact permissions and profile visibility separate settings.
- Do not expose email/phone as public profile fields by default.
- Support account export, deletion requests, retention holds where legally required, and transparent completion status.
- Record consent and notice versions for age-sensitive, financial, professional-support and AI data flows.
- Do not share memory or private data between UNIBUD spaces or external My Realm applications by default.

## Implementation gates

Before production authentication:
- select the credential/verification architecture and document the decision;
- define database constraints and migrations;
- implement CSRF, session rotation, recovery, rate limits and audit events;
- test cross-account, cross-profile, cross-tenant and privilege-escalation attempts;
- review privacy, abuse and account recovery threat models;
- verify deployment secrets and callback origins;
- run security tests and an independent review appropriate to launch risk.

A sign-in screen or successful login test alone is not proof of secure identity and authorisation.
