import test from "node:test";
import assert from "node:assert/strict";
import { AuthenticationService, type AuthRepository, type AuthAccountRecord } from "../src/lib/server/auth/authentication-core.ts";
import { VerificationChallengeService, type NewVerificationChallenge } from "../src/lib/server/auth/verification-core.ts";
import { SessionService, type PersistedSession, type SessionRepository } from "../src/lib/server/auth/session-core.ts";

const now=new Date("2026-11-09T06:00:00.000Z");
class MemoryAuthRepository implements AuthRepository {
  created: Parameters<AuthRepository["registerPending"]>[0] | undefined;
  account: AuthAccountRecord | null = null;
  recovery: {accountId:string;identityId:string;channel:"email"|"phone";destination:string}|null=null;
  challengeAccount: string|null=null;
  resetHash:string|null=null;
  async registerPending(input:Parameters<AuthRepository["registerPending"]>[0]){
    this.created=input;this.challengeAccount=input.accountId;return true;
  }
  async findLoginAccount(){return this.account;}
  async findRecoveryTarget(){return this.recovery;}
  async findChallengeAccount(){return this.challengeAccount;}
  async completePasswordReset(_id:string,hash:string){this.resetHash=hash;return true;}
}
class MemoryChallengeRepository {
  stored=new Map<string,NewVerificationChallenge>();
  code="";
  async create(challenge:NewVerificationChallenge){this.stored.set(challenge.id,challenge);}
  async revoke(id:string){this.stored.delete(id);}
  async verifyAndConsume(input:{challengeId:string;codeDigest:Buffer}){
    const stored=this.stored.get(input.challengeId);
    if(!stored)return "not_found" as const;
    return stored.codeDigest.equals(input.codeDigest)?"verified" as const:"invalid" as const;
  }
}
class MemorySessionRepository implements SessionRepository {
  rows=new Map<string,PersistedSession>();
  async create(s:PersistedSession){this.rows.set(s.id,s);}
  async findByCredentialDigest(d:Buffer){
    const session=[...this.rows.values()].find(s=>s.credentialDigest.equals(d));
    return session?{session,account:{id:session.accountId,status:"active" as const}}:null;
  }
  async touch(){return true;}
  async revoke(id:string,at:string){const s=this.rows.get(id);if(s){s.status="revoked";s.revokedAt=at;}}
  async revokeAll(id:string,at:string){for(const s of this.rows.values())if(s.accountId===id){s.status="revoked";s.revokedAt=at;}}
  async rotate(){return false;}
}
function makeService(){
 const auth=new MemoryAuthRepository(),challengeRepo=new MemoryChallengeRepository(),sessionRepo=new MemorySessionRepository();
 const challenges=new VerificationChallengeService(
  challengeRepo,{async assertAllowed(){}},
  {async deliver(input){challengeRepo.code=input.code;}},
  Buffer.alloc(32,0x61)
 );
 const sessions=new SessionService(sessionRepo);
 const service=new AuthenticationService(auth,{async assertAllowed(){}},challenges,sessions,Buffer.alloc(32,0x71));
 return {service,auth,challengeRepo,sessionRepo};
}

test("registration creates server-generated account and identity IDs and issues bound verification",async()=>{
 const {service,auth,challengeRepo}=makeService();
 const result=await service.register({channel:"email",identifier:"Person@Example.com",password:"correct horse battery staple",now});
 assert.equal(result.ok,true);
 assert.equal(result.ok&&result.state,"verification_required");
 assert.ok(auth.created);
 assert.match(auth.created.accountId,/^[0-9a-f-]{36}$/);
 assert.match(auth.created.identityId,/^[0-9a-f-]{36}$/);
 assert.equal(auth.created.normalizedIdentifier,"person@example.com");
 assert.match(auth.created.passwordHash,/^scrypt\$/);
 const challenge=[...challengeRepo.stored.values()][0];
 assert.equal(challenge.accountId,auth.created.accountId);
 assert.equal(challenge.identityId,auth.created.identityId);
 assert.equal(challengeRepo.code.length,6);
});

test("login creates a session only for active accounts with verified identities",async()=>{
 const {service,auth,sessionRepo}=makeService();
 auth.account={id:"10000000-0000-4000-8000-000000000001",status:"active",identityId:"20000000-0000-4000-8000-000000000001",identityVerifiedAt:now.toISOString(),credentialHash:await (await import("../src/lib/server/auth/credential-core.ts")).hashPassword("correct horse battery staple")};
 const ok=await service.login({channel:"email",identifier:"person@example.com",password:"correct horse battery staple",now});
 assert.equal(ok.ok,true);
 assert.equal(ok.ok&&ok.state,"authenticated");
 assert.equal(sessionRepo.rows.size,1);
 const denied=await service.login({channel:"email",identifier:"missing@example.com",password:"correct horse battery staple",now});
 assert.deepEqual(denied,{ok:false,state:"invalid_credentials"});
});

test("password recovery response does not reveal whether an identity exists",async()=>{
 const {service,auth,challengeRepo}=makeService();
 const absent=await service.requestRecovery({channel:"email",identifier:"nobody@example.com",now});
 auth.recovery={accountId:"10000000-0000-4000-8000-000000000001",identityId:"20000000-0000-4000-8000-000000000001",channel:"email",destination:"person@example.com"};
 const present=await service.requestRecovery({channel:"email",identifier:"person@example.com",now});
 assert.deepEqual(absent,{ok:true,state:"accepted"});
 assert.deepEqual(present,{ok:true,state:"accepted"});
 assert.equal(challengeRepo.stored.size,1);
});

test("verified password recovery stores a new adaptive verifier through the atomic repository operation",async()=>{
 const {service,auth,challengeRepo}=makeService();
 auth.challengeAccount="10000000-0000-4000-8000-000000000001";
 const challenge=await (async()=>{
  const s=await service.requestRecovery({channel:"email",identifier:"person@example.com",now});
  assert.deepEqual(s,{ok:true,state:"accepted"});
  return [...challengeRepo.stored.values()][0];
 })();
 // Test recovery with a repository-provided target and a challenge created for that account.
 auth.recovery={accountId:auth.challengeAccount,identityId:"20000000-0000-4000-8000-000000000001",channel:"email",destination:"person@example.com"};
 await service.requestRecovery({channel:"email",identifier:"person@example.com",now});
 const latest=[...challengeRepo.stored.values()].at(-1)!;
 const result=await service.completeRecovery({challengeId:latest.id,code:challengeRepo.code,newPassword:"a much stronger replacement password",now});
 assert.deepEqual(result,{ok:true,state:"accepted"});
 assert.match(auth.resetHash??"",/^scrypt\$/);
});
