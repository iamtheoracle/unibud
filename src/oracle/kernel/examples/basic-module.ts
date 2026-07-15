import type { IModule } from '../types/index.ts';

export const basicModule: IModule = {
  name: 'basic-module',
  version: '1.0.0',
  description: 'Minimal infrastructure module example',
  async initialize() {
    // module startup logic
  },
  async shutdown() {
    // module shutdown logic
  },
};
