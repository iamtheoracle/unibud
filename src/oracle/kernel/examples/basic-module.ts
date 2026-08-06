import type { IModule } from "../types/index.js";

export const basicModule: IModule = {
  name: "example-module",
  version: "1.0.0",
  description: "Demonstrates generic module registration",
  async initialize() {},
  async shutdown() {},
};
