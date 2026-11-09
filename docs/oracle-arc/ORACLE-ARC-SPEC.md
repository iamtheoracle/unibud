# Oracle Arc — Independent AI Core Specification

## Mission

Oracle Arc is a reusable AI core for UNIBUD and other separately registered applications in the wider My Realm Network. It is not owned by the UNIBUD product experience and must remain useful if UNIBUD is unavailable.

## Independent boundary

Oracle Arc has its own API, authentication of calling applications, deployment configuration, secrets, model/provider gateway, agent runtime, tool permission system, observability, and release lifecycle. A monorepo does not imply shared trust or unrestricted database access.

## Core areas

- **ORACLE:** reasoning orchestration, evaluation, decision traces, and grounded response policy.
- **SPARK:** authenticated, consented, purpose-limited, application-scoped memory.
- **ORBITS:** controlled documents, images, and audio ingestion, processing, access, and retention.
- **Agent runtime:** registration, versioning, responsibilities, health, model assignment, lifecycle, and graceful fallback.
- **Tool execution:** registered tools, deny-by-default grants, validation, scoped execution, revocation, audit, timeouts, retries, and idempotency.
- **Provider gateway:** provider-independent model selection, routing, fallback, quota, usage, cost, and policy enforcement.
- **Evaluation:** quality, safety, tool accuracy, groundedness, leakage, latency, cost, regression, and recovery tests.

## Provider policy

Support local inference as the preferred direction where hardware and quality permit. Remote inference is opt-in and must respect data classification and app policy. Candidate providers may include Ollama-hosted models and approved hosted providers, but no provider or model is selected by this specification.

## Security invariants

- A registered app receives only its own permitted context.
- Agents have no ambient authority.
- Tool execution requires an explicit grant and server-side authorisation.
- Memory retrieval checks user, app, purpose, and consent scope.
- Files are not trusted merely because they were uploaded.
- Provider failure must not silently broaden data disclosure or permissions.
- A model response cannot approve its own consequential action.

## Proof requirements

Track each capability as Planned, In development, Implemented, Tested, Verified, Blocked, or Not available. A passing single test does not prove platform security or end-to-end reliability.
