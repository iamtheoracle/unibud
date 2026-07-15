import { CapabilityRegistry } from "./capabilityRegistry.js";
import { ConfigurationManager } from "./configurationManager.js";
import { DependencyInjector } from "./dependencyInjector.js";
import { EnvironmentManager } from "./environmentManager.js";
import { ErrorBoundary, OracleKernelError } from "./errorBoundary.js";
import { HealthManager } from "./healthManager.js";
import { LifecycleManager } from "./lifecycleManager.js";
import { Logger } from "./logging.js";
import { ModuleRegistry } from "./moduleRegistry.js";
import { PluginRegistrar } from "./pluginRegistrar.js";
import { ServiceRegistry } from "./serviceRegistry.js";
import { VersionManager } from "./versionManager.js";

/**
 * @typedef {{
 *  kernelName?: string;
 *  kernelVersion?: string;
 *  configuration?: Record<string, unknown>;
 *  environmentSchema?: import('./environmentManager.js').EnvironmentSchemaEntry[];
 *  environmentSource?: Record<string, string|undefined>;
 *  logLevel?: 'debug'|'info'|'warn'|'error';
 * }} BootstrapOptions
 */

/** @param {BootstrapOptions} [options] */
export function bootstrap(options = {}) {
  const logger = new Logger({ level: options.logLevel ?? "info" });

  const environment = new EnvironmentManager({
    source: options.environmentSource,
    schema: options.environmentSchema,
  });

  const configuration = new ConfigurationManager(options.configuration);
  const dependencies = new DependencyInjector();
  const modules = new ModuleRegistry();
  const services = new ServiceRegistry();
  const capabilities = new CapabilityRegistry();
  const lifecycle = new LifecycleManager();
  const health = new HealthManager();
  const versions = new VersionManager({ kernelVersion: options.kernelVersion ?? "0.1.0" });

  const errorBoundary = new ErrorBoundary((error) => {
    logger.error(error.message, {
      code: error.code,
      cause: serializeErrorCause(error.cause),
    });
  });

  const context = {
    kernelName: options.kernelName ?? "oracle-kernel",
    logger,
    configuration,
    environment,
    dependencies,
    modules,
    services,
    capabilities,
    lifecycle,
    health,
    versions,
    errorBoundary,
  };

  const plugins = new PluginRegistrar(context);

  lifecycle.onInitialize(async () => {
    environment.load();
    await plugins.initializeAll();
    logger.info("Oracle Kernel initialized", {
      kernel: context.kernelName,
      version: versions.getKernelVersion(),
    });
  });

  lifecycle.onShutdown(() => {
    logger.info("Oracle Kernel stopped", {
      kernel: context.kernelName,
    });
  });

  return {
    ...context,
    plugins,
    registerModule(module) {
      modules.register(module);
      versions.registerModuleVersion(module.id, module.version);

      if (module.initialize) {
        lifecycle.onInitialize(module.initialize.bind(module));
      }

      if (module.shutdown) {
        lifecycle.onShutdown(module.shutdown.bind(module));
      }
    },
    registerService(service) {
      services.register(service);
    },
    registerCapability(capability) {
      capabilities.register(capability);
    },
    registerPlugin(plugin) {
      plugins.register(plugin);
    },
    async initialize() {
      await errorBoundary.executeAsync(() => lifecycle.initialize(), {
        code: "KERNEL_INIT_FAILED",
      });
    },
    async shutdown() {
      await errorBoundary.executeAsync(() => lifecycle.shutdown(), {
        code: "KERNEL_SHUTDOWN_FAILED",
      });
    },
    /** @param {string} token @param {{useFactory?: (di: DependencyInjector)=>unknown; useValue?: unknown; singleton?: boolean}} registration */
    registerDependency(token, registration) {
      dependencies.register(token, registration);
    },
    /** @param {string} token */
    resolveDependency(token) {
      return dependencies.resolve(token);
    },
  };
}

/** @param {unknown} cause */
function serializeErrorCause(cause) {
  if (!cause) {
    return null;
  }

  if (cause instanceof Error || cause instanceof OracleKernelError) {
    return {
      name: cause.name,
      message: cause.message,
    };
  }

  return { value: String(cause) };
}
