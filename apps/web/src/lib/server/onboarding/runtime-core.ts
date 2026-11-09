import { OnboardingService } from "./onboarding-core.ts";
import { OnboardingProcedureRepository } from "./onboarding-repository-core.ts";
import type { SessionService } from "../auth/session-core.ts";
import type { SqlPool } from "../database/account-context-core.ts";

export function createOnboardingRuntime(sessions:SessionService,appPool:SqlPool) {
  const repository=new OnboardingProcedureRepository(appPool);
  return {repository,service:new OnboardingService(sessions,repository)};
}
