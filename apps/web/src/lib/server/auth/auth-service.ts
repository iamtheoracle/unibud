import "server-only";

export { AuthService, DuplicateIdentityError, createIdentifierLookupDigest } from "./auth-service-core";
export type {
  AuthAction,
  AuthIdentityLookup,
  AuthRateLimiter,
  AuthRepository,
  AuthServiceDependencies,
  ContactEncryptor,
  LoginMethod,
  LoginResult,
  RegistrationResult,
  StoredAuthSession,
  VerifiedSession
} from "./auth-service-core";
