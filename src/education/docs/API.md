# Education Module API Reference

All services are resolved from Oracle's DI container after `oracle.bootstrap()`.

## Bootstrap

```typescript
import { oracle } from '@/oracle/kernel';
import { educationModule } from '@/education';

await oracle.modules.register(educationModule);
await oracle.bootstrap();
```

---

## Programs API

```typescript
const programs = oracle.dependencies.resolve('ProgramService');

// Create
programs.createProgram(name, description?, metadata?)   → IProgram

// Read
programs.getProgram(id)                                 → IProgram
programs.listPrograms(filter?)                          → IProgram[]

// Update
programs.updateProgram(id, data)                        → IProgram

// Delete
programs.deleteProgram(id)                              → void

// Subjects
programs.addSubject(programId, subjectId)               → void
programs.removeSubject(programId, subjectId)            → void
```

---

## Organizations API

```typescript
const orgs = oracle.dependencies.resolve('OrganizationService');

orgs.createOrganization(name, type, metadata?)          → IOrganization
orgs.getOrganization(id)                                → IOrganization
orgs.listOrganizations(filter?)                         → IOrganization[]
orgs.updateOrganization(id, data)                       → IOrganization
orgs.deleteOrganization(id)                             → void
orgs.addEducator(orgId, educatorId)                     → void
orgs.removeEducator(orgId, educatorId)                  → void
```

---

## Students API

```typescript
const students = oracle.dependencies.resolve('StudentService');

students.enrollStudent(orgId, userId, programId, meta?) → IStudent
students.getStudent(id)                                 → IStudent
students.listStudents(orgId?, programId?)               → IStudent[]
students.updateStudent(id, data)                        → IStudent
students.activateStudent(id)                            → void
students.deactivateStudent(id)                          → void
```

---

## Educators API

```typescript
const educators = oracle.dependencies.resolve('EducatorService');

educators.registerEducator(userId, bio?, quals?)        → IEducator
educators.getEducator(id)                               → IEducator
educators.listEducators(orgId?)                         → IEducator[]
educators.updateEducator(id, data)                      → IEducator
educators.assignEducator(educatorId, orgId)             → void
educators.unassignEducator(educatorId, orgId)           → void
```

---

## Classes API

```typescript
const classes = oracle.dependencies.resolve('ClassService');

classes.createClass(orgId, programId, subjectId, educatorId, name, schedule?) → IClass
classes.getClass(id)                                                           → IClass
classes.listClasses(orgId?, programId?, educatorId?)                          → IClass[]
classes.updateClass(id, data)                                                  → IClass
classes.deleteClass(id)                                                        → void
classes.addStudent(classId, studentId)                                         → void
classes.removeStudent(classId, studentId)                                      → void
```

---

## Subjects API

```typescript
const subjects = oracle.dependencies.resolve('SubjectService');

subjects.createSubject(programId, code, name, description?) → ISubject
subjects.getSubject(id)                                      → ISubject
subjects.listSubjects(programId?)                            → ISubject[]
subjects.updateSubject(id, data)                             → ISubject
subjects.deleteSubject(id)                                   → void
```

---

## Enrollments API

```typescript
const enrollments = oracle.dependencies.resolve('EnrollmentService');

enrollments.enrollInClass(studentId, classId)       → IEnrollment
enrollments.getEnrollment(id)                       → IEnrollment
enrollments.listEnrollments(studentId?, classId?)   → IEnrollment[]
enrollments.withdrawFromClass(studentId, classId)   → void
enrollments.approveEnrollment(enrollmentId)         → void
enrollments.rejectEnrollment(enrollmentId)          → void
```

---

## Permissions API

```typescript
const perms = oracle.dependencies.resolve('PermissionService');

perms.definePermission(name, description?, scope?)              → IPermission
perms.grantPermission(userId, permName, orgId?, classId?)       → void
perms.revokePermission(userId, permName, orgId?, classId?)      → void
perms.hasPermission(userId, permName, context?)                 → boolean
perms.listPermissions(userId)                                   → IPermission[]
```

---

## Invitations API

```typescript
const invitations = oracle.dependencies.resolve('InvitationService');

invitations.sendInvitation(email, type, orgId?, programId?, data?) → IInvitation
invitations.getInvitation(token)                                    → IInvitation
invitations.acceptInvitation(token)                                 → IInvitation
invitations.rejectInvitation(token)                                 → void
invitations.listInvitations(orgId?)                                 → IInvitation[]
invitations.revokeInvitation(id)                                    → void
```
