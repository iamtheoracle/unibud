import type { ICapability } from "../types/index.js";

export const customCapability: ICapability = {
  name: "example-capability",
  version: "1.0.0",
  description: "Demonstrates generic capability registration",
  metadata: { source: "example-module" },
};
