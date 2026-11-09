# UNIBUD

UNIBUD is a connected digital and real-world ecosystem. Its spaces have distinct purposes and experiences while sharing carefully governed identity, infrastructure, discovery, communication, and service capabilities.

This repository is the source of truth for the new UNIBUD implementation. It is a clean start; legacy application code is not imported.

## Product spaces

- **Connect** — people, communities, institutions, creators, opportunities, and services.
- **Bud** — the academic companion. **Board** lives inside Bud as the digital campus and school workspace.
- **Flow** — student financial services, subject to regulated-provider and compliance requirements.
- **Square** — entertainment, creator media, podcasts, and live content.
- **The Quarter** — marketplace, sellers, products, orders, and fulfilment.
- **SouLync** — an adults-only dating and relationship experience.
- **Wayward** — open experiences people can discover, organise, and join.
- **Riff** — lightweight open discussions.
- **Lync** — purposeful engagement and streaks.
- **Concierge** — conversational access to services and authorised actions.
- **The Fixer** — private support and pathways to appropriate human help.
- **UNIBUD Operations** — internal workforce, fleet, safety, and physical-service coordination.

## Oracle Arc

Oracle Arc is an independent AI core, not merely a UNIBUD chatbot. It has its own API, security boundary, provider gateway, agent runtime, memory controls, multimodal file controls, and evaluation system. It may serve UNIBUD and other separately authorised applications.

## Repository principles

1. One ecosystem does not mean one undifferentiated product surface.
2. Shared identity does not grant shared access to private data.
3. Authorisation is enforced server-side and deny-by-default.
4. Consequential actions require explicit user confirmation and verified outcomes.
5. AI suggestions are not permissions, and tool calls are not proof of execution.
6. No fake balances, transactions, bookings, messages, or provider success.
7. A feature is not complete until its behaviour, security, and failure paths are tested.

## Initial architecture

The initial direction is a modular UNIBUD application with clear domain boundaries, plus Oracle Arc as a separately deployable service in this monorepo. Technology choices remain provisional until the architecture decision records and working foundations validate them.

See [docs/](docs/) for the product and architecture baseline.
