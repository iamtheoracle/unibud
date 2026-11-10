# UNIBUD and My Realm Network — Expanded Capability Scope

Status: preserved product requirements; not a claim that these products, financial rails, AI tools, or regulated permissions are implemented or live.

## Product boundaries

UNIBUD remains a social platform for teenagers and students. Its release scope must not silently absorb adult gambling, lending, investment execution, or other regulated financial services. The modules below are distinct products/interfaces with explicit ownership, permission, age, data, and release boundaries.

- **Flow** is the student-focused money and banking interface. It is not The Quarter marketplace and must not become a general marketplace.
- **The Quarter** is the commerce and finance marketplace: merchants, P2P, goods, services, food, housing/hostels, fashion/resale, referrals and eligible pay-later checkout.
- **Bud**, **The Concierge**, and **The Fixer** are AI application interfaces, not merely decorative chat widgets. Each has a distinct role, permitted tools, memory scope, escalation path and user-facing experience.
- **Tutor** and **Institution** are distinct, non-public profile types. Institutions may manage eligible students and tutors through explicit delegated permissions. Neither is to be exposed publicly until its planned implementation and release gate.
- **Wayward** remains a separate games/entertainment concept. Real-money gambling is not part of the UNIBUD teen/student release.

## Flow — full student banking and money-management capability target

### Accounts and everyday banking
- Individual accounts, account details, balances, statements, transaction history, pending/posted/reversed states, searchable transactions, downloadable statements and receipts.
- Internal transfers, beneficiary management, scheduled and recurring transfers, payment requests, bill payments, tuition payments, merchant payments and supported local payment methods.
- Clear transfer lifecycle, fees, limits, cut-off times, settlement evidence, reversals, disputes and notifications. Never describe a pending or simulated movement as settled.
- Account controls: freeze/unfreeze where legally supported, card controls, limits, trusted devices, sessions, alerts, beneficiary cooling-off and fraud reporting.
- Reconciliation, ledger integrity, double-entry accounting, idempotency, audit trail, exception queues and operator approvals.

### Debit and credit cards
- Virtual and physical debit cards, issuance/activation, PIN lifecycle, replacement, expiry, tokenized wallet provisioning where supported, card-present and online controls, freeze/unfreeze, merchant/category and geographic controls, spending limits, transaction alerts, dispute/chargeback workflow and card lifecycle status.
- Credit cards only after a separately approved underwriting and licensed issuer/processor arrangement: eligibility, application, affordability checks, credit limit, available credit, APR/interest, fees, billing cycle, statements, minimum payment, full balance payment, due dates, grace period, repayment allocation, delinquency, hardship, disputes, chargebacks, fraud and card controls.
- Debit, credit and stored-value balances must be clearly distinguished. A card design or internal ledger does not itself issue a real payment card.

### Savings, flex money and credit
- Savings goals, named pots/vaults, recurring deposits, round-ups where supported, lock/flexible savings products, target dates, progress, withdrawal rules, rates/returns, fees, maturity and early-withdrawal consequences.
- **Flex money** must be explicitly classified per product: flexible access to a user's own savings, an overdraft, a salary advance, a loan, or a buy-now-pay-later facility. Do not blur own funds and borrowed funds.
- Loans: product disclosure, eligibility, application, KYC, affordability and credit checks, offers, APR/effective cost, fees, repayment schedule, disbursement evidence, servicing, early repayment, arrears, hardship/restructuring, collections safeguards, complaints and statements.
- Buy now, pay later / buy on credit: merchant and customer eligibility, clear total cost, instalments, due-date reminders, repayment methods, refunds and cancellation allocation, missed-payment handling, affordability controls, dispute handling, cooling-off and responsible lending checks.
- No lending or credit line is activated without required licences/partners, underwriting controls, disclosures, consent and local legal review.

### FX and international money
- Supported currency balances, indicative vs executable quotes, quote expiry, spread and fee disclosure, conversion preview/confirmation, transaction receipts, limits, funding/withdrawal methods, remittance tracking, sanctions/AML screening and reconciliation.
- Currency pairs, rate charts/history and alerts; distinguish informational market rates from executable customer rates.
- Cross-border transfers only through approved providers and corridors with transparent delivery estimates, fees, compliance and failure/refund paths.

### Investments
- Investment education and research, watchlists, market data with source/time labels, instrument discovery, portfolio valuation, holdings, cost basis, performance, dividends/corporate actions, order tickets, order lifecycle, confirmations, statements, fees/taxes and risk disclosures.
- Stocks, funds, bonds, fixed-income, money-market and other instruments only where products, custody, execution and jurisdictional permissions are confirmed.
- Suitability/appropriateness, risk profiling, investment objectives, fractional-share and recurring-investment rules where supported, market hours, trading halts, liquidity and loss disclosures.
- Paper/simulated portfolios must be visibly separated from funded brokerage accounts. No fabricated prices, fills, returns, custody or settlement.

## The Quarter — commerce and pay-later marketplace

- Buyer and seller accounts, merchant/storefront profiles, product/service catalogue, inventory, search, categories, filters, availability, pricing, tax/fees, shipping/delivery or fulfilment, checkout, receipts, order history and cancellation/returns/refunds.
- P2P listings, supermarkets/restaurants, housing and hostel rentals, fashion/resale, referrals, professional/local services and other approved categories.
- Buyer-vendor messaging, offers/negotiation, reviews/moderation, seller verification, fraud reporting, disputes, chargeback evidence, fulfilment tracking and customer support.
- Pay-later checkout may use Flow or an approved credit partner; present eligibility and total repayment cost before acceptance. Keep credit decisions and repayment records in the regulated credit domain.
- Concierge may help discover, compare, order and pay only with explicit confirmation, scoped permissions, transaction limits and receipts.

