import "server-only";

import { AuthenticationService, type AuthRateLimiter } from "./authentication-core.ts";
import { VerificationChallengeService, type VerificationDelivery, type VerificationRateLimiter } from "./verification-core.ts";
import { SessionService } from "./session-core.ts";
import { createAuthRpcRepository } from "./auth-rpc-repository-core.ts";
import type { SqlPool } from "../database/account-context-core.ts";
import { ProfileService } from "../profiles/profile-service-core.ts";
import { ProfileProcedureRepository } from "../profiles/profile-procedure-repository.ts";
import { OnboardingService } from "../onboarding/onboarding-core.ts";
import { OnboardingProcedureRepository } from "../onboarding/onboarding-repository-core.ts";

function readRuntimeKey(name:string):Buffer {
 const value=process.env[name]?.trim()??"";
 if(!/^(?:[0-9a-f]{2}){32,}$/i.test(value)) throw new Error(name+" must be at least 32 random bytes encoded as hex.");
 return Buffer.from(value,"hex");
}

export interface IdentityRuntimeDependencies {
 /** Must authenticate as a dedicated LOGIN principal granted unibud_auth. */
 authPool:SqlPool;
 /** Must authenticate as a dedicated LOGIN principal granted unibud_app. */
 appPool:SqlPool;
 authRateLimiter:AuthRateLimiter;
 verificationRateLimiter:VerificationRateLimiter;
 verificationDelivery:VerificationDelivery;
}

export function createIdentityServices(dependencies:IdentityRuntimeDependencies){
 if(dependencies.authPool===dependencies.appPool) throw new Error("Authentication and application database pools must be separate role-bound pools.");
 const authRepository=createAuthRpcRepository(dependencies.authPool);
 const verification=new VerificationChallengeService(
  authRepository,dependencies.verificationRateLimiter,dependencies.verificationDelivery,
  readRuntimeKey("UNIBUD_VERIFICATION_DIGEST_KEY")
 );
 const sessions=new SessionService(authRepository);
 const authentication=new AuthenticationService(
  authRepository,dependencies.authRateLimiter,verification,sessions,
  readRuntimeKey("UNIBUD_RATE_LIMIT_DIGEST_KEY")
 );
 const profiles=new ProfileService(new ProfileProcedureRepository(dependencies.appPool));
 const onboarding=new OnboardingService(
  sessions,new OnboardingProcedureRepository(dependencies.appPool)
 );
 return {authentication,verification,sessions,profiles,onboarding};
}
