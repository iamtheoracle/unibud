import type { AccountId, ApplicationId, ResourceId } from "./identity";

/**
 * Private education-domain identities.
 * These are not public UNIBUD profile families and are not discoverable.
 */
export type EducationRole = "student" | "tutor";

export type EducationInstitutionStatus =
  | "pending_verification"
  | "verified"
  | "suspended"
  | "closed";

export interface PrivateInstitutionRecord {
  id: ResourceId;
  legalOrRecognisedName: string;
  status: EducationInstitutionStatus;
  /** Institutions are private records until a separately approved release. */
  visibility: "private";
  publicListingEnabled: false;
  createdAt: string;
}

export interface EducationRoleAssignment {
  id: ResourceId;
  accountId: AccountId;
  institutionId: ResourceId;
  role: EducationRole;
  status: "pending" | "active" | "suspended" | "ended";
  grantedByAccountId: AccountId;
  grantedAt: string;
  endedAt?: string;
  /** Role is explicit; it is never inferred from profile type or behaviour. */
  applicationId: ApplicationId;
}

export interface StudentInstitutionRecord {
  assignment: EducationRoleAssignment & { role: "student" };
  studentReference?: string;
  programmeOrClass?: string;
  academicStatus?: string;
}

export interface TutorInstitutionRecord {
  assignment: EducationRoleAssignment & { role: "tutor" };
  subjectAreas: readonly string[];
  teachingStatus: "pending_review" | "approved" | "paused" | "ended";
}

export interface InstitutionEducationAuthority {
  institutionId: ResourceId;
  /** Separate authority switches; one does not imply the other. */
  mayManageStudentRecords: boolean;
  mayManageTutorRecords: boolean;
  mayAssignStudentRoles: boolean;
  mayAssignTutorRoles: boolean;
  mayLinkTutorToStudent: boolean;
}

export interface TutorStudentRelationship {
  id: ResourceId;
  institutionId: ResourceId;
  tutorAssignmentId: ResourceId;
  studentAssignmentId: ResourceId;
  status: "proposed" | "active" | "paused" | "ended";
  createdByAccountId: AccountId;
  createdAt: string;
  endedAt?: string;
}

/**
 * An account may hold both roles only through two distinct, active assignments.
 * This helper checks role identity, not institution authority or safeguarding.
 */
export function areDistinctEducationRoles(
  left: EducationRoleAssignment,
  right: EducationRoleAssignment
): boolean {
  return left.id !== right.id &&
    left.accountId === right.accountId &&
    left.institutionId === right.institutionId &&
    left.role !== right.role;
}

/**
 * Institution capabilities are evaluated independently. Having authority
 * over student records must never imply authority over tutor records.
 */
export function institutionCanManageRole(
  authority: InstitutionEducationAuthority,
  role: EducationRole
): boolean {
  return role === "student"
    ? authority.mayManageStudentRecords
    : authority.mayManageTutorRecords;
}
