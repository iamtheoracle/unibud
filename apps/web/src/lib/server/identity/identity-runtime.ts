import "server-only";

import { getAuthDatabasePool, getAppDatabasePool } from "../database/postgres-pool";
import { HttpVerificationDelivery } from "../auth/verification-delivery";
import { createIdentityServices } from "./identity-runtime-core";

export { createIdentityServices };
export type { IdentityRuntimeDependencies } from "./identity-runtime-core";

export function createConfiguredIdentityServices() {
  const endpoint=process.env.UNIBUD_VERIFICATION_DELIVERY_URL?.trim();
  const token=process.env.UNIBUD_VERIFICATION_DELIVERY_TOKEN?.trim();
  const verificationDelivery=endpoint && token
    ? HttpVerificationDelivery.fromEnvironment()
    : { async deliver(){ throw new Error("Verification delivery gateway is not configured."); } };
  return createIdentityServices({
    authPool: getAuthDatabasePool(),
    appPool: getAppDatabasePool(),
    verificationDelivery
  });
}
