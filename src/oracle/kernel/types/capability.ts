export interface ICapability {
  id: string;
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  provider?: string;
  metadata?: Record<string, unknown>;
}

export interface ICapabilityRegistry {
  register(capability: ICapability): void;
  get(id: string): ICapability | undefined;
  getAll(): ICapability[];
  has(id: string): boolean;
  unregister(id: string): boolean;
  getByProvider(provider: string): ICapability[];
  getDependencies(id: string): ICapability[];
}
