import type { IOracle } from './index.ts';

export interface IModule {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  initialize?(oracle: IOracle): Promise<void>;
  shutdown?(): Promise<void>;
}

export interface IModuleRegistry {
  register(module: IModule): Promise<void>;
  unregister(name: string): Promise<void>;
  get(name: string): IModule | undefined;
  getAll(): IModule[];
  has(name: string): boolean;
}

export interface IPlugin extends IModule {
  validate(): boolean;
  compatibility(): string;
}

export interface IPluginRegistrar {
  register(plugin: IPlugin): Promise<void>;
  unregister(name: string): Promise<void>;
  isCompatible(plugin: IPlugin): boolean;
  getPlugins(): IPlugin[];
}
