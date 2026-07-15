export interface ICapability {
  name: string;
  version: string;
  provider: string;
  description?: string;
  dependencies?: string[];
}

export interface ICapabilityRegistry {
  register(capability: ICapability): Promise<void>;
  query(filter?: Partial<ICapability>): ICapability[];
  get(name: string): ICapability | undefined;
  has(name: string): boolean;
  getByProvider(provider: string): ICapability[];
}
