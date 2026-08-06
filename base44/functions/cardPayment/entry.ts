import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";
import { secrets } from "base44:runtime";

/**
 * cardPayment — the single server-side endpoint for card payments.
 * Handles two paths:
 *   1. Frontend invoke (JSON body { action: "createSession", ... }) → delegates to
 *      the configured payment provider and returns the hosted checkout URL.
 *   2. Payment provider webhook (raw body + provider-signature header) → on
 *      checkout.session.completed, ledgers the destination wallet, marks the
 *      FinancialTransaction + PaymentAttempt complete. Idempotent.
 * The active banking provider adapter (src/lib/finance/providers.js → card_payment)
 * calls this function; business logic never touches the provider SDK directly.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const providerSignature = req.headers.get("x-payment-signature");

    // ── Provider webhook ─────────────────────────────────────────────
    if (providerSignature) {
      try { await base44.auth.me(); } catch (_) { /* webhook has no user token — expected */ }

      const rawBody = await req.text();
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(rawBody);
      } catch {
        return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
      }

      const md = (event.metadata as Record<string, string>) || {};
      const amount = Number(event.amount || 0) / 100;
      const txId = md.transaction_id || "";
      const attemptId = md.attempt_id || "";
      const toWalletId = md.to_wallet_id || "";
      const institutionId = md.institution_id || "";
      const sessionId = (event.id as string) || "";

      // Idempotency — skip if already completed.
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
            reference: sessionId,
            description: md.description || "Card payment",
            transaction_id: txId,
            institution_id: institutionId,
          });
        }
      }

      // Complete the transaction + attempt.
      if (txId) {
        await base44.asServiceRole.entities.FinancialTransaction.update(txId, {
          status: "completed",
          receipt_no: "RCP-" + String(sessionId).slice(-8).toUpperCase(),
          reference: sessionId,
        }).catch(() => {});
      }
      if (attemptId) {
        await base44.asServiceRole.entities.PaymentAttempt.update(attemptId, {
          status: "captured",
          provider_reference: sessionId,
        }).catch(() => {});
      }

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          action: "Card payment captured",
          target_name: sessionId,
          target_type: "finance",
          severity: "info",
          description: `${amount} captured · ${md.description || ""}`,
        });
      } catch (_) {}

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

    // Delegate to configured payment provider secret endpoint.
    const providerUrl = secrets.get("PAYMENT_PROVIDER_URL");
    const providerKey = secrets.get("PAYMENT_PROVIDER_SECRET_KEY");

    if (!providerUrl || !providerKey) {
      return Response.json({ error: "Payment provider not configured." }, { status: 503 });
    }

    const sessionRes = await fetch(providerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + providerKey },
      body: JSON.stringify({
        amount,
        currency: (body.currency || "ngn").toLowerCase(),
        description: body.description || "UNIBUD Payment",
        success_url: body.success_url,
        cancel_url: body.cancel_url,
        metadata: {
          transaction_id: body.transaction_id || "",
          attempt_id: body.attempt_id || "",
          to_wallet_id: body.to_wallet_id || "",
          from_wallet_id: body.from_wallet_id || "",
          institution_id: body.institution_id || "",
          description: body.description || "",
          user_id: user?.id || "",
        },
      }),
    });

    const sessionData = await sessionRes.json().catch(() => ({}));
    if (!sessionRes.ok) {
      return Response.json({ error: sessionData.error || "Payment provider error" }, { status: 500 });
    }

    return Response.json({ checkout_url: sessionData.checkout_url || sessionData.url, session_id: sessionData.id || sessionData.session_id });
  } catch (error) {
    console.error("cardPayment error:", error?.message || error);
    return Response.json({ error: error?.message || "Payment error" }, { status: 500 });
  }
}
