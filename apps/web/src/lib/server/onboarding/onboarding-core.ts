import { SessionService } from "../auth/session-core.ts";

export interface OnboardingProfile {
  id: string;
  kind: "personal";
  handle: string;
  displayName: string;
  status: "active";
}
export interface OnboardingRepository {
  /**
   * One transaction: ensure one personal profile + owner membership, record both
   * policy versions, and return the existing profile on a safe retry.
   */
  completeOnboarding(accountId: string, sessionId: string, input: {
    handle: string;
    displayName: string;
    termsVersion: string;
    privacyVersion: string;
    acceptedAt: string;
  }): Promise<OnboardingProfile>;
}
export type OnboardingResult =
  | { ok: true; profile: OnboardingProfile; completed: true }
  | { ok: false; reason: "invalid_session" | "account_inactive" };

function validatePolicyVersion(value:string):string {
 const normalized=value.trim();
 if(!normalized || normalized.length>64) throw new Error("A valid policy version is required.");
 return normalized;
}
export class OnboardingService {
 private readonly sessions:SessionService;
 private readonly repository:OnboardingRepository;
 constructor(sessions:SessionService,repository:OnboardingRepository){
  this.sessions=sessions;this.repository=repository;
 }
 async complete(input:{
  sessionToken:string;handle:string;displayName:string;termsVersion:string;privacyVersion:string;
  acceptTerms:boolean;acceptPrivacy:boolean;now?:Date;
 }):Promise<OnboardingResult>{
  const now=input.now??new Date();
  if(input.acceptTerms!==true || input.acceptPrivacy!==true) throw new Error("Terms and privacy acceptance are required to continue.");
  const validated=await this.sessions.validate(input.sessionToken,now);
  if(!validated.valid) return {ok:false,reason:"invalid_session"};
  if(validated.account.status!=="active") return {ok:false,reason:"account_inactive"};
  if(process.env.NODE_ENV==="production" && process.env.UNIBUD_ONBOARDING_POLICIES_APPROVED!=="true") {
   throw new Error("Onboarding is unavailable until the current Terms and Privacy Notice are approved for production.");
  }
  const handle=input.handle.trim().toLowerCase();
  if(!/^[a-z0-9][a-z0-9._-]{1,28}[a-z0-9]$/.test(handle)) throw new Error("Invalid personal profile handle.");
  const displayName=input.displayName.trim();
  if(!displayName || displayName.length>80) throw new Error("Display name must be 1–80 characters.");
  const profile=await this.repository.completeOnboarding(validated.account.id,validated.session.id,{
   handle,displayName,termsVersion:validatePolicyVersion(input.termsVersion),
   privacyVersion:validatePolicyVersion(input.privacyVersion),acceptedAt:now.toISOString()
  });
  return {ok:true,profile,completed:true};
 }
}
