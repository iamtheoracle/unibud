import { randomUUID } from "node:crypto";
import {
  createSignedAccountContextFromEnvironment,
  withSignedAccountTransaction,
  type SqlClient,
  type SqlPool
} from "../database/account-context-core.ts";
import type { ProfileAccessRecord } from "../../../../../../packages/contracts/src/profile.ts";
import type { DelegatedProfileGrantInput, ProfileCreateInput, ProfileRepository } from "./profile-service-core.ts";

type DbRow={ [key:string]:unknown };
function str(v:unknown):string { if(typeof v!=="string") throw new Error("Unexpected profile database result.");return v; }
function mapAccess(row:DbRow):ProfileAccessRecord {
 return {
  accountId:str(row.account_id) as ProfileAccessRecord["accountId"],
  relationship:str(row.relationship) as ProfileAccessRecord["relationship"],
  membershipStatus:str(row.membership_status) as ProfileAccessRecord["membershipStatus"],
  canSwitchToProfile:row.can_switch_to_profile===true,
  profile:{
   id:str(row.profile_id) as ProfileAccessRecord["profile"]["id"],
   ownerAccountId:str(row.owner_account_id) as ProfileAccessRecord["profile"]["ownerAccountId"],
   kind:str(row.kind) as ProfileAccessRecord["profile"]["kind"],
   handle:str(row.handle),
   displayName:str(row.display_name),
   visibility:str(row.visibility) as ProfileAccessRecord["profile"]["visibility"],
   status:str(row.profile_status) as ProfileAccessRecord["profile"]["status"]
  }
 };
}
const ACCESS_SQL=`SELECT p.id AS profile_id,p.owner_account_id,p.kind,p.handle,p.display_name,
 p.visibility,p.status AS profile_status,m.account_id,m.relationship,
 m.status AS membership_status,m.can_switch_to_profile
 FROM public.profile_memberships m
 JOIN public.profiles p ON p.id=m.profile_id
 WHERE m.account_id=$1 AND m.profile_id=$2
 LIMIT 1`;

export class ProfileRpcRepository implements ProfileRepository {
 private readonly pool:SqlPool;
 constructor(pool:SqlPool){this.pool=pool;}

 async createOwnedProfile(ownerAccountId:string,input:ProfileCreateInput):Promise<ProfileAccessRecord>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(ownerAccountId),async client=>{
   const profileId=randomUUID(),membershipId=randomUUID();
   await client.query(
    "SELECT * FROM public.profile_create_owned($1,$2,$3,$4,$5,$6,$7,$8)",
    [profileId,membershipId,ownerAccountId,input.kind,input.handle,input.handle,input.displayName,input.visibility??"private"]
   );
   const result=await client.query<DbRow>(ACCESS_SQL,[ownerAccountId,profileId]);
   if(!result.rows[0]) throw new Error("Created profile membership could not be read back.");
   return mapAccess(result.rows[0]);
  });
 }

 async grantDelegatedAccess(ownerAccountId:string,input:DelegatedProfileGrantInput):Promise<ProfileAccessRecord>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(ownerAccountId),async client=>{
   await client.query(
    "SELECT public.profile_grant_delegated_access($1,$2,$3,$4,$5)",
    [input.profileId,ownerAccountId,input.delegateAccountId,input.role,input.canSwitchToProfile]
   );
   const result=await client.query<DbRow>(ACCESS_SQL,[input.delegateAccountId,input.profileId]);
   if(!result.rows[0]) throw new Error("Delegated profile membership could not be read back.");
   return mapAccess(result.rows[0]);
  });
 }

 async revokeDelegatedAccess(ownerAccountId:string,profileId:string,delegateAccountId:string):Promise<boolean>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(ownerAccountId),async client=>{
   const result=await client.query<{profile_revoke_delegated_access:boolean}>(
    "SELECT public.profile_revoke_delegated_access($1,$2,$3,$4) AS profile_revoke_delegated_access",
    [profileId,ownerAccountId,delegateAccountId,new Date().toISOString()]
   );
   return result.rows[0]?.profile_revoke_delegated_access===true;
  });
 }

 async listAccessibleProfiles(accountId:string):Promise<ProfileAccessRecord[]>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(accountId),async client=>{
   const result=await client.query<DbRow>(
    `SELECT p.id AS profile_id,p.owner_account_id,p.kind,p.handle,p.display_name,
     p.visibility,p.status AS profile_status,m.account_id,m.relationship,
     m.status AS membership_status,m.can_switch_to_profile
     FROM public.profile_memberships m JOIN public.profiles p ON p.id=m.profile_id
     WHERE m.account_id=$1 AND m.status='active' AND p.status='active'
     ORDER BY p.created_at ASC`,[accountId]
   );
   return result.rows.map(mapAccess);
  });
 }

 async findProfileAccess(accountId:string,profileId:string):Promise<ProfileAccessRecord|undefined>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(accountId),async client=>{
   const result=await client.query<DbRow>(ACCESS_SQL,[accountId,profileId]);
   return result.rows[0]?mapAccess(result.rows[0]):undefined;
  });
 }

 async setActiveContext(accountId:string,sessionId:string,profileId:string,contextVersion:string):Promise<boolean>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(accountId),async client=>{
   const result=await client.query<{profile_set_active_context:boolean}>(
    "SELECT public.profile_set_active_context($1,$2,$3,$4) AS profile_set_active_context",
    [accountId,sessionId,profileId,contextVersion]
   );
   return result.rows[0]?.profile_set_active_context===true;
  });
 }
}
