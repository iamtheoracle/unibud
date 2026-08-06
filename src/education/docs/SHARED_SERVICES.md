# Shared Foundation Services

Both the University and Learning Organization ecosystems use the same seven shared services.

## 1. ProgramService

Manages academic programs (curriculum definitions).

```typescript
const programs = module.programs;

// Create WAEC program
const waec = programs.createProgram('WAEC 2025', 'waec', 'learningOrg', 'West African Examinations Council');

// Create university degree program
const bsc = programs.createProgram('B.Sc. Computer Science', 'university_degree', 'university');

// List programs by type
programs.listPrograms('waec');
programs.listPrograms(undefined, 'university');
```

## 2. ClassService

Manages classes (learning groups) — used by both ecosystems.

```typescript
const classes = module.classes;

// Create a class (organizationId can be a university OR learning org)
const cls = classes.createClass(org.id, prog.id, subj.id, educator.id, 'WAEC Maths A', schedule);

// List classes
classes.listClasses(org.id); // by organization
classes.listClasses(undefined, prog.id); // by program
```

## 3. SubjectService

Manages subjects (curriculum units).

```typescript
const subjects = module.subjects;

const maths = subjects.createSubject(prog.id, 'MATH', 'Mathematics');
subjects.listSubjects(prog.id);
```

## 4. EducatorService

Manages educators — they work in both ecosystems.

```typescript
const educators = module.educators;

const educator = educators.registerEducator('teach@school.com', 'Mr. Obi', 'Maths specialist');
educators.assignToOrganization(educator.id, org.id);
educators.listEducators(org.id); // list educators in an organization
```

## 5. EnrollmentService

Manages student enrollment in classes.

```typescript
const enrollments = module.enrollments;

const enr = enrollments.enrollInClass(student.id, class.id);
enrollments.approveEnrollment(enr.id);
enrollments.withdrawFromClass(student.id, class.id);
```

## 6. PermissionService

Manages access control permissions.

```typescript
const permissions = module.permissions;

// Default permissions are registered on module.initialize()
permissions.grantPermission(userId, 'course:read');
permissions.hasPermission(userId, 'course:read');
permissions.revokePermission(userId, 'course:read');
```

## 7. InvitationService

Manages invitations for onboarding educators and students.

```typescript
const invitations = module.invitations;

const inv = invitations.sendInvitation('new@example.com', 'educator', org.id);
invitations.acceptInvitation(inv.token);
invitations.rejectInvitation(inv.token);
```