## AI application interfaces — Bud, The Concierge and The Fixer

All three are complete AI application interfaces with different product identities and permissions, not three interchangeable names for one unrestricted agent.

### Shared assistant capabilities
- Streaming conversations, conversation list/search, rename/archive/delete controls, drafts, regeneration, edit/resend, stop generation, feedback, citations/source inspection and clear model/tool activity.
- Text, image and document understanding; supported file uploads with size/type limits, malware scanning, retention and deletion controls.
- Voice input/output and transcription where available; accessibility controls and clear recording consent.
- Web/research access with source citations and freshness labels; optional app-connected knowledge and retrieval with explicit permissions.
- Tool/function use with confirmation for consequential actions, scoped grants, least privilege, revocation, idempotency, execution receipts and audit logs.
- User-controlled memory: visible scope, per-app isolation, correction, retention/deletion controls and no cross-account or cross-app leakage.
- Model selection/routing, latency and usage indicators, quotas, rate limits, cost/spend controls, safe fallback, provider outage handling and no silent downgrade of privacy settings.
- Safety policy, prompt-injection resistance, untrusted-content isolation, moderation/escalation and clear boundaries for financial, medical, legal and other high-impact advice.
- Account/session management, device/session revocation, privacy settings, data export/deletion policy, reporting and support.

### Distinct roles
- **Bud:** UNIBUD's social companion interface. Helps with conversations, discovery and user-authorised UNIBUD tasks; must respect teen safety, profile privacy and app boundaries.
- **The Concierge:** action-oriented personal/service interface for discovery, errands, bookings, orders and payments. It must preview the exact action, amount, recipient and terms, then obtain explicit confirmation before committing.
- **The Fixer:** problem-solving and task-execution interface for troubleshooting, planning, research and workflows. It explains proposed changes, requests approval for consequential operations, records outcomes and supports rollback where possible.

### Oracle Arc boundary
Oracle Arc remains the separate My Realm Network AI core, not a UNIBUD mini-app or a substitute name for these interfaces. It provides governed model routing, reasoning/evaluation, traceable decisions and controlled multimodal processing. App-scoped memory and tools remain isolated; local-first inference is preferred where the deployment supports it.

## Games, prizes and gambling boundary

- Wayward can support non-wagering games, competitions, educational challenges, transparent prize rules and sponsor-funded education-bill surprises, subject to age-appropriate design and local law.
- Real-money gambling, betting, casino games, cash-out jackpots, wagering wallets, odds markets and gambling affiliate flows are **excluded from the UNIBUD teen/student product**.
- Any future adult gambling product must be a separate 18+ product with independent identity/age assurance, jurisdiction and licence checks, geofencing, KYC/AML, segregated funds/ledger, approved payment rails, transparent rules/odds/RTP where applicable, dispute handling, fraud controls, self-exclusion, deposit/loss/time limits, cooling-off, reality checks, responsible-gambling support and independent compliance review.
- Do not implement wagering, deposits, payouts or gambling promotion in UNIBUD or Wayward while age, jurisdiction, licensing and operating model are unresolved.

## Capabilities expected of every public website and app

- Responsive and accessible UI (keyboard, screen reader, contrast, focus, reduced motion), clear navigation, loading/empty/error/offline states and localization/time-zone/currency correctness.
- Secure account registration, verification, login, recovery, session/device controls, role/permission enforcement, privacy notices, consent and age-appropriate controls.
- Search, filtering, notifications/preferences, help/support/contact, feedback/reporting, legal terms, privacy/cookie notices and transparent service status.
- Secure API design, input validation, CSRF/XSS/SSRF protections, rate limiting, secrets management, encryption, backups, disaster recovery, monitoring, alerting and incident response.
- Performance budgets, SEO/metadata where public, sitemap/robots, analytics with consent and minimization, error tracking, accessibility/security testing and release/rollback controls.
- Admin/operator surfaces separated from customer experiences, least privilege, auditable actions and no public exposure of internal tools or private profile types.

## Financial and regulated delivery gates

Before any real financial capability is represented as live, verify the legal entity, jurisdiction, licence/regulated partner, product terms, provider contract, custody/settlement model, data protection obligations, KYC/AML/sanctions controls, safeguarding/segregation, dispute process, reconciliation, incident response and tested production integrations.

For Nigeria-first planning, obtain current Nigerian legal and regulatory review for each specific product and partner before launch. A product description, prototype, test ledger or mock provider is not evidence of a licence, bank account, card issuance, lending, brokerage, FX execution or gambling authorisation.

## Implementation sequence and acceptance evidence

1. Finish current Operations authorization PR and exact-head CI; do not mix regulated product code into that security change.
2. Convert this scope into module-specific capability matrices with owner, dependencies, age/jurisdiction, data classification, API/ledger boundary, tests, release gate and status.
3. Design Flow's ledger, account model, reconciliation, access isolation and money-movement state machine before adding card/credit/FX/investment UI.
4. Design regulated partner/provider abstractions and compliance controls before representing real-world banking, lending, card, brokerage or FX execution.
5. Implement The Quarter commerce/order/refund flows separately from Flow's banking ledger.
6. Implement Bud, Concierge and Fixer as separate interfaces over the governed Oracle Arc/app-scoped runtime, with distinct tool permissions and approval policies.
7. Keep Wayward non-wagering in UNIBUD; any adult gambling product requires a separate product, legal review and release plan.
8. Every stage requires migrations, authorization tests, negative cross-account tests, end-to-end tests, accessible UI, operational runbooks, capability documentation and exact-head CI. No item is complete merely because a screen or schema exists.
