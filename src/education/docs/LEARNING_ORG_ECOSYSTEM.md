# Learning Organization Ecosystem

## Overview

The Learning Organization Ecosystem has a flat structure designed for pre-university education:

```
Learning Organization → Program → Class → Student
```

## Organization Types

| Type | Description |
|---|---|
| `examCentre` | Prepares students for external exams (WAEC, NECO, JAMB) |
| `tutorialCentre` | General academic tutoring |
| `academy` | Specialized subject or skills training |
| `trainingCentre` | Professional or vocational training |

## Services

### LearningOrganizationService

```typescript
const org = module.organizations.createOrganization('Skyline Exam Centre', 'examCentre');
module.organizations.listOrganizations('examCentre'); // filter by type
module.organizations.updateOrganization(org.id, { description: 'WAEC specialists' });
module.organizations.addEducator(org.id, educator.id);
```

### LearningOrgStudentService

```typescript
const student = module.orgStudents.enrollStudent(
  org.id,
  userId,
  prog.id,       // e.g., WAEC 2025 program
  'ENR-001',     // enrollment number
);

module.orgStudents.listStudents(org.id);
module.orgStudents.listStudents(undefined, prog.id);
module.orgStudents.activateStudent(student.id);
module.orgStudents.deactivateStudent(student.id);
```

## Typical WAEC Workflow

```typescript
// 1. Create program
const waec = module.programs.createProgram('WAEC 2025', 'waec', 'learningOrg');

// 2. Create subjects for program
const maths = module.subjects.createSubject(waec.id, 'MATH', 'Mathematics');

// 3. Create organization
const centre = module.organizations.createOrganization('Apex Centre', 'examCentre');

// 4. Register educator
const teacher = module.educators.registerEducator('mr.obi@apex.com', 'Mr. Obi');
module.educators.assignToOrganization(teacher.id, centre.id);

// 5. Create class
const cls = module.classes.createClass(centre.id, waec.id, maths.id, teacher.id, 'WAEC Maths Class A');

// 6. Enroll student
const student = module.orgStudents.enrollStudent(centre.id, userId, waec.id);
const enrollment = module.enrollments.enrollInClass(student.id, cls.id);
module.enrollments.approveEnrollment(enrollment.id);
```

## Student Status

- `active` — currently studying
- `inactive` — suspended/on hold
- `completed` — completed the program
- `withdrawn` — left the program
