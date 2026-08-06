# Oracle Kernel — Components

## ConfigManager

Stores arbitrary key-value configuration. Values are typed via generics.

```typescript
config.set('db.host', 'localhost');
config.get<string>('db.host');         // 'localhost'
config.get<number>('db.port', 5432);   // 5432 (default)
config.has('db.host');                 // true
config.load({ debug: true, port: 8080 });
config.getAll();                       // { debug: true, port: 8080, ... }
```

Throws `Error` when `get` is called for a missing key with no default.

---

## EnvironmentManager

Reads environment variables with type coercion. Treats empty strings as missing.

```typescript
env.get('NODE_ENV');                   // 'production' | undefined
env.get('NODE_ENV', 'development');    // with default
env.getRequired('DATABASE_URL');       // throws if missing or empty
env.getBoolean('DEBUG');               // true/false
env.getNumber('PORT', 3000);           // number | undefined
env.has('MY_VAR');                     // false for '' or undefined
env.getAll();                          // snapshot of all vars
```

---

## DependencyInjector

Lightweight IoC container supporting transient, singleton, and value registrations.

```typescript
di.register('svc', () => new MyService());            // transient
di.registerSingleton('db', () => new Database());      // singleton
di.registerValue('apiUrl', 'https://api.example.com'); // value
di.resolve<MyService>('svc');
di.has('svc');
di.unregister('svc');
```

Detects circular dependencies and throws `Error` before stack overflow.

---

## ModuleRegistry

Registry for named, versioned modules. Throws on duplicate registration.

```typescript
modules.register({ name: 'auth', version: '1.0.0' });
modules.get('auth');        // IModule | undefined
modules.getAll();           // IModule[]
modules.has('auth');        // boolean
modules.unregister('auth'); // boolean
```

---

## CapabilityRegistry

Registry for named capabilities with provider grouping and dependency resolution.

```typescript
capabilities.register({ id: 'storage.read', name: 'Storage Read', version: '1.0.0', provider: 'storage' });
capabilities.get('storage.read');
capabilities.getByProvider('storage');   // ICapability[]
capabilities.getDependencies('cap.id');  // resolved ICapability[]
```

---

## LifecycleManager

Enforces the kernel state machine. Runs prioritised initializers and shutdown handlers.

```typescript
lifecycle.getState();                           // LifecycleState
lifecycle.isReady();                            // boolean
const off = lifecycle.onStateChange(state => console.log(state));
off(); // unsubscribe

lifecycle.addInitializer('db:connect', async () => { ... }, 50);
lifecycle.addShutdownHandler('db:disconnect', async () => { ... }, 50);
await lifecycle.initialize();
await lifecycle.shutdown();
```

Higher priority number runs first.

---

## HealthManager

Registers named health checks and aggregates results.

```typescript
health.register({
  name: 'database',
  check: async () => ({ name: 'database', status: 'healthy', checkedAt: new Date() }),
});
const result = await health.check('database');
const all = await health.checkAll();
health.getStatus();   // synchronous aggregate: 'healthy' | 'unknown'
health.unregister('database');
```

---

## Logger

Structured logger with levels, context merging, and child loggers.

```typescript
logger.setLevel('debug');
logger.debug('connecting...', { host: 'localhost' });
logger.info('ready');
logger.warn('slow query', { ms: 1200 });
logger.error('connection failed', error, { retries: 3 });
const child = logger.child({ service: 'auth' }); // inherits context
```

Level ordering: `debug < info < warn < error`. Messages below the current level are suppressed.

---

## ErrorBoundary

Captures errors and routes them to registered handlers without swallowing them.

```typescript
const off = errors.onError((err, ctx) => metrics.increment('errors', ctx));
off(); // unsubscribe

const result = await errors.wrap(async () => riskyOperation(), { requestId: '123' });
errors.handle(new Error('manual'));
errors.clearHandlers();
```

Handler errors are caught silently to prevent cascading failures.

---

## PluginRegistrar

Manages plugin lifecycle with version compatibility checks.

```typescript
await plugins.register({
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  minOracleVersion: '1.0.0',
  initialize: async (oracle) => { ... },
  shutdown: async () => { ... },
});
plugins.isCompatible(plugin);   // boolean
plugins.get('my-plugin');        // IPlugin | undefined
await plugins.unregister('my-plugin');
```

---

## VersionManager

Parses and compares semantic versions. Compatibility is based on major version equality.

```typescript
version.getKernelVersion();                     // IVersionInfo { major, minor, patch, toString }
version.parseVersion('2.1.0-beta.1');           // IVersionInfo
version.isCompatible('1.5.0');                  // true (same major)
version.isCompatible('2.0.0');                  // false (different major)
version.registerComponentVersion('db', '3.1.0');
version.getComponentVersion('db');              // IVersionInfo
```
