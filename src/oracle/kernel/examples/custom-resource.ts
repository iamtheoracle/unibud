import type { IResource } from "../types/index.js";

export const customResource: IResource = {
  id: "resource-001",
  name: "Example Resource",
  type: "example",
  metadata: { owner: "module-a" },
  createdAt: new Date(),
  updatedAt: new Date(),
};
