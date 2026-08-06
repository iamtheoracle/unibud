/**
 * Payment checkout — Stripe has been removed.
 * These stubs preserve the existing call-sites so the app compiles without errors.
 * A future payment provider can be wired in here when needed.
 */

export function isInIframe() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

/**
 * startStripeCheckout is no longer backed by Stripe.
 * Throws a user-friendly error so callers surface the right message.
 */
export async function startStripeCheckout() {
  throw new Error("Online card payments are not available at this time. Please contact your institution for payment options.");
}

/**
 * Poll a transaction for completion.
 * Without Stripe webhooks this will always return "timeout".
 */
export async function pollTransactionStatus(txId, { timeoutMs = 20000, intervalMs = 1500 } = {}) {
  const { base44 } = await import("@/api/base44Client");
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const tx = await base44.entities.FinancialTransaction.get(txId).catch(() => null);
    if (tx?.status === "completed") return { status: "completed", tx };
    if (tx?.status === "failed") return { status: "failed", tx };
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return { status: "timeout" };
}
