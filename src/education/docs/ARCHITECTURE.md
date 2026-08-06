# Education Module — Architecture

## Overview

The Education Module is organized by **5 Domains** instead of flat services.
This provides clear ownership, scalability, and testability.

Each domain is self-contained with its own services, models, types, and API definitions.

---

## Module Registration

The Education Module registers with the Oracle Kernel on bootstrap:

```ts
import { bootstrap } from '@/oracle/kernel';
import { educationModule } from '@/education';

await bootstrap({ modules: [educationModule] });
```

---

## Domain Structure

```
Education Module
    │
    ├── Domain 1: Identity
    │   ├── StudentService
    │   └── EducatorService
    │
    ├── Domain 2: Academic
    │   ├── ProgramService
    │   ├── SubjectService
    │   ├── ClassService
    │   └── EnrollmentService
    │
    ├── Domain 3: University
    │   ├── UniversityService
    │   ├── FacultyService
    │   ├── DepartmentService
    │   └── CourseService
    │
    ├── Domain 4: Learning Organization
    │   ├── LearningOrganizationService
    │   └── LearningProgramService
    │
    └── Domain 5: Shared Infrastructure
        ├── PermissionService
        └── InvitationService
```

---

## Folder Structure

```
src/education/
  index.ts                          # Module entry point + Oracle registration
  module.ts                         # IEducationModule interface

  domains/
    identity/
      services/
        student.service.ts
        educator.service.ts
      models/
        student.model.ts
        educator.model.ts
      types/
        student.types.ts
        educator.types.ts
        index.ts
      index.ts

    academic/
      services/
        program.service.ts
        subject.service.ts
        class.service.ts
        enrollment.service.ts
      models/
        academic.models.ts
      types/
        program.types.ts
        subject.types.ts
        class.types.ts
        enrollment.types.ts
        index.ts
      index.ts

    university/
      services/
        university.service.ts
        faculty.service.ts
        department.service.ts
        course.service.ts
      models/
        university.models.ts
      types/
        index.ts
      index.ts

    learning-organization/
      services/
        organization.service.ts
        learning-program.service.ts
      models/
        learning-org.models.ts
      types/
        index.ts
      index.ts

    shared/
      services/
        permission.service.ts
        invitation.service.ts
      models/
        shared.models.ts
      types/
        index.ts
      index.ts

  types/
    index.ts                        # Re-exports all domain types

  docs/
    ARCHITECTURE.md                 # This file
    DOMAINS.md
    API.md
```

---

## Base44 Entities (17 tables)

### Domain 1: Identity
| Entity | Description |
|---|---|
| `EduStudent` | Student identity record |
| `EduStudentContext` | Student membership in a university or learning org |
| `EduEducator` | Educator identity record |
| `EduEducatorContext` | Educator assignment to a university or learning org |

### Domain 2: Academic
| Entity | Description |
|---|---|
| `EduAcademicProgram` | Academic programs (WAEC, NECO, BSc, etc.) |
| `EduSubject` | Subjects within a program |
| `EduClass` | Learning groups run by an educator |
| `EduEnrollment` | Student enrollment in a class |

### Domain 3: University
| Entity | Description |
|---|---|
| `EduUniversity` | University container |
| `EduFaculty` | Faculty within a university |
| `EduDepartment` | Department within a faculty |
| `EduCourse` | Course within a department |

### Domain 4: Learning Organization
| Entity | Description |
|---|---|
| `EduLearningOrganization` | Learning org (Exam Centre, Academy, etc.) |
| `EduLearningProgram` | Offering of an academic program by a learning org |

### Domain 5: Shared Infrastructure
| Entity | Description |
|---|---|
| `EduPermission` | Permission definition |
| `EduPermissionGrant` | Permission granted to a user |
| `EduInvitation` | Invitation to join a program |

---

## Design Principles

1. **Zero duplication** – Services use the Base44 SDK; no business logic is duplicated.
2. **Unified identity** – Students and Educators are single entities with multiple contexts.
3. **Domain isolation** – Each domain can be developed, tested, and extended independently.
4. **Oracle registration** – The module registers capabilities with the kernel on boot.
