# Oracle Kernel — Integration Guide

## Quick Start

```typescript
import { bootstrap } from './src/oracle/kernel';

const oracle = await bootstrap({
  config: { appName: 'my-app', port: 8080 },
  env: process.env,
  logLevel: 'info',
});

// oracle is ready — use it
oracle.config.get<string>('appName');

await oracle.shutdown();
```

## Manual Setup

```typescript
import { OracleKernel } from './src/oracle/kernel';

const kernel = new OracleKernel({ logLevel: 'debug' });
kernel.config.load({ feature: 'enabled' });
await kernel.initialize();
// ... use kernel ...
await kernel.shutdown();
```

## Lifecycle Guide

### 1. Configure before `initialize()`
```typescript
const kernel = new OracleKernel();
kernel.config.load({ db: { host: 'localhost' } });
kernel.dependencies.registerSingleton('db', () => new Database(kernel.config.get('db')));
```

### 2. Register initializers and shutdown handlers
```typescript
kernel.lifecycle.addInitializer('db:migrate', async () => {
  const db = kernel.dependencies.resolve<Database>('db');
  await db.migrate();
}, 10);

kernel.lifecycle.addShutdownHandler('db:close', async () => {
  const db = kernel.dependencies.resolve<Database>('db');
  await db.close();
}, 10);
```

### 3. Initialize
```typescript
await kernel.initialize(); // runs initializers in priority order
```

### 4. Use the kernel
```typescript
if (kernel.isReady()) {
  // All components are available
}
```

### 5. Shutdown
```typescript
process.on('SIGTERM', async () => {
  await kernel.shutdown(); // runs shutdown handlers in priority order
  process.exit(0);
});
```

## Registering Modules

```typescript
import type { IModule, IOracle } from './src/oracle/kernel';

const authModule: IModule = {
  name: 'auth',
  version: '1.0.0',
  description: 'Authentication module',
  async initialize(oracle: IOracle) {
    oracle.logger.info('Auth module initializing');
    oracle.dependencies.registerSingleton('authService', () => new AuthService(oracle.config));
  },
  async shutdown() {
    // cleanup
  },
};

kernel.modules.register(authModule);
await authModule.initialize?.(kernel);
```

## Registering Capabilities

```typescript
import type { ICapability } from './src/oracle/kernel';

kernel.capabilities.register({
  id: 'storage.read',
  name: 'Storage Read Access',
  version: '1.0.0',
  provider: 'storage-module',
  dependencies: ['auth.verify'],
});

// Query
kernel.capabilities.getByProvider('storage-module');
kernel.capabilities.getDependencies('storage.read');
```

## Adding Health Checks

```typescript
import type { IHealthCheck } from './src/oracle/kernel';

const dbCheck: IHealthCheck = {
  name: 'database',
  async check() {
    try {
      await db.ping();
      return { name: 'database', status: 'healthy', checkedAt: new Date() };
    } catch (error) {
      return {
        name: 'database',
        status: 'unhealthy',
        message: (error as Error).message,
        checkedAt: new Date(),
      };
    }
  },
};

kernel.health.register(dbCheck);
const results = await kernel.health.checkAll();
```

## Error Handling

```typescript
// Global error handler
const off = kernel.errors.onError((error, context) => {
  console.error('Unhandled error:', error.message, context);
});

// Wrap risky operations
const result = await kernel.errors.wrap(
  () => fetchExternalData(),
  { operation: 'fetchExternalData', userId: '123' },
);
```

## Plugins

```typescript
import type { IPlugin, IOracle } from './src/oracle/kernel';

const analyticsPlugin: IPlugin = {
  id: 'analytics',
  name: 'Analytics Plugin',
  version: '1.0.0',
  minOracleVersion: '1.0.0',
  async initialize(oracle: IOracle) {
    oracle.logger.info('Analytics plugin loaded');
    oracle.capabilities.register({ id: 'analytics.track', name: 'Track Events', version: '1.0.0' });
  },
};

await kernel.plugins.register(analyticsPlugin);
```
