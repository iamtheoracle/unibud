import "server-only";

export { VerificationChallengeService } from "./verification-core";
export type {
  ChallengeVerificationResult,
  IssueVerificationInput,
  IssuedVerificationChallenge,
  NewVerificationChallenge,
  VerificationChannel,
  VerificationChallengeRepository,
  VerificationDelivery,
  VerificationPurpose,
  VerificationRateLimiter
} from "./verification-core";
