import { CapabilityRegistry } from "./capability-registry.js";
import { ConfigManager } from "./config-manager.js";
import { DependencyInjector } from "./dependency-injector.js";
import { EnvironmentManager } from "./environment-manager.js";
import { ErrorBoundary } from "./error-boundary.js";
import { HealthManager } from "./health-manager.js";
import { LifecycleManager } from "./lifecycle-manager.js";
import { Logger } from "./logger.js";
import { ModuleRegistry } from "./module-registry.js";
import { PluginRegistrar } from "./plugin-registrar.js";
import { VersionManager } from "./version-manager.js";
import { OracleKernel } from "../oracle-kernel.js";

export interface BootstrapOptions {
  config?: Record<string, unknown>;
  environment?: Record<string, string | undefined>;
  version?: string;
}

export const bootstrap = (options: BootstrapOptions = {}): OracleKernel => {
  const logger = new Logger();
  const configManager = new ConfigManager();
  configManager.load(options.config ?? {});

  return new OracleKernel({
    logger,
    configManager,
    environmentManager: new EnvironmentManager(options.environment),
    dependencyInjector: new DependencyInjector(),
    moduleRegistry: new ModuleRegistry(),
    capabilityRegistry: new CapabilityRegistry(),
    lifecycleManager: new LifecycleManager(),
    healthManager: new HealthManager(),
    errorBoundary: new ErrorBoundary(logger),
    pluginRegistrar: new PluginRegistrar(),
    versionManager: new VersionManager(options.version ?? "0.1.0"),
  });
};
