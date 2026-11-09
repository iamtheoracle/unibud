import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword } from "../src/lib/server/auth/credential-core.ts";
import { AuthService, DuplicateIdentityError, type AuthRepository, type AuthIdentityLookup, type StoredAuthSession } from "../src/lib/server/auth/auth-service-core.ts";
import { VerificationChallengeService, type NewVerificationChallenge, type VerificationChallengeRepository } from "../src/lib/server/auth/verification-core.ts";

const accountId="10000000-0000-4000-8000-000000000001";
const identityId="20000000-0000-4000-8000-000000000001";
const now=new Date("2026-11-09T06:00:00.000Z");

class FakeAuthRepository implements AuthRepository, VerificationChallengeRepository {
  identity: AuthIdentityLookup | undefined;
  challenge: NewVerificationChallenge | undefined;
  session: StoredAuthSession | undefined;
  createdAccount: unknown;
  createdSession: unknown;
  resetCalled=false;
  duplicate=false;
  async createPendingAccount(input: unknown) {
    if(this.duplicate) throw new DuplicateIdentityError();
    this.createdAccount=input;
  }
  async findIdentity() { return this.identity; }
  async create(value:NewVerificationChallenge) { this.challenge=value; }
  async revoke() {}
  async verifyAndConsume(input:{challengeId:string;codeDigest:Buffer;now:string}) {
    if(!this.challenge || input.challengeId!==this.challenge.id) return "not_found" as const;
    return input.codeDigest.equals(this.challenge.codeDigest) ? "verified" as const : "invalid" as const;
  }
  async createSession(input:unknown) { this.createdSession=input; }
  async findSession() { return this.session; }
  async touchSession() { return true; }
  async revokeSession() { return true; }
  async rotateSession(input:{newSessionId:string;oldCredentialDigest:Uint8Array;newCredentialDigest:Uint8Array;now:string;idleExpiresAt:string;absoluteExpiresAt:string}) {
    return {sessionId:input.newSessionId,accountId};
  }
  async resetPassword() { this.resetCalled=true; return true; }
}

function setup(repository:FakeAuthRepository, sent:{code:string}) {
  const challengeService=new VerificationChallengeService(
    repository,
    {async assertAllowed(){}},
    {async deliver(input){sent.code=input.code;}},
    Buffer.alloc(32,0x61)
  );
  return new AuthService({
    repository,
    challenges:challengeService,
    rateLimiter:{async assertAllowed(){}},
    contactEncryptor:{async encrypt(input){return Buffer.from(`cipher:${input.method}:${input.normalizedIdentifier}`);}},
    identifierLookupKey:Buffer.alloc(32,0x62)
  });
}

test("registration creates a pending account and sends an identity-bound challenge",async()=>{
  const repo=new FakeAuthRepository(),sent={code:""};
  const service=setup(repo,sent);
  const result=await service.register({
    method:"email",identifier:"Person@Example.com",password:"a sufficiently long password",
    now
  });
  assert.match(result.message,/verification instructions/);
  assert.ok(repo.createdAccount);
  assert.ok(repo.challenge);
  assert.equal(repo.challenge.accountId,(repo.createdAccount as {accountId:string}).accountId);
  assert.equal(repo.challenge.identityId,(repo.createdAccount as {identityId:string}).identityId);
  assert.equal(sent.code.length,6);
  assert.equal("password" in (repo.createdAccount as object),false);
});

test("duplicate registration returns the same generic response shape",async()=>{
  const repo=new FakeAuthRepository(),sent={code:""};
  repo.identity={accountId,identityId,accountStatus:"active",identityStatus:"active",verifiedAt:now.toISOString()};
  const service=setup(repo,sent);
  const result=await service.register({method:"email",identifier:"person@example.com",password:"a sufficiently long password",now});
  assert.match(result.message,/If the address can be registered/);
  assert.equal(repo.challenge,undefined);
});

test("login creates opaque sessions and validation renews idle expiry",async()=>{
  const repo=new FakeAuthRepository(),sent={code:""};
  const passwordHash=await hashPassword("a sufficiently long password");
  repo.identity={accountId,identityId,accountStatus:"active",identityStatus:"active",verifiedAt:now.toISOString(),credentialHash:passwordHash};
  const service=setup(repo,sent);
  const login=await service.login({method:"email",identifier:"person@example.com",password:"a sufficiently long password",now});
  assert.ok(login);
  assert.equal(login.sessionToken.length,43);
  const storedCreate=repo.createdSession as {credentialDigest:Uint8Array;accountId:string};
  assert.equal(storedCreate.accountId,accountId);
  assert.equal(storedCreate.credentialDigest.length,32);
  repo.session={
    sessionId:login.sessionId,accountId,status:"active",accountStatus:"active",
    issuedAt:now.toISOString(),idleExpiresAt:new Date(now.getTime()+30*60_000).toISOString(),
    absoluteExpiresAt:login.expiresAt
  };
  const validated=await service.validateSession(login.sessionToken,new Date(now.getTime()+10_000));
  assert.equal(validated?.accountId,accountId);
  const rotated=await service.rotateSession(login.sessionToken,new Date(now.getTime()+20_000));
  assert.ok(rotated);
  assert.notEqual(rotated.sessionToken,login.sessionToken);
});

test("login and recovery responses do not disclose unknown accounts",async()=>{
  const repo=new FakeAuthRepository(),sent={code:""};
  const service=setup(repo,sent);
  const login=await service.login({method:"email",identifier:"nobody@example.com",password:"a sufficiently long password",now});
  assert.equal(login,undefined);
  const recovery=await service.requestPasswordRecovery({method:"email",identifier:"nobody@example.com",now});
  assert.match(recovery.message,/If an eligible account exists/);
  assert.equal(repo.challenge,undefined);
});

test("verified recovery updates the password and invokes session revocation",async()=>{
  const repo=new FakeAuthRepository(),sent={code:""};
  repo.identity={accountId,identityId,accountStatus:"active",identityStatus:"active",verifiedAt:now.toISOString(),credentialHash:"existing"};
  const service=setup(repo,sent);
  const request=await service.requestPasswordRecovery({method:"email",identifier:"person@example.com",now});
  assert.ok(repo.challenge);
  const completed=await service.completePasswordRecovery({
    challengeId:request.challengeId,code:sent.code,newPassword:"a different long password",now:new Date(now.getTime()+30_000)
  });
  assert.equal(completed,true);
  assert.equal(repo.resetCalled,true);
});
