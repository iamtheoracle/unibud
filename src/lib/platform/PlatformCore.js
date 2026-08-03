/**
 * Platform Core — Unified Facade
 *
 * The single entry point for all Platform Core services. Experiences and
 * agents consume Platform Core through this facade — they never import
 * individual services or kernel components directly.
 *
 * Hierarchy:
 *   Experience → PlatformCore → Kernel (Oracle/Nexus/Guardian/Spark/Orbit)
 *                        → Services (19 platform services)
 *                        → Boot (staged boot + health checks)
 */

import { oracle, nexus, guardian, spark, orbit } from '@/lib/runtime/kernel';
import { services } from '@/lib/runtime/services';
import { runtimeBoot } from '@/lib/runtime/boot';

export const PlatformCore = {
  // ── Kernel ──
  kernel: { oracle, nexus, guardian, spark, orbit },

  // ── Services (19 platform services) ──
  services,

  // ── Convenience accessors ──
  get bud() { return oracle; },
  get oracle() { return oracle; },
  get spark() { return spark; },
  get orbit() { return orbit; },
  get nexus() { return nexus; },
  get guardian() { return guardian; },

  // ── Boot ──
  boot: () => runtimeBoot.boot(),
  shutdown: () => runtimeBoot.shutdown(),

  // ── Status ──
  isReady: () => runtimeBoot.ready,
  getStage: () => runtimeBoot.stage,
  getBootResults: () => runtimeBoot.results,

  // ── Health ──
  async checkHealth() {
    if (!services.health) return { healthy: false, checks: {} };
    return services.health.checkAll();
  },
  getHealthStatus() {
    return services.health?.getStatus() || {};
  },

  // ── Service Catalog (for observability) ──
  getServiceCatalog() {
    return Object.entries(services).map(([id, service]) => ({
      id,
      ready: service?.ready || false,
    }));
  },
};

export default PlatformCore;