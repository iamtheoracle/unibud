import test from "node:test";
import assert from "node:assert/strict";
import type { SqlClient } from "../src/lib/server/database/account-context-core.ts";
import { normalizePeopleSearchTerm, routeGlobalSearch, searchPublicProfiles } from "../src/lib/server/search/search-core.ts";

test("people search normalizes Unicode and whitespace without accepting short or oversized terms", () => {
  assert.equal(normalizePeopleSearchTerm("  Ａda   Lovelace "), "Ada Lovelace");
  assert.equal(normalizePeopleSearchTerm("x"), null);
  assert.equal(normalizePeopleSearchTerm("a".repeat(41)), null);
  assert.equal(normalizePeopleSearchTerm("ab\u0000cd"), null);
  assert.equal(normalizePeopleSearchTerm(null), null);
});

test("people search uses a bound term and returns only safe public profile fields", async () => {
  let statement = "";
  let parameters: readonly unknown[] = [];
  const client: SqlClient = {
    async query<Row = unknown>(sql: string, values?: readonly unknown[]) {
      statement = sql;
      parameters = values ?? [];
      return {
        rows: [{
          handle: "ada",
          display_name: "Ada Lovelace",
          kind: "personal"
        }] as Row[]
      };
    },
    release() {}
  };

  const results = await searchPublicProfiles(client, "ada");
  assert.deepEqual(parameters, ["ada"]);
  assert.match(statement, /p\.visibility = 'public'/);
  assert.match(statement, /p\.status = 'active'/);
  assert.match(statement, /account_blocks/);
  assert.match(statement, /blocker_account_id/);
  assert.match(statement, /blocked_account_id/);
  assert.match(statement, /LIMIT 20/);
  assert.deepEqual(results, [{
    handle: "ada",
    displayName: "Ada Lovelace",
    kind: "personal"
  }]);
  assert.equal("id" in results[0], false);
  assert.equal("ownerAccountId" in results[0], false);
});

test("global search routes academic intent to Board inside Bud", () => {
  assert.deepEqual(routeGlobalSearch("Find a tutor for my university course").route, {
    kind: "space",
    space: "bud_board",
    parentSpace: "bud"
  });
});

test("global dating intent is routed to gated SouLync without searching its records", () => {
  assert.deepEqual(routeGlobalSearch("dating and romantic relationships").route, {
    kind: "space",
    space: "soullync",
    requiresAdultEligibility: true,
    requiresIndependentConsent: true
  });
});

test("ordinary discovery routes to Connect", () => {
  assert.deepEqual(routeGlobalSearch("photographers and local services").route, {
    kind: "space",
    space: "connect"
  });
});
