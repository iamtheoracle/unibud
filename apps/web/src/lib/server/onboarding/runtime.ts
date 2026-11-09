import "server-only";

import { getAppDatabasePool } from "../database/postgres-pool";
import type { SessionService } from "../auth/session-core";
import { createOnboardingRuntime } from "./runtime-core";

export { createOnboardingRuntime };

export function createConfiguredOnboardingRuntime(sessions:SessionService) {
  return createOnboardingRuntime(sessions,getAppDatabasePool());
}
