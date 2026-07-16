/**
 * Oracle Kernel — Public API
 *
 * Single entry point for all Oracle Kernel imports.
 */

export { OracleKernel, getOracle, bootstrap } from './oracle-kernel';
export type {
  IOracle,
  IModule,
  IModuleConfig,
  ICapability,
  IEntity,
  IMetadata,
  ITimestamped,
  IBootstrapOptions,
  ModuleStatus,
} from './types';
