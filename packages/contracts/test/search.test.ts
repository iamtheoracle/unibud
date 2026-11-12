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
  assert.deepEqual(routeSearchIntent({ kind: "general_discovery", category: "people" }), {
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


test("all approved Connect search categories remain inside Connect", () => {
  const categories = [
    "people", "communities", "creators", "institutions", "opportunities",
    "services", "food", "events", "trips"
  ] as const;
  for (const category of categories) {
    assert.deepEqual(
      routeSearchIntent({ kind: "general_discovery", category }),
      { kind: "space", space: "connect" }
    );
  }
});


test("explicit SouLync scope retains independent adult eligibility and consent gates", () => {
  assert.deepEqual(routeSearchIntent({
    kind: "space_scoped",
    applicationId: "soullync" as ApplicationId
  }), {
    kind: "scoped",
    applicationId: "soullync",
    requiresAdultEligibility: true,
    requiresIndependentConsent: true
  });
});

test("every selectable space scope is preserved without crossing into another space", () => {
  const spaces = [
    "connect", "quad", "bud_board", "square", "soullync", "riff", "wayward", "quarter", "flow"
  ] as const;
  for (const space of spaces) {
    const route = routeSearchIntent({
      kind: "space_scoped",
      applicationId: space as ApplicationId
    });
    assert.equal(route.kind, "scoped");
    if (route.kind !== "scoped") continue;
    assert.equal(route.applicationId, space);
    if (space === "soullync") {
      assert.equal(route.requiresAdultEligibility, true);
      assert.equal(route.requiresIndependentConsent, true);
    } else {
      assert.equal(route.requiresAdultEligibility, undefined);
      assert.equal(route.requiresIndependentConsent, undefined);
    }
  }
});
