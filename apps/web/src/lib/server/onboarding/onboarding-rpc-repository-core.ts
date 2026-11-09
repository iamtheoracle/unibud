import { randomUUID } from "node:crypto";
import {
 createSignedAccountContextFromEnvironment,
 withSignedAccountTransaction,
 type SqlPool
} from "../database/account-context-core.ts";
import type { OnboardingProfile, OnboardingRepository } from "./onboarding-core.ts";

type Row={ [key:string]:unknown };
function stringValue(value:unknown):string {
 if(typeof value!=="string") throw new Error("Unexpected onboarding database result.");
 return value;
}
export class OnboardingRpcRepository implements OnboardingRepository {
 private readonly pool:SqlPool;
 constructor(pool:SqlPool){this.pool=pool;}

 async completeOnboarding(accountId:string,input:Parameters<OnboardingRepository["completeOnboarding"]>[1]):Promise<OnboardingProfile>{
  return withSignedAccountTransaction(this.pool,createSignedAccountContextFromEnvironment(accountId),async client=>{
   // Serialize first-profile creation per account; the unique index remains the final invariant.
   await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))",[accountId]);
   let result=await client.query<Row>(
    `SELECT p.id,p.kind,p.handle,p.display_name,p.status
     FROM public.profiles p
     JOIN public.profile_memberships m ON m.profile_id=p.id AND m.account_id=$1
     WHERE p.owner_account_id=$1 AND p.kind='personal'
       AND p.status='active' AND m.relationship='owner' AND m.status='active'
     LIMIT 1`,[accountId]
   );
   if(!result.rows[0]){
    const profileId=randomUUID(),membershipId=randomUUID();
    await client.query(
     "SELECT * FROM public.profile_create_owned($1,$2,$3,'personal',$4,$4,$5,'private')",
     [profileId,membershipId,accountId,input.handle,input.displayName]
    );
    result=await client.query<Row>(
     `SELECT p.id,p.kind,p.handle,p.display_name,p.status
      FROM public.profiles p
      JOIN public.profile_memberships m ON m.profile_id=p.id AND m.account_id=$1
      WHERE p.id=$2 AND p.owner_account_id=$1 AND m.relationship='owner' AND m.status='active'`,
     [accountId,profileId]
    );
   }
   const row=result.rows[0];
   if(!row) throw new Error("Personal profile could not be created or recovered.");
   await client.query(
    `INSERT INTO public.account_policy_acceptances(id,account_id,policy_type,policy_version,accepted_at)
     VALUES ($1,$2,'terms',$3,$4),($5,$2,'privacy',$6,$4)
     ON CONFLICT(account_id,policy_type,policy_version) DO NOTHING`,
    [randomUUID(),accountId,input.termsVersion,input.acceptedAt,randomUUID(),input.privacyVersion]
   );
   return {
    id:stringValue(row.id),kind:"personal",handle:stringValue(row.handle),
    displayName:stringValue(row.display_name),status:"active"
   };
  });
 }
}
