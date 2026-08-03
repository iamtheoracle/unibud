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
import { lifecycleManager } from '@/lib/runtime/lifecycle/ServiceLifecycleManager';

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

  // ── Lifecycle Manager ──
  get lifecycle() { return lifecycleManager; },

  // ── Health (real probes via lifecycle manager) ──
  async checkHealth() {
    return lifecycleManager.checkAll();
  },
  getServiceCatalog() {
    return lifecycleManager.getCatalog();
  },
  getRecoveryLog() {
    return lifecycleManager.getRecoveryLog();
  },
};

export default PlatformCore;