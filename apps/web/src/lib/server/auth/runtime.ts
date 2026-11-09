import "server-only";

import { getAuthDatabasePool } from "../database/postgres-pool";
import { HttpVerificationDelivery } from "./verification-delivery";
import { createAuthenticationRuntime } from "./runtime-core";

export { createAuthenticationRuntime };

export function createConfiguredAuthenticationRuntime() {
  return createAuthenticationRuntime(
    getAuthDatabasePool(),
    HttpVerificationDelivery.fromEnvironment()
  );
}
