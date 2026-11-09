import { hashPassword, verifyPassword } from "./credential-core";
import { VerificationChallengeService, type VerificationChannel } from "./verification-core";
import { SessionService, type SessionAccount } from "./session-core";

export interface AuthAccountRecord extends SessionAccount {
  primaryIdentityVerified: boolean;
  credentialHash: string;
}

export interface RecoveryTarget {
  accountId: string;
  channel: VerificationChannel;
  destination: string;
}

export interface AuthRepository {
  /** Must atomically create pending account, identity and password verifier. */
  registerPending(input: {
    accountId: string;
    identityId: string;
    issuer: string;
    subject: string;
    method: VerificationChannel;
    normalizedIdentifier: string;
    passwordHash: string;
  }): Promise<void>;
  findLoginAccount(normalizedIdentifier: string): Promise<AuthAccountRecord | null>;
  markIdentityVerified(accountId: string, channel: VerificationChannel): Promise<boolean>;
  activateIfVerificationRequirementsMet(accountId: string): Promise<boolean>;
  findRecoveryTarget(normalizedIdentifier: string): Promise<RecoveryTarget | null>;
  findChallengeAccount(challengeId: string): Promise<string | null>;
  updatePassword(accountId: string, passwordHash: string): Promise<void>;
}

export interface AuthRateLimiter {
  assertAllowed(input: { action: "register" | "login" | "recovery"; identifierDigest: string; now: string }): Promise<void>;
}

export type AuthResult =
  | { ok: true; state: "verification_required"; challengeId: string; expiresAt: string }
  | { ok: true; state: "authenticated"; token: string; accountId: string }
  | { ok: true; state: "accepted" }
  | { ok: false; state: "invalid_credentials" | "verification_failed" };

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

  constructor(
    repository: AuthRepository,
    limiter: AuthRateLimiter,
    challenges: VerificationChallengeService,
    sessions: SessionService,
    identifierDigestKey: Uint8Array
  ) {
    if(identifierDigestKey.byteLength<32) throw new Error("Identifier digest key must contain at least 32 bytes.");
    this.repository=repository;
    this.limiter=limiter;
    this.challenges=challenges;
    this.sessions=sessions;
    this.identifierDigestKey=identifierDigestKey;
  }

  private digestIdentifier(identifier: string): string {
    // The rate limiter stores only a keyed digest, never the raw identifier.
    const { createHmac } = requireCrypto();
    return createHmac("sha256",this.identifierDigestKey).update(identifier,"utf8").digest("hex");
  }

  async register(input:{
    accountId:string; identityId:string; channel:VerificationChannel; identifier:string;
    password:string; now?:Date;
  }):Promise<AuthResult>{
    const now=input.now??new Date();
    const identifier=normalizeIdentifier(input.channel,input.identifier);
    await this.limiter.assertAllowed({action:"register",identifierDigest:this.digestIdentifier(identifier),now:now.toISOString()});
    const passwordHash=await hashPassword(input.password);
    try{
      await this.repository.registerPending({
        accountId:input.accountId,identityId:input.identityId,issuer:"unibud:first-party",
        subject:input.identityId,method:input.channel,normalizedIdentifier:identifier,passwordHash
      });
    }catch{
      // Duplicate and policy failures are not disclosed through public registration responses.
      return {ok:true,state:"accepted"};
    }
    const challenge=await this.challenges.issue({
      accountId:input.accountId,channel:input.channel,
      purpose:input.channel==="email"?"email_verification":"phone_verification",
      destination:identifier,now
    });
    return {ok:true,state:"verification_required",challengeId:challenge.challengeId,expiresAt:challenge.expiresAt};
  }

  async completeVerification(input:{accountId:string;challengeId:string;purpose:"email_verification"|"phone_verification";code:string;now?:Date}):Promise<AuthResult>{
    const result=await this.challenges.verify({challengeId:input.challengeId,purpose:input.purpose,code:input.code,now:input.now});
    if(result!=="verified") return {ok:false,state:"verification_failed"};
    const marked=await this.repository.markIdentityVerified(input.accountId,input.purpose==="email_verification"?"email":"phone");
    if(!marked) return {ok:false,state:"verification_failed"};
    await this.repository.activateIfVerificationRequirementsMet(input.accountId);
    return {ok:true,state:"accepted"};
  }

  async login(input:{channel:VerificationChannel;identifier:string;password:string;now?:Date}):Promise<AuthResult>{
    const now=input.now??new Date();
    const identifier=normalizeIdentifier(input.channel,input.identifier);
    await this.limiter.assertAllowed({action:"login",identifierDigest:this.digestIdentifier(identifier),now:now.toISOString()});
    const account=await this.repository.findLoginAccount(identifier);
    const passwordValid=await verifyPassword(input.password,account?.credentialHash??"scrypt$ln=17,r=8,p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    if(!account || !passwordValid || !account.primaryIdentityVerified || account.status!=="active") {
      return {ok:false,state:"invalid_credentials"};
    }
    const session=await this.sessions.issue({id:account.id,status:account.status},now);
    return {ok:true,state:"authenticated",token:session.token,accountId:account.id};
  }

  async requestRecovery(input:{channel:VerificationChannel;identifier:string;now?:Date}):Promise<AuthResult>{
    const now=input.now??new Date();
    const identifier=normalizeIdentifier(input.channel,input.identifier);
    await this.limiter.assertAllowed({action:"recovery",identifierDigest:this.digestIdentifier(identifier),now:now.toISOString()});
    const target=await this.repository.findRecoveryTarget(identifier);
    if(target){
      await this.challenges.issue({
        accountId:target.accountId,channel:target.channel,purpose:"password_reset",
        destination:target.destination,now
      });
    }
    // Same response whether or not the identity exists.
    return {ok:true,state:"accepted"};
  }

  async completeRecovery(input:{challengeId:string;code:string;newPassword:string;now?:Date}):Promise<AuthResult>{
    const verified=await this.challenges.verify({
      challengeId:input.challengeId,purpose:"password_reset",code:input.code,now:input.now
    });
    if(verified!=="verified") return {ok:false,state:"verification_failed"};
    const accountId=await this.repository.findChallengeAccount(input.challengeId);
    if(!accountId) return {ok:false,state:"verification_failed"};
    const passwordHash=await hashPassword(input.newPassword);
    await this.repository.updatePassword(accountId,passwordHash);
    await this.sessions.revokeAll(accountId,input.now??new Date(),"password_recovery");
    return {ok:true,state:"accepted"};
  }
}

// Keep crypto access explicit without introducing a platform/global dependency.
function requireCrypto(){
  return cryptoModule;
}
import { createHmac as hmac } from "node:crypto";
const cryptoModule={createHmac:hmac};
