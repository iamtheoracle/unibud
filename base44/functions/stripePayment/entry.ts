import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import Stripe from "npm:stripe@14.25.0";
import { secrets } from "base44:runtime";

/**
 * stripePayment — the single server-side endpoint for real card payments.
 * Handles two paths:
 *   1. Frontend invoke (JSON body { action: "createSession", ... }) → creates a
 *      Stripe Checkout Session and returns the hosted checkout URL.
 *   2. Stripe webhook (raw body + stripe-signature header) → on
 *      checkout.session.completed, ledgers the destination wallet, marks the
 *      FinancialTransaction + PaymentAttempt complete. Idempotent.
 * The active banking provider adapter (src/lib/finance/providers.js → stripe)
 * calls this function; business logic never touches the Stripe SDK directly.
 */
export default async function (req) {
  try {
    const signature = req.headers.get("stripe-signature");
    const base44 = createClientFromRequest(req);

    // ── Stripe webhook ───────────────────────────────────────────────
    if (signature) {
      // base44 auth must initialize before Stripe signature validation (platform requirement).
      try { await base44.auth.me(); } catch (_) { /* webhook has no user token — expected */ }

      const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
      const rawBody = await req.text();
      const event = await stripe.webhooks.constructEventAsync(
        rawBody,
        signature,
        secrets.get("STRIPE_WEBHOOK_SECRET")
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const md = session.metadata || {};
        const amount = Number(session.amount_total || 0) / 100;
        const txId = md.transaction_id || "";
        const attemptId = md.attempt_id || "";
        const toWalletId = md.to_wallet_id || "";
        const institutionId = md.institution_id || "";

        // Idempotency — skip if the transaction is already completed (Stripe may retry).
        if (txId) {
          const existing = await base44.asServiceRole.entities.FinancialTransaction.get(txId).catch(() => null);
          if (existing && existing.status === "completed") {
            return Response.json({ received: true, duplicate: true });
          }
        }

        // Ledger the destination wallet (double-entry credit).
        if (toWalletId) {
          const w = await base44.asServiceRole.entities.Wallet.get(toWalletId).catch(() => null);
          if (w) {
            const balance = (Number(w.balance) || 0) + amount;
            const available = (Number(w.available_balance) || 0) + amount;
            await base44.asServiceRole.entities.Wallet.update(toWalletId, { balance, available_balance: available });
            await base44.asServiceRole.entities.WalletLedger.create({
              wallet_id: toWalletId,
              type: "credit",
              amount,
              balance_after: balance,
              reference: session.id,
              description: md.description || "Stripe card payment",
              transaction_id: txId,
              institution_id: institutionId,
            });
          }
        }

        // Complete the transaction + attempt.
        if (txId) {
          await base44.asServiceRole.entities.FinancialTransaction.update(txId, {
            status: "completed",
            receipt_no: "RCP-" + String(session.id).slice(-8).toUpperCase(),
            reference: session.id,
          }).catch(() => {});
        }
        if (attemptId) {
          await base44.asServiceRole.entities.PaymentAttempt.update(attemptId, {
            status: "captured",
            provider_reference: session.id,
          }).catch(() => {});
        }

        try {
          await base44.asServiceRole.entities.AuditLog.create({
            action: "Stripe payment captured",
            target_name: session.id,
            target_type: "finance",
            severity: "info",
            description: `${amount} captured via Stripe · ${md.description || ""}`,
          });
        } catch (_) {}
      }

      return Response.json({ received: true });
    }

    // ── Frontend invoke: create checkout session ────────────────────
    const body = await req.json();
    if (body.action !== "createSession") {
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}

    const amount = Math.round((Number(body.amount) || 0) * 100);
    if (amount < 100) {
      return Response.json({ error: "Minimum payment is ₦1.00" }, { status: 400 });
    }

    const stripe = new Stripe(secrets.get("STRIPE_SECRET_KEY"));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: (body.currency || "ngn").toLowerCase(),
            product_data: { name: body.description || "UNIBUD Payment" },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: body.success_url,
      cancel_url: body.cancel_url,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        transaction_id: body.transaction_id || "",
        attempt_id: body.attempt_id || "",
        to_wallet_id: body.to_wallet_id || "",
        from_wallet_id: body.from_wallet_id || "",
        institution_id: body.institution_id || "",
        description: body.description || "",
        user_id: user?.id || "",
      },
    });

    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error("stripePayment error:", error?.message || error);
    return Response.json({ error: error?.message || "Stripe error" }, { status: 500 });
  }
}