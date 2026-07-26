/**
 * Governance Service — Oracle. Internal platform governance: security,
 * privacy, permissions, moderation, fraud detection, compliance, audit logs.
 * Oracle is completely invisible to users.
 */
export function governanceService(base44) {
  return {
    audit: (entry) => base44.entities.AuditLog.create(entry),
    auditList: (q, ...rest) => base44.entities.AuditLog.filter(q, ...rest),
    securityEvent: (e) => base44.entities.SecurityEvent.create(e),
    securityEvents: (q, ...rest) => base44.entities.SecurityEvent.filter(q, ...rest),
  };
}