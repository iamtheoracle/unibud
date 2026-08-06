/**
 * auditLogger — shared utility for recording audit log entries.
 * Used by backend functions to log significant account events.
 *
 * Import from any backend function:
 *   import { logAuditEvent } from "../../shared/auditLogger.ts";
 */

interface AuditEvent {
  action: string;
  actor_id?: string;
  actor_name?: string;
  actor_role?: string;
  target_type?: string;
  target_name?: string;
  target_user_id?: string;
  details: string;
  previous_value?: string;
  new_value?: string;
  severity?: "info" | "warning" | "critical";
  category?: string;
  meta?: Record<string, any>;
}

export async function logAuditEvent(base44: any, event: AuditEvent): Promise<void> {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      action: event.action,
      actor_id: event.actor_id || null,
      actor_name: event.actor_name || null,
      actor_role: event.actor_role || null,
      target_type: event.target_type || "user",
      target_name: event.target_name || null,
      target_user_id: event.target_user_id || event.actor_id || null,
      details: event.details,
      previous_value: event.previous_value || null,
      new_value: event.new_value || null,
      severity: event.severity || "info",
      category: event.category || "system",
      meta: event.meta || {},
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    // Audit logging is best-effort — never fail the primary operation
    console.error("Audit log failed:", e.message);
  }
}