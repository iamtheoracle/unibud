/**
 * Oracle Kernel — Core Implementation
 *
 * Generic infrastructure kernel. Manages module lifecycle,
 * capability registry, and event bus. Zero business knowledge.
 */

import type {
  IOracle,
  IModule,
  ICapability,
  IBootstrapOptions,
} from './types';

export class OracleKernel implements IOracle {
  private readonly modules = new Map<string, IModule>();
  private readonly capabilities = new Map<string, ICapability>();
  private readonly listeners = new Map<string, Array<(payload?: unknown) => void>>();

  async registerModule(module: IModule): Promise<void> {
    if (this.modules.has(module.name)) {
      throw new Error(`Module "${module.name}" is already registered.`);
    }
    this.modules.set(module.name, module);
    this.emit('module:registered', { name: module.name, version: module.version });
  }

  getModule<T extends IModule>(name: string): T | undefined {
    return this.modules.get(name) as T | undefined;
  }

  listModules(): string[] {
    return Array.from(this.modules.keys());
  }

  registerCapability(capability: ICapability): void {
    if (this.capabilities.has(capability.name)) {
      throw new Error(`Capability "${capability.name}" is already registered.`);
    }
    this.capabilities.set(capability.name, capability);
    this.emit('capability:registered', { name: capability.name });
  }

  hasCapability(name: string): boolean {
    return this.capabilities.has(name);
  }

  emit(event: string, payload?: unknown): void {
    const handlers = this.listeners.get(event) ?? [];
    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        // Swallow handler errors to maintain kernel stability; log for diagnostics
        console.warn(`[OracleKernel] Error in handler for event "${event}":`, err);
      }
    });
  }

  on(event: string, handler: (payload?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }
}

// ─── Singleton Kernel Instance ────────────────────────────────────────────────

let kernelInstance: OracleKernel | null = null;

export function getOracle(): OracleKernel {
  if (!kernelInstance) {
    kernelInstance = new OracleKernel();
  }
  return kernelInstance;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

export async function bootstrap(options: IBootstrapOptions = {}): Promise<OracleKernel> {
  const oracle = getOracle();

  for (const module of options.modules ?? []) {
    await oracle.registerModule(module);
    await module.initialize(oracle);
  }

  oracle.emit('oracle:ready', { modules: oracle.listModules() });
  return oracle;
}
