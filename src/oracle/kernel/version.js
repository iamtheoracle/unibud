/**
 * Oracle Kernel — Version Information
 *
 * Tracks version information for the Oracle Kernel and all of its
 * constituent components. Every component registers its own semver
 * string here so that the entire kernel can be interrogated at
 * runtime for diagnostic and compatibility purposes.
 *
 * Usage:
 *   import { ORACLE_KERNEL_VERSION, COMPONENT_VERSIONS, getVersionInfo } from '@/oracle/kernel/version';
 */

/** Semver string for the Oracle Kernel as a whole. */
export const ORACLE_KERNEL_VERSION = '1.0.0';

/** Build label — follows YYYY.MM.DD convention. */
export const ORACLE_KERNEL_BUILD = '2026.07.15';

/**
 * Individual version strings for every Oracle Kernel component.
 * Each key matches the component's canonical identifier.
 */
export const COMPONENT_VERSIONS = Object.freeze({
  bootstrap:           '1.0.0',
  configManager:       '1.0.0',
  dependencyRegistry:  '1.0.0',
  environmentLoader:   '1.0.0',
  errorBoundary:       '1.0.0',
  healthManager:       '1.0.0',
  lifecycleManager:    '1.0.0',
  logger:              '1.0.0',
  moduleRegistry:      '1.0.0',
  pluginRegistry:      '1.0.0',
  serviceRegistry:     '1.0.0',
  version:             '1.0.0',
});

/**
 * Returns a complete version snapshot that can be serialised and logged.
 *
 * @returns {{ kernel: string, build: string, components: Record<string,string> }}
 */
export function getVersionInfo() {
  return {
    kernel: ORACLE_KERNEL_VERSION,
    build:  ORACLE_KERNEL_BUILD,
    components: { ...COMPONENT_VERSIONS },
  };
}
