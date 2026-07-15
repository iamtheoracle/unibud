import type { IService } from './types.ts';

interface ServiceRecord {
  service: IService;
  metadata: Record<string, unknown>;
}

export class ServiceRegistry {
  services: Map<string, ServiceRecord>;

  constructor() {
    this.services = new Map();
  }

  register(service: IService, metadata: Record<string, unknown> = {}): void {
    if (this.services.has(service.name)) {
      throw new Error(`Service already registered: ${service.name}`);
    }

    this.services.set(service.name, {
      service,
      metadata,
    });
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  get(name: string): IService | undefined {
    return this.services.get(name)?.service;
  }

  getMetadata(name: string): Record<string, unknown> | undefined {
    return this.services.get(name)?.metadata;
  }

  list(): IService[] {
    return [...this.services.values()].map((record) => record.service);
  }

  getVersions(): Record<string, string> {
    return this.list().reduce<Record<string, string>>((accumulator, service) => {
      accumulator[service.name] = service.version;
      return accumulator;
    }, {});
  }
}
