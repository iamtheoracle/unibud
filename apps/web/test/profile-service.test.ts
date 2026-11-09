import test from "node:test";
import assert from "node:assert/strict";
import { ProfileAccessDeniedError, ProfileService, type DelegatedProfileGrantInput, type ProfileCreateInput, type ProfileRepository } from "../src/lib/server/profiles/profile-service-core.ts";
import type { ProfileAccessRecord } from "../../../packages/contracts/src/profile.ts";

const owner="10000000-0000-4000-8000-000000000001";
const delegate="10000000-0000-4000-8000-000000000002";
const profileId="20000000-0000-4000-8000-000000000001";
function access(accountId=owner,relationship:"owner"|"delegated"="owner",canSwitch=true):ProfileAccessRecord{
 return {accountId:accountId as ProfileAccessRecord["accountId"],relationship,membershipStatus:"active",canSwitchToProfile:canSwitch,
 profile:{id:profileId as ProfileAccessRecord["profile"]["id"],ownerAccountId:owner as ProfileAccessRecord["profile"]["ownerAccountId"],kind:"personal",handle:"oracle",displayName:"Oracle",visibility:"private",status:"active"}};
}
class Repo implements ProfileRepository{
 record=access(); grants=0; revoked=0;
 async createOwnedProfile(accountId:string,input:ProfileCreateInput){return {...access(accountId),profile:{...access(accountId).profile,kind:input.kind,handle:input.handle,displayName:input.displayName}};}
 async grantDelegatedAccess(_owner:string,input:DelegatedProfileGrantInput){this.grants++;return access(input.delegateAccountId,"delegated",input.canSwitchToProfile);}
 async revokeDelegatedAccess(){this.revoked++;return true;}
 async listAccessibleProfiles(){return [this.record];}
 async findProfileAccess(accountId:string){return this.record.accountId===accountId?this.record:undefined;}
}

test("creates profiles with normalized handle and safe defaults",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 const p=await service.createOwnedProfile(owner,{kind:"creator",handle:"  Creator.One ",displayName:"Creator"});
 assert.equal(p.profile.handle,"creator.one"); assert.equal(p.profile.kind,"creator");
});
test("rejects malformed handles and empty names",async()=>{
 const service=new ProfileService(new Repo());
 await assert.rejects(()=>service.createOwnedProfile(owner,{kind:"creator",handle:"bad handle",displayName:"Creator"}));
 await assert.rejects(()=>service.createOwnedProfile(owner,{kind:"creator",handle:"valid.handle",displayName:" "}));
});
test("only the actual active owner may grant or revoke delegated access",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 await assert.rejects(()=>service.grantDelegatedAccess(delegate,{profileId,delegateAccountId:"10000000-0000-4000-8000-000000000003",role:"editor",canSwitchToProfile:true}),ProfileAccessDeniedError);
 assert.equal(repo.grants,0);
 assert.equal(await service.revokeDelegatedAccess(owner,profileId,delegate),true);
 assert.equal(repo.revoked,1);
});
test("switching requires repository-backed membership and explicit switch permission",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 const result=await service.switchProfile(owner,profileId);
 assert.equal(result.activeProfile.activeProfileId,profileId);
 repo.record=access(delegate,"delegated",false);
 await assert.rejects(()=>service.switchProfile(delegate,profileId),ProfileAccessDeniedError);
});
