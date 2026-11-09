import test from "node:test";
import assert from "node:assert/strict";
import { AccountDependencyRepository } from "../src/lib/server/account/account-dependency-repository.ts";

test("dependency repository signs trusted account context and returns aggregates only", async () => {
  const calls: Array<{sql:string;values?:readonly unknown[]}> = [];
  const pool = {
    async connect() {
      return {
        async query(sql:string,values?:readonly unknown[]) {
          calls.push({sql,values});
          if (sql.includes("account_dependency_discovery")) return {rows:[{discovery:{
            version:"account-dependency-discovery-1",
            accountId:"18000000-0000-4000-8000-000000000001",
            generatedAt:"2026-11-09T12:00:00.000Z",
            counts:{account:1,ownedProfiles:2},
            sharedOwnership:{delegatedMembershipsGrantedToOthers:1},
            foreignKeys:[{constraint:"profiles_owner_fk",fromTable:"profiles",toTable:"accounts",definition:"FOREIGN KEY (owner_account_id) REFERENCES accounts(id)"}],
            coverage:{registeredTables:["accounts","profiles"],notImplementedDomains:["messaging"],unknownExternalDependenciesBlockClosure:true},
            policy:{status:"not_approved",missingPolicyDomains:["profiles","messaging"],canClose:false}
          }}]};
          return {rows:[]};
        },
        release(){}
      };
    }
  };
  const repository = new AccountDependencyRepository(pool);
  const result = await repository.getForAccount("18000000-0000-4000-8000-000000000001");
  assert.equal(result.counts.ownedProfiles,2);
  assert.equal(result.foreignKeys.length,1);
  assert.equal(result.policy.canClose,false);
  assert.equal(calls[0].sql,"BEGIN");
  assert.ok(calls.some(call=>call.sql.includes("set_config('unibud.account_id'")));
  const rpc = calls.find(call=>call.sql.includes("account_dependency_discovery"));
  assert.deepEqual(rpc?.values,["18000000-0000-4000-8000-000000000001"]);
  assert.equal(calls.at(-1)?.sql,"COMMIT");
});

test("dependency repository rolls back and releases the client when discovery fails", async () => {
  const calls:string[]=[];
  const pool={async connect(){return {
    async query(sql:string){calls.push(sql);if(sql.includes("account_dependency_discovery"))throw new Error("denied");return {rows:[]};},
    release(){calls.push("RELEASE");}
  };}};
  const repository=new AccountDependencyRepository(pool);
  await assert.rejects(()=>repository.getForAccount("18000000-0000-4000-8000-000000000001"),/denied/);
  assert.ok(calls.includes("ROLLBACK"));
  assert.equal(calls.at(-1),"RELEASE");
});
