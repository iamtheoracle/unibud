/**
 * Service Registry — Service Definitions
 *
 * Authoritative metadata about all platform services. Used for health
 * checks, dependency validation, and service discovery.
 */

import { logger } from '../logger';

const DEFAULT_SERVICES = [
  { service_id: 'memory', name: 'Memory Service', division: 'intelligence', critical: true, dependencies: [] },
  { service_id: 'conversation', name: 'Conversation Service', division: 'intelligence', critical: true, dependencies: [] },
  { service_id: 'knowledge', name: 'Knowledge Service', division: 'intelligence', critical: false, dependencies: [] },
  { service_id: 'search', name: 'Search Service', division: 'intelligence', critical: false, dependencies: [] },
  { service_id: 'prompt', name: 'Prompt Service', division: 'intelligence', critical: true, dependencies: ['promptRegistry'] },
  { service_id: 'model', name: 'Model Service', division: 'intelligence', critical: true, dependencies: [] },
  { service_id: 'audit', name: 'Audit Service', division: 'trust', critical: true, dependencies: [] },
  { service_id: 'notification', name: 'Notification Service', division: 'communication', critical: false, dependencies: [] },
  { service_id: 'identity', name: 'Identity Service', division: 'identity', critical: true, dependencies: [] },
  { service_id: 'session', name: 'Session Service', division: 'identity', critical: true, dependencies: ['identity'] },
  { service_id: 'configuration', name: 'Configuration Service', division: 'operations', critical: true, dependencies: [] },
  { service_id: 'metrics', name: 'Metrics Service', division: 'monitoring', critical: false, dependencies: [] },
  { service_id: 'telemetry', name: 'Telemetry Service', division: 'monitoring', critical: false, dependencies: ['metrics'] },
  { service_id: 'health', name: 'Health Service', division: 'monitoring', critical: true, dependencies: [] },
];

class ServiceRegistry {
  constructor() { this._services = new Map(); this._ready = false; }

  async init() {
    for (const svc of DEFAULT_SERVICES) this._services.set(svc.service_id, svc);
    this._ready = true;
    logger.info('ServiceRegistry initialized', { serviceCount: this._services.size });
  }

  register(svcDef) { this._services.set(svcDef.service_id, svcDef); }
  get(serviceId) { return this._services.get(serviceId) || null; }
  list(filter) {
    const all = Array.from(this._services.values());
    if (filter?.critical) return all.filter((s) => s.critical);
    return all;
  }

  /** Validate that all dependency services are ready. */
  validateDependencies(serviceId, readyServices) {
    const svc = this._services.get(serviceId);
    if (!svc?.dependencies?.length) return { valid: true, missing: [] };
    const missing = svc.dependencies.filter((dep) => !readyServices.includes(dep));
    return { valid: missing.length === 0, missing };
  }

  get ready() { return this._ready; }
}

export const serviceRegistry = new ServiceRegistry();
export default serviceRegistry;