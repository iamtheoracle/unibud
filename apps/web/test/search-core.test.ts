import test from "node:test";
import assert from "node:assert/strict";
import type { SqlClient } from "../src/lib/server/database/account-context-core.ts";
import { assertSearchProfileContext, consumeSearchRateLimit, isSearchDiscoveryReady, normalizePeopleSearchTerm, routeExplicitSearchScope, routeGlobalSearch, SearchRateLimitExceededError, searchPublicProfiles } from "../src/lib/server/search/search-core.ts";

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

  const results = await searchPublicProfiles(client, "ada", "people");
  assert.deepEqual(parameters, ["ada", "personal"]);
  assert.match(statement, /p\.visibility = 'public'/);
  assert.match(statement, /p\.status = 'active'/);
  assert.match(statement, /p\.kind = \$2/);
  assert.match(statement, /account_discovery_allowed/);
  assert.match(statement, /account_interaction_blocked/);
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



test("Search rate limiting delegates opaque account bucket derivation to PostgreSQL", async () => {
  let statement = "";
  let parameters: readonly unknown[] = [];
  const client: SqlClient = {
    async query<Row = unknown>(sql: string, values?: readonly unknown[]) {
      statement = sql;
      parameters = values ?? [];
      return { rows: [{ allowed: true }] as Row[] };
    },
    release() {}
  };
  await consumeSearchRateLimit(client);
  assert.match(statement, /search_consume_rate_limit\(\)/);
  assert.deepEqual(parameters, []);
});

test("Search rate limiting fails closed when PostgreSQL denies the verified account budget", async () => {
  const client: SqlClient = {
    async query<Row = unknown>() {
      return { rows: [{ allowed: false }] as Row[] };
    },
    release() {}
  };
  await assert.rejects(
    consumeSearchRateLimit(client),
    SearchRateLimitExceededError
  );
});


test("Search discovery readiness exposes only a boolean derived from PostgreSQL", async () => {
  let statement = "";
  const client: SqlClient = {
    async query<Row = unknown>(sql: string) {
      statement = sql;
      return { rows: [{ ready: false }] as Row[] };
    },
    release() {}
  };
  assert.equal(await isSearchDiscoveryReady(client), false);
  assert.match(statement, /account_discovery_viewer_verified/);
});


test("Search revalidates the persisted active profile before running a query", async () => {
  let statement = "";
  let parameters: readonly unknown[] = [];
  const client: SqlClient = {
    async query<Row = unknown>(sql: string, values?: readonly unknown[]) {
      statement = sql;
      parameters = values ?? [];
      return { rows: [{ allowed: true }] as Row[] };
    },
    release() {}
  };
  await assertSearchProfileContext(client, "52000000-0000-4000-8000-000000000001");
  assert.match(statement, /profile_authorize_action/);
  assert.deepEqual(parameters, ["52000000-0000-4000-8000-000000000001"]);
});

test("Search denies a profile whose membership has been revoked", async () => {
  const client: SqlClient = {
    async query<Row = unknown>() {
      return { rows: [{ allowed: false }] as Row[] };
    },
    release() {}
  };
  await assert.rejects(
    assertSearchProfileContext(client, "52000000-0000-4000-8000-000000000001"),
    { name: "SearchProfileContextError" }
  );
});


test("Connect category classification prevents non-profile categories from being treated as people", () => {
  assert.deepEqual(routeGlobalSearch("Find local events").intent, {
    kind: "general_discovery",
    category: "events"
  });
  assert.deepEqual(routeGlobalSearch("Find a photographer").intent, {
    kind: "general_discovery",
    category: "services"
  });
  assert.deepEqual(routeGlobalSearch("Find a job").intent, {
    kind: "general_discovery",
    category: "opportunities"
  });
  assert.deepEqual(routeGlobalSearch("Find a local community").intent, {
    kind: "general_discovery",
    category: "communities"
  });
});

test("Connect people, creator and community profile searches use distinct profile kinds", async () => {
  const seen: unknown[][] = [];
  const client: SqlClient = {
    async query<Row = unknown>(_sql: string, values?: readonly unknown[]) {
      seen.push([...(values ?? [])]);
      return { rows: [] as Row[] };
    },
    release() {}
  };
  await searchPublicProfiles(client, "ada", "people");
  await searchPublicProfiles(client, "ada", "creators");
  await searchPublicProfiles(client, "ada", "communities");
  assert.deepEqual(seen, [
    ["ada", "personal"],
    ["ada", "creator"],
    ["ada", "page_community"]
  ]);
});


test("explicit space-scoped search preserves the selected boundary without granting access", () => {
  for (const space of ["connect", "quad", "bud_board", "square", "riff", "wayward", "quarter", "flow"]) {
    const routed = routeExplicitSearchScope(space);
    assert.deepEqual(routed?.route, {
      kind: "scoped",
      applicationId: space
    });
  }
  assert.deepEqual(routeExplicitSearchScope("soullync")?.route, {
    kind: "scoped",
    applicationId: "soullync",
    requiresAdultEligibility: true,
    requiresIndependentConsent: true
  });
  assert.equal(routeExplicitSearchScope("unknown-space"), null);
  assert.equal(routeExplicitSearchScope(null), null);
});
