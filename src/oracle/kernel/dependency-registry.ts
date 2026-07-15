import type { DependencyDefinition } from './types.ts';

interface DependencyRecord extends DependencyDefinition {
  resolver: unknown | ((dependencies: unknown[]) => unknown | Promise<unknown>);
  instance?: unknown;
}

export class DependencyRegistry {
  definitions: Map<string, DependencyRecord>;

  constructor() {
    this.definitions = new Map();
  }

  register(name: string, resolver: unknown | ((dependencies: unknown[]) => unknown | Promise<unknown>), definition: DependencyDefinition = {}): void {
    if (this.definitions.has(name)) {
      throw new Error(`Dependency already registered: ${name}`);
    }

    this.definitions.set(name, {
      resolver,
      dependencies: definition.dependencies ?? [],
      singleton: definition.singleton ?? true,
      lazy: definition.lazy ?? true,
      metadata: definition.metadata ?? {},
    });
  }

  has(name: string): boolean {
    return this.definitions.has(name);
  }

  list(): string[] {
    return [...this.definitions.keys()];
  }

  getMetadata(name: string): Record<string, unknown> | undefined {
    return this.definitions.get(name)?.metadata;
  }

  getRegistrationOrder(names = this.list()): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const ordered: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) {
        return;
      }

      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${[...visiting, name].join(' -> ')}`);
      }

      const record = this.definitions.get(name);
      if (!record) {
        throw new Error(`Unknown dependency: ${name}`);
      }

      visiting.add(name);
      for (const dependency of record.dependencies ?? []) {
        visit(dependency);
      }
      visiting.delete(name);
      visited.add(name);
      ordered.push(name);
    };

    for (const name of names) {
      visit(name);
    }

    return ordered;
  }

  async resolve(name: string, trail: string[] = []): Promise<unknown> {
    const record = this.definitions.get(name);
    if (!record) {
      throw new Error(`Unknown dependency: ${name}`);
    }

    if (record.singleton && record.instance !== undefined) {
      return record.instance;
    }

    if (trail.includes(name)) {
      throw new Error(`Circular dependency detected: ${[...trail, name].join(' -> ')}`);
    }

    const dependencies = await Promise.all((record.dependencies ?? []).map((dependency) => this.resolve(dependency, [...trail, name])));
    const resolved = typeof record.resolver === 'function'
      ? await record.resolver(dependencies)
      : record.resolver;

    if (record.singleton) {
      record.instance = resolved;
    }

    return resolved;
  }

  async resolveMany(names: string[]): Promise<unknown[]> {
    return Promise.all(names.map((name) => this.resolve(name)));
  }

  async warmup(): Promise<void> {
    const eagerDependencies = [...this.definitions.entries()]
      .filter(([, definition]) => definition.lazy === false)
      .map(([name]) => name);

    await this.resolveMany(this.getRegistrationOrder(eagerDependencies));
  }
}
