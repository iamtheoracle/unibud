# Education Module Services

All 9 services are in `src/education/services/`. Each is registered with Oracle's DI container under the token shown.

## Service Summary

| Service | DI Token | Responsibility |
|---|---|---|
| `ProgramService` | `ProgramService` | Academic programs (WAEC, NECO, JAMB, University Degrees, etc.) |
| `OrganizationService` | `OrganizationService` | Learning organizations (Universities, Tutorial Centres, Exam Centres) |
| `StudentService` | `StudentService` | Student identity and enrollment status |
| `EducatorService` | `EducatorService` | Educator identity and organization assignments |
| `ClassService` | `ClassService` | Class creation, management, and student roster |
| `SubjectService` | `SubjectService` | Subject/Course definitions linked to programs |
| `EnrollmentService` | `EnrollmentService` | Student enrollment in classes with approval flow |
| `PermissionService` | `PermissionService` | Education-specific permissions with scope support |
| `InvitationService` | `InvitationService` | Student and educator invitations with token lifecycle |

---

## ProgramService

**Manages academic programs.** Programs are modular and replaceable — not hardcoded to any country or curriculum.

```typescript
const programs = oracle.dependencies.resolve<ProgramService>('ProgramService');

const waec = programs.createProgram('WAEC 2025', 'West African Examinations', { type: 'preUniversity' });
programs.addSubject(waec.id, subjectId);
programs.listPrograms();
programs.updateProgram(waec.id, { name: 'WAEC 2026' });
programs.deleteProgram(waec.id);
```

---

## OrganizationService

**Manages learning organizations.** Supports Universities, Tutorial Centres, Exam Centres, Academies, Training Centres, etc.

```typescript
const orgs = oracle.dependencies.resolve<OrganizationService>('OrganizationService');

const centre = orgs.createOrganization('Lagos Tutorial Centre', 'TutorialCentre');
orgs.addEducator(centre.id, educatorId);
orgs.listOrganizations({ type: 'TutorialCentre' });
```

---

## StudentService

**Manages student identity and status.** Pre-university students are created by organizations, not by self-registration.

```typescript
const students = oracle.dependencies.resolve<StudentService>('StudentService');

const student = students.enrollStudent(orgId, userId, programId);
students.deactivateStudent(student.id);
students.activateStudent(student.id);
students.listStudents(orgId, programId);
```

---

## EducatorService

**Manages educator identity.** Educators can belong to multiple organizations.

```typescript
const educators = oracle.dependencies.resolve<EducatorService>('EducatorService');

const educator = educators.registerEducator(userId, 'PhD Mathematics', ['B.Sc', 'M.Sc', 'Ph.D']);
educators.assignEducator(educator.id, orgId);
educators.unassignEducator(educator.id, orgId);
educators.listEducators(orgId);
```

---

## ClassService

**Manages classes.** Every class belongs to an organization, program, subject, and educator.

```typescript
const classes = oracle.dependencies.resolve<ClassService>('ClassService');

const cls = classes.createClass(orgId, programId, subjectId, educatorId, 'English A', {
  days: ['Monday', 'Wednesday'],
  time: '09:00',
  location: 'Room 12',
});
classes.addStudent(cls.id, studentId);
classes.removeStudent(cls.id, studentId);
classes.listClasses(orgId, programId, educatorId);
```

---

## SubjectService

**Manages subjects/courses linked to academic programs.**

```typescript
const subjects = oracle.dependencies.resolve<SubjectService>('SubjectService');

const subject = subjects.createSubject(programId, 'ENG101', 'English Language', 'Foundation English');
subjects.listSubjects(programId);
```

---

## EnrollmentService

**Manages student enrollment in classes with approval flow.**

Status transitions: `pending → approved | rejected`, `pending/approved → withdrawn`.

```typescript
const enrollments = oracle.dependencies.resolve<EnrollmentService>('EnrollmentService');

const enrollment = enrollments.enrollInClass(studentId, classId);
enrollments.approveEnrollment(enrollment.id);
// or
enrollments.rejectEnrollment(enrollment.id);
// or
enrollments.withdrawFromClass(studentId, classId);
```

---

## PermissionService

**Manages education-specific permissions with scope support.**

Scopes: `global`, `organization`, `class`.

Default permissions are seeded on module initialization.

```typescript
const perms = oracle.dependencies.resolve<PermissionService>('PermissionService');

perms.grantPermission(userId, 'student.view_class', orgId, classId);
perms.hasPermission(userId, 'student.view_class', { classId });
perms.revokePermission(userId, 'student.view_class', orgId, classId);
perms.listPermissions(userId);
```

**Default Permissions:**

| Name | Scope |
|---|---|
| `student.view_class` | class |
| `student.submit_assignment` | class |
| `educator.create_class` | organization |
| `educator.grade_assignment` | class |
| `org_admin.manage_educators` | organization |
| `org_admin.manage_students` | organization |

---

## InvitationService

**Manages student and educator invitations.** Invitations expire after 72 hours.

```typescript
const invitations = oracle.dependencies.resolve<InvitationService>('InvitationService');

const inv = invitations.sendInvitation('student@example.com', 'student', orgId, programId);
// Send inv.token to the user's email
invitations.acceptInvitation(inv.token);
// or
invitations.rejectInvitation(inv.token);
invitations.revokeInvitation(inv.id);
invitations.listInvitations(orgId);
```
