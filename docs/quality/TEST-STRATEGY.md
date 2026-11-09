# Test and Verification Strategy

## Evidence states

- **Planned:** defined, not built.
- **In development:** implementation underway.
- **Implemented:** code exists, but validation may be incomplete.
- **Tested:** specified tests have passed in a recorded environment.
- **Verified:** relevant end-to-end, security, failure, and operational evidence has been reviewed.
- **Blocked:** dependency or issue prevents progress.
- **Not available:** explicitly unsupported.

## Test layers

1. Unit tests for domain rules and validation.
2. Integration tests for database, queues, object storage, and provider adapters.
3. Contract tests for API and event compatibility.
4. Authorisation tests for ownership, role, app, tenant, and cross-space isolation.
5. End-to-end user journeys for each space.
6. Failure tests for timeouts, retries, duplicate requests, provider outages, cancellation, and recovery.
7. Security tests for secrets, injection, file handling, session controls, and access boundaries.
8. Accessibility and responsive UI checks.
9. Load and performance tests for critical paths.
10. Backup and restore verification.

## AI evaluation

Test groundedness, instruction adherence, tool argument accuracy, unauthorised tool attempts, memory isolation, cross-user/app leakage, prompt injection, unsafe content handling, provider fallback, latency, cost, and regression.

## Release evidence

A release report must include commit SHA, environment, commands and results, tested journeys, known limitations, integrations and provider evidence, security findings, unresolved issues, and approval. Never infer production readiness from a successful build alone.
