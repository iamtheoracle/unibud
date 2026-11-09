import test from "node:test";
import assert from "node:assert/strict";
import {
  OnboardingProcedureRepository
} from "../src/lib/server/onboarding/onboarding-repository-core.ts";
import type { SqlClient, SqlPool } from "../src/lib/server/database/account-context-core.ts";

const accountId="10000000-0000-4000-8000-000000000001";
process.env.UNIBUD_DB_CONTEXT_HMAC_KEY="5a".repeat(32);

class FakeClient implements SqlClient {
  calls:Array<{sql:string;values?:readonly unknown[]}>=[];
  released=false;
  profileCreated=0;
  existing=false;
  async query<Row=unknown>(sql:string,values?:readonly unknown[]){
    this.calls.push({sql,values});
    if(sql.includes("FROM public.profiles")) {
      return {rows:(this.existing?[{id:"20000000-0000-4000-8000-000000000001",kind:"personal",handle:"oracle",display_name:"Oracle",status:"active"}]:[]) as Row[]};
    }
    if(sql.includes("profile_create_owned")) {
      this.profileCreated++;
      this.existing=true;
      return {rows:[{id:"20000000-0000-4000-8000-000000000001",kind:"personal",handle:"oracle",display_name:"Oracle",status:"active"}] as Row[]};
    }
    return {rows:[] as Row[]};
  }
  release(){this.released=true;}
}
class FakePool implements SqlPool {
  client=new FakeClient();
  async connect(){return this.client;}
}

test("onboarding persists one personal profile and versioned acceptances in one signed transaction",async()=>{
  const pool=new FakePool(),repo=new OnboardingProcedureRepository(pool);
  const input={handle:"oracle",displayName:"Oracle",termsVersion:"terms-v1",privacyVersion:"privacy-v1",acceptedAt:"2026-11-09T06:00:00.000Z"};
  const first=await repo.completeOnboarding(accountId,input);
  assert.deepEqual(first,{id:"20000000-0000-4000-8000-000000000001",kind:"personal",handle:"oracle",displayName:"Oracle",status:"active"});
  const sql=pool.client.calls.map(c=>c.sql);
  assert.equal(sql[0],"BEGIN");
  assert.ok(sql[1].includes("set_config('unibud.account_id'"));
  assert.ok(sql.some(x=>x.includes("pg_advisory_xact_lock")));
  assert.equal(sql.filter(x=>x.includes("profile_create_owned")).length,1);
  assert.equal(sql.filter(x=>x.includes("account_policy_acceptances")).length,2);
  assert.equal(sql.at(-1),"COMMIT");
  assert.equal(pool.client.released,true);

  const before=pool.client.profileCreated;
  const second=await repo.completeOnboarding(accountId,{...input,handle:"ignored-retry"});
  assert.equal(second.handle,"oracle");
  assert.equal(pool.client.profileCreated,before);
});

test("onboarding transaction rolls back when persistence fails",async()=>{
  const pool=new FakePool();
  const original=pool.client.query.bind(pool.client);
  pool.client.query=async(sql,values)=>{
    if(sql.includes("profile_create_owned")) throw new Error("synthetic profile failure");
    return original(sql,values);
  };
  const repo=new OnboardingProcedureRepository(pool);
  await assert.rejects(()=>repo.completeOnboarding(accountId,{
    handle:"oracle",displayName:"Oracle",termsVersion:"terms-v1",privacyVersion:"privacy-v1",acceptedAt:"2026-11-09T06:00:00.000Z"
  }),/synthetic profile failure/);
  assert.ok(pool.client.calls.some(c=>c.sql==="ROLLBACK"));
  assert.equal(pool.client.released,true);
});
