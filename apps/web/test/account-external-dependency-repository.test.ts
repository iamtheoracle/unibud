import test from "node:test";
import assert from "node:assert/strict";
import { AccountExternalDependencyRepository } from "../src/lib/server/account/account-external-dependency-repository.ts";

process.env.UNIBUD_DB_CONTEXT_HMAC_KEY = "b8".repeat(32);

test("external dependency repository uses signed session-derived context and returns aggregate registry data", async () => {
  const calls: Array<{sql:string;values?:readonly unknown[]}> = [];
  const pool = {
    async connect() {
      return {
        async query(sql:string,values?:readonly unknown[]) {
          calls.push({sql,values});
          if (sql.includes("account_external_dependency_discovery")) return {rows:[{discovery:{
            version:"external-dependency-registry-1",
            accountId:"19000000-0000-4000-8000-000000000001",
            generatedAt:"2026-11-09T12:00:00.000Z",
            counts:{linkedReferences:2,unverifiedReferences:1,unknownDispositionReferences:2,unavailableReferences:0,staleReferences:0},
            countsByDomain:{identity_verification:2},
            integrations:[{
              integrationKey:"verification_delivery_gateway",domain:"identity_verification",kind:"delivery_gateway",
              provider:null,verificationState:"unknown",evidenceSource:"repository_declaration",
              dataCategories:["recipient_identifier","one_time_verification_code"],
              capabilities:{lookup:false,export:false,delete:false,deletionReceipt:false,backupExpiry:false},
              lastVerifiedAt:null
            }],
            coverage:{accountReferencesAreOpaqueDigests:true,rawProviderIdentifiersExposed:false,providerVerificationRequired:true,unknownExternalDependenciesBlockClosure:true},
            policy:{status:"not_approved",missingPolicyDomains:["external_dependencies"],canClose:false}
          }}]};
          return {rows:[]};
        },
        release(){}
      };
    }
  };
  const repository = new AccountExternalDependencyRepository(pool);
  const result = await repository.getForAccount("19000000-0000-4000-8000-000000000001");
  assert.equal(result.counts.linkedReferences,2);
  assert.equal(result.integrations[0].provider,null);
  assert.equal(result.integrations[0].capabilities.delete,false);
  assert.equal(result.coverage.rawProviderIdentifiersExposed,false);
  assert.equal(result.policy.canClose,false);
  assert.equal(calls[0].sql,"BEGIN");
  assert.ok(calls.some(call=>call.sql.includes("set_config('unibud.account_id'")));
  const rpc = calls.find(call=>call.sql.includes("account_external_dependency_discovery"));
  assert.deepEqual(rpc?.values,["19000000-0000-4000-8000-000000000001"]);
  assert.equal(calls.at(-1)?.sql,"COMMIT");
});

test("external dependency repository rolls back and releases the client when discovery fails", async () => {
  const calls:string[]=[];
  const pool={async connect(){return {
    async query(sql:string){calls.push(sql);if(sql.includes("account_external_dependency_discovery"))throw new Error("denied");return {rows:[]};},
    release(){calls.push("RELEASE");}
  };}};
  const repository=new AccountExternalDependencyRepository(pool);
  await assert.rejects(()=>repository.getForAccount("19000000-0000-4000-8000-000000000001"),/denied/);
  assert.ok(calls.includes("ROLLBACK"));
  assert.equal(calls.at(-1),"RELEASE");
});
