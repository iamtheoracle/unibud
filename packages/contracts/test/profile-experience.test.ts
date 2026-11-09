import test from "node:test";
import assert from "node:assert/strict";
import { getProfileExperience } from "../src/profile-experience.ts";

test("personal profiles focus on individual identity and connections", () => {
  const experience = getProfileExperience("personal");
  assert.equal(experience.title, "Personal profile");
  assert.ok(experience.primarySections.includes("connections"));
  assert.ok(experience.primarySections.includes("highlights"));
  assert.ok(!experience.primarySections.includes("administrators"));
});

test("creator profiles prioritise publishing, featured work and audience", () => {
  const experience = getProfileExperience("creator");
  assert.equal(experience.title, "Creator profile");
  assert.ok(experience.primarySections.includes("publishing"));
  assert.ok(experience.primarySections.includes("featured_work"));
  assert.ok(experience.primarySections.includes("audience"));
  assert.ok(experience.managementSections.includes("insights"));
  assert.ok(experience.managementSections.includes("eligible_monetisation"));
  assert.ok(!experience.primarySections.includes("members"));
});

test("page and community profiles prioritise members and group governance", () => {
  const experience = getProfileExperience("page_community");
  assert.equal(experience.title, "Page / community profile");
  assert.ok(experience.primarySections.includes("members"));
  assert.ok(experience.primarySections.includes("announcements"));
  assert.ok(experience.primarySections.includes("events"));
  assert.ok(experience.managementSections.includes("administrators"));
  assert.ok(experience.managementSections.includes("moderation"));
  assert.ok(!experience.primarySections.includes("publishing"));
});

test("all profile families have distinct purpose and primary navigation", () => {
  const personal = getProfileExperience("personal");
  const creator = getProfileExperience("creator");
  const page = getProfileExperience("page_community");
  assert.notEqual(personal.purpose, creator.purpose);
  assert.notEqual(creator.purpose, page.purpose);
  assert.notDeepEqual(personal.primarySections, creator.primarySections);
  assert.notDeepEqual(creator.primarySections, page.primarySections);
  assert.notDeepEqual(personal.primarySections, page.primarySections);
});

test("presentation metadata does not imply role permissions", () => {
  for (const kind of ["personal", "creator", "page_community"] as const) {
    const experience = getProfileExperience(kind);
    assert.equal("permissions" in experience, false);
    assert.equal("canManage" in experience, false);
  }
});
