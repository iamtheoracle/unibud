# Oracle Kernel — Examples

## Example 1: Basic Bootstrap

```typescript
import { bootstrap } from './src/oracle/kernel';

async function main() {
  const oracle = await bootstrap({
    config: {
      appName: 'my-service',
      version: '1.0.0',
    },
    logLevel: 'info',
  });

  oracle.logger.info('Application started', {
    version: oracle.version.getKernelVersion().toString(),
  });

  await oracle.shutdown();
}

main().catch(console.error);
```

---

## Example 2: Module Registration

```typescript
import { OracleKernel } from './src/oracle/kernel';
import type { IModule, IOracle } from './src/oracle/kernel';

// Define a module
const cacheModule: IModule = {
  name: 'cache',
  version: '1.0.0',
  description: 'In-memory cache module',

  async initialize(oracle: IOracle) {
    oracle.logger.info('Cache module initializing');
    oracle.dependencies.registerSingleton('cache', () => new Map<string, unknown>());
    oracle.capabilities.register({
      id: 'cache.read',
      name: 'Cache Read',
      version: '1.0.0',
      provider: 'cache',
    });
    oracle.capabilities.register({
      id: 'cache.write',
      name: 'Cache Write',
      version: '1.0.0',
      provider: 'cache',
    });
  },

  async shutdown() {
    const cache = kernel.dependencies.resolve<Map<string, unknown>>('cache');
    cache.clear();
  },
};

const kernel = new OracleKernel({ logLevel: 'debug' });
kernel.modules.register(cacheModule);

await kernel.initialize();
await cacheModule.initialize?.(kernel);

// Use the registered cache service
const cache = kernel.dependencies.resolve<Map<string, unknown>>('cache');
cache.set('user:123', { name: 'Alice' });

await kernel.shutdown();
```

---

## Example 3: Capability Graph

```typescript
import { OracleKernel } from './src/oracle/kernel';

const kernel = new OracleKernel();
await kernel.initialize();

// Register capabilities with dependencies
kernel.capabilities.register({
  id: 'auth.identify',
  name: 'Identity Service',
  version: '1.0.0',
  provider: 'auth',
});

kernel.capabilities.register({
  id: 'auth.authorize',
  name: 'Authorization',
  version: '1.0.0',
  provider: 'auth',
  dependencies: ['auth.identify'],
});

kernel.capabilities.register({
  id: 'data.read',
  name: 'Data Read',
  version: '1.0.0',
  provider: 'data',
  dependencies: ['auth.authorize'],
});

// Query the graph
const dataReadDeps = kernel.capabilities.getDependencies('data.read');
console.log(dataReadDeps.map(c => c.id)); // ['auth.authorize']

const authCaps = kernel.capabilities.getByProvider('auth');
console.log(authCaps.map(c => c.id)); // ['auth.identify', 'auth.authorize']

await kernel.shutdown();
```

---

## Example 4: Health Monitoring

```typescript
import { OracleKernel } from './src/oracle/kernel';
import type { IHealthCheck } from './src/oracle/kernel';

const kernel = new OracleKernel();

// Register health checks
const checks: IHealthCheck[] = [
  {
    name: 'memory',
    async check() {
      const used = process.memoryUsage().heapUsed / 1024 / 1024;
      return {
        name: 'memory',
        status: used < 500 ? 'healthy' : 'degraded',
        message: `${used.toFixed(1)} MB used`,
        metadata: { heapUsedMB: used },
        checkedAt: new Date(),
      };
    },
  },
  {
    name: 'uptime',
    async check() {
      return {
        name: 'uptime',
        status: 'healthy',
        message: `${process.uptime().toFixed(0)}s`,
        checkedAt: new Date(),
      };
    },
  },
];

checks.forEach(c => kernel.health.register(c));
await kernel.initialize();

// Run a health report
const results = await kernel.health.checkAll();
results.forEach(r => {
  console.log(`[${r.status.toUpperCase()}] ${r.name}: ${r.message ?? 'ok'}`);
});

await kernel.shutdown();
```

---

## Example 5: Plugin System

```typescript
import { OracleKernel } from './src/oracle/kernel';
import type { IPlugin, IOracle } from './src/oracle/kernel';

function createLoggingPlugin(): IPlugin {
  return {
    id: 'logging-plugin',
    name: 'Logging Plugin',
    version: '1.0.0',
    minOracleVersion: '1.0.0',

    async initialize(oracle: IOracle) {
      const child = oracle.logger.child({ plugin: 'logging' });
      oracle.lifecycle.onStateChange(state => {
        child.info('State changed', { state });
      });
      oracle.dependencies.registerValue('pluginLogger', child);
    },

    async shutdown() {
      console.log('Logging plugin shutting down');
    },
  };
}

const kernel = new OracleKernel({ logLevel: 'info' });
await kernel.initialize();
await kernel.plugins.register(createLoggingPlugin());

console.log('Registered plugins:', kernel.plugins.getAll().map(p => p.id));

await kernel.plugins.unregister('logging-plugin'); // calls shutdown()
await kernel.shutdown();
```

---

## Example 6: Dependency Injection with Lifecycle

```typescript
import { OracleKernel } from './src/oracle/kernel';

class EventBus {
  private listeners = new Map<string, Array<(data: unknown) => void>>();
  on(event: string, fn: (data: unknown) => void) {
    (this.listeners.get(event) ?? this.listeners.set(event, []).get(event)!).push(fn);
  }
  emit(event: string, data: unknown) {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }
}

const kernel = new OracleKernel({ logLevel: 'warn' });

// Register singleton with lifecycle hooks
kernel.dependencies.registerSingleton('eventBus', () => new EventBus());

kernel.lifecycle.addInitializer('eventBus:setup', async () => {
  const bus = kernel.dependencies.resolve<EventBus>('eventBus');
  bus.on('error', data => kernel.errors.handle(new Error(String(data))));
}, 50);

kernel.lifecycle.addShutdownHandler('eventBus:teardown', async () => {
  kernel.logger.info('Event bus shutting down');
}, 50);

await kernel.initialize();

const bus = kernel.dependencies.resolve<EventBus>('eventBus');
bus.emit('ready', { timestamp: Date.now() });

await kernel.shutdown();
```
