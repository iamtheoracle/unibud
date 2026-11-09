import "server-only";

import { getAuthDatabasePool, getAppDatabasePool } from "../database/postgres-pool";
import { HttpVerificationDelivery } from "../auth/verification-delivery";
import { createIdentityServices } from "./identity-runtime-core";

export { createIdentityServices };
export type { IdentityRuntimeDependencies } from "./identity-runtime-core";

export function createConfiguredIdentityServices() {
  return createIdentityServices({
    authPool: getAuthDatabasePool(),
    appPool: getAppDatabasePool(),
    verificationDelivery: HttpVerificationDelivery.fromEnvironment()
  });
}
