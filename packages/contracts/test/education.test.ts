import test from "node:test";
import assert from "node:assert/strict";
import {
  areDistinctEducationRoles,
  institutionCanManageRole,
  type EducationRoleAssignment,
  type InstitutionEducationAuthority
} from "../src/education.ts";
import type { AccountId, ApplicationId, ResourceId } from "../src/identity.ts";

const accountId = "account-1" as AccountId;
const institutionId = "institution-1" as ResourceId;
const appId = "unibud" as ApplicationId;

function assignment(id: string, role: "student" | "tutor"): EducationRoleAssignment {
  return {
    id: id as ResourceId,
    accountId,
    institutionId,
    role,
    status: "active",
    grantedByAccountId: "institution-admin" as AccountId,
    grantedAt: "2026-01-01T00:00:00.000Z",
    applicationId: appId
  };
}

const authority: InstitutionEducationAuthority = {
  institutionId,
  mayManageStudentRecords: true,
  mayManageTutorRecords: false,
  mayAssignStudentRoles: true,
  mayAssignTutorRoles: false,
  mayLinkTutorToStudent: false
};

test("student and tutor roles require distinct assignments", () => {
  assert.equal(areDistinctEducationRoles(
    assignment("student-assignment", "student"),
    assignment("tutor-assignment", "tutor")
  ), true);
});

test("pending or ended assignments cannot establish active dual roles", () => {
  const pendingTutor = { ...assignment("pending-tutor", "tutor"), status: "pending" as const };
  const endedTutor = { ...assignment("ended-tutor", "tutor"), status: "ended" as const };
  assert.equal(areDistinctEducationRoles(assignment("student", "student"), pendingTutor), false);
  assert.equal(areDistinctEducationRoles(assignment("student", "student"), endedTutor), false);
});

test("same assignment cannot represent both roles", () => {
  assert.equal(areDistinctEducationRoles(
    assignment("same", "student"),
    assignment("same", "tutor")
  ), false);
});

test("same account and institution are required for dual-role comparison", () => {
  const other = { ...assignment("tutor", "tutor"), accountId: "other" as AccountId };
  assert.equal(areDistinctEducationRoles(assignment("student", "student"), other), false);
});

test("student management authority does not imply tutor management authority", () => {
  assert.equal(institutionCanManageRole(authority, "student"), true);
  assert.equal(institutionCanManageRole(authority, "tutor"), false);
});

test("tutor management authority does not imply student management authority", () => {
  const tutorOnly = {
    ...authority,
    mayManageStudentRecords: false,
    mayManageTutorRecords: true
  };
  assert.equal(institutionCanManageRole(tutorOnly, "student"), false);
  assert.equal(institutionCanManageRole(tutorOnly, "tutor"), true);
});
