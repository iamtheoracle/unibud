import "server-only";

import { getAppDatabasePool } from "../database/postgres-pool";
import { createProfileRuntime } from "./runtime-core";

export { createProfileRuntime };

export function createConfiguredProfileRuntime() {
  return createProfileRuntime(getAppDatabasePool());
}
