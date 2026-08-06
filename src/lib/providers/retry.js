import { base44 } from "@/api/base44Client";

/** Exponential backoff in seconds, capped at 5 minutes. */
export const backoff = (attempt) => Math.min(300, Math.pow(2, attempt));
export const nextRetry = (attempt) => new Date(Date.now() + backoff(attempt) * 1000).toISOString();
export const MAX_RETRIES = 5;

/**
 * Retry Engine — processes the WebhookEvent retry queue.
 * Mock processing: succeeds pending/retry events, escalates to dead letter
 * after MAX_RETRIES. Real delivery is delegated to the active provider adapter.
 */
export async function processQueue() {
  let pending = [];
  try { pending = await base44.entities.WebhookEvent.filter({ status: "retry" }, "-created_date", 50); } catch {}
  let processed = 0, dead = 0;
  for (const e of pending) {
    const n = (e.retry_count || 0) + 1;
    if (n > MAX_RETRIES) {
      await base44.entities.WebhookEvent.update(e.id, { status: "dead_letter", retry_count: n, error: "Max retries exceeded" });
      dead++; continue;
    }
    try { await base44.entities.WebhookEvent.update(e.id, { status: "success", response_code: 200, retry_count: n, error: "" }); processed++; }
    catch (err) { await base44.entities.WebhookEvent.update(e.id, { status: "retry", retry_count: n, next_retry_at: nextRetry(n), error: String(err) }); }
  }
  return { processed, dead, total: pending.length };
}