import { ProfileService } from "./profile-service-core.ts";
import { ProfileProcedureRepository } from "./profile-procedure-repository.ts";
import type { SqlPool } from "../database/account-context-core.ts";

export function createProfileRuntime(appPool:SqlPool) {
  const repository=new ProfileProcedureRepository(appPool);
  return {repository,service:new ProfileService(repository)};
}
