import test from "node:test";
import assert from "node:assert/strict";
import { routeSearchIntent } from "../src/search.ts";
import type { ApplicationId, ResourceId } from "../src/identity.ts";

test("academic search routes to Board inside Bud", () => {
  assert.deepEqual(routeSearchIntent({ kind: "academic" }), {
    kind: "space",
    space: "bud_board",
    parentSpace: "bud"
  });
});

test("general discovery routes to Connect, not Quad", () => {
  assert.deepEqual(routeSearchIntent({ kind: "general_discovery" }), {
    kind: "space",
    space: "connect"
  });
});

test("adult dating is isolated and carries independent eligibility and consent gates", () => {
  assert.deepEqual(routeSearchIntent({ kind: "adult_dating" }), {
    kind: "space",
    space: "soullync",
    requiresAdultEligibility: true,
    requiresIndependentConsent: true
  });
});

test("explicit space scope is preserved and never reclassified", () => {
  const applicationId = "quad" as ApplicationId;
  const resourceId = "resource-1" as ResourceId;
  assert.deepEqual(routeSearchIntent({
    kind: "space_scoped",
    applicationId,
    resourceId
  }), {
    kind: "scoped",
    applicationId,
    resourceId
  });
});

test("space-scoped search can preserve application scope without a resource", () => {
  const applicationId = "square" as ApplicationId;
  assert.deepEqual(routeSearchIntent({
    kind: "space_scoped",
    applicationId
  }), {
    kind: "scoped",
    applicationId
  });
});
