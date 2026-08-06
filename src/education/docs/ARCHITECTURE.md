# Education Module Architecture

## Overview

The Education Module implements two distinct education ecosystems that share a common foundation. It registers with the Oracle Kernel as a domain module.

```
Education Module
    │
    ├── University Ecosystem
    │   ├── University (container)
    │   ├── Faculty (sub-container)
    │   ├── Department (sub-container)
    │   ├── Course (defines what's taught)
    │   └── University Student (learner in university)
    │
    ├── Learning Organization Ecosystem
    │   ├── Learning Organization (container)
    │   │   ├── Exam Centre
    │   │   ├── Tutorial Centre
    │   │   ├── Academy
    │   │   └── Training Centre
    │   └── Learning Org Student (pre-university learner)
    │
    └── Shared Foundation (Used by Both)
        ├── Academic Programs (WAEC, NECO, JAMB, Degrees, etc.)
        ├── Classes (organized learning groups)
        ├── Subjects (curriculum units)
        ├── Educators (teachers/instructors)
        ├── Enrollment (joining classes)
        ├── Permissions (access control)
        └── Invitations (onboarding)
```

## Key Principle

**Do NOT merge different educational models.**

| | University | Learning Org |
|---|---|---|
| Container | University → Faculty → Department → Course | Learning Organization (Exam/Tutorial/Academy/Training) |
| Students | University Students (matriculation, levels) | Learning Org Students (enrollment numbers) |
| Programs | University Degrees | WAEC, NECO, JAMB, etc. |
| Structure | Hierarchical | Flat |
| Progression | Level-based (100–600) | Program-based |

## Oracle Registration

```typescript
import { EducationModule } from './src/education';

const education = new EducationModule();
await education.initialize(oracle); // registers with Oracle Kernel
```

## Directory Structure

```
src/education/
├── index.ts              — public exports
├── module.ts             — EducationModule class (Oracle registration)
├── oracle.interface.ts   — minimal Oracle interfaces
├── utils.ts              — shared utilities
│
├── types/
│   ├── shared.ts         — IProgram, IClass, ISubject, IEducator, ...
│   ├── university.ts     — IUniversity, IFaculty, IDepartment, ICourse, ...
│   ├── learning-org.ts   — ILearningOrganization, ILearningOrgStudent
│   └── index.ts
│
├── models/
│   ├── shared/           — ProgramModel, ClassModel, ...
│   ├── university/       — UniversityModel, FacultyModel, ...
│   └── learning-org/     — LearningOrganizationModel, ...
│
├── services/
│   ├── shared/           — 7 shared services
│   ├── university/       — 5 university services
│   └── learning-org/     — 2 learning org services
│
├── api/
│   ├── shared/           — 7 route factories
│   ├── university/       — 5 route factories
│   └── learning-org/     — 2 route factories
│
├── database/
│   └── schema.sql        — 16 tables
│
├── docs/                 — additional documentation
│
└── __tests__/
    ├── shared/           — 7 service test files
    ├── university/       — university ecosystem tests
    ├── learning-org/     — learning org ecosystem tests
    └── integration.test.ts
```
