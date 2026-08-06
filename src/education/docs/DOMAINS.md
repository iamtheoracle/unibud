# Education Module — Domains

## Domain 1: Identity

Manages unified user identity for students and educators.
A person has **one** Student or Educator record, and **multiple contexts** (one per organisation they belong to).

### StudentService
- `registerStudent(input)` – Create a new student identity
- `getStudent(id)` – Retrieve a student
- `updateStudent(id, data)` – Update student details
- `listStudents()` – List all students
- `activateStudent(id)` / `deactivateStudent(id)` – Toggle status
- `getStudentContexts(studentId)` – List all org memberships
- `addStudentContext(studentId, input)` – Add to a university or learning org
- `removeStudentContext(contextId)` – Remove membership

### EducatorService
- `registerEducator(input)` – Create a new educator identity
- `getEducator(id)` / `listEducators()` – Read
- `updateEducator(id, data)` – Update
- `getEducatorContexts(educatorId)` – List org assignments
- `assignToContext(educatorId, input)` – Assign to org
- `removeFromContext(contextId)` – Remove assignment

---

## Domain 2: Academic

Manages academic structure: programs, subjects, classes, and enrollment.

### ProgramService
Academic programs (WAEC, NECO, B.Sc. Computer Science, etc.)
- CRUD + `addSubject` / `removeSubject`

### SubjectService
Subjects or modules within a program.
- CRUD + list by `programId`

### ClassService
Learning groups run by an educator for a subject.
- CRUD + `addStudent` / `removeStudent` + filter by program/educator/org

### EnrollmentService
Tracks student enrollment in classes.
- `enrollInClass` / `withdrawFromClass`
- `approveEnrollment` / `rejectEnrollment`
- List by student or class

---

## Domain 3: University

Manages the hierarchical structure of a university.

```
University → Faculty → Department → Course
```

### UniversityService
Container for the full university structure.

### FacultyService
Faculty within a university. Creating a faculty automatically registers it on the university record.

### DepartmentService
Department within a faculty. Creating a department automatically registers it on the faculty record.

### CourseService
Course within a department. Creating a course automatically registers it on the department record.

---

## Domain 4: Learning Organization

Manages non-university learning organisations and their program offerings.

### Types of Learning Organisation
- `examCentre` – Exam preparation centres
- `tutorialCentre` – Tutorial / coaching centres
- `academy` – Private academies
- `trainingCentre` – Corporate or vocational training

### LearningOrganizationService
Container for the organisation.

### LearningProgramService
An instance of an `EduAcademicProgram` offered by a learning organisation, with start/end dates and status.

---

## Domain 5: Shared Infrastructure

Cross-cutting concerns shared by all domains.

### PermissionService
- `definePermission(input)` – Define a named permission with scope
- `grantPermission(input)` – Grant to a user (with optional context)
- `revokePermission(userId, name, contextId?)` – Revoke from a user
- `hasPermission(userId, name, contextId?)` – Check access
- `listPermissions(userId)` – List all permissions for a user

Permission scopes: `global`, `organization`, `class`

### InvitationService
Invitation workflow for onboarding students and educators.
- `sendInvitation(input)` – Create and send an invitation (expires in 7 days by default)
- `getInvitation(token)` – Look up by token
- `acceptInvitation(token)` – Mark as accepted
- `rejectInvitation(token)` – Mark as rejected
- `revokeInvitation(id)` – Revoke an invitation
- `listInvitations(organizationId?)` – List invitations
