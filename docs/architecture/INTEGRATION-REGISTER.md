# Integration Register

This register begins as a policy and inventory template. No external provider is approved merely by appearing here.

| Integration | Purpose | Data class | Status | Owner / decision |
|---|---|---|---|---|
| Identity provider | Authentication and OIDC | Identity | Undecided | Architecture decision required |
| PostgreSQL | Transactional application data | Depends on domain | Proposed | Data architecture |
| Object storage | Private media and documents | Depends on file | Undecided | ORBITS/platform |
| Local inference runtime | Private model inference | Policy-dependent | Candidate | Oracle Arc |
| Hosted model provider | Optional remote inference | Policy-dependent | Undecided | Oracle Arc |
| Payment provider | Payment execution and verification | Financial | Undecided | Flow/Quarter |
| Messaging delivery | Email/SMS/push | Contact data | Undecided | Platform |
| Maps/geocoding | Campus and experience locations | Location | Undecided | Bud/Board/Wayward |

## Approval requirements

For every integration record provider, business purpose, data sent/received, legal basis and user consent where applicable, authentication method, scopes, retention, regional processing, failure behaviour, rate limits, cost controls, incident contact, and exit strategy.

Never place credentials in frontend code or commit them to the repository. Provider selection requires a documented decision and a tested integration.
