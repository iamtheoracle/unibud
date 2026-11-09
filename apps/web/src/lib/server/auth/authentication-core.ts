import { createHmac, randomUUID } from "node:crypto";
import { hashPassword, verifyPassword } from "./credential-core.ts";
import { VerificationChallengeService, type VerificationChannel } from "./verification-core.ts";
import { SessionService } from "./session-core.ts";

export interface AuthAccountRecord {
  id: string;
  status: "pending_verification" | "active" | "restricted" | "suspended" | "closed";
  identityId: string;
  identityVerifiedAt: string | null;
  credentialHash: string;
}
export interface RecoveryTarget {
  accountId: string;
  identityId: string;
  channel: VerificationChannel;
  destination: string;
}
export interface AuthRepository {
  /** Atomic account + identity + password-verifier insert. False means duplicate identifier. */
  registerPending(input: {
    accountId: string; identityId: string; issuer: string; subject: string;
    method: VerificationChannel; normalizedIdentifier: string; passwordHash: string;
  }): Promise<boolean>;
  findLoginAccount(normalizedIdentifier: string, channel: VerificationChannel): Promise<AuthAccountRecord | null>;
  findRecoveryTarget(normalizedIdentifier: string, channel: VerificationChannel): Promise<RecoveryTarget | null>;
  findChallengeAccount(challengeId: string): Promise<string | null>;
  /** Implement with auth_reset_password; this must atomically consume the verified challenge. */
  completePasswordReset(challengeId: string, passwordHash: string, now: string): Promise<boolean>;
}
export interface AuthRateLimiter {
  assertAllowed(input: { action: "register" | "login" | "recovery"; identifierDigest: string; now: string }): Promise<void>;
}
export type AuthResult =
  | { ok: true; state: "verification_required"; challengeId: string; expiresAt: string }
  | { ok: true; state: "authenticated"; token: string; accountId: string }
  | { ok: true; state: "accepted" }
  | { ok: false; state: "invalid_credentials" | "verification_failed" };

const DUMMY_VERIFIER = "scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
function normalizeIdentifier(channel: VerificationChannel, identifier: string): string {
  const value=identifier.trim();
  if(channel==="email") {
    const normalized=value.toLowerCase();
    if(normalized.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new Error("Invalid email address.");
    return normalized;
  }
  if(!/^\+[1-9]\d{7,14}$/.test(value)) throw new Error("Phone number must use E.164 format.");
  return value;
}
export class AuthenticationService {
  private readonly repository: AuthRepository;
  private readonly limiter: AuthRateLimiter;
  private readonly challenges: VerificationChallengeService;
  private readonly sessions: SessionService;
  private readonly identifierDigestKey: Uint8Array;
  constructor(repository: AuthRepository,limiter: AuthRateLimiter,challenges: VerificationChallengeService,
    sessions: SessionService,identifierDigestKey: Uint8Array) {
    if(identifierDigestKey.byteLength<32) throw new Error("Identifier digest key must contain at least 32 bytes.");
    this.repository=repository;this.limiter=limiter;this.challenges=challenges;
    this.sessions=sessions;this.identifierDigestKey=identifierDigestKey;
  }
  private digestIdentifier(identifier:string,channel:VerificationChannel):string {
    return createHmac("sha256",this.identifierDigestKey).update("identifier:"+channel+":"+identifier,"utf8").digest("hex");
  }
  async register(input:{channel:VerificationChannel;identifier:string;password:string;now?:Date}):Promise<AuthResult>{
    const now=input.now??new Date(),identifier=normalizeIdentifier(input.channel,input.identifier);
    await this.limiter.assertAllowed({action:"register",identifierDigest:this.digestIdentifier(identifier,input.channel),now:now.toISOString()});
    const accountId=randomUUID(),identityId=randomUUID(),passwordHash=await hashPassword(input.password);
    const created=await this.repository.registerPending({
      accountId,identityId,issuer:"urn:unibud:first-party",subject:identityId,method:input.channel,
      normalizedIdentifier:identifier,passwordHash
    });
    if(!created) return {ok:true,state:"accepted"};
    const challenge=await this.challenges.issue({
      accountId,identityId,channel:input.channel,
      purpose:input.channel==="email"?"email_verification":"phone_verification",
      destination:identifier,now
    });
    return {ok:true,state:"verification_required",challengeId:challenge.challengeId,expiresAt:challenge.expiresAt};
  }
  async completeVerification(input:{challengeId:string;purpose:"email_verification"|"phone_verification";code:string;now?:Date}):Promise<AuthResult>{
    const accountId=await this.repository.findChallengeAccount(input.challengeId);
    if(!accountId) return {ok:false,state:"verification_failed"};
    const result=await this.challenges.verify({challengeId:input.challengeId,purpose:input.purpose,code:input.code,now:input.now});
    return result==="verified"?{ok:true,state:"accepted"}:{ok:false,state:"verification_failed"};
  }
  async login(input:{channel:VerificationChannel;identifier:string;password:string;now?:Date}):Promise<AuthResult>{
    const now=input.now??new Date(),identifier=normalizeIdentifier(input.channel,input.identifier);
    await this.limiter.assertAllowed({action:"login",identifierDigest:this.digestIdentifier(identifier),now:now.toISOString()});
    const account=await this.repository.findLoginAccount(identifier,input.channel);
    const passwordValid=await verifyPassword(input.password,account?.credentialHash??DUMMY_VERIFIER);
    if(!account || !passwordValid || !account.identityVerifiedAt || account.status!=="active") {
      return {ok:false,state:"invalid_credentials"};
    }
    const session=await this.sessions.issue({id:account.id,status:account.status},now);
    return {ok:true,state:"authenticated",token:session.token,accountId:account.id};
  }
  async requestRecovery(input:{channel:VerificationChannel;identifier:string;now?:Date}):Promise<AuthResult>{
    const now=input.now??new Date(),identifier=normalizeIdentifier(input.channel,input.identifier);
    await this.limiter.assertAllowed({action:"recovery",identifierDigest:this.digestIdentifier(identifier),now:now.toISOString()});
    const target=await this.repository.findRecoveryTarget(identifier,input.channel);
    if(target) await this.challenges.issue({
      accountId:target.accountId,identityId:target.identityId,channel:target.channel,
      purpose:"password_reset",destination:target.destination,now
    });
    return {ok:true,state:"accepted"};
  }
  async completeRecovery(input:{challengeId:string;code:string;newPassword:string;now?:Date}):Promise<AuthResult>{
    const verified=await this.challenges.verify({
      challengeId:input.challengeId,purpose:"password_reset",code:input.code,now:input.now
    });
    if(verified!=="verified") return {ok:false,state:"verification_failed"};
    const passwordHash=await hashPassword(input.newPassword);
    const completed=await this.repository.completePasswordReset(input.challengeId,passwordHash,(input.now??new Date()).toISOString());
    return completed?{ok:true,state:"accepted"}:{ok:false,state:"verification_failed"};
  }
}
