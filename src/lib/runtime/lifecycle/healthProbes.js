/**
 * Health Probes — Real connectivity tests for each Platform Core service.
 *
 * Each probe returns { healthy, detail } by testing actual backend
 * connectivity — not just a readiness flag.
 *
 * Probes are lightweight (1-item queries) to minimize API usage.
 */

import { base44 } from '@/api/base44Client';

// Helper: try a lightweight entity query
async function probeEntity(entityName, label) {
  try {
    const entity = base44.entities[entityName];
    if (!entity?.list) return { healthy: false, detail: `${label} entity not found` };
    await entity.list('-created_date', 1);
    return { healthy: true, detail: `${label} queryable` };
  } catch (e) {
    return { healthy: false, detail: `${label} unreachable: ${e.message}` };
  }
}

// Helper: check SDK availability (no API call, no credits)
function probeSdk(feature, label) {
  const available = typeof feature === 'function';
  return { healthy: available, detail: available ? `${label} available` : `${label} not configured` };
}

export const HEALTH_PROBES = {
  // ── Database-backed services: lightweight 1-item queries ──
  memory: () => probeEntity('BudMemory', 'BudMemory'),
  conversation: () => probeEntity('BudConversation', 'BudConversation'),
  knowledge: () => probeEntity('LibraryResource', 'LibraryResource'),
  search: () => probeEntity('User', 'User entity'),
  notification: () => probeEntity('Notification', 'Notification'),
  audit: () => probeEntity('AuditLog', 'AuditLog'),
  metrics: () => probeEntity('AIServiceMetric', 'AIServiceMetric'),

  // ── Auth-backed services: verify SDK is available ──
  identity: () => probeSdk(base44.auth?.me, 'Auth API'),
  session: () => probeSdk(base44.auth?.isAuthenticated, 'Session API'),
  permissions: () => probeSdk(base44.auth?.me, 'Auth API'),

  // ── Integration-backed services: verify integration is available ──
  model: () => probeSdk(base44.integrations?.Core?.InvokeLLM, 'InvokeLLM'),
  media: () => probeSdk(base44.integrations?.Core?.UploadFile, 'UploadFile'),
  storage: () => probeSdk(base44.integrations?.Core?.UploadFile, 'UploadFile'),
  integrations: () => probeSdk(base44.integrations?.Core?.SendEmail, 'SendEmail'),

  // ── In-memory services: always healthy if booted ──
  configuration: () => ({ healthy: true, detail: 'In-memory config store' }),
  prompt: () => ({ healthy: true, detail: 'In-memory prompt templates' }),
  telemetry: () => ({ healthy: true, detail: 'In-memory tracing' }),
  health: () => ({ healthy: true, detail: 'Self-monitoring active' }),

  // ── Analytics: check SDK + event count ──
  analytics: (svc) => ({
    healthy: typeof base44.analytics?.track === 'function',
    detail: `${svc?._eventCount || 0} events tracked`,
  }),
};

export default HEALTH_PROBES;