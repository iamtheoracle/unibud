import test from "node:test";
import assert from "node:assert/strict";
import { ProfileAccessDeniedError, ProfileService, type ProfileCreateInput, type ProfileRepository } from "../src/lib/server/profiles/profile-service-core.ts";
import type { ProfileAccessRecord } from "../../../packages/contracts/src/profile.ts";

const owner="10000000-0000-4000-8000-000000000001";
const delegate="10000000-0000-4000-8000-000000000002";
const profileId="20000000-0000-4000-8000-000000000001";
function access(accountId=owner,relationship:"owner"|"delegated"="owner",canSwitch=true):ProfileAccessRecord{
 return {accountId:accountId as ProfileAccessRecord["accountId"],relationship,membershipStatus:"active",canSwitchToProfile:canSwitch,
 profile:{id:profileId as ProfileAccessRecord["profile"]["id"],ownerAccountId:owner as ProfileAccessRecord["profile"]["ownerAccountId"],kind:"personal",handle:"oracle",displayName:"Oracle",visibility:"private",status:"active"}};
}
class Repo implements ProfileRepository{
 record=access(); revoked=0; activeContext=false; invitationInput:unknown=null; invitationResponse:unknown=null;
 async createOwnedProfile(accountId:string,input:ProfileCreateInput){return {...access(accountId),profile:{...access(accountId).profile,kind:input.kind,handle:input.handle,displayName:input.displayName}};}
 async revokeDelegatedAccess(){this.revoked++;return true;}
 async listAccessibleProfiles(){return [this.record];}
 async listDelegatedAccess(){return [access(delegate,"delegated",true)];}
 async findProfileAccess(accountId:string){return this.record.accountId===accountId?this.record:undefined;}
 async inviteDelegateByHandle(_owner:string,input:Parameters<ProfileRepository["inviteDelegateByHandle"]>[1]){this.invitationInput=input;return {id:"60000000-0000-4000-8000-000000000001",inviteeHandle:input.inviteeHandle,inviteeDisplayName:"Invitee"};}
 async listIncomingInvitations(){return [];}
 async respondToInvitation(_account:string,id:string,accept:boolean){this.invitationResponse={id,accept};return true;}
 async setActiveProfileContext(){this.activeContext=true;return true;}
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
test("only the active page owner may revoke delegated access",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 assert.equal(await service.revokeDelegatedAccess(owner,profileId,delegate),true);
 assert.equal(repo.revoked,1);
 await assert.rejects(()=>service.revokeDelegatedAccess(delegate,profileId,owner),ProfileAccessDeniedError);
});
test("switching requires repository-backed membership and explicit switch permission",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 const result=await service.switchProfile(owner,"40000000-0000-4000-8000-000000000001",profileId);
 assert.equal(result.activeProfile.activeProfileId,profileId);
 repo.record=access(delegate,"delegated",false);
 await assert.rejects(()=>service.switchProfile(delegate,"40000000-0000-4000-8000-000000000002",profileId),ProfileAccessDeniedError);
});

test("page delegation invites a discoverable UNIBUD handle and does not grant access before acceptance",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 repo.record={...access(),profile:{...access().profile,kind:"page_community"}};
 const invitation=await service.inviteDelegateByHandle(owner,{profileId,inviteeHandle:" @Invitee.One ",role:"editor",canSwitchToProfile:true});
 assert.equal(invitation.inviteeHandle,"invitee.one");
 assert.deepEqual(repo.invitationInput,{profileId,inviteeHandle:"invitee.one",role:"editor",canSwitchToProfile:true});
 assert.equal(await service.respondToInvitation(delegate,invitation.id,true),true);
 assert.deepEqual(repo.invitationResponse,{id:invitation.id,accept:true});
});

test("only an owned active page can issue a profile invitation",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 await assert.rejects(()=>service.inviteDelegateByHandle(delegate,{profileId,inviteeHandle:"valid.user",role:"editor",canSwitchToProfile:false}),ProfileAccessDeniedError);
});

test("profile creation and switching complete as one authenticated profile workflow",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 const created=await service.createOwnedProfile(owner,{kind:"creator",handle:"new.creator",displayName:"New Creator"});
 repo.record=created;
 const switched=await service.switchProfile(owner,"40000000-0000-4000-8000-000000000001",created.profile.id);
 assert.equal(switched.activeProfile.activeProfileId,created.profile.id);
 assert.equal(repo.activeContext,true);
});

test("profile switching rejects another account and revoked memberships",async()=>{
 const repo=new Repo(),service=new ProfileService(repo);
 await assert.rejects(()=>service.switchProfile(delegate,"40000000-0000-4000-8000-000000000002",profileId),ProfileAccessDeniedError);
 repo.record={...access(),membershipStatus:"revoked"};
 await assert.rejects(()=>service.switchProfile(owner,"40000000-0000-4000-8000-000000000001",profileId),ProfileAccessDeniedError);
});
