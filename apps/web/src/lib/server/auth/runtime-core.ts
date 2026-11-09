import { AuthenticationService } from "./authentication-core.ts";
import { createAuthRpcRepository } from "./auth-rpc-repository-core.ts";
import { SessionService } from "./session-core.ts";
import { VerificationChallengeService, type VerificationDelivery } from "./verification-core.ts";
import type { SqlPool } from "../database/account-context-core.ts";

function readKey(name:string):Buffer {
  const value=process.env[name]?.trim()??"";
  if(!/^(?:[0-9a-f]{2}){32,}$/i.test(value)) {
    throw new Error(name+" must be at least 32 random bytes encoded as hex.");
  }
  return Buffer.from(value,"hex");
}

/** Provider-neutral service composition; caller supplies the restricted auth DB pool and delivery adapter. */
export function createAuthenticationRuntime(pool:SqlPool,delivery:VerificationDelivery) {
  const repository=createAuthRpcRepository(pool);
  const rateLimitKey=readKey("UNIBUD_RATE_LIMIT_HMAC_KEY");
  const verificationKey=readKey("UNIBUD_VERIFICATION_HMAC_KEY");
  const sessions=new SessionService(repository);
  const challenges=new VerificationChallengeService(repository,repository,delivery,verificationKey);
  const authentication=new AuthenticationService(
    repository,repository,challenges,sessions,rateLimitKey
  );
  return {repository,sessions,challenges,authentication};
}
