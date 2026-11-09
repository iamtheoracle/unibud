# Concierge — Product and Workflow Specification

## Experience

Concierge is a conversational service interface. Chat is the primary experience; relevant service cards, order summaries, booking details, and payment confirmations appear inline when useful. It must not become a generic dashboard.

## Service types

Support one-time purchases and bookings, fixed-quantity packages, recurring schedules, subscriptions, and fixed-term service arrangements as distinct commercial models. Examples include a one-off meal, a package of four meals, weekly cleaning, monthly deliveries, or a recurring order for a defined period.

## Ownership boundaries

Concierge coordinates the conversation and workflow. The relevant domain remains the system of record:
- The Quarter owns listings, seller terms, orders, fulfilment, refunds, and disputes.
- Flow or an approved payment provider owns payment execution and provider status.
- Wayward owns activity bookings and participation.
- Operations owns physical assignments and delivery evidence.

## Required workflow record

A service arrangement should capture customer, provider, service, quantity or units, price and currency, payment state, schedule, remaining units, fulfilment history, renewal/cancellation terms, and lifecycle status.

## Consequential action protocol

1. Identify the user and active application.
2. Resolve the requested service and provider.
3. Present scope, price, schedule, and material terms.
4. Check eligibility and availability through the owning domain.
5. Ask for explicit confirmation before purchase, payment, booking, cancellation, or other consequential action.
6. Execute through an authorised, idempotent backend workflow.
7. Verify provider result and reconcile.
8. Report the actual outcome, including pending or failed states.

The assistant must never claim an order, transfer, booking, refund, or cancellation succeeded based only on generated text or a tool request.
