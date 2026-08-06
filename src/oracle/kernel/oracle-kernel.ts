/**
 * Oracle Kernel — Main Oracle Class
 *
 * Composes all infrastructure services into the IOracle interface.
 * Domain-agnostic: no business logic lives here.
 */

import type { IOracle } from './types.js';
import { OracleLogger } from './logger.js';
import { OracleConfigManager } from './config.js';
import { OracleDependencyInjector } from './di.js';
import { OracleHealthManager } from './health.js';
import { OracleErrorBoundary } from './error-boundary.js';
import { OracleLifecycleManager } from './lifecycle.js';
import { OracleModuleRegistry } from './module-registry.js';
import { OracleCapabilityRegistry } from './capability-registry.js';
import { OracleResourceRegistry } from './resource-registry.js';

export const ORACLE_VERSION = '1.0.0';

export class OracleKernel implements IOracle {
  readonly version = ORACLE_VERSION;

  readonly logger = new OracleLogger('Oracle');
  readonly config = new OracleConfigManager();
  readonly dependencies = new OracleDependencyInjector();
  readonly health = new OracleHealthManager();
  readonly errors = new OracleErrorBoundary(this.logger);
  readonly lifecycle = new OracleLifecycleManager();

  readonly modules = new OracleModuleRegistry();
  readonly capabilities = new OracleCapabilityRegistry();
  readonly resources = new OracleResourceRegistry();

  async bootstrap(config?: Record<string, unknown>): Promise<void> {
    if (config) {
      for (const [key, value] of Object.entries(config)) {
        this.config.set(key, value);
      }
    }

    this.logger.info('Oracle Kernel bootstrapping…', { version: this.version });

    this.lifecycle.onStart(async () => {
      this.logger.info('Oracle Kernel starting modules…');
      await this.modules.initializeAll(this);
      this.logger.info('Oracle Kernel running.', { version: this.version });
    });

    this.lifecycle.onStop(async () => {
      this.logger.info('Oracle Kernel stopping modules…');
      await this.modules.shutdownAll();
      this.logger.info('Oracle Kernel stopped.');
    });

    await this.lifecycle.start();
  }

  async shutdown(): Promise<void> {
    this.logger.info('Oracle Kernel shutting down…');
    await this.lifecycle.stop();
  }
}

/** Singleton Oracle instance for the application. */
export const oracle = new OracleKernel();
