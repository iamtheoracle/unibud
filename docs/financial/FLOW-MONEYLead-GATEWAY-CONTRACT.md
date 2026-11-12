# Flow ↔ MoneyLead gateway contract

**Status:** Versioned internal adapter port only. No MoneyLead API, repository implementation, credentials, endpoint, settlement event or live transfer capability is verified. The default gateway deliberately fails closed.

## Ownership boundary

- Flow is UNIBUD's customer-facing instruction, review and transaction-authorization layer.
- MoneyLead remains an independent financial institution and owns customer financial accounts, available balances, limits, posting, reversals, settlement and reconciliation.
- Flow is not a competing ledger. It does not debit or credit customer balances and does not infer MoneyLead posting from an HTTP response.
- Concierge, Oracle Arc and plugins may prepare instructions, but cannot create a human transaction attestation, authorize a payment, or call the gateway as a privileged actor.

## Narrow version-1 adapter port

The internal TypeScript port exposes only:

1. submitAuthorizedInstruction(instruction) — submit one already-authorized, immutable payment instruction.
2. lookupByIdempotencyKey(idempotencyKey) — resolve a prior submission after timeout or ambiguous response.

The instruction carries the payment-intent reference, idempotency key, immutable details digest, authorization reference/method/time, source and recipient references, amount, currency, fee, purpose and an opaque signed authorization attestation. It does not carry a reusable PIN, biometric template, user session cookie, or a client-supplied balance.

The acknowledgement union (accepted, rejected, unknown) is an UNIBUD adapter normalization contract, **not a claim about a MoneyLead endpoint or existing provider response**:
- accepted means MoneyLead acknowledged receipt/acceptance only. It does not mean settled, posted or available.
- rejected means a verifiable MoneyLead rejection was received.
- unknown means the result is ambiguous. The gateway must resolve by idempotency lookup/reconciliation before attempting a new submission.

The adapter port intentionally has no balance lookup, account creation, debit, credit, ledger posting, settlement, refund, or reversal methods. Those belong to MoneyLead's authoritative systems and separately verified contracts.

## Security requirements before an adapter can be enabled

- Verify the actual MoneyLead repository, service contract, API schemas, ownership model and authoritative ledger implementation.
- Establish a dedicated service identity with only the required transfer-submit and idempotency-lookup scopes. No shared admin credential.
- Verify transport security, request authentication/signatures, replay protection, idempotency semantics, response signatures, webhook authentication and key rotation.
- Require MoneyLead-side validation of source account ownership, recipient eligibility, limits, available funds, currency, fee and duplicate instruction handling.
- Persist outbound instructions through a transactional outbox before dispatch. Resolve ambiguous outcomes by idempotency lookup and reconciliation; never blindly retry.
- Mirror external states only from authenticated MoneyLead evidence. Settlement requires authoritative posting/settlement evidence and reconciliation.
- Keep MoneyLead customer/account data encrypted and expose only the minimum references required for a specific authorized instruction.
- Security review and founder approval are required before enabling a real adapter, provisioning credentials or dispatching transfers.

## Current implementation

- flow-moneylead-gateway-contract.ts defines the narrow version-1 adapter port.
- flow-moneylead-gateway.ts provides UnconfiguredFlowMoneyLeadGateway, which rejects submit and lookup calls rather than fabricating a provider response.
- The latest repository lookup for iamtheoracle/moneylead returned HTTP 404. No alternative repository or API has been assumed.
- No MoneyLead adapter is active. No transfer has been dispatched. No provider status or settlement is claimed.
