import test from "node:test";
import assert from "node:assert/strict";
import { OnboardingService, type OnboardingRepository } from "../src/lib/server/onboarding/onboarding-core.ts";
import { SessionService, type PersistedSession, type SessionRepository } from "../src/lib/server/auth/session-core.ts";

class Sessions implements SessionRepository{
 rows=new Map<string,PersistedSession>();
 async create(s:PersistedSession){this.rows.set(s.id,s);}
 async findByCredentialDigest(d:Buffer){const s=[...this.rows.values()].find(x=>x.credentialDigest.equals(d));return s?{session:s,account:{id:s.accountId,status:"active" as const}}:null;}
 async touch(){return true;} async revoke(){} async revokeAll(){} async rotate(){return false;}
}
class OnboardingStore implements OnboardingRepository{
 calls=0;lastAccount="";lastSession="";profile={id:"20000000-0000-4000-8000-000000000001",kind:"personal" as const,handle:"oracle",displayName:"Oracle",status:"active" as const};
 async completeOnboarding(accountId:string,sessionId:string,input:Parameters<OnboardingRepository["completeOnboarding"]>[2]){
  this.calls++;this.lastAccount=accountId;this.lastSession=sessionId;this.profile={...this.profile,handle:input.handle,displayName:input.displayName};return this.profile;
 }
}
test("onboarding derives account from a verified session and persists policy versions",async()=>{
 const sessions=new Sessions(),sessionService=new SessionService(sessions),store=new OnboardingStore();
 const issued=await sessionService.issue({id:"10000000-0000-4000-8000-000000000001",status:"active"},new Date("2026-11-09T06:00:00Z"));
 const service=new OnboardingService(sessionService,store);
 const result=await service.complete({sessionToken:issued.token,handle:" Oracle ",displayName:"Oracle",termsVersion:"terms-v1",privacyVersion:"privacy-v1",acceptTerms:true,acceptPrivacy:true,now:new Date("2026-11-09T06:01:00Z")});
 assert.equal(result.ok,true);assert.equal(store.lastAccount,"10000000-0000-4000-8000-000000000001");assert.equal(store.lastSession,issued.session.id);
 assert.equal(result.ok&&result.profile.handle,"oracle");assert.equal(store.calls,1);
});
test("onboarding rejects missing or expired sessions and never accepts a caller account ID",async()=>{
 const sessions=new Sessions(),service=new OnboardingService(new SessionService(sessions),new OnboardingStore());
 const result=await service.complete({sessionToken:"not-a-session",handle:"oracle",displayName:"Oracle",termsVersion:"v1",privacyVersion:"v1",acceptTerms:true,acceptPrivacy:true});
 assert.deepEqual(result,{ok:false,reason:"invalid_session"});
});
test("onboarding validates handle, display name and policy versions",async()=>{
 const sessions=new Sessions(),ss=new SessionService(sessions),store=new OnboardingStore();
 const issued=await ss.issue({id:"10000000-0000-4000-8000-000000000001",status:"active"});
 const service=new OnboardingService(ss,store);
 await assert.rejects(()=>service.complete({sessionToken:issued.token,handle:"bad handle",displayName:"Oracle",termsVersion:"v1",privacyVersion:"v1",acceptTerms:true,acceptPrivacy:true}));
 await assert.rejects(()=>service.complete({sessionToken:issued.token,handle:"oracle",displayName:" ",termsVersion:"v1",privacyVersion:"v1",acceptTerms:true,acceptPrivacy:true}));
});
