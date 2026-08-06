import { base44 } from "@/api/base44Client";
import { PaymentProvider } from "./providers";
import { PaymentService } from "./paymentService";

/**
 * cardPayment — the single frontend entry point for real card payments.
 * Flow: create a pending FinancialTransaction + PaymentAttempt, ask the active
 * banking provider for a hosted Checkout URL, then redirect. The provider
 * webhook completes the ledger asynchronously; the success_url return
 * polls the transaction until it reflects the webhook result.
 */

/** Card checkout must not run inside the builder iframe — only on a published app. */
export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * Start a real card payment.
 * @param {object} opts — amount (number, major units), currency, description, type,
 *   to_wallet_id (destination), from_wallet_id (source, optional), institution_id,
 *   fee_id (optional).
 * Redirects the browser to the payment provider on success. Throws on iframe or provider error.
 */
export async function startCardCheckout(opts) {
  const {
    amount,
    currency = "NGN",
    description,
    type = "deposit",
    to_wallet_id = "",
    from_wallet_id = "",
    institution_id,
    fee_id = "",
  } = opts;

  if (isInIframe()) {
    throw new Error("Checkout works only from a published app. Open the app in a new tab to pay.");
  }
  if (!institution_id) throw new Error("Missing institution scope — cannot start payment.");
  if (!(Number(amount) > 0)) throw new Error("Enter a valid amount.");

  // 1. Pending transaction + attempt (double-entry record before money moves).
  const { tx, attempt } = await PaymentService.create({
    amount: Number(amount),
    currency,
    type,
    from_wallet_id,
    to_wallet_id,
    description: description || type,
    fee_id,
    institution_id,
  });

  // 2. Ask the active banking provider for a hosted Checkout URL.
  const prov = PaymentProvider.get();
  const success_url = `${window.location.origin}/wallet?payment=success&tx=${tx.id}`;
  const cancel_url = `${window.location.origin}/wallet?payment=cancelled&tx=${tx.id}`;

  const res = await prov.pay({
    amount: Number(amount),
    currency: currency.toLowerCase(),
    description: description || "UNIBUD Payment",
    transaction_id: tx.id,
    attempt_id: attempt.id,
    to_wallet_id,
    from_wallet_id,
    institution_id,
    success_url,
    cancel_url,
  });

  const checkoutUrl = res?.checkout_url;
  if (!checkoutUrl) throw new Error(res.data?.error || "Could not start card checkout.");

  // 3. Redirect — the webhook ledgers the wallet on completion.
  window.location.href = checkoutUrl;
  return { redirecting: true, tx, attempt };
}

/**
 * Poll a transaction until the webhook marks it completed (or failed).
 * Used on the success_url return page to reconcile the redirect with the webhook.
 */
export async function pollTransactionStatus(txId, { timeoutMs = 20000, intervalMs = 1500 } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const tx = await base44.entities.FinancialTransaction.get(txId).catch(() => null);
    if (tx?.status === "completed") return { status: "completed", tx };
    if (tx?.status === "failed") return { status: "failed", tx };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: "timeout" };
}
